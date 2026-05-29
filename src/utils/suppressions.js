/**
 * Finding Suppression Manager
 *
 * Allows users to suppress findings by category+module key.
 * Suppressions persist in localStorage and filter out matching findings.
 */

const STORAGE_KEY = 'validai_suppressions'

export function getSuppressions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSuppressions(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

let _counter = 0
export function addSuppression(module, category, reason = '') {
  const items = getSuppressions()
  const key = `${module}:${category}`
  if (items.some(s => s.key === key)) return items
  items.push({
    id: `sup-${Date.now()}-${++_counter}`,
    key,
    module,
    category,
    reason,
    createdAt: new Date().toISOString(),
  })
  saveSuppressions(items)
  return items
}

export function removeSuppression(id) {
  const items = getSuppressions().filter(s => s.id !== id)
  saveSuppressions(items)
  return items
}

export function clearAllSuppressions() {
  saveSuppressions([])
  return []
}

export function isSuppressed(module, category) {
  const items = getSuppressions()
  const key = `${module}:${category}`
  return items.some(s => s.key === key)
}

export function applySuppressions(findings) {
  const items = getSuppressions()
  if (items.length === 0) return findings
  const keys = new Set(items.map(s => s.key))
  return findings.filter(f => !keys.has(`${f.module}:${f.category}`))
}
