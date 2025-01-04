# Template Processor (templateProcessor.ts)

## Overview
This module handles the processing, validation, and evaluation of templates. It provides functionality to substitute variables, process conditional logic, apply formatting functions, and validate template values against their definitions.

## Types

### SharedTemplateContext
```typescript
type SharedTemplateContext = Map<string, SharedTemplate>
```
A Map containing shared templates indexed by their category. This allows for dynamic loading and access of shared templates without explicitly naming them in the code.

## Key Functions

### `processTemplate(template: string | string[], values: Record<string, any>, variables?: Record<string, Variable>, sharedTemplates?: SharedTemplateContext): string`
Processes a template string or array of strings by substituting variables and evaluating expressions.

**Features:**
1. **Conditional Blocks**
   ```typescript
   // Format: [if condition]content[/if]
   "[if size > 5]Large mass[/if]" // Outputs "Large mass" if size > 5
   ```

2. **Ternary Expressions**
   ```typescript
   // Format: {condition ? trueText : falseText}
   "{count > 1 ? multiple : single}" // Outputs based on count
   ```

3. **Function Calls**
   ```typescript
   // Format: {functionName:arg1,arg2,...}
   "{plural:2,polyp}"        // Outputs "polyps"
   "{measure:5,mm}"          // Outputs "5mm"
   "{range:1,3,cm}"         // Outputs "1-3cm"
   ```

4. **Variable Substitution**
   ```typescript
   // Format: {variableName}
   "Mass measuring {size}mm" // Substitutes size value
   "{location}"             // Automatically looks up shared template value if variable uses shared template
   ```

5. **Shared Template Values (Legacy Format)**
   ```typescript
   // Format: {sharedValue:value,type}
   "{sharedValue:anterior,location}" // Explicitly looks up value in shared location template
   ```

**Built-in Processor Functions:**
- `sharedValue(value, type, sharedTemplates)`: Processes values from shared templates
- `plural(count, word, pluralForm?)`: Handles pluralization
- `count(value)`: Formats numeric counts
- `measure(value, unit)`: Formats measurements
- `range(start, end, unit)`: Formats numeric ranges

### `validateTemplateValues(variables: Record<string, Variable>, values: Record<string, any>, sharedTemplates?: Map<string, Template>)`
Validates template values against their variable definitions.

**Validation Types:**
```typescript
{
  isValid: boolean,
  errors: Record<string, string>
}
```

**Validates:**
- Required fields presence
- Number ranges and constraints
- Text pattern matching
- Enum value validation (including shared template values)
- Boolean type checking

**Example:**
```typescript
const result = validateTemplateValues({
  size: {
    type: 'number',
    required: true,
    validation: { min: 0, max: 100 }
  },
  location: {
    type: 'enum',
    required: true,
    useShared: { type: 'location' }
  }
}, {
  size: 50,
  location: 'anterior'
}, sharedTemplates)
// result: { isValid: true, errors: {} }
```

### `evaluateConditions(conditions: Array<Condition>, values: Record<string, any>): boolean`
Evaluates conditions against provided values.

**Supported Operators:**
- `equals`: Exact value match
- `includes`: Array inclusion check
- `greater`: Numeric greater than
- `less`: Numeric less than

**Example:**
```typescript
const result = evaluateConditions([
  {
    field: 'size',
    operator: 'greater',
    value: 5
  }
], {
  size: 10
})
// result: true
```

## Expression Evaluation

The template processor includes a safe expression evaluator that supports:

**Comparison Operators:**
- `>`: Greater than
- `<`: Less than
- `>=`: Greater than or equal
- `<=`: Less than or equal
- `===`: Strict equality
- `!==`: Strict inequality

**Safety Features:**
- Input validation and sanitization
- Error handling and logging
- Safe type conversion
- Protected evaluation context

## Error Handling
- Invalid expressions log errors and return false
- Function processing errors are caught and logged
- Missing variables are replaced with empty strings
- Type mismatches trigger validation errors
- Invalid shared template values are logged with context

## Dependencies
- Requires types from '../types/templates'
- Uses formatting functions from './textUtils'
- Uses logger from './logger'

## Notes for Developers
- Template strings can mix multiple features (conditionals, functions, variables)
- Add new processor functions by extending the processors object
- Validation rules should match variable definitions in templates
- Consider adding error context in validation messages
- Test complex templates with edge cases
- Monitor console for processing errors
- Shared templates are dynamically loaded and accessed via Map
- New shared templates can be added by creating files in templates/shared/
