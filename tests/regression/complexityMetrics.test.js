import { describe, it, expect } from 'vitest'
import {
  cyclomaticComplexity,
  cognitiveComplexity,
  logicalLOC,
  functionMetrics,
  complexitySummary,
} from '../../src/utils/complexityMetrics'

describe('Complexity Metrics', () => {
  describe('cyclomaticComplexity', () => {
    it('returns 1 for straight-line code', () => {
      expect(cyclomaticComplexity('const x = 1')).toBe(1)
    })

    it('increments for if statements', () => {
      const code = 'if (x) { a() } if (y) { b() }'
      expect(cyclomaticComplexity(code)).toBeGreaterThanOrEqual(3)
    })

    it('increments for loops', () => {
      const code = 'for (let i=0; i<n; i++) { while(true) {} }'
      expect(cyclomaticComplexity(code)).toBeGreaterThanOrEqual(3)
    })

    it('counts logical operators', () => {
      const code = 'if (a && b || c) {}'
      const cc = cyclomaticComplexity(code)
      expect(cc).toBeGreaterThanOrEqual(4) // 1 base + if + && + ||
    })

    it('counts ternary operator', () => {
      const code = 'const x = a ? b : c'
      expect(cyclomaticComplexity(code)).toBeGreaterThanOrEqual(2)
    })

    it('counts catch blocks', () => {
      const code = 'try {} catch(e) {}'
      expect(cyclomaticComplexity(code)).toBeGreaterThanOrEqual(2)
    })

    it('counts switch cases', () => {
      const code = 'switch(x) { case 1: break; case 2: break; }'
      expect(cyclomaticComplexity(code)).toBeGreaterThanOrEqual(3)
    })
  })

  describe('cognitiveComplexity', () => {
    it('returns 0 for simple code', () => {
      expect(cognitiveComplexity('const x = 1')).toBe(0)
    })

    it('increments for control structures', () => {
      const code = 'if (x) {\n  doSomething()\n}'
      expect(cognitiveComplexity(code)).toBeGreaterThanOrEqual(1)
    })

    it('penalizes nesting', () => {
      const nested = 'if (a) {\n  if (b) {\n    doSomething()\n  }\n}'
      const flat = 'if (a) { doA() }\nif (b) { doB() }'
      expect(cognitiveComplexity(nested)).toBeGreaterThan(cognitiveComplexity(flat))
    })

    it('handles for loops with nesting', () => {
      const code = 'for (let i=0; i<n; i++) {\n  if (x) {\n    break\n  }\n}'
      expect(cognitiveComplexity(code)).toBeGreaterThanOrEqual(2)
    })
  })

  describe('logicalLOC', () => {
    it('counts non-blank non-comment lines', () => {
      const code = 'const a = 1\n\n// comment\nconst b = 2\n'
      expect(logicalLOC(code)).toBe(2)
    })

    it('skips blank lines', () => {
      expect(logicalLOC('\n\n\n')).toBe(0)
    })

    it('skips multi-line comment markers', () => {
      const code = '/* start */\n* middle\nconst x = 1'
      expect(logicalLOC(code)).toBe(1)
    })

    it('skips Python comments', () => {
      const code = '# comment\nx = 1\n# another'
      expect(logicalLOC(code)).toBe(1)
    })
  })

  describe('functionMetrics', () => {
    it('extracts function declarations', () => {
      const code = 'function foo(a, b) {\n  return a + b\n}'
      const funcs = functionMetrics(code)
      expect(funcs.length).toBeGreaterThanOrEqual(1)
      const foo = funcs.find(f => f.name === 'foo')
      expect(foo).toBeDefined()
      expect(foo.params).toBe(2)
    })

    it('extracts arrow functions', () => {
      const code = 'const bar = (x) => {\n  return x * 2\n}'
      const funcs = functionMetrics(code)
      expect(funcs.some(f => f.name === 'bar')).toBe(true)
    })

    it('returns empty for no functions', () => {
      expect(functionMetrics('const x = 1')).toEqual([])
    })

    it('includes complexity per function', () => {
      const code = 'function test(a) {\n  if (a) {\n    return 1\n  }\n  return 0\n}'
      const funcs = functionMetrics(code)
      if (funcs.length > 0) {
        expect(funcs[0].cyclomaticComplexity).toBeGreaterThanOrEqual(2)
        expect(typeof funcs[0].cognitiveComplexity).toBe('number')
        expect(typeof funcs[0].loc).toBe('number')
      }
    })
  })

  describe('complexitySummary', () => {
    it('returns all required fields', () => {
      const code = 'function foo() {\n  if (x) { return 1 }\n  return 0\n}'
      const summary = complexitySummary(code)
      expect(summary).toHaveProperty('cyclomaticComplexity')
      expect(summary).toHaveProperty('cognitiveComplexity')
      expect(summary).toHaveProperty('logicalLOC')
      expect(summary).toHaveProperty('functionCount')
      expect(summary).toHaveProperty('avgCyclomaticComplexity')
      expect(summary).toHaveProperty('grade')
      expect(summary).toHaveProperty('functions')
    })

    it('grades simple code as A', () => {
      const code = 'const x = 1'
      expect(complexitySummary(code).grade).toBe('A')
    })

    it('grades complex code higher', () => {
      let code = ''
      for (let i = 0; i < 50; i++) code += `if (x${i}) { y${i}() }\n`
      const grade = complexitySummary(code).grade
      expect(['B', 'C', 'D', 'F']).toContain(grade)
    })

    it('computes avgCyclomaticComplexity', () => {
      const code = 'function a() { return 1 }\nfunction b() { if (x) {} }'
      const summary = complexitySummary(code)
      expect(typeof summary.avgCyclomaticComplexity).toBe('number')
    })
  })
})
