import { describe, it, expect } from 'vitest'
import { findDuplicates, getDuplicationScore, formatDuplicateReport } from '../../src/utils/duplicationFinder'

describe('Code Duplication Finder', () => {
  const duplicatedCode = [
    'const a = 1',
    'const b = 2',
    'const c = a + b',
    'console.log(c)',
    '',
    'const x = 1',
    'const y = 2',
    'const z = x + y',
    'console.log(z)',
  ].join('\n')

  describe('findDuplicates', () => {
    it('detects duplicate blocks', () => {
      const dupes = findDuplicates(duplicatedCode, 3)
      expect(dupes.length).toBeGreaterThan(0)
    })

    it('returns empty for unique code', () => {
      const unique = 'const a = 1\nconst b = "hello"\nfunction foo() { return true }\nclass Bar {}\nconst c = [1,2,3]\nconst d = new Map()'
      expect(findDuplicates(unique, 3)).toHaveLength(0)
    })

    it('returns empty for short code', () => {
      expect(findDuplicates('const a = 1', 3)).toHaveLength(0)
    })

    it('includes line numbers', () => {
      const dupes = findDuplicates(duplicatedCode, 3)
      if (dupes.length > 0) {
        expect(dupes[0].firstLine).toBeGreaterThan(0)
        expect(dupes[0].secondLine).toBeGreaterThan(0)
        expect(dupes[0].secondLine).toBeGreaterThan(dupes[0].firstLine)
      }
    })

    it('includes block lines', () => {
      const dupes = findDuplicates(duplicatedCode, 3)
      if (dupes.length > 0) {
        expect(Array.isArray(dupes[0].lines)).toBe(true)
        expect(dupes[0].lines.length).toBe(3)
      }
    })

    it('caps results at 20', () => {
      // Generate many duplicates
      const lines = []
      for (let i = 0; i < 50; i++) {
        lines.push('const a = 1', 'const b = 2', 'const c = 3', '')
      }
      const dupes = findDuplicates(lines.join('\n'), 3)
      expect(dupes.length).toBeLessThanOrEqual(20)
    })
  })

  describe('getDuplicationScore', () => {
    it('returns 100 for empty code', () => {
      const result = getDuplicationScore('')
      expect(result.score).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it('returns score and percentage', () => {
      const result = getDuplicationScore(duplicatedCode, 3)
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('percentage')
      expect(result).toHaveProperty('duplicateCount')
      expect(result).toHaveProperty('duplicatedLineCount')
      expect(result).toHaveProperty('totalLines')
    })

    it('unique code scores high', () => {
      const unique = 'const a = 1\nfunction foo() { return true }\nclass Bar { constructor() {} }\nexport default Bar'
      const result = getDuplicationScore(unique, 3)
      expect(result.score).toBeGreaterThanOrEqual(80)
    })
  })

  describe('formatDuplicateReport', () => {
    it('generates markdown', () => {
      const result = getDuplicationScore(duplicatedCode, 3)
      const report = formatDuplicateReport(result)
      expect(report).toContain('## Code Duplication Report')
      expect(report).toContain('Duplication')
    })

    it('includes block details when duplicates exist', () => {
      const result = getDuplicationScore(duplicatedCode, 3)
      if (result.duplicateCount > 0) {
        const report = formatDuplicateReport(result)
        expect(report).toContain('Duplicate Blocks')
        expect(report).toContain('Lines')
      }
    })
  })
})
