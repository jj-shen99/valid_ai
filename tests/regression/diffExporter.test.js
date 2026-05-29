import { describe, it, expect } from 'vitest'
import { compareAnalyses, exportDiffMarkdown } from '../../src/utils/diffExporter'

const before = [
  { module: 'security', category: 'SQL Injection', severity: 'Critical', moduleName: 'Security Probe', description: 'SQL detected' },
  { module: 'failureMode', category: 'Off-by-one', severity: 'Medium', moduleName: 'Failure Mode Scanner', description: 'Boundary error' },
]

const after = [
  { module: 'security', category: 'SQL Injection', severity: 'Critical', moduleName: 'Security Probe', description: 'SQL detected' },
  { module: 'security', category: 'XSS', severity: 'High', moduleName: 'Security Probe', description: 'XSS found' },
]

describe('Diff Exporter', () => {
  describe('compareAnalyses', () => {
    it('identifies new findings', () => {
      const result = compareAnalyses(before, after)
      expect(result.newFindings).toHaveLength(1)
      expect(result.newFindings[0].category).toBe('XSS')
    })

    it('identifies resolved findings', () => {
      const result = compareAnalyses(before, after)
      expect(result.resolvedFindings).toHaveLength(1)
      expect(result.resolvedFindings[0].category).toBe('Off-by-one')
    })

    it('identifies persistent findings', () => {
      const result = compareAnalyses(before, after)
      expect(result.persistent).toHaveLength(1)
      expect(result.persistent[0].category).toBe('SQL Injection')
    })

    it('computes scores and delta', () => {
      const result = compareAnalyses(before, after)
      expect(typeof result.beforeScore).toBe('number')
      expect(typeof result.afterScore).toBe('number')
      expect(typeof result.delta).toBe('number')
    })

    it('handles empty before', () => {
      const result = compareAnalyses([], after)
      expect(result.newFindings).toHaveLength(2)
      expect(result.resolvedFindings).toHaveLength(0)
    })

    it('handles empty after', () => {
      const result = compareAnalyses(before, [])
      expect(result.newFindings).toHaveLength(0)
      expect(result.resolvedFindings).toHaveLength(2)
    })

    it('marks improved when delta > 0', () => {
      const result = compareAnalyses(before, [])
      expect(result.improved).toBe(true)
    })
  })

  describe('exportDiffMarkdown', () => {
    it('generates markdown report', () => {
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison)
      expect(md).toContain('# Analysis Comparison Report')
      expect(md).toContain('Score Summary')
    })

    it('includes resolved section', () => {
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison)
      expect(md).toContain('Resolved')
      expect(md).toContain('Off-by-one')
    })

    it('includes new issues section', () => {
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison)
      expect(md).toContain('New Issues')
      expect(md).toContain('XSS')
    })

    it('includes persistent section', () => {
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison)
      expect(md).toContain('Persistent')
      expect(md).toContain('SQL Injection')
    })

    it('includes metadata', () => {
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison, { language: 'javascript' })
      expect(md).toContain('javascript')
    })
  })
})
