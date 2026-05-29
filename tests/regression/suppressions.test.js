import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getSuppressions,
  saveSuppressions,
  addSuppression,
  removeSuppression,
  clearAllSuppressions,
  isSuppressed,
  applySuppressions,
} from '../../src/utils/suppressions'

// Mock localStorage
const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

describe('Suppression Manager', () => {
  describe('CRUD operations', () => {
    it('starts with empty suppressions', () => {
      expect(getSuppressions()).toEqual([])
    })

    it('adds a suppression', () => {
      const items = addSuppression('security', 'SQL Injection')
      expect(items).toHaveLength(1)
      expect(items[0].module).toBe('security')
      expect(items[0].category).toBe('SQL Injection')
      expect(items[0].key).toBe('security:SQL Injection')
      expect(items[0].id).toMatch(/^sup-/)
    })

    it('prevents duplicate suppressions', () => {
      addSuppression('security', 'XSS')
      const items = addSuppression('security', 'XSS')
      expect(items).toHaveLength(1)
    })

    it('stores reason in suppression', () => {
      const items = addSuppression('security', 'XSS', 'false positive')
      expect(items[0].reason).toBe('false positive')
    })

    it('generates unique IDs', () => {
      addSuppression('security', 'SQL Injection')
      addSuppression('security', 'XSS')
      addSuppression('failureMode', 'Off-by-one')
      const items = getSuppressions()
      const ids = items.map(i => i.id)
      expect(new Set(ids).size).toBe(3)
    })

    it('removes a suppression by ID', () => {
      addSuppression('security', 'XSS')
      const all = getSuppressions()
      const items = removeSuppression(all[0].id)
      expect(items).toHaveLength(0)
    })

    it('clears all suppressions', () => {
      addSuppression('security', 'XSS')
      addSuppression('failureMode', 'Off-by-one')
      const items = clearAllSuppressions()
      expect(items).toEqual([])
      expect(getSuppressions()).toEqual([])
    })
  })

  describe('isSuppressed', () => {
    it('returns true for suppressed module:category', () => {
      addSuppression('security', 'XSS')
      expect(isSuppressed('security', 'XSS')).toBe(true)
    })

    it('returns false for non-suppressed', () => {
      expect(isSuppressed('security', 'XSS')).toBe(false)
    })

    it('differentiates modules with same category', () => {
      addSuppression('security', 'XSS')
      expect(isSuppressed('failureMode', 'XSS')).toBe(false)
    })
  })

  describe('applySuppressions', () => {
    const findings = [
      { id: '1', module: 'security', category: 'SQL Injection', severity: 'Critical' },
      { id: '2', module: 'security', category: 'XSS', severity: 'High' },
      { id: '3', module: 'failureMode', category: 'Off-by-one', severity: 'Medium' },
      { id: '4', module: 'complexity', category: 'Nested loops', severity: 'Info' },
    ]

    it('returns all findings when no suppressions', () => {
      expect(applySuppressions(findings)).toHaveLength(4)
    })

    it('filters out suppressed findings', () => {
      addSuppression('security', 'XSS')
      const result = applySuppressions(findings)
      expect(result).toHaveLength(3)
      expect(result.find(f => f.category === 'XSS')).toBeUndefined()
    })

    it('filters multiple suppressed categories', () => {
      addSuppression('security', 'SQL Injection')
      addSuppression('security', 'XSS')
      const result = applySuppressions(findings)
      expect(result).toHaveLength(2)
    })

    it('handles empty findings array', () => {
      addSuppression('security', 'XSS')
      expect(applySuppressions([])).toEqual([])
    })
  })

  describe('persistence', () => {
    it('persists to localStorage', () => {
      addSuppression('security', 'XSS')
      expect(store.validai_suppressions).toBeDefined()
      const parsed = JSON.parse(store.validai_suppressions)
      expect(parsed).toHaveLength(1)
    })

    it('recovers from corrupted data', () => {
      store.validai_suppressions = 'not-json'
      expect(getSuppressions()).toEqual([])
    })

    it('includes createdAt timestamp', () => {
      addSuppression('security', 'XSS')
      const items = getSuppressions()
      expect(items[0].createdAt).toBeDefined()
      expect(new Date(items[0].createdAt).getTime()).toBeGreaterThan(0)
    })
  })
})
