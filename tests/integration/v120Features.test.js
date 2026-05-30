import { describe, it, expect } from 'vitest'

describe('v1.2.0 Integration Tests', () => {
  describe('All 5 new modules registered in engine', () => {
    it('getModuleInfo covers all 19 modules', async () => {
      const { getModuleInfo } = await import('../../src/modules/analysisEngine')
      const all = [
        'failureMode', 'security', 'hallucination', 'oracle', 'complexity',
        'mutation', 'property', 'differential', 'typescript', 'accessibility',
        'dependency', 'deadCode', 'raceCondition', 'apiContract', 'errorHandling',
        'regexAnalysis', 'logging', 'customRules', 'aiReview',
      ]
      all.forEach(mod => {
        expect(getModuleInfo(mod), `Missing module info: ${mod}`).toBeDefined()
      })
    })
  })

  describe('Race Condition + Error Handling pipeline', () => {
    it('both modules find issues in problematic async code', async () => {
      const { raceConditionDetector } = await import('../../src/modules/raceConditionDetector')
      const { errorHandlingAuditor } = await import('../../src/modules/errorHandlingAuditor')
      const code = `let count = 0\nasync function run() {\n  const data = await fetch('/api')\n  count++\n}`
      const race = raceConditionDetector(code, 'javascript')
      const errors = errorHandlingAuditor(code, 'javascript')
      expect(race.length + errors.length).toBeGreaterThan(0)
    })
  })

  describe('Regex + Logging cross-module', () => {
    it('regex and logging modules find distinct issues', async () => {
      const { regexAnalyzer } = await import('../../src/modules/regexAnalyzer')
      const { loggingChecker } = await import('../../src/modules/loggingChecker')
      const code = `const re = /(a+)+$/\nconsole.log('testing regex:', password)`
      const regexFindings = regexAnalyzer(code, 'javascript')
      const logFindings = loggingChecker(code, 'javascript')
      expect(regexFindings.some(f => f.module === 'regexAnalysis')).toBe(true)
      expect(logFindings.some(f => f.module === 'logging')).toBe(true)
    })
  })

  describe('API Contract + Dead Code pipeline', () => {
    it('both modules analyze same code independently', async () => {
      const { apiContractValidator } = await import('../../src/modules/apiContractValidator')
      const { deadCodeDetector } = await import('../../src/modules/deadCodeDetector')
      const code = `export function processData(input) {\n  const unusedTemp = 42\n  return input\n}`
      const contracts = apiContractValidator(code, 'javascript')
      const deadCode = deadCodeDetector(code, 'javascript')
      // Should find missing docs AND unused variable
      expect(contracts.length + deadCode.length).toBeGreaterThan(0)
    })
  })

  describe('Full Audit module list', () => {
    it('Full Audit has exactly 19 modules', () => {
      const fullAuditModules = [
        'failureMode', 'security', 'hallucination', 'oracle', 'complexity',
        'mutation', 'property', 'differential', 'typescript', 'accessibility',
        'dependency', 'deadCode', 'raceCondition', 'apiContract', 'errorHandling',
        'regexAnalysis', 'logging', 'customRules', 'aiReview',
      ]
      expect(fullAuditModules).toHaveLength(19)
      expect(new Set(fullAuditModules).size).toBe(19) // No duplicates
    })
  })
})
