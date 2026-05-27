/**
 * Equivalence Partitioning Tests
 * 
 * Divides input domains into equivalence classes where all members
 * of a class should produce the same kind of output.
 * 
 * Classes tested per module:
 *   - Empty/blank input
 *   - Comment-only input
 *   - Clean code (no findings)
 *   - Single-pattern code (exactly one finding)
 *   - Multi-pattern code (multiple findings)
 *   - Non-target language input
 */
import { describe, it, expect } from 'vitest'
import { failureModeScanner } from '../../src/modules/failureMode'
import { securityProbe } from '../../src/modules/securityProbe'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'
import { complexityProfiler } from '../../src/modules/complexityProfiler'
import { oracleChecker } from '../../src/modules/oracleChecker'
import { propertyGenerator } from '../../src/modules/propertyGenerator'
import { mutationScorer } from '../../src/modules/mutationScorer'
import { differentialRunner } from '../../src/modules/differentialRunner'

const ALL_MODULES = [
  { name: 'failureMode', fn: failureModeScanner },
  { name: 'securityProbe', fn: securityProbe },
  { name: 'hallucinationDetector', fn: hallucinationDetector },
  { name: 'complexityProfiler', fn: complexityProfiler },
  { name: 'oracleChecker', fn: oracleChecker },
  { name: 'propertyGenerator', fn: propertyGenerator },
  { name: 'mutationScorer', fn: mutationScorer },
  { name: 'differentialRunner', fn: differentialRunner },
]

describe('Equivalence Partitioning', () => {
  // ── Class 1: Empty / blank input ──
  describe('EC1: Empty input', () => {
    ALL_MODULES.forEach(({ name, fn }) => {
      it(`${name} returns array for empty string`, () => {
        const result = fn('', 'javascript')
        expect(Array.isArray(result)).toBe(true)
      })
    })

    ALL_MODULES.forEach(({ name, fn }) => {
      it(`${name} returns array for whitespace-only string`, () => {
        const result = fn('   \n  \n   ', 'javascript')
        expect(Array.isArray(result)).toBe(true)
      })
    })
  })

  // ── Class 2: Comment-only input ──
  describe('EC2: Comment-only input (should produce no findings)', () => {
    const commentCode = '// this is a comment\n/* block comment */\n* star comment'

    it('failureMode ignores comments', () => {
      expect(failureModeScanner(commentCode, 'javascript')).toEqual([])
    })

    it('securityProbe ignores comments', () => {
      expect(securityProbe(commentCode, 'javascript')).toEqual([])
    })

    it('hallucinationDetector ignores comments', () => {
      expect(hallucinationDetector(commentCode, 'javascript')).toEqual([])
    })

    it('complexityProfiler ignores comments', () => {
      expect(complexityProfiler(commentCode, 'javascript')).toEqual([])
    })

    it('oracleChecker ignores comments', () => {
      expect(oracleChecker(commentCode, 'javascript')).toEqual([])
    })
  })

  // ── Class 3: Clean code (no findings expected) ──
  describe('EC3: Clean code (no findings)', () => {
    const cleanCode = `const add = (a, b) => a + b
const result = add(1, 2)
console.log(result)`

    it('failureMode returns empty for clean code', () => {
      expect(failureModeScanner(cleanCode, 'javascript')).toEqual([])
    })

    it('securityProbe returns empty for clean code', () => {
      expect(securityProbe(cleanCode, 'javascript')).toEqual([])
    })
  })

  // ── Class 4: Single-pattern (exactly one finding category) ──
  describe('EC4: Single-pattern code', () => {
    it('failureMode detects exactly one silent exception', () => {
      const code = 'try { x() } catch (e) {}'
      const findings = failureModeScanner(code, 'javascript')
      const silentExceptions = findings.filter(f => f.category === 'Silent exception swallowing')
      expect(silentExceptions.length).toBe(1)
    })

    it('securityProbe detects exactly one eval usage', () => {
      const code = 'eval(userInput)'
      const findings = securityProbe(code, 'javascript')
      const cmdInjection = findings.filter(f => f.category === 'Command injection risk')
      expect(cmdInjection.length).toBe(1)
    })

    it('propertyGenerator detects exactly one high-param function', () => {
      const code = 'function process(a, b, c, d, e) { return a }'
      const findings = propertyGenerator(code, 'javascript')
      expect(findings.length).toBe(1)
      expect(findings[0].category).toBe('High parameter count')
    })
  })

  // ── Class 5: Multi-pattern (multiple distinct findings) ──
  describe('EC5: Multi-pattern code', () => {
    it('failureMode detects multiple distinct patterns', () => {
      const code = `try { x() } catch (e) {}
while (true) { break }
if (x == null) { return }`
      const findings = failureModeScanner(code, 'javascript')
      const categories = new Set(findings.map(f => f.category))
      expect(categories.size).toBeGreaterThanOrEqual(2)
    })

    it('securityProbe detects multiple vulnerabilities', () => {
      const code = `const query = "SELECT * FROM users WHERE id=" + userId
eval(userInput)
password = "hardcoded123"`
      const findings = securityProbe(code, 'javascript')
      const categories = new Set(findings.map(f => f.category))
      expect(categories.size).toBeGreaterThanOrEqual(2)
    })
  })

  // ── Class 6: Non-target language ──
  describe('EC6: Non-target language input', () => {
    const pythonCode = `def process(data):
    if data is None:
        raise ValueError("missing")
    return data.strip()`

    ALL_MODULES.forEach(({ name, fn }) => {
      it(`${name} handles Python code without crashing`, () => {
        const result = fn(pythonCode, 'python')
        expect(Array.isArray(result)).toBe(true)
      })
    })
  })
})
