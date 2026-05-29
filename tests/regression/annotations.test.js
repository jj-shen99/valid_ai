import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAnnotations,
  setAnnotation,
  getAnnotation,
  removeAnnotation,
  clearAllAnnotations,
  getAnnotatedCount,
} from '../../src/utils/annotations'

const store = {}
beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
  vi.stubGlobal('localStorage', {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    removeItem: (k) => { delete store[k] },
  })
})

describe('Annotations Manager', () => {
  describe('CRUD', () => {
    it('starts empty', () => {
      expect(getAnnotations()).toEqual({})
      expect(getAnnotatedCount()).toBe(0)
    })

    it('sets an annotation', () => {
      setAnnotation('f1', 'This is a false positive')
      const ann = getAnnotation('f1')
      expect(ann.text).toBe('This is a false positive')
      expect(ann.updatedAt).toBeDefined()
    })

    it('updates existing annotation', () => {
      setAnnotation('f1', 'first')
      setAnnotation('f1', 'second')
      expect(getAnnotation('f1').text).toBe('second')
    })

    it('removes annotation with empty text', () => {
      setAnnotation('f1', 'note')
      setAnnotation('f1', '')
      expect(getAnnotation('f1')).toBeNull()
    })

    it('removes annotation with whitespace-only text', () => {
      setAnnotation('f1', 'note')
      setAnnotation('f1', '   ')
      expect(getAnnotation('f1')).toBeNull()
    })

    it('removes annotation by ID', () => {
      setAnnotation('f1', 'note')
      removeAnnotation('f1')
      expect(getAnnotation('f1')).toBeNull()
    })

    it('clears all annotations', () => {
      setAnnotation('f1', 'a')
      setAnnotation('f2', 'b')
      clearAllAnnotations()
      expect(getAnnotations()).toEqual({})
    })

    it('counts annotated findings', () => {
      setAnnotation('f1', 'a')
      setAnnotation('f2', 'b')
      setAnnotation('f3', 'c')
      expect(getAnnotatedCount()).toBe(3)
    })
  })

  describe('persistence', () => {
    it('persists to localStorage', () => {
      setAnnotation('f1', 'persisted')
      expect(store.validai_annotations).toBeDefined()
      const parsed = JSON.parse(store.validai_annotations)
      expect(parsed.f1.text).toBe('persisted')
    })

    it('recovers from corrupted data', () => {
      store.validai_annotations = 'bad-json'
      expect(getAnnotations()).toEqual({})
    })

    it('returns null for non-existent finding', () => {
      expect(getAnnotation('nonexistent')).toBeNull()
    })
  })
})
