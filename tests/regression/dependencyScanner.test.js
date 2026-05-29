import { describe, it, expect } from 'vitest'
import { dependencyScanner, VULNERABLE_PACKAGES } from '../../src/modules/dependencyScanner'

describe('Dependency Scanner', () => {
  it('detects require of vulnerable package', () => {
    const code = "const es = require('event-stream')"
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('event-stream'))).toBe(true)
    expect(findings[0].severity).toBe('Critical')
  })

  it('detects ES module import of vulnerable package', () => {
    const code = "import faker from 'faker'"
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('faker'))).toBe(true)
  })

  it('detects package.json dependency', () => {
    const code = '"event-stream": "^3.3.6"'
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('event-stream'))).toBe(true)
  })

  it('detects deprecated Buffer constructor', () => {
    const code = 'const buf = new Buffer(10)'
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('Buffer'))).toBe(true)
  })

  it('detects lodash with info severity', () => {
    const code = "import _ from 'lodash'"
    const findings = dependencyScanner(code, 'javascript')
    const lodashFinding = findings.find(f => f.category.includes('lodash'))
    expect(lodashFinding).toBeDefined()
    expect(lodashFinding.severity).toBe('Info')
  })

  it('detects moment as deprecated', () => {
    const code = "const moment = require('moment')"
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('moment'))).toBe(true)
  })

  it('returns correct module metadata', () => {
    const code = "require('event-stream')"
    const findings = dependencyScanner(code, 'javascript')
    expect(findings[0].module).toBe('dependency')
    expect(findings[0].moduleName).toBe('Dependency Scanner')
    expect(findings[0].id).toMatch(/^dep-/)
  })

  it('returns empty for clean code', () => {
    const code = 'const x = 1 + 2\nconsole.log(x)'
    expect(dependencyScanner(code, 'javascript')).toHaveLength(0)
  })

  it('deduplicates same package on multiple lines', () => {
    const code = "require('lodash')\nrequire('lodash/get')"
    const findings = dependencyScanner(code, 'javascript')
    const lodash = findings.filter(f => f.category.includes('lodash'))
    expect(lodash).toHaveLength(1)
  })

  it('detects scoped imports', () => {
    const code = "import something from 'event-stream/parser'"
    const findings = dependencyScanner(code, 'javascript')
    expect(findings.some(f => f.category.includes('event-stream'))).toBe(true)
  })

  it('exports VULNERABLE_PACKAGES list', () => {
    expect(Array.isArray(VULNERABLE_PACKAGES)).toBe(true)
    expect(VULNERABLE_PACKAGES.length).toBeGreaterThan(0)
    expect(VULNERABLE_PACKAGES[0]).toHaveProperty('name')
    expect(VULNERABLE_PACKAGES[0]).toHaveProperty('severity')
  })
})
