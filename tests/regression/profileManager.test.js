import { describe, it, expect, beforeEach } from 'vitest'
import { getProfiles, saveProfiles, addProfile, removeProfile, updateProfile } from '../../src/utils/profileManager'

// Mock localStorage for Node tests
const storage = new Map()
const mockLocalStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, val) => storage.set(key, val),
  removeItem: (key) => storage.delete(key),
}
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true })

describe('Profile Manager', () => {
  beforeEach(() => {
    storage.clear()
  })

  describe('getProfiles', () => {
    it('returns empty array when no profiles saved', () => {
      expect(getProfiles()).toEqual([])
    })

    it('returns saved profiles', () => {
      saveProfiles([{ id: 'p1', name: 'Test', modules: ['security'] }])
      expect(getProfiles()).toHaveLength(1)
      expect(getProfiles()[0].name).toBe('Test')
    })

    it('handles corrupted JSON gracefully', () => {
      storage.set('validai_profiles', '{invalid json')
      expect(getProfiles()).toEqual([])
    })
  })

  describe('addProfile', () => {
    it('adds a new profile with unique id', () => {
      const profiles = addProfile('My Profile', ['failureMode', 'security'])
      expect(profiles).toHaveLength(1)
      expect(profiles[0].name).toBe('My Profile')
      expect(profiles[0].modules).toEqual(['failureMode', 'security'])
      expect(profiles[0].id).toMatch(/^profile-/)
      expect(profiles[0].createdAt).toBeDefined()
    })

    it('adds multiple profiles without overwriting', () => {
      addProfile('A', ['failureMode'])
      addProfile('B', ['security'])
      expect(getProfiles()).toHaveLength(2)
    })

    it('generates unique IDs even when called rapidly', () => {
      addProfile('A', ['failureMode'])
      addProfile('B', ['security'])
      const profiles = getProfiles()
      expect(profiles[0].id).not.toBe(profiles[1].id)
    })
  })

  describe('removeProfile', () => {
    it('removes a profile by id', () => {
      addProfile('A', ['failureMode'])
      addProfile('B', ['security'])
      const profiles = getProfiles()
      const remaining = removeProfile(profiles[0].id)
      expect(remaining).toHaveLength(1)
      expect(remaining[0].name).toBe('B')
    })

    it('does nothing for non-existent id', () => {
      addProfile('A', ['failureMode'])
      const result = removeProfile('non-existent-id')
      expect(result).toHaveLength(1)
    })
  })

  describe('updateProfile', () => {
    it('updates name of existing profile', () => {
      addProfile('Old Name', ['failureMode'])
      const profiles = getProfiles()
      const updated = updateProfile(profiles[0].id, { name: 'New Name' })
      expect(updated[0].name).toBe('New Name')
      expect(updated[0].modules).toEqual(['failureMode'])
    })

    it('updates modules of existing profile', () => {
      addProfile('Test', ['failureMode'])
      const profiles = getProfiles()
      const updated = updateProfile(profiles[0].id, { modules: ['security', 'oracle'] })
      expect(updated[0].modules).toEqual(['security', 'oracle'])
    })

    it('does nothing for non-existent id', () => {
      addProfile('Test', ['failureMode'])
      const updated = updateProfile('non-existent', { name: 'X' })
      expect(updated[0].name).toBe('Test')
    })
  })

  describe('saveProfiles', () => {
    it('overwrites all profiles', () => {
      addProfile('A', ['failureMode'])
      addProfile('B', ['security'])
      saveProfiles([])
      expect(getProfiles()).toEqual([])
    })

    it('persists to localStorage', () => {
      const data = [{ id: 'p1', name: 'Saved', modules: ['failureMode'] }]
      saveProfiles(data)
      expect(JSON.parse(storage.get('validai_profiles'))).toEqual(data)
    })
  })
})
