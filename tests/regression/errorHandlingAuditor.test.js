import { describe, it, expect } from 'vitest'
import { errorHandlingAuditor } from '../../src/modules/errorHandlingAuditor'

describe('Error Handling Auditor', () => {
  it('detects empty catch block', () => {
    const code = `try { doSomething() } catch(e) {}`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category === 'Empty catch block')).toBe(true)
  })

  it('detects promise without catch', () => {
    const code = `fetchData().then(data => process(data))`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Uncaught promise'))).toBe(true)
  })

  it('does not flag promise with catch', () => {
    const code = `fetchData().then(data => process(data)).catch(err => log(err))`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Uncaught promise'))).toBe(false)
  })

  it('detects generic error message', () => {
    const code = `throw new Error('something went wrong')`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category === 'Generic Error thrown')).toBe(true)
  })

  it('does not flag specific error message', () => {
    const code = `throw new Error('User with id 123 not found in database table users')`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category === 'Generic Error thrown')).toBe(false)
  })

  it('detects error-first callback without check', () => {
    const code = `fs.readFile('test.txt', (err, data) => {\n  console.log(data)\n})`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Error-first callback'))).toBe(true)
  })

  it('does not flag checked error callback', () => {
    const code = `fs.readFile('test.txt', (err, data) => {\n  if (err) throw err\n  console.log(data)\n})`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Error-first callback'))).toBe(false)
  })

  it('detects await without try/catch', () => {
    const code = `async function run() {\n  const data = await fetchData()\n}`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing error handling for async'))).toBe(true)
  })

  it('does not flag await inside try/catch', () => {
    const code = `async function run() {\n  try {\n    const data = await fetchData()\n  } catch(e) { log(e) }\n}`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing error handling for async'))).toBe(false)
  })

  it('detects re-throw without context', () => {
    const code = `try {\n  doWork()\n} catch(err) {\n  throw err;\n}`
    const findings = errorHandlingAuditor(code, 'javascript')
    expect(findings.some(f => f.category.includes('Re-throwing without context'))).toBe(true)
  })

  it('returns correct module metadata', () => {
    const code = `try { x() } catch(e) {}`
    const findings = errorHandlingAuditor(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('errorHandling')
      expect(findings[0].moduleName).toBe('Error Handling Auditor')
    }
  })

  it('returns empty for well-handled code', () => {
    const code = `const x = 1 + 2`
    expect(errorHandlingAuditor(code, 'javascript')).toHaveLength(0)
  })
})
