import { describe, it, expect, beforeEach, vi } from 'vitest'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

describe('v1.0.0 Feature Contracts', () => {
  describe('findingSearch.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/findingSearch')
      expect(typeof mod.searchFindings).toBe('function')
      expect(typeof mod.filterBySeverity).toBe('function')
      expect(typeof mod.filterByModule).toBe('function')
      expect(typeof mod.filterByLineRange).toBe('function')
      expect(typeof mod.applyFilters).toBe('function')
      expect(typeof mod.getAvailableModules).toBe('function')
      expect(typeof mod.getAvailableSeverities).toBe('function')
    })
  })

  describe('darkMode.js exports', () => {
    it('exports all required functions and constants', async () => {
      const mod = await import('../../src/utils/darkMode')
      expect(typeof mod.getDarkModePref).toBe('function')
      expect(typeof mod.setDarkModePref).toBe('function')
      expect(typeof mod.applyDarkClass).toBe('function')
      expect(typeof mod.dc).toBe('function')
      expect(typeof mod.severityColorsDark).toBe('object')
    })
  })

  describe('dependencyScanner.js exports', () => {
    it('exports scanner function and package list', async () => {
      const mod = await import('../../src/modules/dependencyScanner')
      expect(typeof mod.dependencyScanner).toBe('function')
      expect(Array.isArray(mod.VULNERABLE_PACKAGES)).toBe(true)
    })

    it('returns array of findings', async () => {
      const { dependencyScanner } = await import('../../src/modules/dependencyScanner')
      const result = dependencyScanner('const x = 1', 'javascript')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('summaryReport.js exports', () => {
    it('exports required functions', async () => {
      const mod = await import('../../src/utils/summaryReport')
      expect(typeof mod.generateSummaryReport).toBe('function')
      expect(typeof mod.downloadReport).toBe('function')
    })

    it('generateSummaryReport returns string', async () => {
      const { generateSummaryReport } = await import('../../src/utils/summaryReport')
      expect(typeof generateSummaryReport([])).toBe('string')
    })
  })

  describe('moduleTrend.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/moduleTrend')
      expect(typeof mod.getModuleTrends).toBe('function')
      expect(typeof mod.saveModuleTrends).toBe('function')
      expect(typeof mod.recordModuleTrend).toBe('function')
      expect(typeof mod.recordAllModuleTrends).toBe('function')
      expect(typeof mod.getSparklineData).toBe('function')
      expect(typeof mod.getAllSparklines).toBe('function')
      expect(typeof mod.clearModuleTrends).toBe('function')
      expect(typeof mod.sparklinePath).toBe('function')
    })

    it('sparklinePath returns string', async () => {
      const { sparklinePath } = await import('../../src/utils/moduleTrend')
      expect(typeof sparklinePath([1, 2, 3])).toBe('string')
    })
  })

  describe('analysisEngine module info completeness', () => {
    it('has info for all 13 modules', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const required = ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'typescript', 'accessibility', 'dependency', 'customRules', 'aiReview']
      required.forEach(mod => {
        const info = getModuleInfo(mod)
        expect(info, `Missing info for ${mod}`).toBeDefined()
        expect(info.name).toBeTruthy()
        expect(info.icon).toBeTruthy()
      })
    })
  })
})
