import { CodeMapping, Template } from '../types/templates'

export interface CodeAssignment {
  primary: string
  modifiers: string[]
  source: string // template ID that contributed this code
}

export function assignCodes(
  templates: Template[],
  values: Record<string, any>
): CodeAssignment[] {
  const assignments: CodeAssignment[] = []

  templates.forEach(template => {
    // Always include primary SNOMED code from template
    assignments.push({
      primary: template.codes.snomed[0],
      modifiers: template.codes.snomed.slice(1),
      source: template.id
    })
  })

  return assignments
}

// Validate code compatibility between templates
export function validateCodeCompatibility(
  assignments: CodeAssignment[]
): { isValid: boolean; conflicts: string[] } {
  const conflicts: string[] = []
  const primaryCodes = new Set<string>()

  assignments.forEach(assignment => {
    if (primaryCodes.has(assignment.primary)) {
      conflicts.push(
        `Duplicate primary code ${assignment.primary} from template ${assignment.source}`
      )
    }
    primaryCodes.add(assignment.primary)
  })

  return {
    isValid: conflicts.length === 0,
    conflicts
  }
}

// Format codes for external systems
export function formatCodeAssignments(
  assignments: CodeAssignment[]
): {
  primary: string
  modifiers: string[]
  sources: string[]
} {
  return {
    primary: assignments[0]?.primary ?? '',
    modifiers: assignments.flatMap(a => a.modifiers),
    sources: assignments.map(a => a.source)
  }
}
