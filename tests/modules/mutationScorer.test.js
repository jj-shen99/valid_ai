import { describe, it, expect } from 'vitest'
import { mutationScorer } from '../../src/modules/mutationScorer'

describe('mutationScorer', () => {
  it('always returns an info finding requesting test suite', () => {
    const findings = mutationScorer('const x = 1', 'javascript')
    expect(findings).toHaveLength(1)
    expect(findings[0].severity).toBe('Info')
    expect(findings[0].module).toBe('mutation')
    expect(findings[0].category).toBe('Test suite required')
  })

  it('returns valid finding structure', () => {
    const findings = mutationScorer('x = 1', 'python')
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('moduleName', 'Mutation Scorer')
    expect(f).toHaveProperty('description')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('timestamp')
  })
})
