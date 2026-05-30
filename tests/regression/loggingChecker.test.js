import { describe, it, expect } from 'vitest'
import { loggingChecker } from '../../src/modules/loggingChecker'

describe('Logging Checker', () => {
  it('detects console.log in production code', () => {
    const code = `console.log('processing data')`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'console.log in production code')).toBe(true)
  })

  it('does not flag commented console.log', () => {
    const code = `// console.log('debug')`
    expect(loggingChecker(code, 'javascript')).toHaveLength(0)
  })

  it('detects PII in log statement', () => {
    const code = `console.log('user password:', password)`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'PII in log statement')).toBe(true)
  })

  it('detects PII with apiKey', () => {
    const code = `console.error('Config:', apiKey)`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'PII in log statement')).toBe(true)
  })

  it('detects missing error logging in catch', () => {
    const code = `try {\n  doWork()\n} catch(e) {\n  retry()\n}`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing error logging'))).toBe(true)
  })

  it('does not flag catch with logging', () => {
    const code = `try {\n  doWork()\n} catch(e) {\n  console.error(e)\n}`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing error logging'))).toBe(false)
  })

  it('detects string concatenation in log', () => {
    const code = `console.log('User: ' + user.name)`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'String concatenation in log')).toBe(true)
  })

  it('detects wrong log level', () => {
    const code = `console.log('error: connection failed')`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'Missing log level differentiation')).toBe(true)
  })

  it('detects debug logging left in', () => {
    const code = `console.log('debug: entering function')`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'Verbose debug logging left in')).toBe(true)
  })

  it('detects large object logged', () => {
    const code = `console.log(JSON.stringify(req))`
    const findings = loggingChecker(code, 'javascript')
    expect(findings.some(f => f.category === 'Large object logged directly')).toBe(true)
  })

  it('returns correct module metadata', () => {
    const code = `console.log('test')`
    const findings = loggingChecker(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('logging')
      expect(findings[0].moduleName).toBe('Logging Checker')
      expect(findings[0].id).toMatch(/^log-/)
    }
  })

  it('returns empty for clean code', () => {
    const code = `const x = 1 + 2\nreturn x`
    expect(loggingChecker(code, 'javascript')).toHaveLength(0)
  })
})
