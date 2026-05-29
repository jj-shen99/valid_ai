import { describe, it, expect } from 'vitest'
import { runAnalysis, getModuleInfo } from '../../src/modules/analysisEngine'

describe('Analysis Engine (v0.6.0 updates)', () => {
  describe('Module registry', () => {
    it('recognizes typescript module', () => {
      const info = getModuleInfo('typescript')
      expect(info).toBeDefined()
      expect(info.name).toBe('TypeScript Analyzer')
    })

    it('recognizes customRules module', () => {
      const info = getModuleInfo('customRules')
      expect(info).toBeDefined()
      expect(info.name).toBe('Custom Rules')
    })

    it('still recognizes all original modules', () => {
      const origModules = ['failureMode', 'security', 'hallucination', 'property', 'complexity', 'differential', 'oracle', 'mutation', 'aiReview']
      origModules.forEach(mod => {
        expect(getModuleInfo(mod)).toBeDefined()
        expect(getModuleInfo(mod).name).toBeTruthy()
      })
    })

    it('returns undefined for unknown module', () => {
      expect(getModuleInfo('nonexistent')).toBeUndefined()
    })
  })

  describe('runAnalysis with incremental mode', () => {
    it('returns findings on first run (no previous code)', async () => {
      const code = 'try {} catch (e) {}'
      const findings = await runAnalysis(code, 'javascript', ['failureMode'], '', '', { incremental: true })
      expect(findings.length).toBeGreaterThan(0)
    })

    it('returns empty when identical code submitted with incremental', async () => {
      const code = 'const x = 1\nconst y = 2'
      // First run
      await runAnalysis(code, 'test-inc-lang', ['failureMode'], '', '', { incremental: true })
      // Second run with same code
      const findings = await runAnalysis(code, 'test-inc-lang', ['failureMode'], '', '', { incremental: true })
      expect(findings).toEqual([])
    })

    it('returns findings for changed code in incremental mode', async () => {
      const code1 = 'const x = 1'
      await runAnalysis(code1, 'test-inc2', ['failureMode'], '', '', { incremental: true })
      const code2 = 'try {} catch (e) {}'
      const findings = await runAnalysis(code2, 'test-inc2', ['failureMode'], '', '', { incremental: true })
      expect(findings.length).toBeGreaterThan(0)
    })
  })

  describe('runAnalysis with typescript module', () => {
    it('typescript module finds any types', async () => {
      const code = 'const x: any = 1'
      const findings = await runAnalysis(code, 'typescript', ['typescript'])
      const tsFinding = findings.find(f => f.module === 'typescript')
      expect(tsFinding).toBeDefined()
    })

    it('typescript module returns nothing for javascript', async () => {
      const code = 'const x: any = 1'
      const findings = await runAnalysis(code, 'javascript', ['typescript'])
      const tsFinding = findings.find(f => f.module === 'typescript')
      expect(tsFinding).toBeUndefined()
    })
  })

  describe('runAnalysis sorting', () => {
    it('sorts findings by severity (Critical first)', async () => {
      const code = 'try {} catch (e) {}\nif (x == 5) {}'
      const findings = await runAnalysis(code, 'javascript', ['failureMode'])
      if (findings.length >= 2) {
        const sevOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
        for (let i = 1; i < findings.length; i++) {
          expect(sevOrder[findings[i].severity]).toBeGreaterThanOrEqual(sevOrder[findings[i-1].severity])
        }
      }
    })
  })
})
