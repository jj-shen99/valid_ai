import { describe, it, expect } from 'vitest'
import { complexityProfiler } from '../../src/modules/complexityProfiler'

describe('complexityProfiler', () => {
  it('returns empty array for simple code', () => {
    const code = 'const x = 1\nconst y = 2\n'
    const findings = complexityProfiler(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects inefficient sort usage', () => {
    const code = 'items.sort((a, b) => a - b)'
    const findings = complexityProfiler(code, 'javascript')
    const found = findings.find(f => f.category === 'Inefficient sort usage')
    expect(found).toBeDefined()
    expect(found.severity).toBe('Medium')
    expect(found.module).toBe('complexity')
  })

  it('generates valid finding structure', () => {
    const code = 'items.sort()'
    const findings = complexityProfiler(code, 'javascript')
    expect(findings.length).toBeGreaterThan(0)
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('module', 'complexity')
    expect(f).toHaveProperty('moduleName', 'Complexity Profiler')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('timestamp')
  })
})
