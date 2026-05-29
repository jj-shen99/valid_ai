import { describe, it, expect } from 'vitest'
import { deadCodeDetector } from '../../src/modules/deadCodeDetector'

describe('Dead Code Detector', () => {
  it('detects unused variable', () => {
    const code = 'const unusedVar = 42\nconsole.log("hello")'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unused variable assignment')).toBe(true)
  })

  it('does not flag used variable', () => {
    const code = 'const x = 42\nconsole.log(x)'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unused variable assignment' && f.description.includes('"x"'))).toBe(false)
  })

  it('ignores underscore variables', () => {
    const code = 'const _ = getValue()\nconsole.log("ok")'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.description.includes('"_"'))).toBe(false)
  })

  it('detects unreachable code after return', () => {
    const code = 'function foo() {\n  return 1;\n  const x = 2;\n}'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unreachable code after return')).toBe(true)
  })

  it('does not flag return before closing brace', () => {
    const code = 'function foo() {\n  return 1;\n}'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unreachable code after return')).toBe(false)
  })

  it('detects commented-out code', () => {
    const code = '// const old = getValue()\nconst x = 1'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Commented-out code block')).toBe(true)
  })

  it('does not flag regular comments', () => {
    const code = '// This is a description\nconst x = 1'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Commented-out code block')).toBe(false)
  })

  it('detects empty function', () => {
    const code = 'function doNothing() {}'
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Empty function body')).toBe(true)
  })

  it('detects unused import', () => {
    const code = "import { unused } from './utils'\nconsole.log('hi')"
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unused import')).toBe(true)
  })

  it('does not flag used import', () => {
    const code = "import { helper } from './utils'\nhelper()"
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.category === 'Unused import' && f.description.includes('"helper"'))).toBe(false)
  })

  it('returns correct module metadata', () => {
    const code = 'const unused = 1'
    const findings = deadCodeDetector(code, 'javascript')
    if (findings.length > 0) {
      expect(findings[0].module).toBe('deadCode')
      expect(findings[0].moduleName).toBe('Dead Code Detector')
      expect(findings[0].id).toMatch(/^dead-/)
    }
  })

  it('returns empty for clean code', () => {
    const code = 'const x = 1\nconsole.log(x)'
    expect(deadCodeDetector(code, 'javascript')).toHaveLength(0)
  })

  it('skips React import', () => {
    const code = "import React from 'react'\nexport default function App() { return null }"
    const findings = deadCodeDetector(code, 'javascript')
    expect(findings.some(f => f.description.includes('"React"'))).toBe(false)
  })
})
