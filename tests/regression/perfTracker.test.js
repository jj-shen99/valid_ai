import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getPerfHistory,
  savePerfHistory,
  recordTiming,
  clearPerfHistory,
  timeModule,
  runWithTiming,
  getModuleAverages,
} from '../../src/utils/perfTracker'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
  vi.stubGlobal('performance', { now: vi.fn() })
})

describe('Performance Tracker', () => {
  describe('history CRUD', () => {
    it('starts with empty history', () => {
      expect(getPerfHistory()).toEqual([])
    })

    it('records timing entry', () => {
      const entry = { modules: ['security'], timings: { security: { duration: 5.2, findingCount: 3 } }, totalDuration: 5.2 }
      const history = recordTiming(entry)
      expect(history).toHaveLength(1)
      expect(history[0].timestamp).toBeDefined()
    })

    it('appends to history', () => {
      recordTiming({ modules: ['a'], timings: {}, totalDuration: 1 })
      recordTiming({ modules: ['b'], timings: {}, totalDuration: 2 })
      expect(getPerfHistory()).toHaveLength(2)
    })

    it('clears history', () => {
      recordTiming({ modules: ['a'], timings: {}, totalDuration: 1 })
      clearPerfHistory()
      expect(getPerfHistory()).toEqual([])
    })

    it('caps at 50 entries', () => {
      for (let i = 0; i < 60; i++) {
        recordTiming({ modules: ['a'], timings: {}, totalDuration: i })
      }
      expect(getPerfHistory().length).toBeLessThanOrEqual(50)
    })
  })

  describe('timeModule', () => {
    it('times a sync module', async () => {
      let callCount = 0
      performance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5.5)

      const mockModule = (code) => {
        callCount++
        return [{ id: 'f1', severity: 'High' }]
      }

      const result = await timeModule(mockModule, 'const x = 1', 'javascript')
      expect(result.findings).toHaveLength(1)
      expect(result.duration).toBe(5.5)
      expect(result.error).toBeNull()
      expect(callCount).toBe(1)
    })

    it('captures errors gracefully', async () => {
      performance.now
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(2)

      const badModule = () => { throw new Error('Module crashed') }
      const result = await timeModule(badModule, '', 'javascript')
      expect(result.findings).toEqual([])
      expect(result.error).toBe('Module crashed')
      expect(result.duration).toBe(2)
    })
  })

  describe('runWithTiming', () => {
    it('runs multiple modules and aggregates', async () => {
      let counter = 0
      performance.now.mockImplementation(() => counter++)

      const registry = {
        modA: () => [{ id: 'a1', severity: 'High' }],
        modB: () => [{ id: 'b1', severity: 'Medium' }, { id: 'b2', severity: 'Info' }],
      }

      const result = await runWithTiming(['modA', 'modB'], registry, 'code', 'js')
      expect(result.findings).toHaveLength(3)
      expect(Object.keys(result.timings)).toEqual(['modA', 'modB'])
      expect(result.timings.modA.findingCount).toBe(1)
      expect(result.timings.modB.findingCount).toBe(2)
      expect(typeof result.totalDuration).toBe('number')
    })

    it('skips unknown modules', async () => {
      performance.now.mockReturnValue(0)
      const registry = { modA: () => [] }
      const result = await runWithTiming(['modA', 'nonExistent'], registry, '', 'js')
      expect(Object.keys(result.timings)).toEqual(['modA'])
    })

    it('records timing to history', async () => {
      performance.now.mockReturnValue(0)
      const registry = { modA: () => [] }
      await runWithTiming(['modA'], registry, '', 'js')
      expect(getPerfHistory()).toHaveLength(1)
    })
  })

  describe('getModuleAverages', () => {
    it('computes averages from history', () => {
      savePerfHistory([
        { timings: { security: { duration: 10 }, failureMode: { duration: 5 } } },
        { timings: { security: { duration: 20 }, failureMode: { duration: 15 } } },
      ])
      const avgs = getModuleAverages()
      expect(avgs).toHaveLength(2)
      const secAvg = avgs.find(a => a.module === 'security')
      expect(secAvg.avgDuration).toBe(15)
      expect(secAvg.runs).toBe(2)
    })

    it('sorts by avgDuration descending', () => {
      savePerfHistory([
        { timings: { fast: { duration: 1 }, slow: { duration: 100 } } },
      ])
      const avgs = getModuleAverages()
      expect(avgs[0].module).toBe('slow')
    })

    it('handles empty history', () => {
      expect(getModuleAverages()).toEqual([])
    })
  })

  describe('persistence', () => {
    it('recovers from corrupted data', () => {
      store.validai_perf_history = '{bad'
      expect(getPerfHistory()).toEqual([])
    })
  })
})
