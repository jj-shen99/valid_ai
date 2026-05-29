import { describe, it, expect } from 'vitest'
import { diffSubmissions, formatDelta, scoreTrend } from '../../src/utils/submissionDiff'

describe('Submission Diff', () => {
  const olderSub = {
    score: 60,
    timestamp: '2024-01-01T00:00:00Z',
    findings: [
      { id: 'f1', module: 'security', category: 'SQL Injection', lineNumber: 10, severity: 'Critical' },
      { id: 'f2', module: 'security', category: 'XSS', lineNumber: 20, severity: 'High' },
      { id: 'f3', module: 'failureMode', category: 'Off-by-one', lineNumber: 5, severity: 'Medium' },
    ],
  }

  const newerSub = {
    score: 80,
    timestamp: '2024-01-02T00:00:00Z',
    findings: [
      { id: 'f2', module: 'security', category: 'XSS', lineNumber: 20, severity: 'High' },
      { id: 'f4', module: 'complexity', category: 'Nested loops', lineNumber: 30, severity: 'Medium' },
    ],
  }

  describe('diffSubmissions', () => {
    it('identifies new findings', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.newFindings).toHaveLength(1)
      expect(diff.newFindings[0].category).toBe('Nested loops')
    })

    it('identifies resolved findings', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.resolvedFindings).toHaveLength(2)
      const resolved = diff.resolvedFindings.map(f => f.category).sort()
      expect(resolved).toEqual(['Off-by-one', 'SQL Injection'])
    })

    it('identifies unchanged findings', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.unchangedFindings).toHaveLength(1)
      expect(diff.unchangedFindings[0].category).toBe('XSS')
    })

    it('computes score delta', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.scoreDelta).toBe(20)
    })

    it('computes finding delta', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.findingDelta).toBe(-1)
    })

    it('preserves score values', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.olderScore).toBe(60)
      expect(diff.newerScore).toBe(80)
    })

    it('preserves counts', () => {
      const diff = diffSubmissions(olderSub, newerSub)
      expect(diff.olderCount).toBe(3)
      expect(diff.newerCount).toBe(2)
    })

    it('returns null for null inputs', () => {
      expect(diffSubmissions(null, newerSub)).toBeNull()
      expect(diffSubmissions(olderSub, null)).toBeNull()
    })

    it('handles submissions with no findings', () => {
      const empty = { score: 100, timestamp: '2024-01-03T00:00:00Z', findings: [] }
      const diff = diffSubmissions(olderSub, empty)
      expect(diff.resolvedFindings).toHaveLength(3)
      expect(diff.newFindings).toHaveLength(0)
    })

    it('handles missing findings array', () => {
      const noFindings = { score: 50, timestamp: '2024-01-01T00:00:00Z' }
      const diff = diffSubmissions(noFindings, newerSub)
      expect(diff.olderCount).toBe(0)
      expect(diff.newFindings).toHaveLength(2)
    })

    it('identical submissions produce zero deltas', () => {
      const diff = diffSubmissions(olderSub, olderSub)
      expect(diff.scoreDelta).toBe(0)
      expect(diff.findingDelta).toBe(0)
      expect(diff.newFindings).toHaveLength(0)
      expect(diff.resolvedFindings).toHaveLength(0)
    })
  })

  describe('formatDelta', () => {
    it('adds + prefix for positive', () => {
      expect(formatDelta(5)).toBe('+5')
    })

    it('keeps - prefix for negative', () => {
      expect(formatDelta(-3)).toBe('-3')
    })

    it('returns "0" for zero', () => {
      expect(formatDelta(0)).toBe('0')
    })
  })

  describe('scoreTrend', () => {
    it('returns improved for positive delta', () => {
      expect(scoreTrend(10)).toBe('improved')
    })

    it('returns regressed for negative delta', () => {
      expect(scoreTrend(-5)).toBe('regressed')
    })

    it('returns unchanged for zero', () => {
      expect(scoreTrend(0)).toBe('unchanged')
    })
  })
})
