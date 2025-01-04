import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "dilators",
  type: "shared",
  name: "Dilator Types",
  category: "dilator",
  version: "1.0.0",
  codes: {
    snomed: ["26412008"] // Dilator device
  },
  options: [
    {
      id: "balloon_boston",
      name: "Boston Scientific CRE Balloon",
      hotkey: "bb",
      value: "Boston Scientific CRE Balloon",
      validFor: {
        actions: ["dilatation"]
      },
      codes: {
        snomed: ["26412008", "425487007"] // Dilator device, Balloon dilator
      }
    },
    {
      id: "balloon_cook",
      name: "Cook Medical Balloon",
      hotkey: "cb",
      value: "Cook Medical Balloon",
      validFor: {
        actions: ["dilatation"]
      },
      codes: {
        snomed: ["26412008", "425487007"]
      }
    },
    {
      id: "savary_cook",
      name: "Cook Savary-Gilliard",
      hotkey: "cs",
      value: "Cook Savary-Gilliard",
      validFor: {
        actions: ["dilatation"]
      },
      codes: {
        snomed: ["26412008", "720731000"] // Dilator device, Bougie dilator
      }
    },
    {
      id: "savary_wilson",
      name: "Wilson-Cook Savary",
      hotkey: "ws",
      value: "Wilson-Cook Savary",
      validFor: {
        actions: ["dilatation"]
      },
      codes: {
        snomed: ["26412008", "720731000"]
      }
    }
  ]
}
