import { describe, it, expect, beforeEach } from 'vitest'
import { customRulesRunner, getCustomRules, saveCustomRules, addCustomRule, removeCustomRule, toggleCustomRule } from '../../src/modules/customRules'

// Mock localStorage for Node tests
const storage = new Map()
const mockLocalStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, val) => storage.set(key, val),
  removeItem: (key) => storage.delete(key),
}
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true })

describe('Custom Rules', () => {
  beforeEach(() => {
    storage.clear()
  })

  describe('Rule CRUD', () => {
    it('returns empty array when no rules saved', () => {
      expect(getCustomRules()).toEqual([])
    })

    it('adds a custom rule', () => {
      const rules = addCustomRule({ name: 'No TODO', pattern: 'TODO', severity: 'Medium', message: 'Found TODO' })
      expect(rules).toHaveLength(1)
      expect(rules[0].name).toBe('No TODO')
      expect(rules[0].id).toMatch(/^custom-/)
      expect(rules[0].enabled).toBe(true)
    })

    it('persists rules to localStorage', () => {
      addCustomRule({ name: 'Test', pattern: 'test', severity: 'High' })
      const retrieved = getCustomRules()
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].name).toBe('Test')
    })

    it('removes a rule by id', () => {
      addCustomRule({ name: 'A', pattern: 'a' })
      addCustomRule({ name: 'B', pattern: 'b' })
      const allRules = getCustomRules()
      expect(allRules).toHaveLength(2)
      const after = removeCustomRule(allRules[0].id)
      expect(after).toHaveLength(1)
      expect(after[0].name).toBe('B')
    })

    it('toggles a rule', () => {
      addCustomRule({ name: 'Toggle', pattern: 'x' })
      const rules = getCustomRules()
      const toggled = toggleCustomRule(rules[0].id)
      expect(toggled[0].enabled).toBe(false)
      const toggledBack = toggleCustomRule(rules[0].id)
      expect(toggledBack[0].enabled).toBe(true)
    })

    it('saveCustomRules overwrites all rules', () => {
      addCustomRule({ name: 'A', pattern: 'a' })
      saveCustomRules([])
      expect(getCustomRules()).toEqual([])
    })
  })

  describe('customRulesRunner', () => {
    it('returns empty when no rules configured', () => {
      expect(customRulesRunner('const x = 1', 'javascript')).toEqual([])
    })

    it('detects matching pattern', () => {
      addCustomRule({ name: 'No console.log', pattern: 'console\\.log', severity: 'Medium', message: 'console.log found' })
      const code = 'const x = 1\nconsole.log(x)'
      const findings = customRulesRunner(code, 'javascript')
      expect(findings).toHaveLength(1)
      expect(findings[0].category).toBe('No console.log')
      expect(findings[0].lineNumber).toBe(2)
      expect(findings[0].module).toBe('customRules')
    })

    it('respects enabled flag', () => {
      addCustomRule({ name: 'R1', pattern: 'foo', severity: 'High' })
      const rules = getCustomRules()
      toggleCustomRule(rules[0].id) // disable
      const findings = customRulesRunner('foo bar', 'javascript')
      expect(findings).toHaveLength(0)
    })

    it('uses severity from rule', () => {
      addCustomRule({ name: 'Crit', pattern: 'danger', severity: 'Critical', message: 'Danger!' })
      const findings = customRulesRunner('danger zone', 'javascript')
      expect(findings[0].severity).toBe('Critical')
    })

    it('only reports first match per rule (dedup)', () => {
      addCustomRule({ name: 'No var', pattern: 'var ', severity: 'Medium' })
      const code = 'var a = 1\nvar b = 2\nvar c = 3'
      const findings = customRulesRunner(code, 'javascript')
      expect(findings).toHaveLength(1) // Only first match
    })

    it('skips comment lines', () => {
      addCustomRule({ name: 'Test', pattern: 'TODO', severity: 'Medium' })
      const code = '// TODO: fix this'
      const findings = customRulesRunner(code, 'javascript')
      expect(findings).toHaveLength(0)
    })

    it('handles invalid regex gracefully', () => {
      addCustomRule({ name: 'Bad regex', pattern: '[invalid', severity: 'High' })
      const findings = customRulesRunner('some code', 'javascript')
      expect(findings).toHaveLength(0) // No crash
    })

    it('includes suggestion in findings', () => {
      addCustomRule({ name: 'Fix', pattern: 'fix', severity: 'Medium', message: 'Found fix', suggestion: 'Remove it' })
      const findings = customRulesRunner('fix this', 'javascript')
      expect(findings[0].suggestion).toBe('Remove it')
    })

    it('provides correct finding structure', () => {
      addCustomRule({ name: 'Test', pattern: 'x', severity: 'Medium', message: 'Found x' })
      const findings = customRulesRunner('let x = 1', 'javascript')
      expect(findings[0]).toHaveProperty('id')
      expect(findings[0]).toHaveProperty('module', 'customRules')
      expect(findings[0]).toHaveProperty('moduleName', 'Custom Rule')
      expect(findings[0]).toHaveProperty('lineNumber')
      expect(findings[0]).toHaveProperty('codeSnippet')
      expect(findings[0]).toHaveProperty('timestamp')
    })
  })
})
