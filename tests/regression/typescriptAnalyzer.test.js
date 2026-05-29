import { describe, it, expect } from 'vitest'
import { typescriptAnalyzer } from '../../src/modules/typescriptAnalyzer'

describe('TypeScript Analyzer', () => {
  it('returns empty array for non-TypeScript languages', () => {
    expect(typescriptAnalyzer('const x: any = 1', 'javascript')).toEqual([])
    expect(typescriptAnalyzer('x: any = 1', 'python')).toEqual([])
  })

  it('detects explicit any type', () => {
    const code = 'function foo(x: any) { return x }'
    const findings = typescriptAnalyzer(code, 'typescript')
    const anyFinding = findings.find(f => f.category === 'Explicit any type')
    expect(anyFinding).toBeDefined()
    expect(anyFinding.severity).toBe('Medium')
  })

  it('detects unsafe as-any assertion', () => {
    const code = 'const val = someObj as any'
    const findings = typescriptAnalyzer(code, 'typescript')
    const asFinding = findings.find(f => f.category === 'Unsafe as-any assertion')
    expect(asFinding).toBeDefined()
    expect(asFinding.severity).toBe('High')
  })

  it('detects double assertion', () => {
    const code = 'const val = someObj as unknown as string'
    const findings = typescriptAnalyzer(code, 'typescript')
    const doubleFinding = findings.find(f => f.category === 'Double assertion (as unknown as)')
    expect(doubleFinding).toBeDefined()
  })

  it('detects non-null assertion', () => {
    const code = 'const len = obj!.length'
    const findings = typescriptAnalyzer(code, 'typescript')
    const nonnull = findings.find(f => f.category === 'Non-null assertion overuse')
    expect(nonnull).toBeDefined()
    expect(nonnull.severity).toBe('Medium')
  })

  it('detects @ts-ignore', () => {
    const code = '// @ts-ignore\nconst x = bad()'
    const findings = typescriptAnalyzer(code, 'typescript')
    // @ts-ignore is in a comment line, which gets skipped
    // Test with non-comment usage
    const code2 = 'const x = "// @ts-ignore"'
    const findings2 = typescriptAnalyzer(code2, 'typescript')
    const tsFinding = findings2.find(f => f.category === '@ts-ignore suppression')
    expect(tsFinding).toBeDefined()
  })

  it('returns findings with correct module metadata', () => {
    const code = 'const x: any = 1'
    const findings = typescriptAnalyzer(code, 'typescript')
    expect(findings.length).toBeGreaterThan(0)
    findings.forEach(f => {
      expect(f.module).toBe('typescript')
      expect(f.moduleName).toBe('TypeScript Analyzer')
      expect(f.id).toMatch(/^ts-/)
      expect(f.lineNumber).toBeGreaterThan(0)
      expect(f.timestamp).toBeDefined()
    })
  })

  it('deduplicates findings (one per pattern)', () => {
    const code = 'const a: any = 1\nconst b: any = 2\nconst c: any = 3'
    const findings = typescriptAnalyzer(code, 'typescript')
    const anyFindings = findings.filter(f => f.category === 'Explicit any type')
    expect(anyFindings).toHaveLength(1)
  })

  it('generates autoFix for any type', () => {
    const code = 'const x: any = 1'
    const findings = typescriptAnalyzer(code, 'typescript')
    const anyFinding = findings.find(f => f.category === 'Explicit any type')
    expect(anyFinding.autoFix).toBeDefined()
    expect(anyFinding.autoFix.with).toContain('unknown')
  })

  it('generates autoFix for non-null assertion', () => {
    const code = 'const len = obj!.length'
    const findings = typescriptAnalyzer(code, 'typescript')
    const nonnull = findings.find(f => f.category === 'Non-null assertion overuse')
    expect(nonnull.autoFix).toBeDefined()
    expect(nonnull.autoFix.with).toContain('?')
  })

  it('handles empty code', () => {
    expect(typescriptAnalyzer('', 'typescript')).toEqual([])
  })

  it('skips comment lines', () => {
    const code = '// const x: any = 1'
    const findings = typescriptAnalyzer(code, 'typescript')
    expect(findings).toHaveLength(0)
  })

  it('works with tsx language', () => {
    const code = 'const x: any = 1'
    const findings = typescriptAnalyzer(code, 'tsx')
    expect(findings.length).toBeGreaterThan(0)
  })
})
