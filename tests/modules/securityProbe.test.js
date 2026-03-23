import { describe, it, expect } from 'vitest'
import { securityProbe } from '../../src/modules/securityProbe'

describe('securityProbe', () => {
  it('returns empty array for clean code', () => {
    const code = 'const x = 1\nconst y = x + 2\n'
    const findings = securityProbe(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects SQL injection via string interpolation', () => {
    const code = 'const query = `SELECT * FROM users WHERE id = ${userId}`'
    const findings = securityProbe(code, 'javascript')
    const sqli = findings.find(f => f.category.includes('SQL injection'))
    expect(sqli).toBeDefined()
    expect(sqli.severity).toBe('Critical')
  })

  it('detects weak cryptography (md5)', () => {
    const code = 'const hash = md5(password)'
    const findings = securityProbe(code, 'javascript')
    const weak = findings.find(f => f.category === 'Weak cryptography usage')
    expect(weak).toBeDefined()
    expect(weak.severity).toBe('High')
  })

  it('detects hardcoded credentials', () => {
    const code = 'const password = "super_secret_123"'
    const findings = securityProbe(code, 'javascript')
    const cred = findings.find(f => f.category === 'Hardcoded credentials')
    expect(cred).toBeDefined()
    expect(cred.severity).toBe('Critical')
  })

  it('detects command injection via eval', () => {
    const code = 'eval(userInput)'
    const findings = securityProbe(code, 'javascript')
    const found = findings.find(f => f.category === 'Command injection risk')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Critical')
  })

  it('includes OWASP classification in description', () => {
    const code = 'eval(userInput)'
    const findings = securityProbe(code, 'javascript')
    const found = findings.find(f => f.category === 'Command injection risk')
    expect(found.description).toContain('A03:2021')
  })

  it('detects insecure deserialization (pickle)', () => {
    const code = 'data = pickle.loads(raw_bytes)'
    const findings = securityProbe(code, 'python')
    const found = findings.find(f => f.category === 'Insecure deserialization')
    expect(found).toBeDefined()
    expect(found.severity).toBe('High')
  })

  it('detects multiple security issues', () => {
    const code = 'password = "abc"\neval(userInput)\nconst h = md5(x)'
    const findings = securityProbe(code, 'javascript')
    expect(findings.length).toBeGreaterThanOrEqual(3)
  })
})
