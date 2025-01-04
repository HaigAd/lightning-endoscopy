import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "perforation",
  type: "shared",
  name: "Perforation Details",
  category: "complication",
  version: "1.0.0",
  codes: {
    snomed: ["5596006"] // Perforation of organ
  },
  variables: {
    size: {
      type: "enum",
      required: true,
      options: ["microscopic", "small (<1cm)", "medium (1-2cm)", "large (>2cm)"]
    },
    location: {
      type: "text",
      required: true,
      useShared: {
        type: "location"
      }
    }
  },
  options: [
    {
      id: "clean",
      name: "Clean perforation",
      hotkey: "cp",
      value: "clean perforation with no contamination",
      validFor: {
        actions: ["dilatation", "polypectomy", "egd", "colonoscopy"]
      },
      codes: {
        snomed: ["5596006", "255235000"] // Perforation, Clean surgical wound
      }
    },
    {
      id: "contaminated",
      name: "Contaminated perforation",
      hotkey: "co",
      value: "contaminated perforation with luminal contents",
      validFor: {
        actions: ["dilatation", "polypectomy", "egd", "colonoscopy"]
      },
      codes: {
        snomed: ["5596006", "255236004"] // Perforation, Contaminated surgical wound
      }
    },
    {
      id: "sealed",
      name: "Self-sealed perforation",
      hotkey: "sp",
      value: "self-sealed perforation",
      validFor: {
        actions: ["dilatation", "polypectomy", "egd", "colonoscopy"]
      },
      codes: {
        snomed: ["5596006", "255237008"] // Perforation, Healing surgical wound
      }
    }
  ],
  template: [
    "{value} noted in the {location}",
    "[if size]measuring {size}[/if]"
  ]
}
