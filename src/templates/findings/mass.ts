import { FindingTemplate } from '../../types/templates'

export const template: FindingTemplate = {
  id: "mass",
  type: "finding",
  name: "Mass Finding",
  description: "Template for documenting masses",
  version: "1.0.0",
  codes: {
    snomed: ["125605004"], // Mass
    custom: {
      "local": "MASS-1"
    }
  },
  variables: {
    location: {
      type: "enum",
      required: true,
      allow_multiple: true,
      useShared: {
        type: "location"
      }
    },
    size: {
      type: "mixed",
      required: true,
      allow_multiple: true,
      useShared: {
        type: "size",
        allowDirect: true,
        variables: {
          unit: "mm" // Default to mm, can be overridden in UI
        }
      },
      validation: {
        min: 1,
        max: 200
      }
    },
    appearance: {
      type: "enum",
      required: true,
      options: ["ulcerated", "smooth", "irregular", "fungating", "submucosal", "mucosal"]
    },
    biopsied: {
      type: "boolean",
      required: false,
      default: false
    }
  },
  template: [
    "An {appearance} mass was found in {location}, measuring {size}",
    "[if biopsied]Biopsies {plural:1,was,were} taken[/if]"
  ],
  allowedActions: [
    {
      id: "biopsy",
      conditions: [],
      required: false
    }
  ]
}
