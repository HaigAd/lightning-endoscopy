# Template Loader (templateLoader.ts)

Loads and indexes medical templates using Vite's glob import.

## Key Functions

### `loadTemplates(): TemplateLibrary`
Returns organized template library with:
- Templates indexed by ID
- Relationships (requires/suggests/allows)
- Indexes by type, SNOMED code, keywords, and category

## Dynamic Template Loading

The loader automatically discovers and loads templates from three directories:

```typescript
const findingModules = import.meta.glob('../templates/findings/*.ts')
const actionModules = import.meta.glob('../templates/actions/*.ts')
const sharedModules = import.meta.glob('../templates/shared/*.ts')
```

### Shared Templates
- Automatically loaded from `templates/shared/` directory
- Indexed by category for dynamic lookup
- No explicit naming required in code
- New shared templates can be added by creating files in the shared directory

### Template Organization
1. **Findings**: Clinical observations (e.g., polyp, mass)
   - Located in `templates/findings/`
   - Indexed by type, codes, keywords
   - Can specify allowed actions

2. **Actions**: Medical procedures (e.g., biopsy, polypectomy)
   - Located in `templates/actions/`
   - Indexed by type, codes, keywords
   - Can specify valid findings and next actions

3. **Shared**: Reusable template components (e.g., locations, sizes)
   - Located in `templates/shared/`
   - Indexed by category
   - Used by findings and actions for standardized values

## Indexing Features

### Primary Indexes
- `templates`: Map of all templates by ID
- `relationships`: Map of template relationships
- `indexes.byType`: Templates grouped by type (finding/action/shared)
- `indexes.byCode`: Templates grouped by SNOMED code
- `indexes.byKeyword`: Templates grouped by searchable terms
- `indexes.byCategory`: Shared templates grouped by category

### Relationship Types
- `requires`: Template A requires Template B
- `suggests`: Template A suggests Template B
- `allows`: Template A allows Template B (with optional conditions)

## Notes
- Template IDs must be unique across all types
- Relationships can have conditions
- Uses Vite's import.meta.glob for dynamic imports
- Shared templates are automatically available to all templates
- New shared templates are discovered automatically
- Categories are derived from shared template definitions
