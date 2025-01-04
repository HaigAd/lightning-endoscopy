# Template Store (templateStore.ts)

Zustand store managing medical template state and operations.

## State
- Template library (templates, relationships, indexes)
- Active templates (finding/action)
- Template values and errors
- Code assignments

## Key Functions

### Template Selection
- setActiveFinding: Set active finding template
- setActiveAction: Set active action template
- getAvailableActions: Get valid actions for current finding

### Value Management
- updateFindingValues: Update finding template values
- updateActionValues: Update action template values
- generateText: Generate text from current templates

### Template Management
- getTemplatesByType: Get templates by type (finding/action)
- reloadTemplates: Reload all templates
- validateTemplateCompatibility: Check version compatibility

### Code Management
- getAssignedCodes: Get formatted SNOMED codes
- Automatic code validation on template/value changes

## Notes
- Uses Zustand for state management
- Validates template compatibility
- Handles code assignments automatically
- Maintains template relationships
