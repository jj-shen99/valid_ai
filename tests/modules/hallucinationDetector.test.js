import { describe, it, expect } from 'vitest'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'

describe('hallucinationDetector', () => {
  it('returns empty array for valid JS API usage', () => {
    const code = 'console.log("hello")\nJSON.parse(data)'
    const findings = hallucinationDetector(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects potentially non-existent API call', () => {
    const code = 'response.fakeMethod(data)'
    const findings = hallucinationDetector(code, 'javascript')
    const found = findings.find(f => f.description.includes('fakeMethod'))
    expect(found).toBeDefined()
    expect(found.module).toBe('hallucination')
    expect(found.severity).toBe('High')
  })

  it('flags unknown method on known object', () => {
    const code = 'Math.nonExistentFunc(42)'
    const findings = hallucinationDetector(code, 'javascript')
    const found = findings.find(f => f.description.includes('nonExistentFunc'))
    expect(found).toBeDefined()
  })

  it('does not flag common methods like then/catch', () => {
    const code = 'promise.then(result => result).catch(err => err)'
    const findings = hallucinationDetector(code, 'javascript')
    const falsePosT = findings.find(f => f.description.includes('.then'))
    const falsePosC = findings.find(f => f.description.includes('.catch'))
    expect(falsePosT).toBeUndefined()
    expect(falsePosC).toBeUndefined()
  })

  it('works with python language', () => {
    const code = 'obj.imaginary_func(x)'
    const findings = hallucinationDetector(code, 'python')
    expect(findings.length).toBeGreaterThan(0)
  })

  it('generates valid finding structure', () => {
    const code = 'obj.unknownCall(x)'
    const findings = hallucinationDetector(code, 'javascript')
    expect(findings.length).toBeGreaterThan(0)
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('module', 'hallucination')
    expect(f).toHaveProperty('moduleName', 'Hallucination Detector')
    expect(f).toHaveProperty('suggestion')
  })
})
