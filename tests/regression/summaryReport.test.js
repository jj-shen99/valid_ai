import { describe, it, expect } from 'vitest'
import { generateSummaryReport } from '../../src/utils/summaryReport'

const findings = [
  { id: '1', module: 'security', moduleName: 'Security Probe', severity: 'Critical', category: 'SQL Injection', description: 'SQL injection found', suggestion: 'Use params', lineNumber: 10 },
  { id: '2', module: 'security', moduleName: 'Security Probe', severity: 'High', category: 'XSS', description: 'XSS vulnerability', suggestion: 'Sanitize', lineNumber: 20 },
  { id: '3', module: 'failureMode', moduleName: 'Failure Mode Scanner', severity: 'Medium', category: 'Off-by-one', description: 'Boundary error', suggestion: 'Fix bounds' },
  { id: '4', module: 'complexity', moduleName: 'Complexity Profiler', severity: 'Info', category: 'Nested loops', description: 'O(n^2)', suggestion: 'Optimize' },
]

describe('Summary Report Generator', () => {
  it('generates valid markdown', () => {
    const report = generateSummaryReport(findings, { language: 'javascript', score: 65 })
    expect(report).toContain('# ValidAI Analysis Report')
    expect(report).toContain('**Language:** javascript')
    expect(report).toContain('**Quality Score:** 65%')
  })

  it('includes severity table', () => {
    const report = generateSummaryReport(findings)
    expect(report).toContain('| Critical | 1 |')
    expect(report).toContain('| High | 1 |')
    expect(report).toContain('| Medium | 1 |')
    expect(report).toContain('| Info | 1 |')
    expect(report).toContain('| **Total** | **4** |')
  })

  it('includes module breakdown', () => {
    const report = generateSummaryReport(findings)
    expect(report).toContain('Security Probe')
    expect(report).toContain('Failure Mode Scanner')
    expect(report).toContain('Complexity Profiler')
  })

  it('includes top issues', () => {
    const report = generateSummaryReport(findings)
    expect(report).toContain('## Top Issues')
    expect(report).toContain('SQL Injection')
    expect(report).toContain('XSS')
  })

  it('includes recommendations for critical issues', () => {
    const report = generateSummaryReport(findings, { score: 40 })
    expect(report).toContain('critical issues')
    expect(report).toContain('high-severity issues')
  })

  it('includes good recommendation for high score', () => {
    const report = generateSummaryReport([], { score: 90 })
    expect(report).toContain('Code quality is good')
  })

  it('includes poor recommendation for low score', () => {
    const report = generateSummaryReport(findings, { score: 30 })
    expect(report).toContain('Code quality is poor')
  })

  it('handles empty findings', () => {
    const report = generateSummaryReport([])
    expect(report).toContain('# ValidAI Analysis Report')
    expect(report).toContain('| **Total** | **0** |')
  })

  it('includes version in footer', () => {
    const report = generateSummaryReport([], { version: '1.0.0' })
    expect(report).toContain('ValidAI v1.0.0')
  })

  it('includes modules count', () => {
    const report = generateSummaryReport([], { modules: ['a', 'b', 'c'] })
    expect(report).toContain('**Modules:** 3 active')
  })

  it('limits top issues to 5', () => {
    const manyFindings = Array.from({ length: 10 }, (_, i) => ({
      id: `f${i}`, module: 'a', severity: 'High', category: `Issue ${i}`, description: 'd', suggestion: 's',
    }))
    const report = generateSummaryReport(manyFindings)
    const issueHeaders = report.match(/### \d+\./g)
    expect(issueHeaders.length).toBeLessThanOrEqual(5)
  })
})
