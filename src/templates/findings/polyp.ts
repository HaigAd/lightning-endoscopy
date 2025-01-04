import { FindingTemplate } from '../../types/templates'

export const template: FindingTemplate = {
  id: "polyp",
  type: "finding",
  name: "Polyp Finding",
  description: "Template for documenting polyps",
  version: "1.0.0",
  codes: {
    snomed: ["68496003"], // Polyp
    custom: {
      "local": "POLYP-1"
    }
  },
  variables: {
    number: {
      type: "number",
      required: true,
      validation: {
        min: 1,
        max: 100
      }
    },
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
        allowDirect: true
      },
      validation: {
        min: 1,
        max: 150
      }
    },
    morphology: {
      type: "enum",
      required: false,
      options: ["sessile", "pedunculated", "flat"]
    },
    classification: {
      type: "enum",
      required: false,
      allow_multiple:false,
      useShared: {
        type: "paris",
        allowDirect: false
      }
    },
    removed: {
      type: "boolean",
      required: false,
      default: false
    }
  },
  template: [
    "{count:number} {morphology} {classification} {plural:number,polyp} ",
    "{plural:number,was,were} found in {location}",
    "[if size]ranging in size from {size}[/if]",
    "[if removed]{number > 1 ? 'These were' : 'This was'} removed[/if]"
  ],
  allowedActions: [
    {
      id: "polypectomy",
      conditions: [],
      required: false
    }, 
    {
      id: "biopsy",
      conditions: [],
      required: false
    }
  ]
}
