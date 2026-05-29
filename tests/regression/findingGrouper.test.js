import { describe, it, expect } from 'vitest'
import { groupFindings, deduplicateFindings, priorityScore, sortByPriority, groupSummary } from '../../src/utils/findingGrouper'

const makeFinding = (overrides = {}) => ({
  id: 'f1',
  module: 'failureMode',
  moduleName: 'Failure Mode Scanner',
  severity: 'Medium',
  category: 'Test category',
  description: 'Test description',
  lineNumber: 1,
  ...overrides,
})

describe('Finding Grouper', () => {
  describe('groupFindings', () => {
    it('groups by module', () => {
      const findings = [
        makeFinding({ moduleName: 'Security Probe', module: 'security' }),
        makeFinding({ moduleName: 'Security Probe', module: 'security', id: 'f2' }),
        makeFinding({ moduleName: 'Failure Mode Scanner', module: 'failureMode', id: 'f3' }),
      ]
      const groups = groupFindings(findings, 'module')
      expect(groups).toHaveLength(2)
      expect(groups[0].count).toBe(2) // Security has more
      expect(groups[1].count).toBe(1)
    })

    it('groups by severity', () => {
      const findings = [
        makeFinding({ severity: 'Critical' }),
        makeFinding({ severity: 'High', id: 'f2' }),
        makeFinding({ severity: 'Critical', id: 'f3' }),
      ]
      const groups = groupFindings(findings, 'severity')
      expect(groups[0].label).toBe('Critical')
      expect(groups[0].count).toBe(2)
      expect(groups[1].label).toBe('High')
    })

    it('groups by category', () => {
      const findings = [
        makeFinding({ category: 'Off-by-one' }),
        makeFinding({ category: 'Off-by-one', id: 'f2' }),
        makeFinding({ category: 'XSS', id: 'f3' }),
      ]
      const groups = groupFindings(findings, 'category')
      expect(groups).toHaveLength(2)
    })

    it('handles empty findings', () => {
      expect(groupFindings([])).toEqual([])
    })

    it('sorts module groups by count descending', () => {
      const findings = [
        makeFinding({ moduleName: 'A' }),
        makeFinding({ moduleName: 'B', id: 'f2' }),
        makeFinding({ moduleName: 'B', id: 'f3' }),
        makeFinding({ moduleName: 'B', id: 'f4' }),
      ]
      const groups = groupFindings(findings, 'module')
      expect(groups[0].label).toBe('B')
      expect(groups[0].count).toBe(3)
    })
  })

  describe('deduplicateFindings', () => {
    it('removes duplicate module+category combos', () => {
      const findings = [
        makeFinding({ module: 'security', category: 'XSS', lineNumber: 1 }),
        makeFinding({ module: 'security', category: 'XSS', lineNumber: 5, id: 'f2' }),
      ]
      const deduped = deduplicateFindings(findings)
      expect(deduped).toHaveLength(1)
    })

    it('keeps findings with different categories', () => {
      const findings = [
        makeFinding({ module: 'security', category: 'XSS' }),
        makeFinding({ module: 'security', category: 'SQL Injection', id: 'f2' }),
      ]
      const deduped = deduplicateFindings(findings)
      expect(deduped).toHaveLength(2)
    })

    it('keeps findings from different modules with same category', () => {
      const findings = [
        makeFinding({ module: 'failureMode', category: 'Test' }),
        makeFinding({ module: 'security', category: 'Test', id: 'f2' }),
      ]
      const deduped = deduplicateFindings(findings)
      expect(deduped).toHaveLength(2)
    })

    it('handles empty input', () => {
      expect(deduplicateFindings([])).toEqual([])
    })
  })

  describe('priorityScore', () => {
    it('Critical has lowest score (highest priority)', () => {
      expect(priorityScore(makeFinding({ severity: 'Critical' }))).toBeLessThan(
        priorityScore(makeFinding({ severity: 'High' }))
      )
    })

    it('High < Medium < Info', () => {
      const highScore = priorityScore(makeFinding({ severity: 'High' }))
      const medScore = priorityScore(makeFinding({ severity: 'Medium' }))
      const infoScore = priorityScore(makeFinding({ severity: 'Info' }))
      expect(highScore).toBeLessThan(medScore)
      expect(medScore).toBeLessThan(infoScore)
    })

    it('findings with autoFix get lower score (higher priority)', () => {
      const withFix = priorityScore(makeFinding({ autoFix: { replace: 'a', with: 'b' } }))
      const without = priorityScore(makeFinding({}))
      expect(withFix).toBeLessThan(without)
    })

    it('findings with lineNumber get lower score', () => {
      const withLine = priorityScore(makeFinding({ lineNumber: 5 }))
      const without = priorityScore(makeFinding({ lineNumber: undefined }))
      expect(withLine).toBeLessThan(without)
    })
  })

  describe('sortByPriority', () => {
    it('sorts Critical before High before Medium', () => {
      const findings = [
        makeFinding({ severity: 'Medium', id: 'f1' }),
        makeFinding({ severity: 'Critical', id: 'f2' }),
        makeFinding({ severity: 'High', id: 'f3' }),
      ]
      const sorted = sortByPriority(findings)
      expect(sorted[0].severity).toBe('Critical')
      expect(sorted[1].severity).toBe('High')
      expect(sorted[2].severity).toBe('Medium')
    })

    it('does not mutate original array', () => {
      const findings = [makeFinding({ severity: 'Medium' }), makeFinding({ severity: 'Critical', id: 'f2' })]
      const sorted = sortByPriority(findings)
      expect(sorted).not.toBe(findings)
      expect(findings[0].severity).toBe('Medium') // original unchanged
    })
  })

  describe('groupSummary', () => {
    it('returns summary stats for groups', () => {
      const groups = groupFindings([
        makeFinding({ severity: 'Critical', moduleName: 'A' }),
        makeFinding({ severity: 'High', moduleName: 'A', id: 'f2' }),
        makeFinding({ severity: 'Medium', moduleName: 'B', id: 'f3' }),
      ], 'module')
      const summary = groupSummary(groups)
      expect(summary).toHaveLength(2)
      const a = summary.find(s => s.label === 'A')
      expect(a.count).toBe(2)
      expect(a.critical).toBe(1)
      expect(a.high).toBe(1)
    })
  })
})
