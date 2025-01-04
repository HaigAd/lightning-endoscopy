export interface Variable {
  type: 'number' | 'text' | 'enum' | 'boolean' | 'mixed'
  required: boolean
  default?: any
  options?: string[]
  description?: string
  allow_multiple?: boolean  // Allows selecting multiple values for enum/mixed types
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  useShared?: {
    type: string  // Category of shared template to use (e.g. 'location', 'size', etc.)
    allowDirect?: boolean // For mixed type - allows direct value input in addition to enum options
    variables?: Record<string, any> // Variables to pass to the shared template
  }
}

export interface BaseTemplate {
  id: string
  type: 'finding' | 'action' | 'shared'
  name: string
  description?: string
  version: string
  codes: {
    snomed: string[]
    custom?: Record<string, string>
  }
}

export interface FindingTemplate extends BaseTemplate {
  type: 'finding'
  variables: Record<string, Variable>
  template: string | string[]
  allowedActions: Array<{
    id: string
    conditions?: {
      field: string
      operator: 'equals' | 'includes' | 'greater' | 'less'
      value: any
    }[]
    required?: boolean
    default?: Record<string, any>
  }>
}

export interface ActionTemplate extends BaseTemplate {
  type: 'action'
  variables: Record<string, Variable>
  template: string | string[]
  validForFindings: string[]  // Can include "*" for all findings
  standalone?: boolean  // Whether this action can be used without a finding
  nextActions?: Array<{
    id: string
    conditions?: {
      field: string
      operator: 'equals' | 'includes' | 'greater' | 'less'
      value: any
    }[]
  }>
  autoSuggest?: boolean
}

export interface SharedTemplate extends BaseTemplate {
  type: 'shared'
  category: string  // Type of shared template (e.g. 'location', 'size', 'morphology', etc.)
  variables?: Record<string, Variable>  // Optional variables that can reference other shared templates
  template?: string | string[]  // Optional template string(s) for variable substitution
  options: Array<{
    id: string
    name: string
    hotkey: string
    value: string | number
    validFor: {
      procedures?: string[]
      findings?: string[]
      actions?: string[]
    }
    codes?: {
      snomed: string[]
      custom?: Record<string, string>
    }
    references?: Record<string, any>  // Values for any referenced shared template variables
  }>
}

export type Template = FindingTemplate | ActionTemplate | SharedTemplate

export interface TemplateRelationship {
  parent: string
  child: string
  relationship: 'requires' | 'suggests' | 'allows'
  conditions?: {
    field: string
    value: any
  }[]
}

export interface CodeMapping {
  template: string
  conditions?: {
    field: string
    value: any
  }[]
  codes: {
    primary: string
    modifiers?: string[]
  }
}

export interface ValidationRule {
  field: string
  rule: 'required' | 'range' | 'pattern' | 'custom'
  params?: any
  message: string
}

export interface TemplateLibrary {
  templates: Map<string, Template>
  relationships: Map<string, TemplateRelationship[]>
  indexes: {
    byType: Map<string, string[]>
    byCode: Map<string, string[]>
    byKeyword: Map<string, string[]>
    byCategory: Map<string, string[]>
  }
}
