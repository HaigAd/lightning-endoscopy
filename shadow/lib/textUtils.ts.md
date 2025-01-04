# Text Utilities (textUtils.ts)

Text formatting utilities for medical reporting.

## Functions

### pluralize(word: string, count: number, customRules?: PluralRules)
Handles pluralization with medical term support.
- Built-in rules for common terms (polyp, mass, lesion, etc.)
- Supports custom rules and irregular plurals

### formatCount(count: number)
- Returns 'no' for zero
- Returns number as string otherwise

### formatMeasurement(value: number, unit: string, options?)
Formats measurements with units.
- Options: precision (decimals), showUnit (boolean)

### plural(count: number, singular: string, plural?: string)
Template string helper for pluralization.

### formatRange(start: number, end: number, unit: string)
Formats numeric ranges (e.g., "5 to 10mm").

## Notes
- Add medical terms to defaultPluralRules as needed
- Test with edge cases (zero, decimals)
- Maintain consistent measurement formatting
