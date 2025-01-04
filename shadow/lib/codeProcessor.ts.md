# Code Processor (codeProcessor.ts)

## Overview
This module handles the processing and validation of medical coding assignments, particularly focusing on SNOMED CT codes. It manages how medical codes are assigned from templates and ensures their compatibility.

## Core Types

### CodeAssignment
```typescript
interface CodeAssignment {
  primary: string      // Primary SNOMED CT code
  modifiers: string[]  // Additional modifier codes
  source: string      // ID of template that provided the code
}
```

## Key Functions

### `assignCodes(templates: Template[], values: Record<string, any>): CodeAssignment[]`
Assigns SNOMED CT codes from a set of templates.

**Behavior:**
- Takes an array of templates and their associated values
- Extracts SNOMED codes from each template
- First code is considered primary, others are modifiers
- Returns array of code assignments with source tracking

**Example:**
```typescript
const assignments = assignCodes([
  {
    id: "mass",
    codes: {
      snomed: ["125605004", "263714004"] // Mass + Additional codes
    }
  }
], {})
// Result:
// [{
//   primary: "125605004",
//   modifiers: ["263714004"],
//   source: "mass"
// }]
```

### `validateCodeCompatibility(assignments: CodeAssignment[]): { isValid: boolean; conflicts: string[] }`
Validates code assignments for compatibility.

**Validation Rules:**
- No duplicate primary codes allowed
- Each primary code must come from a different template

**Returns:**
```typescript
{
  isValid: boolean,    // true if no conflicts found
  conflicts: string[]  // Array of conflict descriptions
}
```

**Example:**
```typescript
const result = validateCodeCompatibility([
  {
    primary: "125605004",
    modifiers: ["263714004"],
    source: "mass"
  },
  {
    primary: "125605004", // Duplicate!
    modifiers: [],
    source: "lesion"
  }
])
// Result:
// {
//   isValid: false,
//   conflicts: ["Duplicate primary code 125605004 from template lesion"]
// }
```

### `formatCodeAssignments(assignments: CodeAssignment[])`
Formats code assignments for external system integration.

**Returns:**
```typescript
{
  primary: string,     // Primary code from first assignment
  modifiers: string[], // All modifier codes combined
  sources: string[]    // List of source template IDs
}
```

**Example:**
```typescript
const formatted = formatCodeAssignments([
  {
    primary: "125605004",
    modifiers: ["263714004"],
    source: "mass"
  },
  {
    primary: "86273004",
    modifiers: ["424226004"],
    source: "biopsy"
  }
])
// Result:
// {
//   primary: "125605004",
//   modifiers: ["263714004", "424226004"],
//   sources: ["mass", "biopsy"]
// }
```

## Dependencies
- Imports types from '../types/templates'

## Notes for Developers
- Primary codes should be carefully chosen in templates
- Consider SNOMED CT hierarchies when assigning codes
- Modifier codes should refine, not contradict, primary codes
- Code validation should happen before saving/transmitting
- Monitor for coding conflicts during template development
- Consider adding support for other coding systems (ICD-10, etc.)
- Maintain documentation of code meanings and relationships
