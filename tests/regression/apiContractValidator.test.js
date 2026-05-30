import { describe, it, expect } from 'vitest'
import { apiContractValidator } from '../../src/modules/apiContractValidator'

describe('API Contract Validator', () => {
  it('detects missing function documentation', () => {
    const code = `export function processData(input) {\n  return input.trim()\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Missing function documentation')).toBe(true)
  })

  it('does not flag documented function', () => {
    const code = `/**\n * Processes input data\n * @param {string} input\n * @returns {string}\n */\nfunction processData(input) {\n  return input.trim()\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Missing function documentation' && f.description.includes('processData'))).toBe(false)
  })

  it('detects undocumented thrown error', () => {
    const code = `/**\n * Validates input\n */\nfunction validate(input) {\n  if (!input) throw new TypeError('Required')\n  return true\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Undocumented thrown error')).toBe(true)
  })

  it('detects inconsistent return type', () => {
    const code = `/**\n * @returns {number}\n */\nfunction getValue() {\n  return "hello"\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Inconsistent return type')).toBe(true)
  })

  it('does not flag consistent return type', () => {
    const code = `/**\n * @returns {number}\n */\nfunction getValue() {\n  return 42\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Inconsistent return type')).toBe(false)
  })

  it('skips constructor and render', () => {
    const code = `function constructor() {}\nfunction render() {}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.description.includes('constructor'))).toBe(false)
    expect(findings.some(f => f.description.includes('render'))).toBe(false)
  })

  it('returns correct module metadata', () => {
    const code = `export function foo() { return 1 }`
    const findings = apiContractValidator(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('apiContract')
      expect(findings[0].moduleName).toBe('API Contract Validator')
      expect(findings[0].id).toMatch(/^contract-/)
    }
  })

  it('returns empty for fully documented code', () => {
    const code = `/**\n * Adds two numbers\n * @param {number} a\n * @param {number} b\n * @returns {number}\n */\nfunction add(a, b) {\n  return a + b\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Missing function documentation')).toBe(false)
  })

  it('handles empty code', () => {
    expect(apiContractValidator('', 'javascript')).toHaveLength(0)
  })

  it('detects void return type with value', () => {
    const code = `/**\n * @returns {void}\n */\nfunction setup() {\n  return config\n}`
    const findings = apiContractValidator(code, 'javascript')
    expect(findings.some(f => f.category === 'Inconsistent return type')).toBe(true)
  })
})
