/**
 * Module Performance Tracker
 *
 * Wraps analysis modules to measure execution time.
 * Stores timing history for visualization.
 */

const STORAGE_KEY = 'validai_perf_history'
const MAX_HISTORY = 50

export function getPerfHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePerfHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)))
}

export function recordTiming(entry) {
  const history = getPerfHistory()
  history.push({
    ...entry,
    timestamp: new Date().toISOString(),
  })
  savePerfHistory(history)
  return history
}

export function clearPerfHistory() {
  localStorage.removeItem(STORAGE_KEY)
  return []
}

// Time a single module execution
export async function timeModule(moduleFn, code, language) {
  const start = performance.now()
  let findings = []
  let error = null
  try {
    const result = moduleFn(code, language)
    findings = result instanceof Promise ? await result : result
  } catch (e) {
    error = e.message
  }
  const duration = Math.round((performance.now() - start) * 100) / 100
  return { findings, duration, error }
}

// Run all selected modules with timing
export async function runWithTiming(modules, moduleRegistry, code, language) {
  const timings = {}
  const allFindings = []

  for (const moduleName of modules) {
    const fn = moduleRegistry[moduleName]
    if (!fn) continue
    const { findings, duration, error } = await timeModule(fn, code, language)
    timings[moduleName] = { duration, findingCount: findings.length, error }
    allFindings.push(...findings)
  }

  const totalDuration = Object.values(timings).reduce((sum, t) => sum + t.duration, 0)

  const entry = {
    modules: Object.keys(timings),
    timings,
    totalDuration: Math.round(totalDuration * 100) / 100,
    totalFindings: allFindings.length,
    language,
  }
  recordTiming(entry)

  return { findings: allFindings, timings, totalDuration: entry.totalDuration }
}

// Get average timing per module from history
export function getModuleAverages() {
  const history = getPerfHistory()
  const moduleTotals = {}

  history.forEach(entry => {
    if (!entry.timings) return
    Object.entries(entry.timings).forEach(([mod, data]) => {
      if (!moduleTotals[mod]) moduleTotals[mod] = { total: 0, count: 0 }
      moduleTotals[mod].total += data.duration
      moduleTotals[mod].count++
    })
  })

  return Object.entries(moduleTotals).map(([module, data]) => ({
    module,
    avgDuration: Math.round((data.total / data.count) * 100) / 100,
    runs: data.count,
  })).sort((a, b) => b.avgDuration - a.avgDuration)
}
