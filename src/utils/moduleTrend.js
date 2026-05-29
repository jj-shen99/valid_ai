/**
 * Module Trend Tracker
 *
 * Tracks per-module finding counts across analysis runs
 * and provides data for sparkline visualizations.
 */

const STORAGE_KEY = 'validai_module_trends'
const MAX_ENTRIES = 30

export function getModuleTrends() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveModuleTrends(trends) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trends))
}

export function recordModuleTrend(moduleName, findingCount, timestamp) {
  const trends = getModuleTrends()
  if (!trends[moduleName]) trends[moduleName] = []
  trends[moduleName].push({
    count: findingCount,
    timestamp: timestamp || new Date().toISOString(),
  })
  // Cap at MAX_ENTRIES
  if (trends[moduleName].length > MAX_ENTRIES) {
    trends[moduleName] = trends[moduleName].slice(-MAX_ENTRIES)
  }
  saveModuleTrends(trends)
  return trends
}

export function recordAllModuleTrends(findings) {
  const byCounts = {}
  findings.forEach(f => {
    const mod = f.module || 'unknown'
    byCounts[mod] = (byCounts[mod] || 0) + 1
  })
  const ts = new Date().toISOString()
  Object.entries(byCounts).forEach(([mod, count]) => {
    recordModuleTrend(mod, count, ts)
  })
  return getModuleTrends()
}

export function getSparklineData(moduleName, limit = 10) {
  const trends = getModuleTrends()
  const entries = trends[moduleName] || []
  return entries.slice(-limit).map(e => e.count)
}

export function getAllSparklines(limit = 10) {
  const trends = getModuleTrends()
  const result = {}
  for (const [mod, entries] of Object.entries(trends)) {
    result[mod] = entries.slice(-limit).map(e => e.count)
  }
  return result
}

export function clearModuleTrends() {
  saveModuleTrends({})
  return {}
}

// Generate SVG sparkline path
export function sparklinePath(data, width = 60, height = 16) {
  if (!data || data.length < 2) return ''
  const max = Math.max(...data, 1)
  const step = width / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = height - (v / max) * height
    return `${x},${y}`
  })
  return `M${points.join(' L')}`
}
