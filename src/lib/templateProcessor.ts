import { Template, Variable, SharedTemplate } from '../types/templates'
import { plural, formatCount, formatMeasurement, formatRange } from './textUtils'
import { logger } from './logger'

type TemplateValues = Record<string, any>

type ProcessorFunction = (...args: any[]) => string

type SharedTemplateContext = Map<string, SharedTemplate>

const processors: Record<string, ProcessorFunction> = {
  templateRef: (value: string, sharedTemplates?: SharedTemplateContext) => {
    logger.debug('Processing template reference', { value, sharedTemplates })
    
    if (!sharedTemplates) {
      logger.warn('No shared templates provided')
      return value
    }

    // Extract template name from the value (which should be in {templateName} format)
    const templateMatch = value.match(/^\{([^}]+)\}$/)
    if (!templateMatch) {
      logger.warn('Invalid template reference format', { value })
      return value
    }

    const templateName = templateMatch[1]
    const template = sharedTemplates.get(templateName)
    if (!template) {
      logger.warn(`Template not found: ${templateName}`)
      return value
    }

    // Build template values from defaults
    const templateValues: Record<string, any> = {}
    if (template.variables) {
      Object.entries(template.variables).forEach(([key, variable]) => {
        templateValues[key] = variable.default
      })
    }

    logger.debug('Processing template with defaults', { 
      templateName, 
      templateValues,
      template: template.template
    })

    if (!template.template) {
      logger.warn(`No template string found for ${templateName}`)
      return value
    }

    return processTemplate(
      template.template,
      templateValues,
      template.variables,
      sharedTemplates
    )
  },
  sharedValue: (value: string, type: string, sharedTemplates?: SharedTemplateContext, variables?: Record<string, Variable>) => {
    logger.debug('Processing shared value', { value, type, sharedTemplates })
    
    if (!sharedTemplates) {
      logger.warn('No shared templates provided')
      return value
    }

    const template = sharedTemplates?.get(type)
    if (!template) {
      logger.warn(`No shared template found for type: ${type}`)
      return value
    }

    // Process array of values
    if (Array.isArray(value)) {
      return value.map(v => processors.sharedValue(v.toString(), type, sharedTemplates, variables)).join(', ')
    }

    // Process single value
    const processValue = (val: string, variables?: Record<string, Variable>) => {
      // Build template values from:
      // 1. Default values from shared template variables
      // 2. Variables passed through useShared.variables
      const templateValues: Record<string, any> = {}
      
      // Get defaults from shared template
      if (template.variables) {
        Object.entries(template.variables).forEach(([key, variable]) => {
          templateValues[key] = variable.default
        })
      }
      
      // Override with passed variables if any
      const variable = variables?.[type]
      if (variable?.useShared?.variables) {
        Object.assign(templateValues, variable.useShared.variables)
      }

      // For direct numeric values
      if (!isNaN(Number(val))) {
        if (template.template) {
          const templateToUse = Array.isArray(template.template) ? template.template[1] : template.template
          return processTemplate(templateToUse, { ...templateValues, value: val }, template.variables, sharedTemplates)
        }
        return `${val}${templateValues.unit || 'mm'}`
      }

      // For enum options
      const option = template.options.find(opt => opt.id === val || opt.name === val)
      if (!option) {
        logger.warn(`No matching option found for ${val} in ${type} template`)
        return val
      }

      logger.debug('Found shared template option', { option })

      // Handle referenced shared template values
      if (option.references && template.variables) {
        Object.entries(option.references).forEach(([key, refValue]) => {
          const variable = template.variables?.[key]
          if (variable?.useShared?.type && sharedTemplates) {
            templateValues[key] = processors.sharedValue(refValue.toString(), variable.useShared.type, sharedTemplates)
          } else {
            templateValues[key] = refValue
          }
        })
      }

      // Use the template if available, otherwise fall back to raw value
      if (template.template) {
        const templateToUse = Array.isArray(template.template) ? template.template[0] : template.template
        return processTemplate(templateToUse, { ...templateValues, value: option.value }, template.variables, sharedTemplates)
      }
      return option.value?.toString() ?? val
    }

    return processValue(value.toString(), variables)
  },
  plural: (count: number, word: string, pluralForm?: string) => 
    plural(count, word, pluralForm),
  count: (value: number) => formatCount(value),
  measure: (value: number, unit: string) => formatMeasurement(value, unit),
  range: (start: number, end: number, unit: string) => formatRange(start, end, unit)
}

export function hasSharedType(template: Template, type: string): boolean {
  if ('variables' in template && template.variables) {
    return Object.values(template.variables).some(variable => 
      variable.useShared?.type === type
    )
  }
  return false
}

