import { describe, it, expect } from 'vitest'
import { propertyGenerator } from '../../src/modules/propertyGenerator'

describe('propertyGenerator', () => {
  it('returns empty array for simple code', () => {
    const code = 'const x = 1\nfunction add(a, b) { return a + b }\n'
    const findings = propertyGenerator(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects high parameter count (>3 params)', () => {
    const code = 'function createUser(name, age, email, role, dept) { return {} }'
    const findings = propertyGenerator(code, 'javascript')
    const found = findings.find(f => f.category === 'High parameter count')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
    expect(found.description).toContain('createUser')
    expect(found.description).toContain('5 parameters')
    expect(found.codeSnippet).toContain('createUser')
  })

  it('detects high parameter count in arrow functions', () => {
    const code = 'const process = (a, b, c, d) => a + b + c + d'
    const findings = propertyGenerator(code, 'javascript')
    const found = findings.find(f => f.category === 'High parameter count')
    expect(found).toBeDefined()
    expect(found.description).toContain('process')
    expect(found.description).toContain('4 parameters')
  })

  it('does not flag functions with 3 or fewer params', () => {
    const code = 'function add(a, b, c) { return a + b + c }'
    const findings = propertyGenerator(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('includes correct line number and codeSnippet', () => {
    const code = 'const x = 1\nfunction big(a, b, c, d, e) { return a }'
    const findings = propertyGenerator(code, 'javascript')
    expect(findings.length).toBe(1)
    expect(findings[0].lineNumber).toBe(2)
    expect(findings[0].codeSnippet).toContain('big')
  })

  it('skips comment lines', () => {
    const code = '// function big(a, b, c, d, e) { return a }'
    const findings = propertyGenerator(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('returns valid finding structure', () => {
    const code = 'function f(a, b, c, d) { return a }'
    const findings = propertyGenerator(code, 'javascript')
    expect(findings.length).toBe(1)
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('module', 'property')
    expect(f).toHaveProperty('moduleName', 'Property Generator')
    expect(f).toHaveProperty('severity', 'Medium')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('timestamp')
  })
})
