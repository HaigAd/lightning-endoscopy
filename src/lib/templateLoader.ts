import { Template, FindingTemplate, ActionTemplate, SharedTemplate, TemplateLibrary } from '../types/templates'
import { logger } from './logger'

// Use Vite's glob import feature to load all templates
const findingModules = import.meta.glob<{ template: FindingTemplate }>('../templates/findings/*.ts', { eager: true })
const actionModules = import.meta.glob<{ template: ActionTemplate }>('../templates/actions/*.ts', { eager: true })
const sharedModules = import.meta.glob<{ template: SharedTemplate }>('../templates/shared/*.ts', { eager: true })

export function loadTemplates(): TemplateLibrary {
  logger.debug('Starting template loading process')

  const templates = new Map<string, Template>()
  const relationships = new Map<string, Array<{
    parent: string
    child: string
    relationship: 'requires' | 'suggests' | 'allows'
    conditions?: {
      field: string
      value: any
    }[]
  }>>()
  const byType = new Map<string, string[]>()
  const byCode = new Map<string, string[]>()
  const byKeyword = new Map<string, string[]>()
  const byCategory = new Map<string, string[]>()

  // Initialize index maps
  byType.set('finding', [])
  byType.set('action', [])
  byType.set('shared', [])

  // Load findings
  Object.values(findingModules).forEach(module => {
    const template = module.template
    templates.set(template.id, template)
    byType.get('finding')?.push(template.id)

    // Index by codes
    template.codes.snomed.forEach(code => {
      if (!byCode.has(code)) {
        byCode.set(code, [])
      }
      byCode.get(code)?.push(template.id)
    })

    // Index by keywords (using name and description)
    const keywords = [
      ...template.name.toLowerCase().split(' '),
      ...(template.description?.toLowerCase().split(' ') || [])
    ]
    keywords.forEach(keyword => {
      if (!byKeyword.has(keyword)) {
        byKeyword.set(keyword, [])
      }
      byKeyword.get(keyword)?.push(template.id)
    })

    // Create relationships from allowedActions
    if (!relationships.has(template.id)) {
      relationships.set(template.id, [])
    }
    template.allowedActions.forEach(action => {
      relationships.get(template.id)?.push({
        parent: template.id,
        child: action.id,
        relationship: 'allows',
        conditions: action.conditions?.map(c => ({
          field: c.field,
          value: c.value
        }))
      })
    })
  })

  // Load actions
  Object.values(actionModules).forEach(module => {
    const template = module.template
    templates.set(template.id, template)
    byType.get('action')?.push(template.id)

    // Index by codes
    template.codes.snomed.forEach(code => {
      if (!byCode.has(code)) {
        byCode.set(code, [])
      }
      byCode.get(code)?.push(template.id)
    })

    // Index by keywords
    const keywords = [
      ...template.name.toLowerCase().split(' '),
      ...(template.description?.toLowerCase().split(' ') || [])
    ]
    keywords.forEach(keyword => {
      if (!byKeyword.has(keyword)) {
        byKeyword.set(keyword, [])
      }
      byKeyword.get(keyword)?.push(template.id)
    })

    // Create relationships from nextActions
    if (template.nextActions) {
      if (!relationships.has(template.id)) {
        relationships.set(template.id, [])
      }
      template.nextActions.forEach(nextAction => {
        relationships.get(template.id)?.push({
          parent: template.id,
          child: nextAction.id,
          relationship: template.autoSuggest ? 'suggests' : 'allows',
          conditions: nextAction.conditions?.map(c => ({
            field: c.field,
            value: c.value
          }))
        })
      })
    }
  })

  // Load shared templates
  Object.values(sharedModules).forEach(module => {
    const template = module.template
    templates.set(template.id, template)
    byType.get('shared')?.push(template.id)

    // Index by category
    if (!byCategory.has(template.category)) {
      byCategory.set(template.category, [])
    }
    byCategory.get(template.category)?.push(template.id)

    // Index by codes
    template.codes.snomed.forEach(code => {
      if (!byCode.has(code)) {
        byCode.set(code, [])
      }
      byCode.get(code)?.push(template.id)
    })

    // Index by keywords
    const keywords = [
      ...template.name.toLowerCase().split(' '),
      ...(template.description?.toLowerCase().split(' ') || [])
    ]
    keywords.forEach(keyword => {
      if (!byKeyword.has(keyword)) {
        byKeyword.set(keyword, [])
      }
      byKeyword.get(keyword)?.push(template.id)
    })
  })

  return {
    templates,
    relationships,
    indexes: {
      byType,
      byCode,
      byKeyword,
      byCategory
    }
  }
}

