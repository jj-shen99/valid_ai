/**
 * Severity Override Manager
 *
 * Lets users reclassify finding severity levels.
 * Keyed by module:category, persisted in localStorage.
 */

const STORAGE_KEY = 'validai_severity_overrides'
const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Info']

export function getOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveOverrides(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function setOverride(module, category, newSeverity) {
  if (!VALID_SEVERITIES.includes(newSeverity)) return getOverrides()
  const map = getOverrides()
  const key = `${module}:${category}`
  map[key] = {
    severity: newSeverity,
    updatedAt: new Date().toISOString(),
  }
  saveOverrides(map)
  return map
}

export function removeOverride(module, category) {
  const map = getOverrides()
  delete map[`${module}:${category}`]
  saveOverrides(map)
  return map
}

export function clearAllOverrides() {
  saveOverrides({})
  return {}
}

export function getOverride(module, category) {
  const map = getOverrides()
  return map[`${module}:${category}`] || null
}

export function applyOverrides(findings) {
  const map = getOverrides()
  if (Object.keys(map).length === 0) return findings
  return findings.map(f => {
    const override = map[`${f.module}:${f.category}`]
    if (override) {
      return { ...f, severity: override.severity, originalSeverity: f.severity }
    }
    return f
  })
}

export { VALID_SEVERITIES }
