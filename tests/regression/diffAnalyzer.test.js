import { describe, it, expect, beforeEach } from 'vitest'
import { computeChangedLines, filterByChangedLines, getLastCode, setLastCode, hasCodeChanged, getCodeHash } from '../../src/utils/diffAnalyzer'

describe('Diff Analyzer', () => {
  describe('computeChangedLines', () => {
    it('returns null when oldCode is null (first submission)', () => {
      expect(computeChangedLines(null, 'const x = 1')).toBeNull()
    })

    it('returns null when oldCode is empty string falsy', () => {
      expect(computeChangedLines('', 'const x = 1')).toBeNull()
    })

    it('returns empty set when code is identical', () => {
      const code = 'line1\nline2\nline3'
      const changed = computeChangedLines(code, code)
      expect(changed.size).toBe(0)
    })

    it('detects a single changed line', () => {
      const old = 'line1\nline2\nline3'
      const new_ = 'line1\nLINE2\nline3'
      const changed = computeChangedLines(old, new_)
      expect(changed.has(2)).toBe(true) // line 2 changed (1-indexed)
    })

    it('includes ±2 context lines', () => {
      const old = 'a\nb\nc\nd\ne\nf\ng'
      const new_ = 'a\nb\nc\nD\ne\nf\ng'
      const changed = computeChangedLines(old, new_)
      // Line 4 changed, context should include lines 2-6
      expect(changed.has(2)).toBe(true)
      expect(changed.has(3)).toBe(true)
      expect(changed.has(4)).toBe(true)
      expect(changed.has(5)).toBe(true)
      expect(changed.has(6)).toBe(true)
      expect(changed.has(1)).toBe(false) // too far
      expect(changed.has(7)).toBe(false) // too far
    })

    it('handles added lines (new code is longer)', () => {
      const old = 'a\nb'
      const new_ = 'a\nb\nc\nd'
      const changed = computeChangedLines(old, new_)
      expect(changed.has(3)).toBe(true)
      expect(changed.has(4)).toBe(true)
    })

    it('handles removed lines (new code is shorter)', () => {
      const old = 'a\nb\nc\nd'
      const new_ = 'a\nb'
      const changed = computeChangedLines(old, new_)
      expect(changed.size).toBeGreaterThan(0)
    })

    it('handles completely different code', () => {
      const old = 'aaa\nbbb\nccc'
      const new_ = 'xxx\nyyy\nzzz'
      const changed = computeChangedLines(old, new_)
      expect(changed.has(1)).toBe(true)
      expect(changed.has(2)).toBe(true)
      expect(changed.has(3)).toBe(true)
    })
  })

  describe('filterByChangedLines', () => {
    const findings = [
      { lineNumber: 1, category: 'A' },
      { lineNumber: 5, category: 'B' },
      { lineNumber: 10, category: 'C' },
      { category: 'D' }, // no lineNumber (global finding)
    ]

    it('returns all findings when changedLines is null', () => {
      expect(filterByChangedLines(findings, null)).toEqual(findings)
    })

    it('filters to only changed lines', () => {
      const changed = new Set([1, 2, 3])
      const result = filterByChangedLines(findings, changed)
      expect(result).toHaveLength(2) // line 1 + global finding D
      expect(result[0].category).toBe('A')
      expect(result[1].category).toBe('D')
    })

    it('keeps global findings (no lineNumber)', () => {
      const changed = new Set([999])
      const result = filterByChangedLines(findings, changed)
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('D')
    })

    it('returns empty when no lines match', () => {
      const changed = new Set([99, 100])
      const result = filterByChangedLines(
        findings.filter(f => f.lineNumber),
        changed
      )
      expect(result).toHaveLength(0)
    })
  })

  describe('Code cache', () => {
    beforeEach(() => {
      // Reset cache state
      setLastCode('test-lang', null)
    })

    it('returns null for unknown language', () => {
      expect(getLastCode('unknown-lang-xyz')).toBeNull()
    })

    it('stores and retrieves code', () => {
      setLastCode('python', 'print("hello")')
      expect(getLastCode('python')).toBe('print("hello")')
    })

    it('detects code changes', () => {
      setLastCode('js', 'const x = 1')
      expect(hasCodeChanged('js', 'const x = 2')).toBe(true)
    })

    it('detects identical code', () => {
      setLastCode('js', 'const x = 1')
      expect(hasCodeChanged('js', 'const x = 1')).toBe(false)
    })

    it('reports changed when no previous code exists', () => {
      expect(hasCodeChanged('new-lang', 'anything')).toBe(true)
    })
  })

  describe('getCodeHash', () => {
    it('returns consistent hash for same input', () => {
      expect(getCodeHash('hello')).toBe(getCodeHash('hello'))
    })

    it('returns different hash for different input', () => {
      expect(getCodeHash('hello')).not.toBe(getCodeHash('world'))
    })

    it('returns a hex string', () => {
      expect(getCodeHash('test')).toMatch(/^[0-9a-f]+$/)
    })
  })
})
