/**
 * Finding Search & Filter
 *
 * Search findings by text, filter by severity/module,
 * and sort by various criteria.
 */

export function searchFindings(findings, query) {
  if (!query || !query.trim()) return findings
  const q = query.toLowerCase().trim()
  return findings.filter(f =>
    (f.category || '').toLowerCase().includes(q) ||
    (f.description || '').toLowerCase().includes(q) ||
    (f.suggestion || '').toLowerCase().includes(q) ||
    (f.moduleName || f.module || '').toLowerCase().includes(q) ||
    (f.codeSnippet || '').toLowerCase().includes(q)
  )
}

export function filterBySeverity(findings, severities) {
  if (!severities || severities.length === 0) return findings
  return findings.filter(f => severities.includes(f.severity))
}

export function filterByModule(findings, modules) {
  if (!modules || modules.length === 0) return findings
  return findings.filter(f => modules.includes(f.module))
}

export function filterByLineRange(findings, startLine, endLine) {
  return findings.filter(f => {
    if (!f.lineNumber) return true
    return f.lineNumber >= startLine && f.lineNumber <= endLine
  })
}

export function applyFilters(findings, { query, severities, modules, startLine, endLine } = {}) {
  let result = findings
  if (query) result = searchFindings(result, query)
  if (severities?.length) result = filterBySeverity(result, severities)
  if (modules?.length) result = filterByModule(result, modules)
  if (startLine && endLine) result = filterByLineRange(result, startLine, endLine)
  return result
}

export function getAvailableModules(findings) {
  return [...new Set(findings.map(f => f.module).filter(Boolean))]
}

export function getAvailableSeverities(findings) {
  return [...new Set(findings.map(f => f.severity).filter(Boolean))]
}
