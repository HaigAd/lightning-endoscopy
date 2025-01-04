import { create } from 'zustand'
import { 
  Template, 
  FindingTemplate, 
  ActionTemplate,
  SharedTemplate,
  TemplateLibrary,
  TemplateRelationship
} from '../types/templates'
import { processTemplate, validateTemplateValues, evaluateConditions } from '../lib/templateProcessor'
import { assignCodes, validateCodeCompatibility, formatCodeAssignments, CodeAssignment } from '../lib/codeProcessor'
import { loadTemplates } from '../lib/templateLoader'
import { logger } from '../lib/logger'

interface TemplateState {
  // Template Library
  templates: Map<string, Template>
  relationships: Map<string, TemplateRelationship[]>
  indexes: {
    byType: Map<string, string[]>
    byCode: Map<string, string[]>
    byKeyword: Map<string, string[]>
  }
  // Active State
  activeFinding: FindingTemplate | null
  activeAction: ActionTemplate | null
  findingValues: Record<string, any>
  actionValues: Record<string, any>
  errors: Record<string, string>
  codeAssignments: CodeAssignment[]
  codeErrors: string[]
  // State Actions
  setActiveFinding: (template: FindingTemplate | null) => void
  setActiveAction: (template: ActionTemplate | null) => void
  updateFindingValues: (values: Record<string, any>) => void
  updateActionValues: (values: Record<string, any>) => void
  
  // Template Actions
  getAvailableActions: () => ActionTemplate[]
  generateText: () => string
  getTemplatesByType: (type: 'finding' | 'action') => Template[]
  reloadTemplates: () => void
  
  // Version Control
  getActiveTemplateVersion: () => string | null
  validateTemplateCompatibility: () => boolean
  
  // Code Management
  getAssignedCodes: () => {
    primary: string
    modifiers: string[]
    sources: string[]
  }
}

// Version compatibility check
function checkVersionCompatibility(v1: string, v2: string): boolean {
  const [major1] = v1.split('.')
  const [major2] = v2.split('.')
  return major1 === major2
}

// Load initial templates
const initialLibrary = loadTemplates()