export function processTemplate(
  template: string | string[],
  values: TemplateValues,
  variables?: Record<string, Variable>,
  sharedTemplates?: SharedTemplateContext
): string {
  logger.debug('Starting template processing', {
    template: typeof template,
    values: Object.keys(values),
    variables: variables ? Object.keys(variables) : undefined,
    sharedTemplates: sharedTemplates ? {
      count: sharedTemplates.size,
      types: Array.from(sharedTemplates.keys())
    } : undefined
  })

  const templateArray = Array.isArray(template) ? template : [template]
  
  logger.debug('Processing template segments', { 
    segmentCount: templateArray.length,
    firstSegment: templateArray[0]?.substring(0, 50) + '...'
  })
  
  return templateArray
    .map(segment => {
      // Safe expression evaluator
      const evaluateExpression = (expr: string): boolean => {
        const ops = {
          '>': (a: number, b: number) => a > b,
          '<': (a: number, b: number) => a < b,
          '>=': (a: number, b: number) => a >= b,
          '<=': (a: number, b: number) => a <= b,
          '===': (a: any, b: any) => a === b,
          '!==': (a: any, b: any) => a !== b,
        }

        // Match patterns like: value > 5, count === 3, etc.
        const match = expr.match(/^\s*(\w+)\s*([><=!]+)\s*(\d+|\w+)\s*$/)
        if (!match) {
          logger.error(`Invalid expression format: ${expr}`)
          return false
        }

        const [_, left, operator, right] = match
        const leftValue = values[left]
        const rightValue = /^\d+$/.test(right) ? Number(right) : values[right]
        
        const op = ops[operator as keyof typeof ops]
        if (!op) {
          logger.error(`Unsupported operator: ${operator}`)
          return false
        }

        try {
          return op(leftValue, rightValue)
        } catch (error) {
          logger.error(`Error evaluating expression: ${expr}`, error)
          return false
        }
      }

      let result = segment

      // First process variable substitutions and function calls
      // Process function calls {fn:arg1,arg2,...}
      result = result.replace(
        /\{([^}]+)\s*\?\s*([^:}]+)\s*:\s*([^}]+)\}/g,
        (_, condition, trueText, falseText) => {
          const evaluated = evaluateExpression(condition)
          logger.debug('Processing ternary', { condition, trueText, falseText, result: evaluated })
          return evaluated ? trueText.trim() : falseText.trim()
        }
      )

      logger.debug('Processing function calls in segment', { segment: result })
      result = result.replace(
        /\{(\w+):([^}]+)\}/g,
        (_, fn, args) => {
          const processor = processors[fn]
          if (!processor) {
            logger.warn(`Unknown processor function: ${fn}`)
            return ''
          }

          try {
            const processedArgs = args.split(',').map((arg: string) => {
              const trimmed = arg.trim()
              
              // If it's a variable reference
              if (values.hasOwnProperty(trimmed)) {
                const value = values[trimmed]
                const variable = variables?.[trimmed]

                // Handle shared template values
                if (variable?.useShared?.type) {
                  logger.debug('Processing shared template value', { 
                    field: trimmed,
                    value,
                    type: variable.useShared.type
                  })
                  return processors.sharedValue(value, variable.useShared.type, sharedTemplates, variables)
                }
                
                // Ensure numbers are returned as numbers
                return typeof value === 'string' && !isNaN(Number(value)) 
                  ? Number(value) 
                  : value
              }
              
              // If it's a numeric string
              if (!isNaN(Number(trimmed))) {
                return Number(trimmed)
              }
              
              // Otherwise treat as string, removing quotes if present
              return trimmed.replace(/^['"]|['"]$/g, '')
            })

            const result = processor.apply(null, processedArgs)
            logger.debug('Processed function call', { fn, args: processedArgs, result })
            return result
          } catch (error) {
            logger.error(`Error processing template function ${fn}:`, error)
            return ''
          }
        }
      )

      // Process template references in enum values
      if (variables) {
        Object.entries(variables).forEach(([key, variable]) => {
          if (variable.type === 'enum' && values[key]) {
            const value = values[key]
            if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
              logger.debug('Found template reference in enum', { key, value })
              values[key] = processors.templateRef(value, sharedTemplates)
            } else if (Array.isArray(value)) {
              values[key] = value.map(v => 
                typeof v === 'string' && v.startsWith('{') && v.endsWith('}')
                  ? processors.templateRef(v, sharedTemplates)
                  : v
              )
            }
          }
        })
      }

      // Process variable substitutions
      result = result.replace(
        /\{([^:}]+)\}/g,
        (match, key) => {
          const value = values[key]
          const variable = variables?.[key]

          // If this variable uses a shared template, process it with sharedValue
          if (variable?.useShared?.type && sharedTemplates) {
            logger.debug('Processing shared template variable', { key, value, type: variable.useShared.type })
            return processors.sharedValue(value, variable.useShared.type, sharedTemplates, variables)
          }

          // Otherwise return the raw value
          const stringValue = Array.isArray(value) ? value.join(', ') : (value?.toString() ?? '')
          logger.debug('Variable substitution', { key, value: stringValue })
          return stringValue
        }
      )

      // Process conditionals [if condition]content[/if] recursively
      const processConditionals = (text: string): string => {
        // Process all conditionals in the text
        const processAllConditionals = (input: string): string => {
          // Find the innermost conditional (one that doesn't contain other [if] tags)
          const match = input.match(/\[if ([^\]]+)\]([^\[]*?)\[\/if\]/);
          if (!match) return input;

          const [fullMatch, condition, content] = match;
          const evaluated = evaluateExpression(condition);
          logger.debug('Processing conditional', {
            condition,
            content,
            result: evaluated
          });

          // Replace this conditional with its result
          const processed = input.replace(fullMatch, evaluated ? content : '');
          
          // Recursively process any remaining conditionals
          return processAllConditionals(processed);
        };

        return processAllConditionals(text);
      }

      // Process ternary expressions {condition ? trueText : falseText}
      result = result.replace(
        /\{([^}]+)\s*\?\s*([^:}]+)\s*:\s*([^}]+)\}/g,
        (_, condition, trueText, falseText) => {
          const evaluated = evaluateExpression(condition)
          logger.debug('Processing ternary', { condition, trueText, falseText, result: evaluated })
          return evaluated ? trueText.trim() : falseText.trim()
        }
      )

      return processConditionals(result)
    })
    .join(' ')
}

