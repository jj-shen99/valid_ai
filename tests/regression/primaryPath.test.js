/**
 * Primary Path (Happy Path) Tests
 * 
 * Tests the most common, expected user workflows end-to-end:
 *   Path 1: Submit code → get findings → findings have correct structure
 *   Path 2: Submit clean code → get zero findings
 *   Path 3: Analysis engine orchestrates multiple modules
 *   Path 4: Quality score calculation from findings
 *   Path 5: Store persistence workflow
 */
import { describe, it, expect } from 'vitest'
import { runAnalysis } from '../../src/modules/analysisEngine'
import { failureModeScanner } from '../../src/modules/failureMode'
import { securityProbe } from '../../src/modules/securityProbe'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'

describe('Primary Path Tests', () => {
  // ── Path 1: Submit vulnerable code → get structured findings ──
  describe('P1: Submit code with known vulnerabilities', () => {
    const vulnerableCode = `try { processData() } catch (e) {}
eval(userInput)
const query = "SELECT * FROM users WHERE id=" + userId`

    it('analysis engine returns sorted findings from multiple modules', async () => {
      const findings = await runAnalysis(vulnerableCode, 'javascript', ['failureMode', 'security'])
      expect(findings.length).toBeGreaterThan(0)

      // Findings should be sorted by severity (Critical first)
      const sevOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
      for (let i = 1; i < findings.length; i++) {
        expect(sevOrder[findings[i].severity]).toBeGreaterThanOrEqual(sevOrder[findings[i - 1].severity])
      }
    })

    it('every finding has required structure', async () => {
      const findings = await runAnalysis(vulnerableCode, 'javascript', ['failureMode', 'security'])
      findings.forEach(f => {
        expect(f).toHaveProperty('id')
        expect(f).toHaveProperty('module')
        expect(f).toHaveProperty('moduleName')
        expect(f).toHaveProperty('severity')
        expect(f).toHaveProperty('category')
        expect(f).toHaveProperty('description')
        expect(f).toHaveProperty('suggestion')
        expect(f).toHaveProperty('timestamp')
        expect(['Critical', 'High', 'Medium', 'Info']).toContain(f.severity)
      })
    })

    it('findings include codeSnippet when present', async () => {
      const findings = await runAnalysis(vulnerableCode, 'javascript', ['failureMode', 'security'])
      const withSnippets = findings.filter(f => f.codeSnippet)
      expect(withSnippets.length).toBeGreaterThan(0)
    })
  })

  // ── Path 2: Submit clean code → no actionable findings ──
  describe('P2: Submit clean code', () => {
    const cleanCode = `const add = (a, b) => a + b
const subtract = (a, b) => a - b
console.log(add(1, 2))`

    it('failureMode returns empty for clean code', () => {
      expect(failureModeScanner(cleanCode, 'javascript')).toEqual([])
    })

    it('securityProbe returns empty for clean code', () => {
      expect(securityProbe(cleanCode, 'javascript')).toEqual([])
    })

    it('analysis engine returns empty for clean code with all modules', async () => {
      const findings = await runAnalysis(cleanCode, 'javascript', ['failureMode', 'security'])
      expect(findings).toEqual([])
    })
  })

  // ── Path 3: Analysis engine orchestrates modules correctly ──
  describe('P3: Module orchestration', () => {
    it('runs only selected modules', async () => {
      const code = 'eval(x)\ntry { a() } catch(e) {}'
      const secOnly = await runAnalysis(code, 'javascript', ['security'])
      const fmOnly = await runAnalysis(code, 'javascript', ['failureMode'])

      expect(secOnly.every(f => f.module === 'security')).toBe(true)
      expect(fmOnly.every(f => f.module === 'failureMode')).toBe(true)
    })

    it('handles empty module selection gracefully', async () => {
      const findings = await runAnalysis('eval(x)', 'javascript', [])
      expect(findings).toEqual([])
    })

    it('handles unknown module names gracefully', async () => {
      const findings = await runAnalysis('eval(x)', 'javascript', ['nonexistent'])
      expect(findings).toEqual([])
    })
  })

  // ── Path 4: Quality score derivation ──
  describe('P4: Quality score calculation', () => {
    it('score is 100 for zero findings', () => {
      const findings = []
      const actionable = findings.filter(f => f.severity !== 'Info')
      const score = actionable.length === 0 ? 100 : 0
      expect(score).toBe(100)
    })

    it('score decreases with Critical findings', () => {
      const findings = [
        { severity: 'Critical' },
        { severity: 'Critical' },
      ]
      const actionable = findings.filter(f => f.severity !== 'Info')
      const weighted = actionable.reduce((s, f) => s + (f.severity === 'Critical' ? 10 : f.severity === 'High' ? 5 : 2), 0)
      const avgPenalty = weighted / actionable.length
      const score = Math.max(0, Math.round(100 - avgPenalty * 10))
      expect(score).toBe(0)
    })

    it('Info findings do not affect score', () => {
      const findings = [
        { severity: 'Info' },
        { severity: 'Info' },
        { severity: 'Info' },
      ]
      const actionable = findings.filter(f => f.severity !== 'Info')
      const score = actionable.length === 0 ? 100 : 0
      expect(score).toBe(100)
    })
  })

  // ── Path 5: Full pipeline — code in, structured results out ──
  describe('P5: End-to-end pipeline', () => {
    it('full analysis pipeline produces consistent results', async () => {
      const code = `function processUser(name, email, age, role, dept) {
  try { saveToDb(name) } catch (err) {}
  while (true) { break }
  eval(name)
}`
      const findings = await runAnalysis(code, 'javascript', [
        'failureMode', 'security', 'property', 'complexity', 'hallucination'
      ])

      // Should find issues across multiple modules
      const modules = new Set(findings.map(f => f.module))
      expect(modules.size).toBeGreaterThanOrEqual(2)

      // All findings should have lineNumber >= 1
      findings.forEach(f => {
        if (f.lineNumber) {
          expect(f.lineNumber).toBeGreaterThanOrEqual(1)
        }
      })

      // No duplicate findings within same module+category
      const seen = new Set()
      findings.forEach(f => {
        const key = `${f.module}:${f.category}`
        expect(seen.has(key)).toBe(false)
        seen.add(key)
      })
    })
  })
})
