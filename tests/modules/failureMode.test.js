import { describe, it, expect } from 'vitest'
import { failureModeScanner } from '../../src/modules/failureMode'

describe('failureModeScanner', () => {
  it('returns empty array for clean code', () => {
    const code = 'const x = 1\nconst y = 2\n'
    const findings = failureModeScanner(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects silent exception swallowing', () => {
    const code = 'try { doSomething() } catch (e) {}'
    const findings = failureModeScanner(code, 'javascript')
    const silent = findings.find(f => f.category === 'Silent exception swallowing')
    expect(silent).toBeDefined()
    expect(silent.severity).toBe('Critical')
    expect(silent.module).toBe('failureMode')
  })

  it('detects unbounded loop', () => {
    const code = 'while (true) { process() }'
    const findings = failureModeScanner(code, 'javascript')
    const found = findings.find(f => f.category === 'Unbounded loop')
    expect(found).toBeDefined()
    expect(found.severity).toBe('High')
  })

  it('detects type coercion issue in conditionals', () => {
    const code = 'if (x == null) { return }'
    const findings = failureModeScanner(code, 'javascript')
    const found = findings.find(f => f.category === 'Type coercion issue')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
    expect(found.codeSnippet).toBeDefined()
  })

  it('generates valid finding structure', () => {
    const code = 'while (true) { x() }'
    const findings = failureModeScanner(code, 'javascript')
    expect(findings.length).toBeGreaterThan(0)
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('module')
    expect(f).toHaveProperty('moduleName')
    expect(f).toHaveProperty('severity')
    expect(f).toHaveProperty('category')
    expect(f).toHaveProperty('description')
    expect(f).toHaveProperty('lineNumber')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('timestamp')
  })

  it('reports correct line numbers', () => {
    const code = 'const a = 1\nwhile (true) { x() }\nconst b = 2'
    const findings = failureModeScanner(code, 'javascript')
    const found = findings.find(f => f.category === 'Unbounded loop')
    expect(found.lineNumber).toBe(2)
  })

  it('detects multiple issues in multi-line code', () => {
    const code = 'try { x() } catch (e) {}\nwhile (true) { y() }'
    const findings = failureModeScanner(code, 'javascript')
    expect(findings.length).toBeGreaterThanOrEqual(2)
    const categories = findings.map(f => f.category)
    expect(categories).toContain('Silent exception swallowing')
    expect(categories).toContain('Unbounded loop')
  })
})
