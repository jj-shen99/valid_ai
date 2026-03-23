import { describe, it, expect } from 'vitest'
import { runAnalysis, getModuleInfo } from '../../src/modules/analysisEngine'

describe('runAnalysis', () => {
  it('returns findings for mutation module on simple code', async () => {
    const findings = await runAnalysis('const x = 1', 'javascript', ['mutation'], '', '')
    // mutation now returns a summary + any detected targets
    expect(findings.length).toBeGreaterThanOrEqual(1)
    expect(findings[0].module).toBe('mutation')
  })

  it('runs multiple modules and combines findings', async () => {
    const code = 'eval(userInput)\nwhile (true) { x() }'
    const findings = await runAnalysis(code, 'javascript', ['failureMode', 'security'], '', '')
    expect(findings.length).toBeGreaterThanOrEqual(2)
    const modules = new Set(findings.map(f => f.module))
    expect(modules.has('failureMode')).toBe(true)
    expect(modules.has('security')).toBe(true)
  })

  it('returns findings sorted by severity', async () => {
    const code = 'try { x() } catch (e) {}\nwhile (true) { y() }'
    const findings = await runAnalysis(code, 'javascript', ['failureMode'], '', '')
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    for (let i = 1; i < findings.length; i++) {
      expect(severityOrder[findings[i].severity]).toBeGreaterThanOrEqual(severityOrder[findings[i - 1].severity])
    }
  })

  it('skips unknown modules gracefully', async () => {
    const findings = await runAnalysis('const x = 1', 'javascript', ['nonexistent'], '', '')
    expect(findings).toEqual([])
  })

  it('handles empty code', async () => {
    const findings = await runAnalysis('', 'javascript', ['failureMode', 'security'], '', '')
    expect(findings).toEqual([])
  })

  it('handles empty module list', async () => {
    const findings = await runAnalysis('eval(x)', 'javascript', [], '', '')
    expect(findings).toEqual([])
  })
})

describe('getModuleInfo', () => {
  it('returns info for known modules', () => {
    const info = getModuleInfo('failureMode')
    expect(info).toBeDefined()
    expect(info.name).toBe('Failure Mode Scanner')
    expect(info.icon).toBe('🔍')
    expect(info.description).toBeDefined()
    expect(info.estimatedTime).toBeDefined()
  })

  it('returns info for security module', () => {
    const info = getModuleInfo('security')
    expect(info).toBeDefined()
    expect(info.name).toBe('Security Probe')
  })

  it('returns undefined for unknown module', () => {
    const info = getModuleInfo('nonexistent')
    expect(info).toBeUndefined()
  })
})
