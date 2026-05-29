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

describe('v1.1.0 Feature Contracts', () => {
  describe('deadCodeDetector exports', () => {
    it('exports scanner function', async () => {
      const mod = await import('../../src/modules/deadCodeDetector')
      expect(typeof mod.deadCodeDetector).toBe('function')
    })

    it('returns array of findings', async () => {
      const { deadCodeDetector } = await import('../../src/modules/deadCodeDetector')
      expect(Array.isArray(deadCodeDetector('const x = 1', 'js'))).toBe(true)
    })
  })

  describe('duplicationFinder exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/duplicationFinder')
      expect(typeof mod.findDuplicates).toBe('function')
      expect(typeof mod.getDuplicationScore).toBe('function')
      expect(typeof mod.formatDuplicateReport).toBe('function')
    })
  })

  describe('findingTimeline exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/findingTimeline')
      expect(typeof mod.getTimeline).toBe('function')
      expect(typeof mod.recordFinding).toBe('function')
      expect(typeof mod.recordFindings).toBe('function')
      expect(typeof mod.getFindingHistory).toBe('function')
      expect(typeof mod.getRecurringFindings).toBe('function')
      expect(typeof mod.getResolvedFindings).toBe('function')
      expect(typeof mod.getNewFindings).toBe('function')
      expect(typeof mod.clearTimeline).toBe('function')
      expect(typeof mod.getTimelineStats).toBe('function')
    })
  })

  describe('diffExporter exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/diffExporter')
      expect(typeof mod.compareAnalyses).toBe('function')
      expect(typeof mod.exportDiffMarkdown).toBe('function')
      expect(typeof mod.downloadDiffReport).toBe('function')
    })

    it('compareAnalyses returns correct shape', async () => {
      const { compareAnalyses } = await import('../../src/utils/diffExporter')
      const result = compareAnalyses([], [])
      expect(result).toHaveProperty('newFindings')
      expect(result).toHaveProperty('resolvedFindings')
      expect(result).toHaveProperty('persistent')
      expect(result).toHaveProperty('delta')
      expect(result).toHaveProperty('improved')
    })
  })

  describe('qualityGate exports', () => {
    it('exports all required functions and constants', async () => {
      const mod = await import('../../src/utils/qualityGate')
      expect(typeof mod.getThresholds).toBe('function')
      expect(typeof mod.saveThresholds).toBe('function')
      expect(typeof mod.resetThresholds).toBe('function')
      expect(typeof mod.evaluateGate).toBe('function')
      expect(typeof mod.formatGateResult).toBe('function')
      expect(typeof mod.DEFAULT_THRESHOLDS).toBe('object')
    })

    it('evaluateGate returns correct shape', async () => {
      const { evaluateGate } = await import('../../src/utils/qualityGate')
      const result = evaluateGate([], 100)
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('violations')
      expect(result).toHaveProperty('counts')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('thresholds')
    })
  })

  describe('analysisEngine has 14 module infos', () => {
    it('getModuleInfo covers all modules', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const ids = ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'typescript', 'accessibility', 'dependency', 'deadCode', 'customRules', 'aiReview']
      ids.forEach(id => {
        const info = getModuleInfo(id)
        expect(info, `Missing ${id}`).toBeDefined()
        expect(info.name).toBeTruthy()
        expect(info.icon).toBeTruthy()
        expect(info.description).toBeTruthy()
      })
    })
  })
})
