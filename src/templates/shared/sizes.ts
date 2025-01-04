import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "sizes",
  type: "shared",
  category: "size",
  name: "Standard Sizes",
  version: "1.0.0",
  codes: {
    snomed: ["246479003"] // Size property
  },
  variables: {
    unit: {
      type: "enum",
      required: true,
      options: ["mm", "cm"],
      default: "mm",
      description: "Unit of measurement"
    }
  },
  template: [
    "{value} in size", // For enum options
    "{value}{unit} in size" // For direct numeric values
  ],
  options: [
    {
      id: "diminutive",
      name: "diminutive",
      hotkey: "d",
      value: "diminutive",
      validFor: {
        procedures: ["colonoscopy", "egd"],
        findings: ["polyp", "mass"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["255507004"] // Diminutive size
      }
    },
    {
      id: "small",
      name: "small",
      hotkey: "s",
      value: "small",
      validFor: {
        procedures: ["colonoscopy", "egd"],
        findings: ["polyp", "mass"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["255508009"] // Small size
      }
    },
    {
      id: "medium",
      name: "medium",
      hotkey: "m",
      value: "medium",
      validFor: {
        procedures: ["colonoscopy", "egd"],
        findings: ["polyp", "mass"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["255509001"] // Medium size
      }
    },
    {
      id: "large",
      name: "large",
      hotkey: "l",
      value: "large",
      validFor: {
        procedures: ["colonoscopy", "egd"],
        findings: ["polyp", "mass"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["255510006"] // Large size
      }
    }
  ]
}
