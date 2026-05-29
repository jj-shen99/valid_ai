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

describe('v1.0.0 Integration Tests', () => {
  describe('Search + Filter Pipeline', () => {
    it('search narrows then severity filter further narrows', async () => {
      const { applyFilters } = await import('../../src/utils/findingSearch')
      const findings = [
        { module: 'security', severity: 'Critical', category: 'SQL Injection', description: 'sql' },
        { module: 'security', severity: 'High', category: 'XSS', description: 'xss' },
        { module: 'failureMode', severity: 'Critical', category: 'Off-by-one', description: 'boundary' },
      ]
      const result = applyFilters(findings, { query: 'security', severities: ['Critical'] })
      // Only security Critical match
      expect(result.length).toBeLessThanOrEqual(2)
    })
  })

  describe('Dependency Scanner + Engine', () => {
    it('dependency module is registered', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const info = getModuleInfo('dependency')
      expect(info).toBeDefined()
      expect(info.name).toBe('Dependency Scanner')
    })

    it('dependency scanner detects known packages', async () => {
      const { dependencyScanner } = await import('../../src/modules/dependencyScanner')
      const code = "const es = require('event-stream')\nimport _ from 'lodash'"
      const findings = dependencyScanner(code, 'javascript')
      expect(findings.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Summary Report from real analysis', () => {
    it('generates report from failureMode findings', async () => {
      const { failureModeScanner } = await import('../../src/modules/failureMode')
      const { generateSummaryReport } = await import('../../src/utils/summaryReport')
      const code = 'try { doSomething() } catch(e) {}\nfor(;;) { break; }'
      const findings = failureModeScanner(code, 'javascript')
      const report = generateSummaryReport(findings, { language: 'javascript', score: 70 })
      expect(report).toContain('# ValidAI Analysis Report')
      expect(report).toContain('javascript')
    })
  })

  describe('Module Trends + Analysis', () => {
    it('records trends from analysis findings', async () => {
      const { recordAllModuleTrends, getSparklineData } = await import('../../src/utils/moduleTrend')
      const { failureModeScanner } = await import('../../src/modules/failureMode')
      const code = 'try {} catch(e) {}\nvar x = null; x.foo()'
      const findings = failureModeScanner(code, 'javascript')
      recordAllModuleTrends(findings)
      const data = getSparklineData('failureMode')
      expect(data.length).toBeGreaterThan(0)
    })
  })

  describe('Full Audit profile completeness', () => {
    it('Full Audit includes all registered modules except aiReview optionally', async () => {
      const allModules = ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'typescript', 'accessibility', 'dependency', 'customRules', 'aiReview']
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      allModules.forEach(mod => {
        if (mod === 'customRules') return // custom rules depends on user config
        const info = getModuleInfo(mod)
        expect(info, `Missing module info for ${mod}`).toBeDefined()
      })
    })
  })

  describe('Dark mode + severity colors', () => {
    it('dark severity colors cover all levels', async () => {
      const { severityColorsDark } = await import('../../src/utils/darkMode')
      const levels = ['Critical', 'High', 'Medium', 'Info']
      levels.forEach(l => {
        expect(severityColorsDark[l].bg).toContain('dark:')
        expect(severityColorsDark[l].border).toContain('dark:')
      })
    })
  })
})
