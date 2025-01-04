import { SharedTemplate } from '../../types/templates'

export const template: SharedTemplate = {
  id: "dilatorSizes",
  type: "shared",
  name: "Dilator Sizes",
  category: "dilatorSize",
  version: "1.0.0",
  codes: {
    snomed: ["246205007"] // Quantity measure
  },
  variables: {
    dilatorType: {
      type: "text",
      required: true,
      description: "Type of dilator being used"
    }
  },
  options: [
    // Balloon dilator sizes
    {
      id: "balloon_6_8",
      name: "6-8mm",
      hotkey: "68",
      value: "6-8mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "balloon"
      }
    },
    {
      id: "balloon_8_10",
      name: "8-10mm",
      hotkey: "810",
      value: "8-10mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "balloon"
      }
    },
    {
      id: "balloon_10_12",
      name: "10-12mm",
      hotkey: "1012",
      value: "10-12mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "balloon"
      }
    },
    {
      id: "balloon_12_15",
      name: "12-15mm",
      hotkey: "1215",
      value: "12-15mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "balloon"
      }
    },
    {
      id: "balloon_15_18",
      name: "15-18mm",
      hotkey: "1518",
      value: "15-18mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "balloon"
      }
    },
    // Savary dilator sizes
    {
      id: "savary_5",
      name: "5mm (15Fr)",
      hotkey: "5",
      value: "5mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_7",
      name: "7mm (21Fr)",
      hotkey: "7",
      value: "7mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_9",
      name: "9mm (27Fr)",
      hotkey: "9",
      value: "9mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_11",
      name: "11mm (33Fr)",
      hotkey: "11",
      value: "11mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_12.8",
      name: "12.8mm (38Fr)",
      hotkey: "13",
      value: "12.8mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_14",
      name: "14mm (42Fr)",
      hotkey: "14",
      value: "14mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    },
    {
      id: "savary_15",
      name: "15mm (45Fr)",
      hotkey: "15",
      value: "15mm",
      validFor: {
        actions: ["dilatation"]
      },
      references: {
        dilatorType: "savary"
      }
    }
  ]
}
