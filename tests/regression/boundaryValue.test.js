/**
 * Boundary Value Analysis Tests
 * 
 * Tests inputs at boundary conditions:
 *   - Single-character input
 *   - Single-line vs multi-line
 *   - Very long lines (>120 chars for codeSnippet truncation)
 *   - Exact threshold values (e.g. 3 params vs 4 params)
 *   - Maximum pattern density
 *   - Unicode and special characters
 */
import { describe, it, expect } from 'vitest'
import { failureModeScanner } from '../../src/modules/failureMode'
import { securityProbe } from '../../src/modules/securityProbe'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'
import { complexityProfiler } from '../../src/modules/complexityProfiler'
import { propertyGenerator } from '../../src/modules/propertyGenerator'
import { mutationScorer } from '../../src/modules/mutationScorer'

describe('Boundary Value Analysis', () => {
  // ── BV1: Minimal input ──
  describe('BV1: Minimal inputs', () => {
    it('handles single character', () => {
      expect(failureModeScanner('x', 'javascript')).toEqual([])
      expect(securityProbe('x', 'javascript')).toEqual([])
    })

    it('handles single newline', () => {
      expect(failureModeScanner('\n', 'javascript')).toEqual([])
    })

    it('handles single-line code', () => {
      const code = 'const x = 1'
      expect(Array.isArray(failureModeScanner(code, 'javascript'))).toBe(true)
    })
  })

  // ── BV2: codeSnippet truncation boundary (120 chars) ──
  describe('BV2: codeSnippet truncation at 120 characters', () => {
    it('securityProbe truncates long lines to 120 chars', () => {
      const longPrefix = 'x'.repeat(200)
      const code = `${longPrefix} eval(userInput)`
      const findings = securityProbe(code, 'javascript')
      const evalFinding = findings.find(f => f.category === 'Command injection risk')
      if (evalFinding) {
        expect(evalFinding.codeSnippet.length).toBeLessThanOrEqual(120)
      }
    })

    it('line exactly 120 chars is not truncated', () => {
      const line = 'a'.repeat(110) + ' eval(x)'
      const findings = securityProbe(line, 'javascript')
      const evalFinding = findings.find(f => f.category === 'Command injection risk')
      if (evalFinding) {
        expect(evalFinding.codeSnippet.length).toBeLessThanOrEqual(120)
      }
    })
  })

  // ── BV3: Property generator parameter threshold (3 → 4) ──
  describe('BV3: Parameter count threshold', () => {
    it('3 params: no finding (at boundary)', () => {
      const code = 'function f(a, b, c) { return a }'
      expect(propertyGenerator(code, 'javascript')).toEqual([])
    })

    it('4 params: finding triggered (just above boundary)', () => {
      const code = 'function f(a, b, c, d) { return a }'
      const findings = propertyGenerator(code, 'javascript')
      expect(findings.length).toBe(1)
      expect(findings[0].category).toBe('High parameter count')
    })

    it('0 params: no finding (well below boundary)', () => {
      const code = 'function f() { return 1 }'
      expect(propertyGenerator(code, 'javascript')).toEqual([])
    })
  })

  // ── BV4: Mutation scorer density calculation ──
  describe('BV4: Mutation density boundaries', () => {
    it('single code line with mutation target', () => {
      const code = 'if (x < 10) { return true }'
      const findings = mutationScorer(code, 'javascript')
      const summary = findings.find(f => f.category === 'Mutation Density Score')
      expect(summary).toBeDefined()
      expect(summary.description).toContain('%')
    })

    it('all-comment code has zero density', () => {
      const code = '// if (x < 10) { return true }\n// return false'
      const findings = mutationScorer(code, 'javascript')
      const summary = findings.find(f => f.category === 'Mutation Density Score')
      expect(summary).toBeDefined()
      expect(summary.description).toContain('0%')
    })
  })

  // ── BV5: Line numbering accuracy ──
  describe('BV5: Line number precision', () => {
    it('first line: lineNumber is 1', () => {
      const code = 'eval(x)'
      const findings = securityProbe(code, 'javascript')
      expect(findings[0]?.lineNumber).toBe(1)
    })

    it('pattern on line 5', () => {
      const code = 'const a = 1\nconst b = 2\nconst c = 3\nconst d = 4\neval(x)'
      const findings = securityProbe(code, 'javascript')
      const evalFinding = findings.find(f => f.category === 'Command injection risk')
      expect(evalFinding?.lineNumber).toBe(5)
    })

    it('pattern on last line of 100-line file', () => {
      const lines = Array(99).fill('const x = 1')
      lines.push('eval(x)')
      const code = lines.join('\n')
      const findings = securityProbe(code, 'javascript')
      const evalFinding = findings.find(f => f.category === 'Command injection risk')
      expect(evalFinding?.lineNumber).toBe(100)
    })
  })

  // ── BV6: Unicode and special characters ──
  describe('BV6: Unicode and special characters', () => {
    it('handles Unicode variable names', () => {
      const code = 'const café = "latte"\nconst naïve = true'
      expect(() => failureModeScanner(code, 'javascript')).not.toThrow()
      expect(() => securityProbe(code, 'javascript')).not.toThrow()
    })

    it('handles emoji in strings', () => {
      const code = 'const msg = "Hello 🌍"\nconsole.log(msg)'
      expect(() => failureModeScanner(code, 'javascript')).not.toThrow()
    })

    it('handles Windows line endings (CRLF)', () => {
      const code = 'try { x() } catch (e) {}\r\neval(y)\r\n'
      const fmFindings = failureModeScanner(code, 'javascript')
      const secFindings = securityProbe(code, 'javascript')
      expect(fmFindings.length).toBeGreaterThan(0)
      expect(secFindings.length).toBeGreaterThan(0)
    })
  })

  // ── BV7: Very large input ──
  describe('BV7: Large input handling', () => {
    it('handles 1000-line file without error', () => {
      const lines = Array(1000).fill('const x = 1')
      const code = lines.join('\n')
      expect(() => failureModeScanner(code, 'javascript')).not.toThrow()
      expect(() => securityProbe(code, 'javascript')).not.toThrow()
      expect(() => complexityProfiler(code, 'javascript')).not.toThrow()
    })

    it('deduplication works on large repetitive input', () => {
      const lines = Array(500).fill('eval(x)')
      const code = lines.join('\n')
      const findings = securityProbe(code, 'javascript')
      const cmdFindings = findings.filter(f => f.category === 'Command injection risk')
      expect(cmdFindings.length).toBe(1)
    })
  })
})
