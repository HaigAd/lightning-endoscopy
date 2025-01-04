import { describe, it, expect } from 'vitest'
import { processTemplate, validateTemplateValues, evaluateConditions, hasSharedType } from '../../lib/templateProcessor'
import { SharedTemplate, Template } from '../../types/templates'

describe('Template Processor', () => {
  it('processes simple variable substitution', () => {
    const result = processTemplate(
      'Hello {name}',
      { name: 'World' },
      { name: { type: 'text', required: true } }
    )
    expect(result).toBe('Hello World')
  })

  it('handles missing optional variables', () => {
    const result = processTemplate(
      'Hello {name}, {title}',
      { name: 'World' },
      {
        name: { type: 'text', required: true },
        title: { type: 'text', required: false }
      }
    )
    expect(result).toBe('Hello World, ')
  })

  it('processes shared template references', () => {
    const sharedTemplates = new Map<string, SharedTemplate>()
    sharedTemplates.set('location', {
      id: 'location',
      type: 'shared',
      name: 'Location',
      category: 'location',
      version: '1.0.0',
      template: 'in the {position} {segment}',
      codes: { snomed: [] },
      variables: {
        position: { type: 'text', required: true, default: 'mid' },
        segment: { type: 'text', required: true, default: 'esophagus' }
      },
      options: []
    })

    const result = processTemplate(
      'Finding {location}',
      { location: '{location}' },
      {
        location: {
          type: 'enum',
          required: true,
          options: ['{location}']
        }
      },
      sharedTemplates
    )
    expect(result).toBe('Finding in the mid esophagus')
  })

  it('processes conditional expressions', () => {
    const result = processTemplate(
      '[if count > 2]multiple[/if][if count <= 2]few[/if] items',
      { count: 3 },
      { count: { type: 'number', required: true } }
    )
    expect(result).toBe('multiple items')
  })

  it('processes built-in functions', () => {
    const result = processTemplate(
      '{plural:2,polyp}',
      {},
      {}
    )
    expect(result).toBe('polyps')
  })

  it('handles deeply nested template references', () => {
    const sharedTemplates = new Map<string, SharedTemplate>()
    
    sharedTemplates.set('location', {
      id: 'location',
      type: 'shared',
      name: 'Location',
      category: 'location',
      version: '1.0.0',
      template: 'in the {position} {segment}',
      codes: { snomed: [] },
      variables: {
        position: { 
          type: 'enum',
          required: true,
          useShared: { type: 'position' }
        },
        segment: { 
          type: 'enum',
          required: true,
          useShared: { type: 'segment' }
        }
      },
      options: [
        { 
          id: 'loc1', 
          name: 'Location 1', 
          hotkey: 'l',
          value: 'Location 1',
          validFor: {},
          references: { position: 'proximal', segment: 'esophagus' }
        }
      ]
    })

    sharedTemplates.set('position', {
      id: 'position',
      type: 'shared',
      name: 'Position',
      category: 'position',
      version: '1.0.0',
      template: '{value}',
      codes: { snomed: [] },
      variables: {},
      options: [
        { 
          id: 'proximal', 
          name: 'Proximal', 
          hotkey: 'p',
          value: 'proximal',
          validFor: {}
        }
      ]
    })

    sharedTemplates.set('segment', {
      id: 'segment',
      type: 'shared',
      name: 'Segment',
      category: 'segment',
      version: '1.0.0',
      template: '{value}',
      codes: { snomed: [] },
      variables: {},
      options: [
        { 
          id: 'esophagus', 
          name: 'Esophagus', 
          hotkey: 'e',
          value: 'esophagus',
          validFor: {}
        }
      ]
    })

    const result = processTemplate(
      'Finding {location}',
      { location: 'loc1' },
      {
        location: {
          type: 'enum',
          required: true,
          useShared: { type: 'location' }
        }
      },
      sharedTemplates
    )
    expect(result).toBe('Finding in the proximal esophagus')
  })

  it('handles array values in templates', () => {
    const sharedTemplates = new Map<string, SharedTemplate>()
    sharedTemplates.set('location', {
      id: 'location',
      type: 'shared',
      name: 'Location',
      category: 'location',
      version: '1.0.0',
      template: '{value}',
      codes: { snomed: [] },
      variables: {},
      options: [
        { 
          id: 'loc1', 
          name: 'Location 1', 
          hotkey: 'l1',
          value: 'proximal esophagus',
          validFor: {}
        },
        { 
          id: 'loc2', 
          name: 'Location 2', 
          hotkey: 'l2',
          value: 'mid esophagus',
          validFor: {}
        }
      ]
    })

    const result = processTemplate(
      'Findings at {locations}',
      { locations: ['loc1', 'loc2'] },
      {
        locations: {
          type: 'enum',
          required: true,
          useShared: { type: 'location' },
          allow_multiple: true
        }
      },
      sharedTemplates
    )
    expect(result).toBe('Findings at proximal esophagus, mid esophagus')
  })

  // New tests for missing coverage

  it('processes ternary expressions', () => {
    const result = processTemplate(
      'The size is {size > 10 ? large : small}',
      { size: 15 },
      { size: { type: 'number', required: true } }
    )
    expect(result).toBe('The size is large')
  })

  it('validates boolean type variables', () => {
    const result = validateTemplateValues(
      {
        isActive: { type: 'boolean', required: true }
      },
      { isActive: 'not-a-boolean' }
    )
    expect(result.isValid).toBe(false)
    expect(result.errors.isActive).toBe('Must be true or false')
  })

  it('validates text with pattern', () => {
    const result = validateTemplateValues(
      {
        code: { 
          type: 'text', 
          required: true,
          validation: { pattern: '^[A-Z]{2}\\d{3}$' }
        }
      },
      { code: 'invalid' }
    )
    expect(result.isValid).toBe(false)
    expect(result.errors.code).toBe('Invalid format')
  })

  it('processes template with custom units', () => {
    const sharedTemplates = new Map<string, SharedTemplate>()
    sharedTemplates.set('measurement', {
      id: 'measurement',
      type: 'shared',
      name: 'Measurement',
      category: 'measurement',
      version: '1.0.0',
      template: '{value}{unit}',
      codes: { snomed: [] },
      variables: {
        unit: { type: 'text', required: false, default: 'cm' }
      },
      options: []
    })

    const result = processTemplate(
      'Length: {size}',
      { size: 5 },
      {
        size: {
          type: 'mixed',
          required: true,
          useShared: { 
            type: 'measurement',
            allowDirect: true,
            variables: { unit: 'cm' }
          }
        }
      },
      sharedTemplates
    )
    expect(result).toBe('Length: 5cm')
  })

  it('processes template arrays', () => {
    const result = processTemplate(
      ['Size: {size}', 'Large size: {size}'],
      { size: '20mm' },
      { size: { type: 'text', required: true } }
    )
    expect(result).toBe('Size: 20mm Large size: 20mm')
  })

  describe('hasSharedType Tests', () => {
    it('detects direct shared type usage', () => {
      const template: Template = {
        id: 'test-template',
        type: 'finding',
        name: 'Test Template',
        version: '1.0.0',
        codes: { snomed: [] },
        template: 'test',
        allowedActions: [],
        variables: {
          location: {
            type: 'enum',
            required: true,
            useShared: { type: 'location' }
          }
        }
      }
      expect(hasSharedType(template, 'location')).toBe(true)
    })

    it('returns false for non-existent shared type', () => {
      const template: Template = {
        id: 'test-template',
        type: 'finding',
        name: 'Test Template',
        version: '1.0.0',
        codes: { snomed: [] },
        template: 'test',
        allowedActions: [],
        variables: {
          location: {
            type: 'enum',
            required: true,
            useShared: { type: 'location' }
          }
        }
      }
      expect(hasSharedType(template, 'nonexistent')).toBe(false)
    })
  })

  describe('evaluateConditions Tests', () => {
    it('evaluates multiple conditions', () => {
      const result = evaluateConditions([
        { field: 'size', operator: 'greater', value: 10 },
        { field: 'type', operator: 'equals', value: 'polyp' }
      ], {
        size: 15,
        type: 'polyp'
      })
      expect(result).toBe(true)
    })

    it('handles array includes condition', () => {
      const result = evaluateConditions([
        { field: 'locations', operator: 'includes', value: 'esophagus' }
      ], {
        locations: ['stomach', 'esophagus', 'duodenum']
      })
      expect(result).toBe(true)
    })

    it('handles invalid operator gracefully', () => {
      const result = evaluateConditions([
        { field: 'size', operator: 'invalid' as any, value: 10 }
      ], {
        size: 15
      })
      expect(result).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles invalid function calls gracefully', () => {
      const result = processTemplate(
        'Test {invalidFunction:arg1,arg2}',
        {},
        {}
      )
      expect(result).toBe('Test ')
    })

    it('handles invalid expressions gracefully', () => {
      const result = processTemplate(
        '[if invalid expression]content[/if]',
        {},
        {}
      )
      expect(result).toBe('')
    })

    it('handles missing shared templates gracefully', () => {
      const result = processTemplate(
        '{sharedValue:test,missing}',
        {},
        {},
        new Map()
      )
      expect(result).toBe('test')
    })
  })
})
