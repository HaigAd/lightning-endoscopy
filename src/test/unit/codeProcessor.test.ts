import { describe, it, expect } from 'vitest'
import { assignCodes, validateCodeCompatibility, formatCodeAssignments, CodeAssignment } from '../../lib/codeProcessor'
import { Template } from '../../types/templates'

describe('Code Processor', () => {
  describe('assignCodes', () => {
    it('assigns codes from a single template', () => {
      const templates: Template[] = [{
        id: 'test1',
        type: 'finding',
        name: 'Test 1',
        version: '1.0.0',
        codes: {
          snomed: ['123456', '789012'] // Primary + modifier
        },
        template: 'test',
        allowedActions: [],
        variables: {}
      }]

      const result = assignCodes(templates, {})
      expect(result).toEqual([{
        primary: '123456',
        modifiers: ['789012'],
        source: 'test1'
      }])
    })

    it('assigns codes from multiple templates', () => {
      const templates: Template[] = [
        {
          id: 'test1',
          type: 'finding',
          name: 'Test 1',
          version: '1.0.0',
          codes: {
            snomed: ['123456', '789012']
          },
          template: 'test',
          allowedActions: [],
          variables: {}
        },
        {
          id: 'test2',
          type: 'finding',
          name: 'Test 2',
          version: '1.0.0',
          codes: {
            snomed: ['345678', '901234']
          },
          template: 'test',
          allowedActions: [],
          variables: {}
        }
      ]

      const result = assignCodes(templates, {})
      expect(result).toEqual([
        {
          primary: '123456',
          modifiers: ['789012'],
          source: 'test1'
        },
        {
          primary: '345678',
          modifiers: ['901234'],
          source: 'test2'
        }
      ])
    })

    it('handles empty templates array', () => {
      const result = assignCodes([], {})
      expect(result).toEqual([])
    })
  })

  describe('validateCodeCompatibility', () => {
    it('validates compatible code assignments', () => {
      const assignments: CodeAssignment[] = [
        {
          primary: '123456',
          modifiers: ['789012'],
          source: 'test1'
        },
        {
          primary: '345678',
          modifiers: ['901234'],
          source: 'test2'
        }
      ]

      const result = validateCodeCompatibility(assignments)
      expect(result.isValid).toBe(true)
      expect(result.conflicts).toEqual([])
    })

    it('detects duplicate primary codes', () => {
      const assignments: CodeAssignment[] = [
        {
          primary: '123456',
          modifiers: ['789012'],
          source: 'test1'
        },
        {
          primary: '123456', // Duplicate
          modifiers: ['901234'],
          source: 'test2'
        }
      ]

      const result = validateCodeCompatibility(assignments)
      expect(result.isValid).toBe(false)
      expect(result.conflicts).toEqual([
        'Duplicate primary code 123456 from template test2'
      ])
    })

    it('handles empty assignments', () => {
      const result = validateCodeCompatibility([])
      expect(result.isValid).toBe(true)
      expect(result.conflicts).toEqual([])
    })
  })

  describe('formatCodeAssignments', () => {
    it('formats single assignment', () => {
      const assignments: CodeAssignment[] = [
        {
          primary: '123456',
          modifiers: ['789012'],
          source: 'test1'
        }
      ]

      const result = formatCodeAssignments(assignments)
      expect(result).toEqual({
        primary: '123456',
        modifiers: ['789012'],
        sources: ['test1']
      })
    })

    it('formats multiple assignments', () => {
      const assignments: CodeAssignment[] = [
        {
          primary: '123456',
          modifiers: ['789012'],
          source: 'test1'
        },
        {
          primary: '345678',
          modifiers: ['901234'],
          source: 'test2'
        }
      ]

      const result = formatCodeAssignments(assignments)
      expect(result).toEqual({
        primary: '123456',
        modifiers: ['789012', '901234'],
        sources: ['test1', 'test2']
      })
    })

    it('handles empty assignments', () => {
      const result = formatCodeAssignments([])
      expect(result).toEqual({
        primary: '',
        modifiers: [],
        sources: []
      })
    })
  })
})
