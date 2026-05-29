import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Structured tests: verify public API contracts and data shapes
 * for all v0.8.0 features.
 */

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
  vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) })
})

describe('Feature Contracts', () => {
  describe('suppressions.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/suppressions')
      expect(typeof mod.getSuppressions).toBe('function')
      expect(typeof mod.saveSuppressions).toBe('function')
      expect(typeof mod.addSuppression).toBe('function')
      expect(typeof mod.removeSuppression).toBe('function')
      expect(typeof mod.clearAllSuppressions).toBe('function')
      expect(typeof mod.isSuppressed).toBe('function')
      expect(typeof mod.applySuppressions).toBe('function')
    })

    it('addSuppression returns array shape', async () => {
      const { addSuppression } = await import('../../src/utils/suppressions')
      const result = addSuppression('mod', 'cat')
      expect(Array.isArray(result)).toBe(true)
      const item = result[0]
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('key')
      expect(item).toHaveProperty('module')
      expect(item).toHaveProperty('category')
      expect(item).toHaveProperty('reason')
      expect(item).toHaveProperty('createdAt')
    })
  })

  describe('perfTracker.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/perfTracker')
      expect(typeof mod.getPerfHistory).toBe('function')
      expect(typeof mod.savePerfHistory).toBe('function')
      expect(typeof mod.recordTiming).toBe('function')
      expect(typeof mod.clearPerfHistory).toBe('function')
      expect(typeof mod.timeModule).toBe('function')
      expect(typeof mod.runWithTiming).toBe('function')
      expect(typeof mod.getModuleAverages).toBe('function')
    })

    it('timeModule returns correct shape', async () => {
      const { timeModule } = await import('../../src/utils/perfTracker')
      performance.now.mockReturnValueOnce(0).mockReturnValueOnce(1)
      const result = await timeModule(() => [], '', 'js')
      expect(result).toHaveProperty('findings')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('error')
      expect(Array.isArray(result.findings)).toBe(true)
    })

    it('runWithTiming returns correct shape', async () => {
      const { runWithTiming } = await import('../../src/utils/perfTracker')
      const result = await runWithTiming(['a'], { a: () => [] }, '', 'js')
      expect(result).toHaveProperty('findings')
      expect(result).toHaveProperty('timings')
      expect(result).toHaveProperty('totalDuration')
      expect(typeof result.totalDuration).toBe('number')
    })

    it('getModuleAverages returns array of {module, avgDuration, runs}', async () => {
      const { savePerfHistory, getModuleAverages } = await import('../../src/utils/perfTracker')
      savePerfHistory([{ timings: { x: { duration: 10 } } }])
      const avgs = getModuleAverages()
      expect(Array.isArray(avgs)).toBe(true)
      if (avgs.length > 0) {
        expect(avgs[0]).toHaveProperty('module')
        expect(avgs[0]).toHaveProperty('avgDuration')
        expect(avgs[0]).toHaveProperty('runs')
      }
    })
  })

  describe('batchAnalyzer.js exports', () => {
    it('exports detectLanguage and analyzeBatch', async () => {
      const mod = await import('../../src/utils/batchAnalyzer')
      expect(typeof mod.detectLanguage).toBe('function')
      expect(typeof mod.analyzeBatch).toBe('function')
      expect(typeof mod.readFilesFromInput).toBe('function')
    })

    it('detectLanguage always returns a string', async () => {
      const { detectLanguage } = await import('../../src/utils/batchAnalyzer')
      expect(typeof detectLanguage('file.xyz')).toBe('string')
      expect(typeof detectLanguage('file.py')).toBe('string')
      expect(typeof detectLanguage('')).toBe('string')
    })
  })

  describe('submissionDiff.js exports', () => {
    it('exports all required functions', async () => {
      const mod = await import('../../src/utils/submissionDiff')
      expect(typeof mod.diffSubmissions).toBe('function')
      expect(typeof mod.formatDelta).toBe('function')
      expect(typeof mod.scoreTrend).toBe('function')
    })

    it('diffSubmissions returns correct shape', async () => {
      const { diffSubmissions } = await import('../../src/utils/submissionDiff')
      const sub = { score: 50, findings: [{ module: 'a', category: 'b', lineNumber: 1 }] }
      const diff = diffSubmissions(sub, sub)
      expect(diff).toHaveProperty('newFindings')
      expect(diff).toHaveProperty('resolvedFindings')
      expect(diff).toHaveProperty('unchangedFindings')
      expect(diff).toHaveProperty('scoreDelta')
      expect(diff).toHaveProperty('findingDelta')
      expect(diff).toHaveProperty('olderScore')
      expect(diff).toHaveProperty('newerScore')
      expect(diff).toHaveProperty('olderCount')
      expect(diff).toHaveProperty('newerCount')
    })

    it('scoreTrend returns one of three values', async () => {
      const { scoreTrend } = await import('../../src/utils/submissionDiff')
      const validValues = ['improved', 'regressed', 'unchanged']
      expect(validValues).toContain(scoreTrend(1))
      expect(validValues).toContain(scoreTrend(-1))
      expect(validValues).toContain(scoreTrend(0))
    })
  })

  describe('analysisEngine timed export', () => {
    it('runAnalysisTimed is exported', async () => {
      const { runAnalysisTimed } = await import('../../src/modules/analysisEngine')
      expect(typeof runAnalysisTimed).toBe('function')
    })
  })
})
