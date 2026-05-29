import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getThresholds,
  saveThresholds,
  resetThresholds,
  evaluateGate,
  formatGateResult,
  DEFAULT_THRESHOLDS,
} from '../../src/utils/qualityGate'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

const clean = []
const moderate = [
  { severity: 'High' },
  { severity: 'Medium' },
  { severity: 'Medium' },
]
const critical = [
  { severity: 'Critical' },
  { severity: 'Critical' },
  { severity: 'High' },
]

describe('Quality Gate', () => {
  describe('thresholds CRUD', () => {
    it('returns defaults', () => {
      const t = getThresholds()
      expect(t.minScore).toBe(70)
      expect(t.maxCritical).toBe(0)
      expect(t.maxHigh).toBe(3)
    })

    it('saves custom thresholds', () => {
      saveThresholds({ minScore: 80 })
      expect(getThresholds().minScore).toBe(80)
    })

    it('preserves defaults for unset keys', () => {
      saveThresholds({ minScore: 80 })
      expect(getThresholds().maxCritical).toBe(0)
    })

    it('resets to defaults', () => {
      saveThresholds({ minScore: 90 })
      resetThresholds()
      expect(getThresholds().minScore).toBe(70)
    })
  })

  describe('evaluateGate', () => {
    it('passes for clean code with high score', () => {
      const result = evaluateGate(clean, 95)
      expect(result.status).toBe('pass')
      expect(result.violations).toHaveLength(0)
    })

    it('fails for critical violations', () => {
      const result = evaluateGate(critical, 30)
      expect(result.status).toBe('fail')
      expect(result.violations.length).toBeGreaterThan(0)
    })

    it('warns for exceeded high/medium thresholds', () => {
      const manyMedium = Array.from({ length: 15 }, () => ({ severity: 'Medium' }))
      const result = evaluateGate(manyMedium, 75)
      expect(result.status).toBe('warn')
    })

    it('checks minScore', () => {
      const result = evaluateGate([], 50)
      expect(result.violations.some(v => v.rule === 'minScore')).toBe(true)
    })

    it('checks maxCritical', () => {
      const result = evaluateGate(critical, 80)
      expect(result.violations.some(v => v.rule === 'maxCritical')).toBe(true)
    })

    it('checks maxTotal', () => {
      const many = Array.from({ length: 25 }, () => ({ severity: 'Medium' }))
      const result = evaluateGate(many, 80)
      expect(result.violations.some(v => v.rule === 'maxTotal')).toBe(true)
    })

    it('respects custom thresholds', () => {
      const config = { ...DEFAULT_THRESHOLDS, maxCritical: 5 }
      const result = evaluateGate(critical, 80, config)
      expect(result.violations.some(v => v.rule === 'maxCritical')).toBe(false)
    })

    it('includes counts in result', () => {
      const result = evaluateGate(moderate, 80)
      expect(result.counts.High).toBe(1)
      expect(result.counts.Medium).toBe(2)
    })
  })

  describe('formatGateResult', () => {
    it('formats pass', () => {
      const result = evaluateGate(clean, 95)
      const text = formatGateResult(result)
      expect(text).toContain('PASS')
      expect(text).toContain('All thresholds met')
    })

    it('formats fail with violations', () => {
      const result = evaluateGate(critical, 30)
      const text = formatGateResult(result)
      expect(text).toContain('FAIL')
      expect(text).toContain('critical')
    })
  })

  describe('DEFAULT_THRESHOLDS', () => {
    it('exports defaults', () => {
      expect(DEFAULT_THRESHOLDS).toHaveProperty('minScore')
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxCritical')
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxHigh')
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxMedium')
      expect(DEFAULT_THRESHOLDS).toHaveProperty('maxTotal')
    })
  })
})
