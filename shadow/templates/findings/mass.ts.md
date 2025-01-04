# Mass Finding Template (mass.ts)

Finding template for documenting masses.

## Template Structure
- ID: mass
- Type: finding
- SNOMED: 125605004 (Mass)

## Variables
- size: number (1-200mm)
- appearance: enum (ulcerated/smooth/irregular/fungating/submucosal/mucosal)
- location: text
- biopsied: boolean (optional)

## Text Generation
```
A {measure:size,mm} {appearance} mass was found in the {location}
[if biopsied]Biopsies {plural:1,was,were} taken[/if]
```

## Actions
- biopsy: allowed if size > 3mm