export const useTemplateStore = create<TemplateState>((set, get) => ({
  // Template Library State
  ...initialLibrary,

  // Active State
  activeFinding: null,
  activeAction: null,
  findingValues: {},
  actionValues: {},
  errors: {},
  codeAssignments: [],
  codeErrors: [],

  // Actions
  setActiveFinding: (template) => {
    const state = get()
    
    // Clear previous state
    const newState: Partial<TemplateState> = { 
      activeFinding: template,
      findingValues: {},
      errors: {},
      codeAssignments: [] as CodeAssignment[],
      codeErrors: [] as string[]
    }

    // Update codes if template is selected
    if (template) {
      const assignments = assignCodes([template], {})
      const { isValid, conflicts } = validateCodeCompatibility(assignments)
      
      newState.codeAssignments = assignments
      newState.codeErrors = conflicts
    }

    set(newState)
  },

  setActiveAction: (template) => {
    const state = get()
    
    // Clear previous state
    const baseState = { 
      activeAction: template,
      actionValues: {},
      errors: {},
      codeAssignments: [] as CodeAssignment[],
      codeErrors: [] as string[]
    }

    // Update codes if both finding and action are selected
    if (template && state.activeFinding) {
      const assignments = assignCodes(
        [state.activeFinding, template],
        { ...state.findingValues, ...state.actionValues }
      )
      const { isValid, conflicts } = validateCodeCompatibility(assignments)
      
      baseState.codeAssignments = assignments
      baseState.codeErrors = conflicts
    }

    set(baseState)
  },

  updateFindingValues: (values) => {
    const state = get()
    if (!state.activeFinding) return

    // Get shared templates for validation
    const sharedTemplates = new Map<string, SharedTemplate>()
    Object.entries(state.activeFinding.variables).forEach(([key, variable]) => {
      if (variable.useShared?.type) {
        const sharedTemplate = Array.from(state.templates.values())
          .find(t => t.type === 'shared' && t.category === variable.useShared?.type)
        if (sharedTemplate?.type === 'shared') {
          sharedTemplates.set(variable.useShared.type, sharedTemplate)
        }
      }
    })

    const { isValid, errors } = validateTemplateValues(
      state.activeFinding.variables,
      values,
      sharedTemplates
    )

    // Update codes with new values
    const activeTemplates: Template[] = [state.activeFinding]
    if (state.activeAction) activeTemplates.push(state.activeAction)
    
    const assignments = assignCodes(
      activeTemplates,
      { ...values, ...state.actionValues }
    )
    const { conflicts } = validateCodeCompatibility(assignments)

    set({ 
      findingValues: values,
      errors: isValid ? {} : errors,
      codeAssignments: assignments,
      codeErrors: conflicts
    })
  },

  updateActionValues: (values) => {
    const state = get()
    if (!state.activeAction) return

    const { isValid, errors } = validateTemplateValues(
      state.activeAction.variables,
      values
    )

    // Update codes with new values
    if (state.activeFinding) {
      const assignments = assignCodes(
        [state.activeFinding, state.activeAction],
        { ...state.findingValues, ...values }
      )
      const { conflicts } = validateCodeCompatibility(assignments)

      set({ 
        actionValues: values,
        errors: isValid ? {} : errors,
        codeAssignments: assignments,
        codeErrors: conflicts
      })
    } else {
      set({ 
        actionValues: values,
        errors: isValid ? {} : errors
      })
    }
  },

  getAvailableActions: () => {
    const state = get()
    const actions = Array.from(state.templates.values())
      .filter((template): template is ActionTemplate => template.type === 'action')

    // If no finding is selected, only return standalone actions
    if (!state.activeFinding) {
      return actions.filter(template => template.standalone)
    }

    // With a finding selected, only return actions valid for the current finding
    return actions.filter(template => {
      // Skip standalone actions when a finding is selected
      if (template.standalone) return false

      // Check if action is valid for current finding
      const isValidForFinding = template.validForFindings.includes('*') || 
        template.validForFindings.includes(state.activeFinding!.id)
      
      if (!isValidForFinding) return false

      // Check if action is allowed based on current finding's allowedActions
      const allowedAction = state.activeFinding!.allowedActions
        .find(action => action.id === template.id)

      // If the action is valid for all findings (*) and not explicitly disallowed,
      // we consider it available
      if (!allowedAction && template.validForFindings.includes('*')) {
        return true
      }

      if (!allowedAction) return false

      // Check conditions if they exist
      if (allowedAction.conditions) {
        return evaluateConditions(allowedAction.conditions, state.findingValues)
      }

      return true
    })
  },

  generateText: () => {
    const state = get()
    const texts: string[] = []
    logger.debug('Generating report text', {
      hasFinding: !!state.activeFinding,
      hasAction: !!state.activeAction
    })

    if (state.activeFinding) {
      // Get shared templates for text processing
      const sharedTemplates = new Map<string, SharedTemplate>()
      Object.entries(state.activeFinding.variables).forEach(([key, variable]) => {
        if (variable.useShared?.type) {
          const sharedTemplate = Array.from(state.templates.values())
            .find(t => t.type === 'shared' && t.category === variable.useShared?.type)
          if (sharedTemplate?.type === 'shared') {
            sharedTemplates.set(variable.useShared.type, sharedTemplate)
          }
        }
      })

      logger.debug('Processing finding template', {
        templateId: state.activeFinding.id,
        values: Object.keys(state.findingValues),
        sharedTemplates: Array.from(sharedTemplates.keys())
      })
      texts.push(processTemplate(
        state.activeFinding.template, 
        state.findingValues,
        state.activeFinding.variables,
        sharedTemplates
      ))
    }

    if (state.activeAction) {
      logger.debug('Processing action template', {
        templateId: state.activeAction.id,
        values: Object.keys(state.actionValues)
      })
      texts.push(processTemplate(state.activeAction.template, state.actionValues))
    }

    const result = texts.join('\n')
    logger.debug('Generated report text', { result })
    return result
  },

  getTemplatesByType: (type) => {
    const state = get()
    return Array.from(state.templates.values()).filter(t => t.type === type)
  },

  reloadTemplates: () => {
    const library = loadTemplates()
    set({
      ...library,
      activeFinding: null,
      activeAction: null,
      findingValues: {},
      actionValues: {},
      errors: {},
      codeAssignments: [],
      codeErrors: []
    })
  },

  // Version control
  getActiveTemplateVersion: () => {
    const state = get()
    return state.activeFinding?.version ?? null
  },

  // Template compatibility
  validateTemplateCompatibility: () => {
    const state = get()
    if (!state.activeFinding || !state.activeAction) return true

    return checkVersionCompatibility(
      state.activeFinding.version,
      state.activeAction.version
    )
  },

  // Code assignment
  getAssignedCodes: () => {
    const state = get()
    return formatCodeAssignments(state.codeAssignments)
  }
}))
