import { ActionTemplate } from '../../types/templates'

export const template: ActionTemplate = {
  id: "dilatation",
  type: "action",
  name: "Dilatation",
  description: "Endoscopic dilatation procedure",
  version: "1.0.0",
  codes: {
    snomed: ["180246003"] // Endoscopic dilatation
  },
  variables: {
    dilator: {
      type: "mixed",
      required: true,
      description: "Type of dilator used",
      useShared: {
        type: "dilator"
      }
    },
    size: {
      type: "mixed",
      required: true,
      description: "Size of dilator used",
      useShared: {
        type: "dilatorSize",
        variables: {
          dilatorType: "{dilator.includes('Balloon') ? 'balloon' : 'savary'}"
        }
      }
    },
    technique: {
      type: "enum",
      required: true,
      options: [
        "direct visualization",
        "wire-guided",
        "fluoroscopic guidance",
        "combined endoscopic and fluoroscopic"
      ]
    },
    successful: {
      type: "boolean",
      required: true,
      default: true,
      description: "Whether the dilatation was successful"
    },
    complications: {
      type: "enum",
      required: false,
      allow_multiple: true,
      options: [
        "mucosal disruption",
        "bleeding",
        "perforation",
        "pain",
        "oxygen desaturation"
      ]
    },
    perforationDetails: {
      type: "mixed",
      required: false,
      description: "Additional details if perforation occurred",
      useShared: {
        type: "perforation"
      }
    },
    postDilatationFindings: {
      type: "enum",
      required: true,
      allow_multiple: true,
      options: [
        "adequate luminal diameter achieved",
        "residual stenosis",
        "mucosal tear",
        "deep mucosal tear",
        "clean base tear",
        "visible vessel in tear",
        "active bleeding from tear"
      ]
    }
  },
  template: [
    "Dilatation performed using {dilator} dilator",
    "[if dilator.includes('Balloon')]to size {size}[/if]",
    "[if !dilator.includes('Balloon')]up to {size}[/if]",
    " under {technique}.",
    "[if successful]Successful dilatation achieved[/if]",
    "[if !successful]Unable to achieve adequate dilatation[/if]",
    "[if complications && complications.length > 0]Complications: {complications.join(', ')}[/if]",
    "[if complications?.includes('perforation')]Perforation details: {perforationDetails}[/if]",
    "Post-dilatation findings: {postDilatationFindings.join(', ')}"
  ],
  validForFindings: [],
  standalone: true,
  nextActions: [
    {
      id: "biopsy",
      conditions: [
        {
          field: "complications",
          operator: "includes",
          value: "mucosal disruption"
        }
      ]
    },
    {
      id: "hemostasis",
      conditions: [
        {
          field: "complications",
          operator: "includes",
          value: "bleeding"
        }
      ]
    },
    {
      id: "closure",
      conditions: [
        {
          field: "complications",
          operator: "includes",
          value: "perforation"
        }
      ]
    }
  ],
  autoSuggest: false
}