export function validateTemplateValues(
  variables: Record<string, Variable>,
  values: TemplateValues,
  sharedTemplates?: Map<string, Template>
): { isValid: boolean; errors: Record<string, string> } {
  logger.debug('Validating template values', { variables, values })
  const errors: Record<string, string> = {}

  Object.entries(variables).forEach(([key, variable]) => {
    const value = values[key]

    // Check required fields
    if (variable.required && (value === undefined || value === '')) {
      logger.warn(`Required field missing: ${key}`)
      errors[key] = 'This field is required'
      return
    }

    if (value !== undefined && value !== '') {
      // Type validation
      switch (variable.type) {
        case 'number':
          if (typeof value !== 'number' && isNaN(Number(value))) {
            logger.warn(`Invalid number value for ${key}: ${value}`)
            errors[key] = 'Must be a number'
          } else if (variable.validation) {
            const num = Number(value)
            if (variable.validation.min !== undefined && num < variable.validation.min) {
              logger.warn(`Value ${num} below minimum ${variable.validation.min} for ${key}`)
              errors[key] = `Must be at least ${variable.validation.min}`
            }
            if (variable.validation.max !== undefined && num > variable.validation.max) {
              logger.warn(`Value ${num} above maximum ${variable.validation.max} for ${key}`)
              errors[key] = `Must be at most ${variable.validation.max}`
            }
          }
          break

        case 'text':
          if (typeof value !== 'string') {
            logger.warn(`Invalid text value for ${key}: ${value}`)
            errors[key] = 'Must be text'
          } else if (variable.validation?.pattern) {
            const regex = new RegExp(variable.validation.pattern)
            if (!regex.test(value)) {
              logger.warn(`Value ${value} does not match pattern ${variable.validation.pattern} for ${key}`)
              errors[key] = 'Invalid format'
            }
          }
          break

        case 'enum':
        case 'mixed':
          if (variable.useShared) {
            if (!sharedTemplates?.has(variable.useShared.type)) {
              logger.warn(`Shared template not found for ${key}: ${variable.useShared.type}`)
              errors[key] = 'Invalid shared template'
              break
            }
            const sharedTemplate = sharedTemplates.get(variable.useShared.type) as SharedTemplate
            
            // For mixed type, allow direct numeric values if allowDirect is true
            if (variable.type === 'mixed' && variable.useShared?.allowDirect && !isNaN(Number(value))) {
              // Validate number if validation rules exist
              if (variable.validation) {
                const num = Number(value)
                if (variable.validation.min !== undefined && num < variable.validation.min) {
                  logger.warn(`Value ${num} below minimum ${variable.validation.min} for ${key}`)
                  errors[key] = `Must be at least ${variable.validation.min}`
                }
                if (variable.validation.max !== undefined && num > variable.validation.max) {
                  logger.warn(`Value ${num} above maximum ${variable.validation.max} for ${key}`)
                  errors[key] = `Must be at most ${variable.validation.max}`
                }
              }
              break
            }
            
            // Handle array of values for multiple selections
            if (Array.isArray(value)) {
              if (!variable.allow_multiple) {
                logger.warn(`Multiple values not allowed for ${key}`)
                errors[key] = 'Multiple values not allowed'
                break
              }
              
              const invalidValues = value.filter(v => {
                if (variable.type === 'mixed' && variable.useShared?.allowDirect && !isNaN(Number(v))) {
                  // Validate number if validation rules exist
                  if (variable.validation) {
                    const num = Number(v)
                    return (variable.validation.min !== undefined && num < variable.validation.min) ||
                           (variable.validation.max !== undefined && num > variable.validation.max)
                  }
                  return false
                }
                return !sharedTemplate.options.some(opt => opt.id === v || opt.name === v)
              })
              
              if (invalidValues.length > 0) {
                logger.warn(`Invalid shared enum values for ${key}: ${invalidValues.join(', ')}`)
                errors[key] = 'Invalid options selected'
              }
            } else {
            const option = sharedTemplate.options.find(opt => 
              opt.id === value || opt.name === value
            )
            if (!option) {
              logger.warn(`Invalid shared enum value for ${key}: ${value}`)
              errors[key] = 'Invalid option selected'
              break
            }

            // Validate referenced values if they exist
            if (option.references && 'variables' in sharedTemplate && sharedTemplate.variables) {
              Object.entries(option.references).forEach(([refKey, refValue]) => {
                const refVariable = sharedTemplate.variables?.[refKey]
                if (refVariable?.useShared?.type) {
                  const refTemplate = sharedTemplates.get(refVariable.useShared.type) as SharedTemplate
                  if (refTemplate && !refTemplate.options.some((opt: { id: string, name: string }) => 
                    opt.id === refValue || opt.name === refValue
                  )) {
                    logger.warn(`Invalid referenced value ${refValue} for ${refKey} in ${key}`)
                    errors[key] = `Invalid referenced ${refKey} value`
                  }
                }
              })
            }
            }
          } else if (variable.options) {
            // Handle array of values for multiple selections
            if (Array.isArray(value)) {
              if (!variable.allow_multiple) {
                logger.warn(`Multiple values not allowed for ${key}`)
                errors[key] = 'Multiple values not allowed'
                break
              }
              
              const invalidValues = value.filter(v => {
                // Check if the value matches a template reference pattern {templateName}
                const templateMatch = v.match(/^\{([^}]+)\}$/)
                if (templateMatch) {
                  const templateName = templateMatch[1]
                  return !variable.options?.some(opt => opt === `{${templateName}}`)
                }
                return !variable.options?.includes(v)
              })
              
              if (invalidValues.length > 0) {
                logger.warn(`Invalid enum values for ${key}: ${invalidValues.join(', ')}`)
                errors[key] = 'Invalid options selected'
              }
            } else {
              // Check if the value matches a template reference pattern {templateName}
              const templateMatch = value.match(/^\{([^}]+)\}$/)
              if (templateMatch) {
                const templateName = templateMatch[1]
                if (!variable.options?.some(opt => opt === `{${templateName}}`)) {
                  logger.warn(`Invalid template reference for ${key}: ${value}`)
                  errors[key] = 'Invalid option selected'
                }
              } else if (!variable.options?.includes(value)) {
                logger.warn(`Invalid enum value for ${key}: ${value}. Valid options: ${variable.options?.join(', ')}`)
                errors[key] = 'Invalid option selected'
              }
            }
          }
          break

        case 'boolean':
          if (typeof value !== 'boolean') {
            logger.warn(`Invalid boolean value for ${key}: ${value}`)
            errors[key] = 'Must be true or false'
          }
          break
      }
    }
  })

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors
  }
  
  if (!result.isValid) {
    logger.warn('Template validation failed', { errors })
  } else {
    logger.debug('Template validation successful')
  }
  
  return result
}

export function evaluateConditions(
  conditions: Array<{
    field: string
    operator: 'equals' | 'includes' | 'greater' | 'less'
    value: any
  }>,
  values: TemplateValues
): boolean {
  logger.debug('Evaluating conditions', { conditions, values })
  
  return conditions.every(condition => {
    const fieldValue = values[condition.field]
    let result = false
    
    switch (condition.operator) {
      case 'equals':
        result = fieldValue === condition.value
        break
      case 'includes':
        result = Array.isArray(fieldValue) && fieldValue.includes(condition.value)
        break
      case 'greater':
        result = Number(fieldValue) > Number(condition.value)
        break
      case 'less':
        result = Number(fieldValue) < Number(condition.value)
        break
      default:
        logger.warn(`Unknown operator: ${condition.operator}`)
        return false
    }

    logger.debug('Condition evaluation', {
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      fieldValue,
      result
    })

    return result
  })
}
