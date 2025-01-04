# Template Types (templates.ts)

Core type system for medical templates.

## Types

### Variable
Input field definition:
- type: number/text/enum/boolean
- validation rules
- required/optional status

### BaseTemplate
Base template properties:
- id, name, version
- SNOMED codes

### FindingTemplate
Clinical observations with:
- input variables
- template text
- allowed actions

### ActionTemplate
Clinical procedures with:
- input variables
- template text
- valid findings/next actions
- standalone flag (can be used without a finding)

### TemplateLibrary
Template container with indexes:
- by ID and type
- by SNOMED code
- by keywords

## Notes
- Use SNOMED codes
- Validate inputs
- Support conditions
