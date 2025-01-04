import { describe, it, expect, vi } from 'vitest'
import { loadTemplates, logLoadedTemplates } from '../../lib/templateLoader'
import { FindingTemplate, ActionTemplate, SharedTemplate } from '../../types/templates'
import { logger } from '../../lib/logger'

// Mock logger
vi.mock('../../lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn()
  }
}))

// Temporarily mock import.meta.glob to return actual templates
vi.mock('../../templates/findings/*.ts', async () => {
  const massTemplate = (await import('../../templates/findings/mass.ts')).template
  const polypTemplate = (await import('../../templates/findings/polyp.ts')).template
  return {
    'mass.ts': { template: massTemplate },
    'polyp.ts': { template: polypTemplate }
  }
})

vi.mock('../../templates/actions/*.ts', async () => {
  const biopsyTemplate = (await import('../../templates/actions/biopsy.ts')).template
  const dilatationTemplate = (await import('../../templates/actions/dilatation.ts')).template
  const polypectomyTemplate = (await import('../../templates/actions/polypectomy.ts')).template
  return {
    'biopsy.ts': { template: biopsyTemplate },
    'dilatation.ts': { template: dilatationTemplate },
    'polypectomy.ts': { template: polypectomyTemplate }
  }
})

vi.mock('../../templates/shared/*.ts', async () => {
  const dilatorSizesTemplate = (await import('../../templates/shared/dilatorSizes.ts')).template
  const dilatorsTemplate = (await import('../../templates/shared/dilators.ts')).template
  const locationsTemplate = (await import('../../templates/shared/locations.ts')).template
  const parisTemplate = (await import('../../templates/shared/paris.ts')).template
  const perforationTemplate = (await import('../../templates/shared/perforation.ts')).template
  const sizesTemplate = (await import('../../templates/shared/sizes.ts')).template
  return {
    'dilatorSizes.ts': { template: dilatorSizesTemplate },
    'dilators.ts': { template: dilatorsTemplate },
    'locations.ts': { template: locationsTemplate },
    'paris.ts': { template: parisTemplate },
    'perforation.ts': { template: perforationTemplate },
    'sizes.ts': { template: sizesTemplate }
  }
})

describe('Template Loader', () => {
  describe('loadTemplates', () => {
    it('loads all templates and creates indexes', () => {
      const library = loadTemplates()

      // Check templates are loaded
      expect(library.templates.size).toBe(11)
      
      // Verify specific templates exist
      const findingTemplates = ['mass', 'polyp']
      const actionTemplates = ['biopsy', 'dilatation', 'polypectomy']
      const sharedTemplates = ['dilatorSizes', 'dilators', 'locations', 'paris', 'perforation', 'sizes']

      findingTemplates.forEach(id => {
        expect(library.templates.get(id)).toBeDefined()
        expect(library.indexes.byType.get('finding')).toContain(id)
      })

      actionTemplates.forEach(id => {
        expect(library.templates.get(id)).toBeDefined()
        expect(library.indexes.byType.get('action')).toContain(id)
      })

      sharedTemplates.forEach(id => {
        expect(library.templates.get(id)).toBeDefined()
        expect(library.indexes.byType.get('shared')).toContain(id)
      })
    })

    it('creates relationships between templates', () => {
      const library = loadTemplates()

      // Check finding -> action relationships
      const massRels = library.relationships.get('mass')
      expect(massRels).toBeDefined()
      expect(massRels?.some(rel => rel.child === 'biopsy')).toBeTruthy()

      const polypRels = library.relationships.get('polyp')
      expect(polypRels).toBeDefined()
      expect(polypRels?.some(rel => rel.child === 'polypectomy')).toBeTruthy()
      expect(polypRels?.some(rel => rel.child === 'biopsy')).toBeTruthy()
    })
  })

  describe('logLoadedTemplates', () => {
    it('logs template summary information', () => {
      const library = loadTemplates()
      logLoadedTemplates(library)

      // Verify logger was called with expected information
      expect(logger.info).toHaveBeenCalledWith('Loaded Templates Summary:')
      expect(logger.info).toHaveBeenCalledWith('Total Templates: 11')
      
      // Verify template type logging
      expect(logger.info).toHaveBeenCalledWith('FINDING Templates (2):')
      expect(logger.info).toHaveBeenCalledWith('ACTION Templates (3):')
      expect(logger.info).toHaveBeenCalledWith('SHARED Templates (6):')
    })
  })
})
