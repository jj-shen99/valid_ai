import { describe, it, expect } from 'vitest'
import { oracleChecker } from '../../src/modules/oracleChecker'

describe('oracleChecker', () => {
  it('returns empty array for clean code', () => {
    const code = 'const x = 1\nconst y = 2\n'
    const findings = oracleChecker(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects missing input validation', () => {
    const code = 'function processData(input) {\n  return input.trim()\n}'
    const findings = oracleChecker(code, 'javascript')
    const found = findings.find(f => f.category === 'Missing input validation')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
    expect(found.lineNumber).toBe(1)
    expect(found.codeSnippet).toContain('processData')
  })

  it('detects missing return type consistency', () => {
    const code = 'function getValue(x) {\n  if (!x) return null\n  return x.value\n}'
    const findings = oracleChecker(code, 'javascript')
    const found = findings.find(f => f.category === 'Missing return type consistency')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
  })

  it('detects missing error contract', () => {
    const code = 'try { doWork() } catch (err) { console.log(err) }'
    const findings = oracleChecker(code, 'javascript')
    const found = findings.find(f => f.category === 'Missing error contract')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
    expect(found.codeSnippet).toBeDefined()
  })

  it('deduplicates findings per pattern type', () => {
    const code = 'return null\nreturn null\nreturn null'
    const findings = oracleChecker(code, 'javascript')
    const returnFindings = findings.filter(f => f.category === 'Missing return type consistency')
    expect(returnFindings.length).toBe(1)
  })

  it('includes codeSnippet and lineNumber in findings', () => {
    const code = 'function process(input) {\n  return input\n}'
    const findings = oracleChecker(code, 'javascript')
    findings.forEach(f => {
      expect(f).toHaveProperty('lineNumber')
      expect(f.lineNumber).toBeGreaterThan(0)
      expect(f).toHaveProperty('codeSnippet')
      expect(f).toHaveProperty('module', 'oracle')
      expect(f).toHaveProperty('moduleName', 'Oracle Checker')
      expect(f).toHaveProperty('timestamp')
    })
  })

  it('skips comment lines', () => {
    const code = '// return null\n/* return undefined */'
    const findings = oracleChecker(code, 'javascript')
    expect(findings).toEqual([])
  })
})
