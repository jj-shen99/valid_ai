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

describe('v0.9.0 Feature Contracts', () => {
  describe('annotations.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/annotations')
      expect(typeof mod.getAnnotations).toBe('function')
      expect(typeof mod.saveAnnotations).toBe('function')
      expect(typeof mod.setAnnotation).toBe('function')
      expect(typeof mod.getAnnotation).toBe('function')
      expect(typeof mod.removeAnnotation).toBe('function')
      expect(typeof mod.clearAllAnnotations).toBe('function')
      expect(typeof mod.getAnnotatedCount).toBe('function')
    })

    it('setAnnotation returns object map', async () => {
      const { setAnnotation } = await import('../../src/utils/annotations')
      const result = setAnnotation('f1', 'note')
      expect(typeof result).toBe('object')
      expect(result.f1).toBeDefined()
      expect(result.f1.text).toBe('note')
      expect(result.f1.updatedAt).toBeDefined()
    })
  })

  describe('severityOverrides.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/severityOverrides')
      expect(typeof mod.getOverrides).toBe('function')
      expect(typeof mod.setOverride).toBe('function')
      expect(typeof mod.removeOverride).toBe('function')
      expect(typeof mod.clearAllOverrides).toBe('function')
      expect(typeof mod.getOverride).toBe('function')
      expect(typeof mod.applyOverrides).toBe('function')
      expect(Array.isArray(mod.VALID_SEVERITIES)).toBe(true)
    })

    it('applyOverrides returns array', async () => {
      const { applyOverrides } = await import('../../src/utils/severityOverrides')
      const result = applyOverrides([{ module: 'a', category: 'b', severity: 'High' }])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('accessibilityAnalyzer exports', () => {
    it('exports analyzer function', async () => {
      const mod = await import('../../src/modules/accessibilityAnalyzer')
      expect(typeof mod.accessibilityAnalyzer).toBe('function')
    })

    it('returns array of findings', async () => {
      const { accessibilityAnalyzer } = await import('../../src/modules/accessibilityAnalyzer')
      const result = accessibilityAnalyzer('const x = 1', 'javascript')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('complexityMetrics.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/complexityMetrics')
      expect(typeof mod.cyclomaticComplexity).toBe('function')
      expect(typeof mod.cognitiveComplexity).toBe('function')
      expect(typeof mod.logicalLOC).toBe('function')
      expect(typeof mod.functionMetrics).toBe('function')
      expect(typeof mod.complexitySummary).toBe('function')
    })

    it('complexitySummary returns correct shape', async () => {
      const { complexitySummary } = await import('../../src/utils/complexityMetrics')
      const result = complexitySummary('const x = 1')
      expect(result).toHaveProperty('cyclomaticComplexity')
      expect(result).toHaveProperty('cognitiveComplexity')
      expect(result).toHaveProperty('logicalLOC')
      expect(result).toHaveProperty('functionCount')
      expect(result).toHaveProperty('avgCyclomaticComplexity')
      expect(result).toHaveProperty('grade')
      expect(result).toHaveProperty('functions')
      expect(Array.isArray(result.functions)).toBe(true)
    })
  })

  describe('githubIssueExporter.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/githubIssueExporter')
      expect(typeof mod.formatIssueTitle).toBe('function')
      expect(typeof mod.formatIssueBody).toBe('function')
      expect(typeof mod.getIssueLabels).toBe('function')
      expect(typeof mod.createGitHubIssue).toBe('function')
      expect(typeof mod.createBatchIssues).toBe('function')
      expect(typeof mod.buildIssueUrl).toBe('function')
    })

    it('getIssueLabels always returns array with validai', async () => {
      const { getIssueLabels } = await import('../../src/utils/githubIssueExporter')
      const labels = getIssueLabels({ severity: 'Medium', module: 'test' })
      expect(Array.isArray(labels)).toBe(true)
      expect(labels).toContain('validai')
    })
  })

  describe('analysisEngine module info completeness', () => {
    it('has info for accessibility module', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const info = getModuleInfo('accessibility')
      expect(info).toBeDefined()
      expect(info.name).toBeTruthy()
      expect(info.icon).toBeTruthy()
      expect(info.description).toBeTruthy()
    })
  })
})