export function logLoadedTemplates(library: TemplateLibrary) {
  logger.info('Loaded Templates Summary:')
  logger.info(`Total Templates: ${library.templates.size}`)
  
  // Log template types with full details
  library.indexes.byType.forEach((templateIds, type) => {
    logger.info(`${type.toUpperCase()} Templates (${templateIds.length}):`)
    templateIds.forEach(id => {
      const template = library.templates.get(id)
      if (template) {
        // Detailed template logging
        logger.info(`Template Details:`)
        logger.info(`- ID: ${template.id}`)
        logger.info(`- Name: ${template.name}`)
        logger.info(`- Description: ${template.description || 'N/A'}`)
        
        // Log SNOMED codes
        logger.info(`- SNOMED Codes:`)
        template.codes.snomed.forEach(code => {
          logger.info(`  * ${code}`)
        })

        // Log keywords
        logger.info(`- Keywords:`)
        const keywords = [
          ...template.name.toLowerCase().split(' '),
          ...(template.description?.toLowerCase().split(' ') || [])
        ]
        keywords.forEach(keyword => {
          logger.info(`  * ${keyword}`)
        })

        // Log specific details based on template type
        if (type === 'finding') {
          const findingTemplate = template as FindingTemplate
          logger.info(`- Allowed Actions:`)
          findingTemplate.allowedActions.forEach(action => {
            logger.info(`  * ${action.id}`)
            if (action.conditions) {
              logger.info(`    Conditions:`)
              action.conditions.forEach(condition => {
                logger.info(`    - Field: ${condition.field}, Value: ${condition.value}`)
              })
            }
          })
        } else if (type === 'action') {
          const actionTemplate = template as ActionTemplate
          if (actionTemplate.nextActions) {
            logger.info(`- Next Actions:`)
            actionTemplate.nextActions.forEach(nextAction => {
              logger.info(`  * ${nextAction.id}`)
              if (nextAction.conditions) {
                logger.info(`    Conditions:`)
                nextAction.conditions.forEach(condition => {
                  logger.info(`    - Field: ${condition.field}, Operator: ${condition.operator}, Value: ${condition.value}`)
                })
              }
            })
            logger.info(`- Auto Suggest: ${actionTemplate.autoSuggest}`)
          }
        } else if (type === 'shared') {
          const sharedTemplate = template as SharedTemplate
          logger.info(`- Category: ${sharedTemplate.category}`)
        }

        logger.info('---') // Separator between templates
      }
    })
  })

  // Log relationships with more context
  logger.info('Template Relationships:')
  library.relationships.forEach((rels, parentId) => {
    if (rels.length > 0) {
      logger.info(`Relationships for ${parentId}:`)
      rels.forEach(rel => {
        logger.info(`- ${parentId} ${rel.relationship} ${rel.child}`)
        if (rel.conditions) {
          logger.info(`  Conditions:`)
          rel.conditions.forEach(condition => {
            logger.info(`  - Field: ${condition.field}, Value: ${condition.value}`)
          })
        }
      })
    }
  })

  // Log indexes for additional context
  logger.info('Template Indexes:')
  logger.info('By Type:')
  library.indexes.byType.forEach((ids, type) => {
    logger.info(`- ${type}: ${ids.join(', ')}`)
  })

  logger.info('By Code:')
  library.indexes.byCode.forEach((ids, code) => {
    logger.info(`- ${code}: ${ids.join(', ')}`)
  })

  logger.info('By Keyword:')
  library.indexes.byKeyword.forEach((ids, keyword) => {
    logger.info(`- ${keyword}: ${ids.join(', ')}`)
  })

  logger.info('By Category:')
  library.indexes.byCategory.forEach((ids, category) => {
    logger.info(`- ${category}: ${ids.join(', ')}`)
  })

  return library
}
