import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getModuleTrends,
  saveModuleTrends,
  recordModuleTrend,
  recordAllModuleTrends,
  getSparklineData,
  getAllSparklines,
  clearModuleTrends,
  sparklinePath,
} from '../../src/utils/moduleTrend'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

describe('Module Trend Tracker', () => {
  describe('CRUD', () => {
    it('starts empty', () => {
      expect(getModuleTrends()).toEqual({})
    })

    it('records a trend entry', () => {
      recordModuleTrend('security', 5)
      const trends = getModuleTrends()
      expect(trends.security).toHaveLength(1)
      expect(trends.security[0].count).toBe(5)
      expect(trends.security[0].timestamp).toBeDefined()
    })

    it('appends to existing module', () => {
      recordModuleTrend('security', 3)
      recordModuleTrend('security', 7)
      expect(getModuleTrends().security).toHaveLength(2)
    })

    it('caps at 30 entries', () => {
      for (let i = 0; i < 35; i++) {
        recordModuleTrend('security', i)
      }
      expect(getModuleTrends().security.length).toBeLessThanOrEqual(30)
    })

    it('clears all trends', () => {
      recordModuleTrend('security', 1)
      clearModuleTrends()
      expect(getModuleTrends()).toEqual({})
    })
  })

  describe('recordAllModuleTrends', () => {
    it('records counts from findings', () => {
      const findings = [
        { module: 'security' },
        { module: 'security' },
        { module: 'failureMode' },
      ]
      recordAllModuleTrends(findings)
      const trends = getModuleTrends()
      expect(trends.security[0].count).toBe(2)
      expect(trends.failureMode[0].count).toBe(1)
    })
  })

  describe('getSparklineData', () => {
    it('returns last N counts', () => {
      recordModuleTrend('security', 1)
      recordModuleTrend('security', 2)
      recordModuleTrend('security', 3)
      expect(getSparklineData('security', 2)).toEqual([2, 3])
    })

    it('returns empty for unknown module', () => {
      expect(getSparklineData('nonexistent')).toEqual([])
    })
  })

  describe('getAllSparklines', () => {
    it('returns all modules', () => {
      recordModuleTrend('a', 1)
      recordModuleTrend('b', 2)
      const all = getAllSparklines()
      expect(Object.keys(all)).toEqual(['a', 'b'])
    })
  })

  describe('sparklinePath', () => {
    it('generates SVG path', () => {
      const path = sparklinePath([1, 3, 2, 5])
      expect(path).toMatch(/^M/)
      expect(path).toContain('L')
    })

    it('returns empty for insufficient data', () => {
      expect(sparklinePath([])).toBe('')
      expect(sparklinePath([1])).toBe('')
    })

    it('handles all-zero data', () => {
      const path = sparklinePath([0, 0, 0])
      expect(path).toMatch(/^M/)
    })

    it('uses specified dimensions', () => {
      const path = sparklinePath([1, 2, 3], 100, 20)
      expect(path).toBeDefined()
    })
  })

  describe('persistence', () => {
    it('persists to localStorage', () => {
      recordModuleTrend('security', 5)
      expect(store.validai_module_trends).toBeDefined()
    })

    it('recovers from corrupted data', () => {
      store.validai_module_trends = 'bad'
      expect(getModuleTrends()).toEqual({})
    })
  })
})
