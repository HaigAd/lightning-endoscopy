type PluralRules = {
  [key: string]: {
    plural: string
    threshold?: number
  }
}

const defaultPluralRules: PluralRules = {
  // Common medical terms
  'polyp': { plural: 'polyps' },
  'mass': { plural: 'masses' },
  'lesion': { plural: 'lesions' },
  'ulcer': { plural: 'ulcers' },
  'erosion': { plural: 'erosions' },
  'nodule': { plural: 'nodules' },
  
  // Irregular plurals
  'was': { plural: 'were', threshold: 2 },
  'is': { plural: 'are', threshold: 2 },
  'this': { plural: 'these', threshold: 2 },
  'that': { plural: 'those', threshold: 2 }
}

export function pluralize(word: string, count: number, customRules?: PluralRules): string {
  const rules = { ...defaultPluralRules, ...customRules }
  const rule = rules[word.toLowerCase()]

  if (rule) {
    return count >= (rule.threshold ?? 2) ? rule.plural : word
  }

  // Default English pluralization rules
  if (count === 1) return word

  // Words ending in 'y'
  if (word.endsWith('y')) {
    const isVowelBeforeY = /[aeiou]y$/i.test(word)
    return isVowelBeforeY ? word + 's' : word.slice(0, -1) + 'ies'
  }

  // Words ending in 's', 'sh', 'ch', 'x', 'z'
  if (/[sxz]$/.test(word) || /[cs]h$/.test(word)) {
    return word + 'es'
  }

  return word + 's'
}

export function formatCount(count: number): string {
  if (count === 0) return 'no'
  return count.toString()
}

export function formatMeasurement(
  value: number,
  unit: string,
  options?: { 
    precision?: number
    showUnit?: boolean 
  }
): string {
  const formatted = value.toFixed(options?.precision ?? 0)
  return options?.showUnit === false ? formatted : `${formatted}${unit}`
}

// Helper for template strings
export function plural(count: number, singular: string, plural?: string): string {
  if (plural) {
    return count === 1 ? singular : plural
  }
  return pluralize(singular, count)
}

// Format ranges
export function formatRange(start: number, end: number, unit: string): string {
  if (start === end) {
    return formatMeasurement(start, unit)
  }
  return `${formatMeasurement(start, '')} to ${formatMeasurement(end, unit)}`
}
