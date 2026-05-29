import { describe, it, expect } from 'vitest'
import { SHORTCUT_MAP } from '../../src/hooks/useKeyboardShortcuts'

describe('Keyboard Shortcuts', () => {
  describe('SHORTCUT_MAP', () => {
    it('exports a non-empty array of shortcuts', () => {
      expect(Array.isArray(SHORTCUT_MAP)).toBe(true)
      expect(SHORTCUT_MAP.length).toBeGreaterThan(0)
    })

    it('each shortcut has required fields', () => {
      SHORTCUT_MAP.forEach(s => {
        expect(s).toHaveProperty('key')
        expect(s).toHaveProperty('label')
        expect(s).toHaveProperty('description')
        expect(typeof s.key).toBe('string')
        expect(typeof s.label).toBe('string')
        expect(typeof s.description).toBe('string')
      })
    })

    it('includes Ctrl+K command palette shortcut', () => {
      const cmdK = SHORTCUT_MAP.find(s => s.key === 'k' && s.mod)
      expect(cmdK).toBeDefined()
      expect(cmdK.description).toContain('command palette')
    })

    it('includes Ctrl+Enter run analysis shortcut', () => {
      const enter = SHORTCUT_MAP.find(s => s.key === 'Enter' && s.mod)
      expect(enter).toBeDefined()
      expect(enter.description).toContain('Run analysis')
    })

    it('includes navigation shortcuts for pages 1-5', () => {
      for (let i = 1; i <= 5; i++) {
        const shortcut = SHORTCUT_MAP.find(s => s.key === String(i) && s.mod)
        expect(shortcut).toBeDefined()
      }
    })

    it('includes Shift+? help shortcut', () => {
      const help = SHORTCUT_MAP.find(s => s.key === '?' && s.shift)
      expect(help).toBeDefined()
      expect(help.description).toContain('keyboard shortcuts')
    })

    it('all shortcuts have unique key+mod combinations', () => {
      const keys = SHORTCUT_MAP.map(s => `${s.key}-${s.mod || false}-${s.shift || false}`)
      const unique = new Set(keys)
      expect(unique.size).toBe(keys.length)
    })
  })
})
