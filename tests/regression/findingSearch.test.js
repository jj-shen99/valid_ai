import { describe, it, expect } from 'vitest'
import {
  searchFindings,
  filterBySeverity,
  filterByModule,
  filterByLineRange,
  applyFilters,
  getAvailableModules,
  getAvailableSeverities,
} from '../../src/utils/findingSearch'

const findings = [
  { id: '1', module: 'security', moduleName: 'Security Probe', severity: 'Critical', category: 'SQL Injection', description: 'SQL injection detected', suggestion: 'Use parameterized queries', lineNumber: 10, codeSnippet: 'db.query(sql)' },
  { id: '2', module: 'security', moduleName: 'Security Probe', severity: 'High', category: 'XSS', description: 'Cross-site scripting', suggestion: 'Sanitize input', lineNumber: 20, codeSnippet: 'innerHTML = data' },
  { id: '3', module: 'failureMode', moduleName: 'Failure Mode Scanner', severity: 'Medium', category: 'Off-by-one', description: 'Loop boundary error', suggestion: 'Check bounds', lineNumber: 30 },
  { id: '4', module: 'complexity', moduleName: 'Complexity Profiler', severity: 'Info', category: 'Nested loops', description: 'O(n^2) complexity', suggestion: 'Use hash map', lineNumber: 40 },
]

describe('Finding Search', () => {
  describe('searchFindings', () => {
    it('returns all for empty query', () => {
      expect(searchFindings(findings, '')).toHaveLength(4)
      expect(searchFindings(findings, null)).toHaveLength(4)
    })

    it('searches by category', () => {
      expect(searchFindings(findings, 'SQL')).toHaveLength(1)
    })

    it('searches by description', () => {
      expect(searchFindings(findings, 'cross-site')).toHaveLength(1)
    })

    it('searches by suggestion', () => {
      expect(searchFindings(findings, 'parameterized')).toHaveLength(1)
    })

    it('searches by module name', () => {
      expect(searchFindings(findings, 'Failure Mode')).toHaveLength(1)
    })

    it('searches by code snippet', () => {
      expect(searchFindings(findings, 'innerHTML')).toHaveLength(1)
    })

    it('is case-insensitive', () => {
      expect(searchFindings(findings, 'sql')).toHaveLength(1)
      expect(searchFindings(findings, 'SQL')).toHaveLength(1)
    })

    it('handles whitespace-only query', () => {
      expect(searchFindings(findings, '   ')).toHaveLength(4)
    })
  })

  describe('filterBySeverity', () => {
    it('returns all for empty array', () => {
      expect(filterBySeverity(findings, [])).toHaveLength(4)
    })

    it('filters single severity', () => {
      expect(filterBySeverity(findings, ['Critical'])).toHaveLength(1)
    })

    it('filters multiple severities', () => {
      expect(filterBySeverity(findings, ['Critical', 'High'])).toHaveLength(2)
    })
  })

  describe('filterByModule', () => {
    it('returns all for empty array', () => {
      expect(filterByModule(findings, [])).toHaveLength(4)
    })

    it('filters single module', () => {
      expect(filterByModule(findings, ['security'])).toHaveLength(2)
    })
  })

  describe('filterByLineRange', () => {
    it('filters by line range', () => {
      expect(filterByLineRange(findings, 15, 35)).toHaveLength(2)
    })

    it('includes findings without line numbers', () => {
      const noLine = [{ id: 'x', module: 'a' }]
      expect(filterByLineRange(noLine, 1, 10)).toHaveLength(1)
    })
  })

  describe('applyFilters', () => {
    it('combines query and severity filters', () => {
      const result = applyFilters(findings, { query: 'security', severities: ['Critical'] })
      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('returns all with empty filters', () => {
      expect(applyFilters(findings, {})).toHaveLength(4)
    })

    it('applies all filter types', () => {
      const result = applyFilters(findings, {
        query: 'SQL',
        severities: ['Critical'],
        modules: ['security'],
        startLine: 1,
        endLine: 15,
      })
      expect(result).toHaveLength(1)
    })
  })

  describe('getAvailableModules', () => {
    it('returns unique modules', () => {
      const mods = getAvailableModules(findings)
      expect(mods).toContain('security')
      expect(mods).toContain('failureMode')
      expect(mods).toContain('complexity')
      expect(new Set(mods).size).toBe(mods.length)
    })
  })

  describe('getAvailableSeverities', () => {
    it('returns unique severities', () => {
      const sevs = getAvailableSeverities(findings)
      expect(sevs).toContain('Critical')
      expect(sevs).toContain('High')
      expect(new Set(sevs).size).toBe(sevs.length)
    })
  })
})
