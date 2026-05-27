/**
 * Decision Table Tests
 * 
 * Tests combinations of conditions that drive analysis behaviour:
 *   Condition 1: Code contains a pattern match (Y/N)
 *   Condition 2: Line is a comment (Y/N)
 *   Condition 3: Pattern is already seen / duplicate (Y/N)
 *   Condition 4: Severity is Info (Y/N)
 * 
 * Expected actions:
 *   A1 = Finding pushed
 *   A2 = Finding skipped (no push)
 */
import { describe, it, expect } from 'vitest'
import { failureModeScanner } from '../../src/modules/failureMode'
import { securityProbe } from '../../src/modules/securityProbe'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'
import { complexityProfiler } from '../../src/modules/complexityProfiler'
import { oracleChecker } from '../../src/modules/oracleChecker'
import { mutationScorer } from '../../src/modules/mutationScorer'

describe('Decision Table', () => {
  // Rule 1: Pattern=Y, Comment=N, Duplicate=N → A1 (finding pushed)
  describe('R1: Match + Not Comment + Not Duplicate → Finding pushed', () => {
    it('failureMode: first silent exception match is reported', () => {
      const code = 'try { x() } catch (e) {}'
      const findings = failureModeScanner(code, 'javascript')
      expect(findings.some(f => f.category === 'Silent exception swallowing')).toBe(true)
    })

    it('securityProbe: first eval match is reported', () => {
      const code = 'eval(input)'
      const findings = securityProbe(code, 'javascript')
      expect(findings.some(f => f.category === 'Command injection risk')).toBe(true)
    })

    it('complexityProfiler: first sort match is reported', () => {
      const code = 'arr.sort((a, b) => a - b)'
      const findings = complexityProfiler(code, 'javascript')
      expect(findings.some(f => f.category === 'Inefficient sort usage')).toBe(true)
    })
  })

  // Rule 2: Pattern=Y, Comment=Y → A2 (skipped)
  describe('R2: Match inside comment → Finding skipped', () => {
    it('failureMode skips catch in comment', () => {
      const code = '// try { x() } catch (e) {}'
      expect(failureModeScanner(code, 'javascript')).toEqual([])
    })

    it('securityProbe skips eval in comment', () => {
      const code = '// eval(input)'
      expect(securityProbe(code, 'javascript')).toEqual([])
    })

    it('complexityProfiler skips sort in comment', () => {
      const code = '// arr.sort()'
      expect(complexityProfiler(code, 'javascript')).toEqual([])
    })

    it('oracleChecker skips return null in comment', () => {
      const code = '// return null'
      expect(oracleChecker(code, 'javascript')).toEqual([])
    })

    it('hallucinationDetector skips API calls in block comment', () => {
      const code = '/* myObj.fakeMethod() */'
      expect(hallucinationDetector(code, 'javascript')).toEqual([])
    })
  })

  // Rule 3: Pattern=Y, Comment=N, Duplicate=Y → A2 (skipped)
  describe('R3: Duplicate match → Only first reported', () => {
    it('failureMode deduplicates silent exceptions', () => {
      const code = 'try { a() } catch (e) {}\ntry { b() } catch (e) {}\ntry { c() } catch (e) {}'
      const findings = failureModeScanner(code, 'javascript')
      const silentExceptions = findings.filter(f => f.category === 'Silent exception swallowing')
      expect(silentExceptions.length).toBe(1)
      expect(silentExceptions[0].lineNumber).toBe(1)
    })

    it('securityProbe deduplicates eval findings', () => {
      const code = 'eval(a)\neval(b)\neval(c)'
      const findings = securityProbe(code, 'javascript')
      const cmdFindings = findings.filter(f => f.category === 'Command injection risk')
      expect(cmdFindings.length).toBe(1)
    })

    it('complexityProfiler deduplicates sort findings', () => {
      const code = 'a.sort()\nb.sort()\nc.sort()'
      const findings = complexityProfiler(code, 'javascript')
      const sortFindings = findings.filter(f => f.category === 'Inefficient sort usage')
      expect(sortFindings.length).toBe(1)
    })

    it('oracleChecker deduplicates return null findings', () => {
      const code = 'return null\nreturn null\nreturn null'
      const findings = oracleChecker(code, 'javascript')
      const returnFindings = findings.filter(f => f.category === 'Missing return type consistency')
      expect(returnFindings.length).toBe(1)
    })

    it('hallucinationDetector deduplicates same obj.method call', () => {
      const code = 'myLib.fakeMethod()\nmyLib.fakeMethod()\nmyLib.fakeMethod()'
      const findings = hallucinationDetector(code, 'javascript')
      const fakeFindings = findings.filter(f => f.description.includes('fakeMethod'))
      expect(fakeFindings.length).toBe(1)
    })
  })

  // Rule 4: Pattern=N → A2 (no finding)
  describe('R4: No pattern match → No finding', () => {
    it('failureMode: clean code produces no findings', () => {
      const code = 'const x = 1 + 2'
      expect(failureModeScanner(code, 'javascript')).toEqual([])
    })

    it('securityProbe: clean code produces no findings', () => {
      const code = 'const greeting = "hello"'
      expect(securityProbe(code, 'javascript')).toEqual([])
    })
  })

  // Rule 5: Multi-condition — mixed comments and code
  describe('R5: Mixed comments + code lines', () => {
    it('only reports findings from non-comment lines', () => {
      const code = `// eval(badInput)
const safe = true
eval(userInput)
// while (true) {}
while (true) { break }`
      const secFindings = securityProbe(code, 'javascript')
      expect(secFindings.length).toBeGreaterThan(0)
      secFindings.forEach(f => {
        expect(f.lineNumber).toBe(3)
      })

      const fmFindings = failureModeScanner(code, 'javascript')
      const unbounded = fmFindings.find(f => f.category === 'Unbounded loop')
      if (unbounded) {
        expect(unbounded.lineNumber).toBe(5)
      }
    })
  })
})
