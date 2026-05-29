/**
 * Profile Manager
 *
 * Manages user-defined analysis profiles (presets) in localStorage.
 * Each profile has a name and a list of module IDs.
 */

const STORAGE_KEY = 'validai_profiles'

export function getProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

let _counter = 0
export function addProfile(name, modules) {
  const profiles = getProfiles()
  const profile = {
    id: `profile-${Date.now()}-${++_counter}`,
    name,
    modules: [...modules],
    createdAt: new Date().toISOString(),
  }
  profiles.push(profile)
  saveProfiles(profiles)
  return profiles
}

export function removeProfile(profileId) {
  const profiles = getProfiles().filter(p => p.id !== profileId)
  saveProfiles(profiles)
  return profiles
}

export function updateProfile(profileId, updates) {
  const profiles = getProfiles().map(p =>
    p.id === profileId ? { ...p, ...updates } : p
  )
  saveProfiles(profiles)
  return profiles
}
