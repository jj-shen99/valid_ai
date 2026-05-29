import { describe, it, expect } from 'vitest'

// Test the code context computation logic from FindingCard
function computeCodeContext(sourceCode, lineNumber) {
  if (!sourceCode || !lineNumber) return null
  const lines = sourceCode.split('\n')
  const ln = lineNumber - 1
  const start = Math.max(0, ln - 3)
  const end = Math.min(lines.length, ln + 4)
  return { start, end, lines: lines.slice(start, end), highlight: ln - start }
}

describe('Code Context Viewer', () => {
  const code = 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10'

  it('returns null when sourceCode is empty', () => {
    expect(computeCodeContext('', 1)).toBeNull()
    expect(computeCodeContext(null, 1)).toBeNull()
    expect(computeCodeContext(undefined, 1)).toBeNull()
  })

  it('returns null when lineNumber is falsy', () => {
    expect(computeCodeContext(code, 0)).toBeNull()
    expect(computeCodeContext(code, null)).toBeNull()
    expect(computeCodeContext(code, undefined)).toBeNull()
  })

  it('shows ±3 lines of context around target line', () => {
    const ctx = computeCodeContext(code, 5)
    expect(ctx.lines.length).toBe(7) // lines 2-8
    expect(ctx.highlight).toBe(3) // line 5 is at index 3 in the slice
    expect(ctx.lines[ctx.highlight]).toBe('line5')
  })

  it('handles first line (no lines above)', () => {
    const ctx = computeCodeContext(code, 1)
    expect(ctx.start).toBe(0)
    expect(ctx.highlight).toBe(0)
    expect(ctx.lines[0]).toBe('line1')
  })

  it('handles last line (no lines below)', () => {
    const ctx = computeCodeContext(code, 10)
    expect(ctx.end).toBe(10)
    expect(ctx.lines[ctx.highlight]).toBe('line10')
  })

  it('handles line 2 (only 1 line above)', () => {
    const ctx = computeCodeContext(code, 2)
    expect(ctx.start).toBe(0) // Can't go above line 1
    expect(ctx.lines[ctx.highlight]).toBe('line2')
  })

  it('handles single-line code', () => {
    const ctx = computeCodeContext('only line', 1)
    expect(ctx.lines).toEqual(['only line'])
    expect(ctx.highlight).toBe(0)
  })

  it('highlight index correctly identifies target line', () => {
    for (let i = 1; i <= 10; i++) {
      const ctx = computeCodeContext(code, i)
      expect(ctx.lines[ctx.highlight]).toBe(`line${i}`)
    }
  })

  it('start and end are 0-indexed', () => {
    const ctx = computeCodeContext(code, 5)
    expect(ctx.start).toBe(1) // 0-indexed start (line 2)
    expect(ctx.end).toBe(8)   // 0-indexed exclusive end (line 9)
  })

  it('handles line number beyond code length', () => {
    const ctx = computeCodeContext('a\nb', 99)
    // When line is beyond code, context still returns (may be empty slice)
    expect(ctx).not.toBeNull()
    expect(ctx.start).toBeGreaterThanOrEqual(0)
  })
})
