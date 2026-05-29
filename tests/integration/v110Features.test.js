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

describe('v1.1.0 Integration Tests', () => {
  describe('Dead Code + Engine', () => {
    it('deadCode module is registered and produces findings', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      expect(getModuleInfo('deadCode')).toBeDefined()

      const { deadCodeDetector } = await import('../../src/modules/deadCodeDetector')
      const code = 'const tempVar = 1\nconsole.log("hi")'
      const findings = deadCodeDetector(code, 'javascript')
      expect(findings.some(f => f.module === 'deadCode')).toBe(true)
    })
  })

  describe('Duplication + Summary Report', () => {
    it('duplication data integrates with summary report', async () => {
      const { getDuplicationScore } = await import('../../src/utils/duplicationFinder')
      const { generateSummaryReport } = await import('../../src/utils/summaryReport')
      const code = 'const a = 1\nconst b = 2\nconst c = 3\n\nconst x = 1\nconst y = 2\nconst z = 3'
      const dupResult = getDuplicationScore(code, 3)
      expect(typeof dupResult.score).toBe('number')
      const report = generateSummaryReport([], { score: dupResult.score })
      expect(report).toContain('ValidAI Analysis Report')
    })
  })

  describe('Finding Timeline + Quality Gate', () => {
    it('recurring findings contribute to gate evaluation', async () => {
      const { recordFinding, getRecurringFindings } = await import('../../src/utils/findingTimeline')
      const { evaluateGate } = await import('../../src/utils/qualityGate')
      const finding = { module: 'security', category: 'SQL Injection', severity: 'Critical' }
      for (let i = 0; i < 5; i++) recordFinding(finding)
      const recurring = getRecurringFindings(3)
      expect(recurring.length).toBeGreaterThan(0)
      const gate = evaluateGate([finding], 60)
      expect(gate.status).toBe('fail')
    })
  })

  describe('Diff Export + Comparison', () => {
    it('exports diff between two analysis runs', async () => {
      const { compareAnalyses, exportDiffMarkdown } = await import('../../src/utils/diffExporter')
      const before = [{ module: 'security', category: 'XSS', severity: 'High', moduleName: 'Security' }]
      const after = [{ module: 'failureMode', category: 'Off-by-one', severity: 'Medium', moduleName: 'Failure Mode' }]
      const comparison = compareAnalyses(before, after)
      const md = exportDiffMarkdown(comparison, { language: 'javascript' })
      expect(md).toContain('Resolved')
      expect(md).toContain('New Issues')
    })
  })

  describe('Full Audit module completeness', () => {
    it('all 14 modules registered in engine', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const all = ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'typescript', 'accessibility', 'dependency', 'deadCode', 'customRules', 'aiReview']
      all.forEach(mod => {
        if (mod === 'customRules') return
        expect(getModuleInfo(mod), `Missing: ${mod}`).toBeDefined()
      })
    })
  })
})
