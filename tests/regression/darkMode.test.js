import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDarkModePref,
  setDarkModePref,
  dc,
  severityColorsDark,
} from '../../src/utils/darkMode'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
  vi.stubGlobal('window', {
    matchMedia: vi.fn().mockReturnValue({ matches: false }),
  })
})

describe('Dark Mode Utilities', () => {
  describe('getDarkModePref', () => {
    it('defaults to system preference (false)', () => {
      expect(getDarkModePref()).toBe(false)
    })

    it('returns true when stored as true', () => {
      store.validai_dark_mode = 'true'
      expect(getDarkModePref()).toBe(true)
    })

    it('returns false when stored as false', () => {
      store.validai_dark_mode = 'false'
      expect(getDarkModePref()).toBe(false)
    })

    it('falls back to system dark preference', () => {
      window.matchMedia.mockReturnValue({ matches: true })
      expect(getDarkModePref()).toBe(true)
    })
  })

  describe('setDarkModePref', () => {
    it('stores preference', () => {
      setDarkModePref(true)
      expect(store.validai_dark_mode).toBe('true')
    })

    it('stores false', () => {
      setDarkModePref(false)
      expect(store.validai_dark_mode).toBe('false')
    })
  })

  describe('dc helper', () => {
    it('generates light and dark classes', () => {
      const result = dc('bg-white', 'bg-gray-900')
      expect(result).toBe('bg-white dark:bg-gray-900')
    })
  })

  describe('severityColorsDark', () => {
    it('has all severity levels', () => {
      expect(severityColorsDark).toHaveProperty('Critical')
      expect(severityColorsDark).toHaveProperty('High')
      expect(severityColorsDark).toHaveProperty('Medium')
      expect(severityColorsDark).toHaveProperty('Info')
    })

    it('each level has bg, border, text, badge', () => {
      for (const level of ['Critical', 'High', 'Medium', 'Info']) {
        expect(severityColorsDark[level]).toHaveProperty('bg')
        expect(severityColorsDark[level]).toHaveProperty('border')
        expect(severityColorsDark[level]).toHaveProperty('text')
        expect(severityColorsDark[level]).toHaveProperty('badge')
      }
    })

    it('includes dark: prefixed classes', () => {
      expect(severityColorsDark.Critical.bg).toContain('dark:')
      expect(severityColorsDark.High.border).toContain('dark:')
    })
  })
})
