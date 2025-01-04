import { describe, it, expect } from 'vitest'
import { formatCount, formatMeasurement, plural, formatRange } from '../../lib/textUtils'

describe('Text Utils', () => {
  describe('formatCount', () => {
    it('formats zero as "no"', () => {
      expect(formatCount(0)).toBe('no')
    })

    it('formats positive numbers as strings', () => {
      expect(formatCount(1)).toBe('1')
      expect(formatCount(10)).toBe('10')
    })
  })

  describe('formatMeasurement', () => {
    it('formats basic measurements', () => {
      expect(formatMeasurement(5, 'mm')).toBe('5mm')
      expect(formatMeasurement(10, 'cm')).toBe('10cm')
    })

    it('formats with precision', () => {
      expect(formatMeasurement(5.67, 'mm', { precision: 1 })).toBe('5.7mm')
      expect(formatMeasurement(10.123, 'cm', { precision: 2 })).toBe('10.12cm')
    })

    it('formats without unit display', () => {
      expect(formatMeasurement(5, 'mm', { showUnit: false })).toBe('5')
      expect(formatMeasurement(10.5, 'cm', { precision: 1, showUnit: false })).toBe('10.5')
    })
  })

  describe('plural helper', () => {
    it('uses default pluralization when no plural form provided', () => {
      expect(plural(2, 'polyp')).toBe('polyps')
      expect(plural(1, 'polyp')).toBe('polyp')
    })

    it('uses custom plural form when provided', () => {
      expect(plural(2, 'was', 'were')).toBe('were')
      expect(plural(1, 'was', 'were')).toBe('was')
    })
  })

  describe('formatRange', () => {
    it('formats equal values', () => {
      expect(formatRange(5, 5, 'mm')).toBe('5mm')
    })

    it('formats different values', () => {
      expect(formatRange(5, 10, 'mm')).toBe('5 to 10mm')
    })

    it('formats with precision', () => {
      expect(formatRange(5.67, 10.123, 'mm')).toBe('6 to 10mm')
    })
  })
})
