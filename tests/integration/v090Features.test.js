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

describe('v0.9.0 Integration Tests', () => {
  describe('Annotations + Severity Overrides together', () => {
    it('annotating and overriding same finding works independently', async () => {
      const { setAnnotation, getAnnotation } = await import('../../src/utils/annotations')
      const { setOverride, applyOverrides } = await import('../../src/utils/severityOverrides')

      const findings = [
        { id: 'f1', module: 'security', category: 'XSS', severity: 'High' },
      ]

      setAnnotation('f1', 'Known issue, deprioritized')
      setOverride('security', 'XSS', 'Info')

      const overridden = applyOverrides(findings)
      expect(overridden[0].severity).toBe('Info')
      expect(overridden[0].originalSeverity).toBe('High')

      const ann = getAnnotation('f1')
      expect(ann.text).toBe('Known issue, deprioritized')
    })
  })

  describe('Accessibility Analyzer + Engine', () => {
    it('accessibility module is registered in engine', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const info = getModuleInfo('accessibility')
      expect(info).toBeDefined()
      expect(info.name).toBe('Accessibility Analyzer')
    })

    it('accessibility module produces findings for JSX', async () => {
      const { accessibilityAnalyzer } = await import('../../src/modules/accessibilityAnalyzer')
      const code = '<img src="test.png" />\n<div onClick={handler}>click</div>'
      const findings = accessibilityAnalyzer(code, 'javascript')
      expect(findings.length).toBeGreaterThan(0)
      expect(findings.every(f => f.module === 'accessibility')).toBe(true)
    })
  })

  describe('Complexity Metrics + Analysis Pipeline', () => {
    it('complexity summary produces grade for real code', async () => {
      const { complexitySummary } = await import('../../src/utils/complexityMetrics')
      const code = `
function processOrder(order) {
  if (!order) return null
  if (order.items.length === 0) return { error: 'empty' }
  for (const item of order.items) {
    if (item.quantity <= 0) continue
    if (item.price < 0) throw new Error('negative price')
    order.total += item.quantity * item.price
  }
  return order
}
`
      const summary = complexitySummary(code)
      expect(summary.cyclomaticComplexity).toBeGreaterThanOrEqual(5)
      expect(summary.functions.length).toBeGreaterThanOrEqual(1)
      expect(['A', 'B', 'C', 'D', 'F']).toContain(summary.grade)
    })
  })

  describe('Suppressions + Overrides + Annotations pipeline', () => {
    it('override then suppress removes finding', async () => {
      const { setOverride, applyOverrides } = await import('../../src/utils/severityOverrides')
      const { addSuppression, applySuppressions } = await import('../../src/utils/suppressions')

      const findings = [
        { id: 'f1', module: 'security', category: 'XSS', severity: 'High' },
        { id: 'f2', module: 'security', category: 'CSRF', severity: 'Medium' },
      ]

      setOverride('security', 'XSS', 'Info')
      const overridden = applyOverrides(findings)
      expect(overridden[0].severity).toBe('Info')

      addSuppression('security', 'XSS')
      const filtered = applySuppressions(overridden)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('CSRF')
    })
  })

  describe('GitHub Issue Export formatting', () => {
    it('end-to-end: analyze code then format as GitHub issue', async () => {
      const { failureModeScanner } = await import('../../src/modules/failureMode')
      const { formatIssueTitle, formatIssueBody, getIssueLabels } = await import('../../src/utils/githubIssueExporter')

      const code = 'try { doSomething() } catch(e) {}'
      const findings = failureModeScanner(code, 'javascript')

      if (findings.length > 0) {
        const title = formatIssueTitle(findings[0])
        const body = formatIssueBody(findings[0])
        const labels = getIssueLabels(findings[0])

        expect(title).toContain('[ValidAI]')
        expect(body).toContain('Description')
        expect(labels).toContain('validai')
        expect(labels.some(l => l.startsWith('module:'))).toBe(true)
      }
    })
  })
})
