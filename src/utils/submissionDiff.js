/**
 * Submission Diff
 *
 * Compares two analysis submissions and identifies
 * new, resolved, and unchanged findings between them.
 */

export function diffSubmissions(older, newer) {
  if (!older || !newer) return null

  const olderFindings = older.findings || []
  const newerFindings = newer.findings || []

  const findingKey = (f) => `${f.module}:${f.category}:${f.lineNumber || 0}`

  const olderKeys = new Set(olderFindings.map(findingKey))
  const newerKeys = new Set(newerFindings.map(findingKey))

  const newFindings = newerFindings.filter(f => !olderKeys.has(findingKey(f)))
  const resolvedFindings = olderFindings.filter(f => !newerKeys.has(findingKey(f)))
  const unchangedFindings = newerFindings.filter(f => olderKeys.has(findingKey(f)))

  const scoreDelta = (newer.score || 0) - (older.score || 0)
  const findingDelta = newerFindings.length - olderFindings.length

  return {
    newFindings,
    resolvedFindings,
    unchangedFindings,
    scoreDelta,
    findingDelta,
    olderScore: older.score || 0,
    newerScore: newer.score || 0,
    olderCount: olderFindings.length,
    newerCount: newerFindings.length,
    olderTimestamp: older.timestamp,
    newerTimestamp: newer.timestamp,
  }
}

export function formatDelta(value) {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

export function scoreTrend(scoreDelta) {
  if (scoreDelta > 0) return 'improved'
  if (scoreDelta < 0) return 'regressed'
  return 'unchanged'
}
