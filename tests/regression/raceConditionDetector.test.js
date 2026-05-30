import { describe, it, expect } from 'vitest'
import { raceConditionDetector } from '../../src/modules/raceConditionDetector'

describe('Race Condition Detector', () => {
  it('detects unguarded Promise.all with shared state', () => {
    const code = `let count = 0\nasync function run() {\n  await Promise.all([1,2,3].map(async n => { count++ }))\n}`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('Promise.all'))).toBe(true)
  })

  it('detects non-atomic read-modify-write in async context', () => {
    const code = `let total = 0\nasync function add(v) { total = total + v }`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('Non-atomic'))).toBe(true)
  })

  it('detects setTimeout state mutation', () => {
    const code = `let x = 0\nsetTimeout(function() {\n  x++\n}, 100)`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('setTimeout'))).toBe(true)
  })

  it('detects missing await on async call', () => {
    const code = `async function run() {\n  db.save({ name: 'test' })\n}`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing await'))).toBe(true)
  })

  it('does not flag awaited calls', () => {
    const code = `async function run() {\n  await db.save({ name: 'test' })\n}`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('Missing await'))).toBe(false)
  })

  it('detects unprotected global counter', () => {
    const code = `let counter = 0\nasync function inc() { counter++ }`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.some(f => f.category.includes('Unprotected global counter'))).toBe(true)
  })

  it('detects event listener shared state', () => {
    const code = `let clicks = 0\ndocument.addEventListener('click', () => { clicks++ })`
    const findings = raceConditionDetector(code, 'javascript')
    expect(findings.length).toBeGreaterThan(0)
  })

  it('returns correct module metadata', () => {
    const code = `let counter = 0\nasync function inc() { counter++ }`
    const findings = raceConditionDetector(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('raceCondition')
      expect(findings[0].moduleName).toBe('Race Condition Detector')
    }
  })

  it('returns empty for synchronous code', () => {
    const code = `const x = 1 + 2\nconst y = x * 3`
    expect(raceConditionDetector(code, 'javascript')).toHaveLength(0)
  })

  it('skips comments', () => {
    const code = `// let counter = 0\nconst x = 1`
    expect(raceConditionDetector(code, 'javascript')).toHaveLength(0)
  })
})
