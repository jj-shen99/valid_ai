import { describe, it, expect, vi } from 'vitest'
import { detectLanguage } from '../../src/utils/batchAnalyzer'

describe('Batch Analyzer', () => {
  describe('detectLanguage', () => {
    it('detects Python from .py extension', () => {
      expect(detectLanguage('main.py')).toBe('python')
    })

    it('detects JavaScript from .js extension', () => {
      expect(detectLanguage('app.js')).toBe('javascript')
    })

    it('detects JavaScript from .jsx extension', () => {
      expect(detectLanguage('Component.jsx')).toBe('javascript')
    })

    it('detects TypeScript from .ts extension', () => {
      expect(detectLanguage('utils.ts')).toBe('typescript')
    })

    it('detects TypeScript from .tsx extension', () => {
      expect(detectLanguage('App.tsx')).toBe('typescript')
    })

    it('detects Java from .java extension', () => {
      expect(detectLanguage('Main.java')).toBe('java')
    })

    it('detects Go from .go extension', () => {
      expect(detectLanguage('server.go')).toBe('go')
    })

    it('detects C# from .cs extension', () => {
      expect(detectLanguage('Program.cs')).toBe('csharp')
    })

    it('defaults to javascript for unknown extensions', () => {
      expect(detectLanguage('file.rb')).toBe('javascript')
      expect(detectLanguage('file.rs')).toBe('javascript')
    })

    it('handles paths with dots in directories', () => {
      expect(detectLanguage('src/v2.0/app.py')).toBe('python')
    })

    it('handles uppercase extensions', () => {
      expect(detectLanguage('file.PY')).toBe('python')
    })
  })
})
