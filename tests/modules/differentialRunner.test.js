import { describe, it, expect } from 'vitest'
import { differentialRunner } from '../../src/modules/differentialRunner'

describe('differentialRunner', () => {
  it('returns empty array for clean code with no differential targets', () => {
    const code = 'const x = 1\nconst y = x + 2\n'
    const findings = differentialRunner(code, 'javascript')
    expect(findings).toEqual([])
  })

  it('detects versioned function names (V2, New, Alt, etc.)', () => {
    const code = 'function processDataV2(input) {\n  return input.trim()\n}'
    const findings = differentialRunner(code, 'javascript')
    const versioned = findings.find(f => f.category === 'Versioned function detected')
    expect(versioned).toBeDefined()
    expect(versioned.severity).toBe('Medium')
    expect(versioned.lineNumber).toBe(1)
    expect(versioned.description).toContain('processDataV2')
    expect(versioned.codeSnippet).toContain('processDataV2')
  })

  it('detects const arrow versioned functions', () => {
    const code = 'const fetchNew = (url) => fetch(url)'
    const findings = differentialRunner(code, 'javascript')
    const versioned = findings.find(f => f.category === 'Versioned function detected')
    expect(versioned).toBeDefined()
    expect(versioned.description).toContain('fetchNew')
  })

  it('detects custom sort implementations', () => {
    const code = 'function bubbleSort(arr) {\n  // custom sort\n}'
    const findings = differentialRunner(code, 'javascript')
    const algo = findings.find(f => f.category === 'Custom sort implementation')
    expect(algo).toBeDefined()
    expect(algo.severity).toBe('Medium')
    expect(algo.lineNumber).toBe(1)
    expect(algo.description).toContain('bubbleSort')
    expect(algo.suggestion).toContain('Array.prototype.sort()')
  })

  it('detects custom deepClone implementations', () => {
    const code = 'function deepClone(obj) {\n  return JSON.parse(JSON.stringify(obj))\n}'
    const findings = differentialRunner(code, 'javascript')
    const algo = findings.find(f => f.category === 'Custom deep clone implementation')
    expect(algo).toBeDefined()
    expect(algo.suggestion).toContain('structuredClone()')
  })

  it('detects complex regex patterns (15+ chars)', () => {
    const code = 'const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/'
    const findings = differentialRunner(code, 'javascript')
    const regex = findings.find(f => f.category === 'Complex regex pattern')
    expect(regex).toBeDefined()
    expect(regex.severity).toBe('Medium')
    expect(regex.description).toContain('emailRegex')
  })

  it('does not flag short regex patterns', () => {
    const code = 'const re = /\\d+/'
    const findings = differentialRunner(code, 'javascript')
    const regex = findings.find(f => f.category === 'Complex regex pattern')
    expect(regex).toBeUndefined()
  })

  it('detects chained data transformations', () => {
    const code = 'const result = data.map(x => x.name).filter(n => n.length > 3)'
    const findings = differentialRunner(code, 'javascript')
    const chain = findings.find(f => f.category === 'Chained data transformation')
    expect(chain).toBeDefined()
    expect(chain.severity).toBe('Medium')
    expect(chain.lineNumber).toBe(1)
  })

  it('detects duplicate function definitions', () => {
    const code = 'function process(x) { return x + 1 }\n\nfunction process(x) { return x * 2 }'
    const findings = differentialRunner(code, 'javascript')
    const dup = findings.find(f => f.category === 'Duplicate function definition')
    expect(dup).toBeDefined()
    expect(dup.severity).toBe('High')
    expect(dup.description).toContain('"process"')
    expect(dup.description).toContain('2 times')
    expect(dup.description).toContain('lines 1, 3')
  })

  it('includes lineNumber and codeSnippet in all findings', () => {
    const code = 'function mergeSort(arr) { return arr }\nconst x = data.map(f).filter(g)\n'
    const findings = differentialRunner(code, 'javascript')
    findings.forEach(f => {
      expect(f).toHaveProperty('lineNumber')
      expect(f.lineNumber).toBeGreaterThan(0)
      expect(f).toHaveProperty('module', 'differential')
      expect(f).toHaveProperty('moduleName', 'Differential Runner')
      expect(f).toHaveProperty('timestamp')
    })
  })

  it('returns valid finding structure', () => {
    const code = 'function customSort(arr) { return arr.sort() }'
    const findings = differentialRunner(code, 'javascript')
    expect(findings.length).toBeGreaterThanOrEqual(1)
    const f = findings[0]
    expect(f).toHaveProperty('id')
    expect(f).toHaveProperty('module', 'differential')
    expect(f).toHaveProperty('moduleName', 'Differential Runner')
    expect(f).toHaveProperty('severity')
    expect(f).toHaveProperty('category')
    expect(f).toHaveProperty('description')
    expect(f).toHaveProperty('suggestion')
    expect(f).toHaveProperty('lineNumber')
    expect(f).toHaveProperty('timestamp')
  })
})
