import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getOverrides,
  setOverride,
  removeOverride,
  clearAllOverrides,
  getOverride,
  applyOverrides,
  VALID_SEVERITIES,
} from '../../src/utils/severityOverrides'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

describe('Severity Overrides', () => {
  describe('CRUD', () => {
    it('starts empty', () => {
      expect(getOverrides()).toEqual({})
    })

    it('sets an override', () => {
      setOverride('security', 'XSS', 'Info')
      const override = getOverride('security', 'XSS')
      expect(override.severity).toBe('Info')
      expect(override.updatedAt).toBeDefined()
    })

    it('rejects invalid severity', () => {
      setOverride('security', 'XSS', 'SuperCritical')
      expect(getOverride('security', 'XSS')).toBeNull()
    })

    it('removes an override', () => {
      setOverride('security', 'XSS', 'Info')
      removeOverride('security', 'XSS')
      expect(getOverride('security', 'XSS')).toBeNull()
    })

    it('clears all overrides', () => {
      setOverride('security', 'XSS', 'Info')
      setOverride('failureMode', 'Off-by-one', 'Critical')
      clearAllOverrides()
      expect(getOverrides()).toEqual({})
    })

    it('overwrites existing override', () => {
      setOverride('security', 'XSS', 'Info')
      setOverride('security', 'XSS', 'Critical')
      expect(getOverride('security', 'XSS').severity).toBe('Critical')
    })
  })

  describe('VALID_SEVERITIES', () => {
    it('includes all four levels', () => {
      expect(VALID_SEVERITIES).toEqual(['Critical', 'High', 'Medium', 'Info'])
    })
  })

  describe('applyOverrides', () => {
    const findings = [
      { id: '1', module: 'security', category: 'XSS', severity: 'High' },
      { id: '2', module: 'security', category: 'SQL Injection', severity: 'Critical' },
      { id: '3', module: 'failureMode', category: 'Off-by-one', severity: 'Medium' },
    ]

    it('returns unmodified findings when no overrides', () => {
      const result = applyOverrides(findings)
      expect(result).toEqual(findings)
    })

    it('applies severity override and preserves original', () => {
      setOverride('security', 'XSS', 'Info')
      const result = applyOverrides(findings)
      const xss = result.find(f => f.category === 'XSS')
      expect(xss.severity).toBe('Info')
      expect(xss.originalSeverity).toBe('High')
    })

    it('only overrides matching findings', () => {
      setOverride('security', 'XSS', 'Info')
      const result = applyOverrides(findings)
      const sql = result.find(f => f.category === 'SQL Injection')
      expect(sql.severity).toBe('Critical')
      expect(sql.originalSeverity).toBeUndefined()
    })

    it('handles empty findings', () => {
      setOverride('security', 'XSS', 'Info')
      expect(applyOverrides([])).toEqual([])
    })

    it('applies multiple overrides', () => {
      setOverride('security', 'XSS', 'Info')
      setOverride('failureMode', 'Off-by-one', 'Critical')
      const result = applyOverrides(findings)
      expect(result.find(f => f.category === 'XSS').severity).toBe('Info')
      expect(result.find(f => f.category === 'Off-by-one').severity).toBe('Critical')
    })
  })

  describe('persistence', () => {
    it('persists to localStorage', () => {
      setOverride('security', 'XSS', 'Info')
      expect(store.validai_severity_overrides).toBeDefined()
    })

    it('recovers from corrupted data', () => {
      store.validai_severity_overrides = 'bad'
      expect(getOverrides()).toEqual({})
    })
  })
})
