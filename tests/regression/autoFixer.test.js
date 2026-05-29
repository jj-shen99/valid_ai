import { describe, it, expect } from 'vitest'
import { attachAutoFixes, applyFix, generatePatchText } from '../../src/utils/autoFixer'

describe('Auto-Fixer', () => {
  describe('attachAutoFixes', () => {
    it('attaches fix for loose equality', () => {
      const code = 'if (x == 5) {}'
      const findings = [{
        module: 'failureMode',
        category: 'Type coercion issue',
        lineNumber: 1,
        severity: 'Medium',
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeDefined()
      expect(result[0].autoFix.with).toContain('===')
    })

    it('attaches fix for silent catch', () => {
      const code = 'try {} catch (e) {}'
      const findings = [{
        module: 'failureMode',
        category: 'Silent exception swallowing',
        lineNumber: 1,
        severity: 'Critical',
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeDefined()
      expect(result[0].autoFix.with).toContain('console.error')
    })

    it('attaches fix for off-by-one', () => {
      const code = 'for (let i = 0; i <= arr.length; i++) {}'
      const findings = [{
        module: 'failureMode',
        category: 'Off-by-one boundary error',
        lineNumber: 1,
        severity: 'High',
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeDefined()
      expect(result[0].autoFix.with).toContain('< arr.length')
    })

    it('attaches fix for innerHTML XSS', () => {
      const code = 'el.innerHTML = userInput'
      const findings = [{
        module: 'security',
        category: 'XSS vulnerability',
        lineNumber: 1,
        severity: 'High',
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeDefined()
      expect(result[0].autoFix.with).toContain('textContent')
    })

    it('preserves existing autoFix on findings', () => {
      const code = 'const x = 1'
      const existing = { replace: 'foo', with: 'bar', line: 1 }
      const findings = [{
        module: 'failureMode',
        category: 'Type coercion issue',
        lineNumber: 1,
        autoFix: existing,
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBe(existing)
    })

    it('returns findings unchanged when no fix applies', () => {
      const code = 'const x = 1'
      const findings = [{
        module: 'oracle',
        category: 'Something else',
        lineNumber: 1,
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeUndefined()
    })

    it('handles findings without lineNumber', () => {
      const code = 'const x = 1'
      const findings = [{
        module: 'failureMode',
        category: 'Type coercion issue',
        // no lineNumber
      }]
      const result = attachAutoFixes(findings, code)
      expect(result[0].autoFix).toBeUndefined()
    })
  })

  describe('applyFix', () => {
    it('replaces text on the correct line', () => {
      const code = 'line1\nif (x == 5) {}\nline3'
      const fix = { replace: '==', with: '===', line: 2 }
      const result = applyFix(code, fix)
      expect(result).toBe('line1\nif (x === 5) {}\nline3')
    })

    it('handles fix on first line', () => {
      const code = 'x == y'
      const fix = { replace: '==', with: '===', line: 1 }
      expect(applyFix(code, fix)).toBe('x === y')
    })

    it('does nothing for out-of-range line', () => {
      const code = 'line1'
      const fix = { replace: 'foo', with: 'bar', line: 99 }
      expect(applyFix(code, fix)).toBe('line1')
    })
  })

  describe('generatePatchText', () => {
    it('generates patch text for autoFix finding', () => {
      const finding = { autoFix: { replace: '==', with: '===', line: 5 } }
      const patch = generatePatchText(finding)
      expect(patch).toContain('Line 5')
      expect(patch).toContain('- ==')
      expect(patch).toContain('+ ===')
    })

    it('returns null when no autoFix', () => {
      expect(generatePatchText({ category: 'test' })).toBeNull()
    })
  })
})
