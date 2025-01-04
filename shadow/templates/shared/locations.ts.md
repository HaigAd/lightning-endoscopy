# GI Tract Locations (locations.ts)

Shared template defining anatomical locations in the GI tract with hotkeys and procedure-specific validation.

## Structure

### Base Properties
- id: "locations"
- type: "shared"
- category: "location"
- SNOMED: 86117003 (GI tract structure)

### Locations

#### Colonoscopy Locations
All valid for colonoscopy procedures, all findings, and biopsy/polypectomy actions:

- Ascending Colon
  - Hotkey: 'a'
  - SNOMED: 9040008
  
- Transverse Colon
  - Hotkey: 't'
  - SNOMED: 485005
  
- Descending Colon
  - Hotkey: 'd'
  - SNOMED: 32713005
  
- Sigmoid Colon
  - Hotkey: 's'
  - SNOMED: 60184004
  
- Rectum
  - Hotkey: 'r'
  - SNOMED: 34402009

#### EGD Locations
Valid for EGD procedures, all findings, and biopsy actions:

- Gastric Antrum
  - Hotkey: 'n'
  - SNOMED: 14742008
  
- Gastric Body
  - Hotkey: 'b'
  - SNOMED: 85973000

## Usage

Quick entry format:
```
[hotkey] -> selects location
```

Example:
```
'a' -> selects "ascending colon"
```

## Validation

- Locations are filtered by:
  1. Current procedure (colonoscopy/EGD)
  2. Active finding type
  3. Available actions

## Notes
- Hotkeys are single characters for quick entry
- Each location includes proper SNOMED coding
- Validation prevents incorrect location selection (e.g. gastric locations during colonoscopy)
