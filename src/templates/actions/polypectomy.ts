import { ActionTemplate } from '../../types/templates'

export const template: ActionTemplate = {
  id: "polypectomy",
  type: "action",
  name: "Polypectomy",
  description: "Polyp removal procedure",
  version: "1.0.0",
  codes: {
    snomed: ["65801008"], // Polypectomy
  },
  variables: {
    technique: {
      type: "enum",
      required: true,
      options: ["hot snare", "cold snare", "hot biopsy", "cold biopsy"]
    },
    complete: {
      type: "boolean",
      required: true,
      default: true
    }
  },
  template: [
    "Polypectomy performed using {technique}",
    "[if complete]Complete removal achieved[/if]",
    "[if !complete]Partial removal only[/if]"
  ],
  validForFindings: ["polyp"],
  nextActions: [
    {
      id: "retrieval",
      conditions: [
        {
          field: "complete",
          operator: "equals",
          value: true
        }
      ]
    }
  ],
  autoSuggest: true
}
