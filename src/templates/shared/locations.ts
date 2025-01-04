import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "locations",
  type: "shared",
  category: "location",
  name: "GI Tract Locations",
  version: "1.0.0",
  codes: {
    snomed: ["86117003"] // GI tract structure
  },
  options: [
    {
      id: "asc",
      name: "ascending colon",
      hotkey: "a",
      value: "ascending colon",
      validFor: {
        procedures: ["colonoscopy"],
        findings: ["*"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["9040008"]  // Ascending colon structure
      }
    },
    {
      id: "trans",
      name: "transverse colon",
      hotkey: "t",
      value: "transverse colon",
      validFor: {
        procedures: ["colonoscopy"],
        findings: ["*"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["485005"]  // Transverse colon structure
      }
    },
    {
      id: "desc",
      name: "descending colon",
      hotkey: "d",
      value: "descending colon",
      validFor: {
        procedures: ["colonoscopy"],
        findings: ["*"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["32713005"]  // Descending colon structure
      }
    },
    {
      id: "sig",
      name: "sigmoid colon",
      hotkey: "s",
      value: "sigmoid colon",
      validFor: {
        procedures: ["colonoscopy"],
        findings: ["*"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["60184004"]  // Sigmoid colon structure
      }
    },
    {
      id: "rect",
      name: "rectum",
      hotkey: "r",
      value: "rectum",
      validFor: {
        procedures: ["colonoscopy"],
        findings: ["*"],
        actions: ["biopsy", "polypectomy"]
      },
      codes: {
        snomed: ["34402009"]  // Rectum structure
      }
    },
    {
      id: "antrum",
      name: "gastric antrum",
      hotkey: "n",
      value: "gastric antrum",
      validFor: {
        procedures: ["egd"],
        findings: ["*"],
        actions: ["biopsy"]
      },
      codes: {
        snomed: ["14742008"]  // Gastric antrum structure
      }
    },
    {
      id: "body",
      name: "gastric body",
      hotkey: "b",
      value: "gastric body",
      validFor: {
        procedures: ["egd"],
        findings: ["*"],
        actions: ["biopsy"]
      },
      codes: {
        snomed: ["85973000"]  // Gastric body structure
      }
    }
  ]
}
