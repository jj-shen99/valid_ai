import { describe, it, expect } from 'vitest'
import { regexAnalyzer } from '../../src/modules/regexAnalyzer'

describe('Regex Complexity Analyzer', () => {
  it('detects potential ReDoS pattern with nested quantifiers', () => {
    const code = `const re = /(a+)+$/`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category === 'Potential ReDoS pattern')).toBe(true)
  })

  it('detects overly complex regex', () => {
    const code = `const re = /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$/`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category === 'Overly complex regex')).toBe(true)
  })

  it('does not flag simple regex', () => {
    const code = `const re = /^\\d+$/`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category === 'Overly complex regex')).toBe(false)
  })

  it('detects global flag with test()', () => {
    const code = `const re = /test/g.test(input)`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category === 'Global flag with test()')).toBe(true)
  })

  it('detects dynamic RegExp with user input', () => {
    const code = "const re = new RegExp(`${userInput}`)"
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category.includes('Greedy quantifier in user input'))).toBe(true)
  })

  it('detects unnecessary capture group', () => {
    const code = `const hasNum = /(\\d+)/.test(str)`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.category === 'Unnecessary capture group')).toBe(true)
  })

  it('returns correct module metadata', () => {
    const code = `const re = /(a+)+$/`
    const findings = regexAnalyzer(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('regexAnalysis')
      expect(findings[0].moduleName).toBe('Regex Complexity Analyzer')
      expect(findings[0].id).toMatch(/^regex-/)
    }
  })

  it('returns empty for code without regex', () => {
    const code = `const x = 1 + 2\nconst y = "hello"`
    expect(regexAnalyzer(code, 'javascript')).toHaveLength(0)
  })

  it('skips comments', () => {
    const code = `// const re = /(a+)+$/\nconst x = 1`
    expect(regexAnalyzer(code, 'javascript')).toHaveLength(0)
  })

  it('detects nested .* pattern', () => {
    const code = `const re = /(.*).*/`
    const findings = regexAnalyzer(code, 'javascript')
    expect(findings.some(f => f.severity === 'Critical')).toBe(true)
  })
})
