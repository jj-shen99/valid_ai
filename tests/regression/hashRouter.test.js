import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Test the hash routing logic (extracted from the hook for testability)
const VALID_PAGES = ['dashboard', 'submit', 'github', 'analysis', 'trends', 'settings']
const DEFAULT_PAGE = 'dashboard'

function getPageFromHash(hash) {
  const page = hash.replace('#/', '').replace('#', '')
  return VALID_PAGES.includes(page) ? page : DEFAULT_PAGE
}

describe('Hash Router', () => {
  describe('getPageFromHash', () => {
    it('returns dashboard for empty hash', () => {
      expect(getPageFromHash('')).toBe('dashboard')
    })

    it('parses #/submit format', () => {
      expect(getPageFromHash('#/submit')).toBe('submit')
    })

    it('parses #analysis format (no slash)', () => {
      expect(getPageFromHash('#analysis')).toBe('analysis')
    })

    it('returns dashboard for invalid page', () => {
      expect(getPageFromHash('#/nonexistent')).toBe('dashboard')
    })

    it('handles all valid pages', () => {
      VALID_PAGES.forEach(page => {
        expect(getPageFromHash(`#/${page}`)).toBe(page)
      })
    })

    it('returns dashboard for malicious hash', () => {
      expect(getPageFromHash('#/<script>alert(1)</script>')).toBe('dashboard')
    })

    it('returns dashboard for hash with query params', () => {
      expect(getPageFromHash('#/submit?foo=bar')).toBe('dashboard')
    })
  })
})
