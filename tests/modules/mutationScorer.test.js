import { describe, it, expect } from 'vitest'
import { mutationScorer } from '../../src/modules/mutationScorer'

describe('mutationScorer', () => {
  it('returns a summary finding with mutation density', () => {
    const findings = mutationScorer('const x = 1', 'javascript')
    expect(findings.length).toBeGreaterThanOrEqual(1)
    expect(findings[0].module).toBe('mutation')
    expect(findings[0].category).toBe('Mutation Density Score')
    expect(findings[0].description).toContain('mutation targets')
  })

  it('returns valid finding structure', () => {
    const findings = mutationScorer('if (x === 1) { return true }', 'javascript')
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('moduleName', 'Mutation Scorer')
    expect(f).toHaveProperty('description')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('timestamp')
  })

  it('detects boundary comparison mutation targets', () => {
    const code = 'for (let i = 0; i < arr.length; i++) {}'
    const findings = mutationScorer(code, 'javascript')
    const boundary = findings.find(f => f.category === 'Boundary comparison operator')
    expect(boundary).toBeDefined()
  })
})
