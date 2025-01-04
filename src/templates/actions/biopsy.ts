import { ActionTemplate } from '../../types/templates'

export const template: ActionTemplate = {
  id: "biopsy",
  type: "action",
  name: "Biopsy",
  description: "Tissue sampling procedure",
  version: "1.0.0",
  codes: {
    snomed: ["86273004"], // Biopsy
  },
  variables: {
    method: {
      type: "enum",
      required: true,
      options: ["forceps", "needle", "snare"]
    },
    samples: {
      type: "number",
      required: true,
      validation: {
        min: 1,
        max: 10
      }
    },
    adequate: {
      type: "boolean",
      required: true,
      default: true
    },
    reason: {
      type: "text",
      required: false,
      description: "Optional reason for biopsy"
    }
  },
  template: [
    "{samples} biopsy sample{samples > 1 ? 's' : ''} obtained using {method}",
    "[if reason]Reason: {reason}[/if]",
    "[if adequate]Adequate sampling achieved[/if]",
    "[if !adequate]Sampling may be suboptimal[/if]"
  ],
  // Make biopsy available for all findings
  validForFindings: ["*"],
  nextActions: [
    {
      id: "retrieval",
      conditions: [
        {
          field: "adequate",
          operator: "equals",
          value: true
        }
      ]
    }
  ],
  autoSuggest: false
}
