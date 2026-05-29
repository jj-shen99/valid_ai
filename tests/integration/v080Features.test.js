import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Integration tests for v0.8.0 features.
 * Tests interactions between multiple new utilities.
 */

// Mock localStorage
const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
  vi.stubGlobal('performance', {
    now: (() => { let c = 0; return () => c++ })(),
  })
})

describe('v0.8.0 Integration Tests', () => {

  describe('Suppressions + Analysis Pipeline', () => {
    it('suppressed findings are filtered from analysis output', async () => {
      const { addSuppression, applySuppressions } = await import('../../src/utils/suppressions')
      const { failureModeScanner } = await import('../../src/modules/failureMode')

      const code = `
function test() {
  try { doSomething() } catch(e) {}
  for(;;) { break; }
  var x = 42;
}`
      const findings = failureModeScanner(code, 'javascript')
      expect(findings.length).toBeGreaterThan(0)

      // Suppress the first finding's category
      const first = findings[0]
      addSuppression(first.module, first.category)
      const filtered = applySuppressions(findings)
      expect(filtered.every(f => f.category !== first.category)).toBe(true)
      expect(filtered.length).toBeLessThan(findings.length)
    })
  })

  describe('Performance Tracking + Analysis', () => {
    it('runWithTiming records accurate module counts', async () => {
      const { runWithTiming, getPerfHistory } = await import('../../src/utils/perfTracker')
      const { failureModeScanner } = await import('../../src/modules/failureMode')
      const { securityProbe } = await import('../../src/modules/securityProbe')

      const code = `eval("alert(1)")`
      const registry = { failureMode: failureModeScanner, security: securityProbe }
      const result = await runWithTiming(['failureMode', 'security'], registry, code, 'javascript')

      expect(result.findings.length).toBeGreaterThan(0)
      expect(result.timings.failureMode).toBeDefined()
      expect(result.timings.security).toBeDefined()
      expect(typeof result.timings.failureMode.duration).toBe('number')
      expect(typeof result.timings.security.findingCount).toBe('number')
      expect(result.totalDuration).toBeGreaterThanOrEqual(0)

      const history = getPerfHistory()
      expect(history.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Submission Diff + Suppressions', () => {
    it('diffing submissions reflects suppression impact', async () => {
      const { diffSubmissions } = await import('../../src/utils/submissionDiff')
      const { addSuppression, applySuppressions } = await import('../../src/utils/suppressions')

      const sub1 = {
        score: 50,
        timestamp: '2024-01-01T00:00:00Z',
        findings: [
          { id: '1', module: 'security', category: 'XSS', lineNumber: 10 },
          { id: '2', module: 'security', category: 'SQL Injection', lineNumber: 20 },
        ],
      }

      // After suppressing XSS, the "newer" submission only has SQL Injection
      addSuppression('security', 'XSS')
      const filteredFindings = applySuppressions(sub1.findings)
      const sub2 = { ...sub1, score: 70, findings: filteredFindings, timestamp: '2024-01-02T00:00:00Z' }

      const diff = diffSubmissions(sub1, sub2)
      expect(diff.resolvedFindings).toHaveLength(1)
      expect(diff.resolvedFindings[0].category).toBe('XSS')
      expect(diff.scoreDelta).toBe(20)
    })
  })

  describe('Batch + Language Detection', () => {
    it('detectLanguage integrates with batch pipeline', async () => {
      const { detectLanguage } = await import('../../src/utils/batchAnalyzer')

      const files = [
        { name: 'app.py', ext: 'py' },
        { name: 'server.js', ext: 'js' },
        { name: 'utils.ts', ext: 'ts' },
        { name: 'Main.java', ext: 'java' },
        { name: 'handler.go', ext: 'go' },
      ]

      const languages = files.map(f => detectLanguage(f.name))
      expect(languages).toEqual(['python', 'javascript', 'typescript', 'java', 'go'])
    })
  })

  describe('Module Registry Completeness', () => {
    it('analysisEngine exports both runAnalysis and runAnalysisTimed', async () => {
      const engine = await import('../../src/modules/analysisEngine')
      expect(typeof engine.runAnalysis).toBe('function')
      expect(typeof engine.runAnalysisTimed).toBe('function')
      expect(typeof engine.getModuleInfo).toBe('function')
    })

    it('getModuleInfo has entries for all modules', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const modules = ['failureMode', 'security', 'hallucination', 'property', 'complexity',
                        'differential', 'oracle', 'mutation', 'typescript', 'customRules', 'aiReview']
      modules.forEach(mod => {
        const info = getModuleInfo(mod)
        expect(info, `Missing info for ${mod}`).toBeDefined()
        expect(info.name).toBeTruthy()
        expect(info.description).toBeTruthy()
      })
    })
  })

  describe('Cross-feature: suppress then diff', () => {
    it('clearing suppressions restores full finding set', async () => {
      const { addSuppression, applySuppressions, clearAllSuppressions } = await import('../../src/utils/suppressions')

      const findings = [
        { module: 'a', category: 'c1' },
        { module: 'a', category: 'c2' },
        { module: 'b', category: 'c3' },
      ]

      addSuppression('a', 'c1')
      addSuppression('a', 'c2')
      expect(applySuppressions(findings)).toHaveLength(1)

      clearAllSuppressions()
      expect(applySuppressions(findings)).toHaveLength(3)
    })
  })
})
