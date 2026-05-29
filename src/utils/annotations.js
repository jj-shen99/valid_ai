/**
 * Finding Annotations Manager
 *
 * Attach user-written notes to individual findings.
 * Keyed by finding id, persisted in localStorage.
 */

const STORAGE_KEY = 'validai_annotations'

export function getAnnotations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveAnnotations(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function setAnnotation(findingId, text) {
  const map = getAnnotations()
  if (!text || !text.trim()) {
    delete map[findingId]
  } else {
    map[findingId] = {
      text: text.trim(),
      updatedAt: new Date().toISOString(),
    }
  }
  saveAnnotations(map)
  return map
}

export function getAnnotation(findingId) {
  const map = getAnnotations()
  return map[findingId] || null
}

export function removeAnnotation(findingId) {
  const map = getAnnotations()
  delete map[findingId]
  saveAnnotations(map)
  return map
}

export function clearAllAnnotations() {
  saveAnnotations({})
  return {}
}

export function getAnnotatedCount() {
  return Object.keys(getAnnotations()).length
}
