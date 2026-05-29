import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getTimeline,
  recordFinding,
  recordFindings,
  getFindingHistory,
  getRecurringFindings,
  getResolvedFindings,
  getNewFindings,
  clearTimeline,
  getTimelineStats,
} from '../../src/utils/findingTimeline'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

const finding1 = { module: 'security', category: 'SQL Injection', severity: 'Critical' }
const finding2 = { module: 'failureMode', category: 'Off-by-one', severity: 'Medium' }

describe('Finding Timeline', () => {
  describe('CRUD', () => {
    it('starts empty', () => {
      expect(getTimeline()).toEqual({})
    })

    it('records a finding', () => {
      recordFinding(finding1)
      const timeline = getTimeline()
      expect(Object.keys(timeline)).toHaveLength(1)
    })

    it('tracks firstSeen and lastSeen', () => {
      recordFinding(finding1, '2024-01-01T00:00:00Z')
      recordFinding(finding1, '2024-06-01T00:00:00Z')
      const history = getFindingHistory(finding1)
      expect(history.firstSeen).toBe('2024-01-01T00:00:00Z')
      expect(history.lastSeen).toBe('2024-06-01T00:00:00Z')
    })

    it('increments count', () => {
      recordFinding(finding1)
      recordFinding(finding1)
      recordFinding(finding1)
      expect(getFindingHistory(finding1).count).toBe(3)
    })

    it('clears timeline', () => {
      recordFinding(finding1)
      clearTimeline()
      expect(getTimeline()).toEqual({})
    })
  })

  describe('recordFindings', () => {
    it('records multiple findings', () => {
      recordFindings([finding1, finding2])
      const timeline = getTimeline()
      expect(Object.keys(timeline)).toHaveLength(2)
    })
  })

  describe('getFindingHistory', () => {
    it('returns null for unknown finding', () => {
      expect(getFindingHistory({ module: 'x', category: 'y' })).toBeNull()
    })
  })

  describe('getRecurringFindings', () => {
    it('returns findings with count >= threshold', () => {
      for (let i = 0; i < 5; i++) recordFinding(finding1)
      recordFinding(finding2)
      const recurring = getRecurringFindings(3)
      expect(recurring).toHaveLength(1)
      expect(recurring[0].category).toBe('SQL Injection')
    })
  })

  describe('getResolvedFindings', () => {
    it('returns findings no longer in current set', () => {
      recordFinding(finding1)
      recordFinding(finding2)
      const resolved = getResolvedFindings([finding1])
      expect(resolved).toHaveLength(1)
      expect(resolved[0].category).toBe('Off-by-one')
    })
  })

  describe('getNewFindings', () => {
    it('returns findings seen only once', () => {
      recordFinding(finding1)
      recordFinding(finding1)
      recordFinding(finding2)
      const newOnes = getNewFindings([finding1, finding2])
      expect(newOnes.some(f => f.category === 'Off-by-one')).toBe(true)
    })
  })

  describe('getTimelineStats', () => {
    it('returns stats', () => {
      for (let i = 0; i < 5; i++) recordFinding(finding1)
      recordFinding(finding2)
      const stats = getTimelineStats()
      expect(stats.totalTracked).toBe(2)
      expect(stats.recurring).toBe(1)
      expect(stats.mostFrequent.length).toBeGreaterThan(0)
    })
  })

  describe('persistence', () => {
    it('caps occurrences at 50', () => {
      for (let i = 0; i < 55; i++) recordFinding(finding1)
      const history = getFindingHistory(finding1)
      expect(history.occurrences.length).toBeLessThanOrEqual(50)
      expect(history.count).toBe(55)
    })

    it('handles corrupted data', () => {
      store.validai_finding_timeline = 'corrupt'
      expect(getTimeline()).toEqual({})
    })
  })
})
