import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "paris",
  type: "shared",
  category: "morphology",
  name: "Paris Classification",
  version: "1.0.0",
  codes: {
    snomed: ["1234567"] // TODO: Add correct SNOMED code for Paris classification
  },
  variables: {
    size: {
      type: "mixed",
      required: true,
      useShared: {
        type: "size",
        allowDirect: true
      },
      validation: {
        min: 1,
        max: 200
      }
    }
  },
  options: [
    {
      id: "0-ip",
      name: "0-Ip",
      hotkey: "i",
      value: "0-Ip",
      validFor: {
        findings: ["polyp", "mass"]
      },
      references: {
        size: "large" // Typically for larger pedunculated polyps
      },
      codes: {
        snomed: ["1234568"] // TODO: Add correct SNOMED code
      }
    },
    {
      id: "0-is",
      name: "0-Is",
      hotkey: "s",
      value: "0-Is",
      validFor: {
        findings: ["polyp", "mass"]
      },
      references: {
        size: "small" // Often for smaller sessile polyps
      },
      codes: {
        snomed: ["1234569"] // TODO: Add correct SNOMED code
      }
    },
    {
      id: "0-iia",
      name: "0-IIa",
      hotkey: "a",
      value: "0-IIa",
      validFor: {
        findings: ["polyp", "mass"]
      },
      references: {
        size: "diminutive" // Typically for smaller flat elevated lesions
      },
      codes: {
        snomed: ["1234570"] // TODO: Add correct SNOMED code
      }
    },
    {
      id: "0-iib",
      name: "0-IIb",
      hotkey: "b",
      value: "0-IIb",
      validFor: {
        findings: ["polyp", "mass"]
      },
      references: {
        size: "diminutive" // Typically for very flat lesions
      },
      codes: {
        snomed: ["1234571"] // TODO: Add correct SNOMED code
      }
    },
    {
      id: "0-iic",
      name: "0-IIc",
      hotkey: "c",
      value: "0-IIc",
      validFor: {
        findings: ["polyp", "mass"]
      },
      references: {
        size: "small" // Often for slightly depressed lesions
      },
      codes: {
        snomed: ["1234572"] // TODO: Add correct SNOMED code
      }
    }
  ]
}
