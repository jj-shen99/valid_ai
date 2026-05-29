/**
 * Finding Timeline
 *
 * Tracks finding occurrences across analysis runs
 * to show when issues were first detected, last seen, and recurrence count.
 */

const STORAGE_KEY = 'validai_finding_timeline'
const MAX_ENTRIES_PER_FINDING = 50

function getKey(finding) {
  return `${finding.module}::${finding.category}`
}

export function getTimeline() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveTimeline(timeline) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timeline))
}

export function recordFinding(finding, timestamp) {
  const timeline = getTimeline()
  const key = getKey(finding)
  const ts = timestamp || new Date().toISOString()

  if (!timeline[key]) {
    timeline[key] = {
      module: finding.module,
      category: finding.category,
      severity: finding.severity,
      firstSeen: ts,
      lastSeen: ts,
      occurrences: [ts],
      count: 1,
    }
  } else {
    timeline[key].lastSeen = ts
    timeline[key].severity = finding.severity
    timeline[key].count++
    timeline[key].occurrences.push(ts)
    if (timeline[key].occurrences.length > MAX_ENTRIES_PER_FINDING) {
      timeline[key].occurrences = timeline[key].occurrences.slice(-MAX_ENTRIES_PER_FINDING)
    }
  }

  saveTimeline(timeline)
  return timeline[key]
}

export function recordFindings(findings, timestamp) {
  const ts = timestamp || new Date().toISOString()
  findings.forEach(f => recordFinding(f, ts))
  return getTimeline()
}

export function getFindingHistory(finding) {
  const timeline = getTimeline()
  const key = getKey(finding)
  return timeline[key] || null
}

export function getRecurringFindings(minCount = 3) {
  const timeline = getTimeline()
  return Object.values(timeline).filter(entry => entry.count >= minCount)
}

export function getResolvedFindings(currentFindings) {
  const timeline = getTimeline()
  const currentKeys = new Set(currentFindings.map(getKey))
  return Object.entries(timeline)
    .filter(([key]) => !currentKeys.has(key))
    .map(([key, entry]) => ({ key, ...entry }))
}

export function getNewFindings(currentFindings) {
  const timeline = getTimeline()
  return currentFindings.filter(f => {
    const key = getKey(f)
    return !timeline[key] || timeline[key].count === 1
  })
}

export function clearTimeline() {
  saveTimeline({})
}

export function getTimelineStats() {
  const timeline = getTimeline()
  const entries = Object.values(timeline)
  return {
    totalTracked: entries.length,
    recurring: entries.filter(e => e.count >= 3).length,
    mostFrequent: entries.sort((a, b) => b.count - a.count).slice(0, 5),
    oldestUnresolved: entries.sort((a, b) => a.firstSeen.localeCompare(b.firstSeen)).slice(0, 5),
  }
}
