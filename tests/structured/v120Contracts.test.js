import { describe, it, expect } from 'vitest'

describe('v1.2.0 Feature Contracts', () => {
  describe('raceConditionDetector exports', () => {
    it('exports scanner function', async () => {
      const mod = await import('../../src/modules/raceConditionDetector')
      expect(typeof mod.raceConditionDetector).toBe('function')
    })
    it('returns array', async () => {
      const { raceConditionDetector } = await import('../../src/modules/raceConditionDetector')
      expect(Array.isArray(raceConditionDetector('const x = 1', 'js'))).toBe(true)
    })
    it('findings have required fields', async () => {
      const { raceConditionDetector } = await import('../../src/modules/raceConditionDetector')
      const code = `let count = 0\nasync function inc() { count++ }`
      const findings = raceConditionDetector(code, 'js')
      if (findings.length > 0) {
        const f = findings[0]
        expect(f).toHaveProperty('id')
        expect(f).toHaveProperty('module', 'raceCondition')
        expect(f).toHaveProperty('severity')
        expect(f).toHaveProperty('category')
        expect(f).toHaveProperty('description')
        expect(f).toHaveProperty('suggestion')
      }
    })
  })

  describe('apiContractValidator exports', () => {
    it('exports validator function', async () => {
      const mod = await import('../../src/modules/apiContractValidator')
      expect(typeof mod.apiContractValidator).toBe('function')
    })
    it('returns array', async () => {
      const { apiContractValidator } = await import('../../src/modules/apiContractValidator')
      expect(Array.isArray(apiContractValidator('', 'js'))).toBe(true)
    })
  })

  describe('errorHandlingAuditor exports', () => {
    it('exports auditor function', async () => {
      const mod = await import('../../src/modules/errorHandlingAuditor')
      expect(typeof mod.errorHandlingAuditor).toBe('function')
    })
    it('returns array with correct shape', async () => {
      const { errorHandlingAuditor } = await import('../../src/modules/errorHandlingAuditor')
      const findings = errorHandlingAuditor('try { x() } catch(e) {}', 'js')
      expect(Array.isArray(findings)).toBe(true)
      if (findings.length > 0) {
        expect(findings[0].module).toBe('errorHandling')
      }
    })
  })

  describe('regexAnalyzer exports', () => {
    it('exports analyzer function', async () => {
      const mod = await import('../../src/modules/regexAnalyzer')
      expect(typeof mod.regexAnalyzer).toBe('function')
    })
    it('returns array', async () => {
      const { regexAnalyzer } = await import('../../src/modules/regexAnalyzer')
      expect(Array.isArray(regexAnalyzer('const x = 1', 'js'))).toBe(true)
    })
  })

  describe('loggingChecker exports', () => {
    it('exports checker function', async () => {
      const mod = await import('../../src/modules/loggingChecker')
      expect(typeof mod.loggingChecker).toBe('function')
    })
    it('returns array with correct shape', async () => {
      const { loggingChecker } = await import('../../src/modules/loggingChecker')
      const findings = loggingChecker("console.log('test')", 'js')
      expect(Array.isArray(findings)).toBe(true)
      if (findings.length > 0) {
        expect(findings[0].module).toBe('logging')
        expect(findings[0]).toHaveProperty('lineNumber')
        expect(findings[0]).toHaveProperty('codeSnippet')
      }
    })
  })

  describe('analysisEngine has 19 module infos', () => {
    it('getModuleInfo returns info for all modules', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const ids = [
        'failureMode', 'security', 'hallucination', 'oracle', 'complexity',
        'mutation', 'property', 'differential', 'typescript', 'accessibility',
        'dependency', 'deadCode', 'raceCondition', 'apiContract', 'errorHandling',
        'regexAnalysis', 'logging', 'customRules', 'aiReview',
      ]
      ids.forEach(id => {
        const info = getModuleInfo(id)
        expect(info, `Missing ${id}`).toBeDefined()
        expect(info.name).toBeTruthy()
        expect(info.icon).toBeTruthy()
        expect(info.description).toBeTruthy()
      })
    })
  })
})
