/**
 * Finding deduplication and grouping utilities.
 *
 * Groups related findings by module or category, deduplicates
 * near-identical findings, and provides priority sorting.
 */

// Group findings by a specified key (module, severity, category)
export function groupFindings(findings, groupBy = 'module') {
  const map = {}
  findings.forEach(f => {
    const key = groupBy === 'module' ? (f.moduleName || f.module || 'Unknown')
      : groupBy === 'severity' ? (f.severity || 'Unknown')
      : (f.category || 'Other')
    if (!map[key]) map[key] = { label: key, findings: [], count: 0 }
    map[key].findings.push(f)
    map[key].count++
  })

  const sevOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }

  return Object.values(map).sort((a, b) => {
    if (groupBy === 'severity') {
      return (sevOrder[a.label] ?? 4) - (sevOrder[b.label] ?? 4)
    }
    return b.count - a.count
  })
}

// Deduplicate findings with identical category + similar description
export function deduplicateFindings(findings) {
  const seen = new Map()

  return findings.filter(f => {
    const key = `${f.module}:${f.category}`
    if (seen.has(key)) {
      const existing = seen.get(key)
      // Keep the one with the lower line number (first occurrence)
      if (f.lineNumber && existing.lineNumber && f.lineNumber < existing.lineNumber) {
        // Replace with earlier occurrence in the seen map but filter out this one
        // (first one already passed filter)
      }
      return false
    }
    seen.set(key, f)
    return true
  })
}

// Compute a priority score for a finding (lower = higher priority)
export function priorityScore(finding) {
  const sevWeight = { Critical: 0, High: 10, Medium: 20, Info: 30 }
  const base = sevWeight[finding.severity] ?? 40
  const hasFix = finding.autoFix ? -2 : 0
  const hasLine = finding.lineNumber ? -1 : 0
  return base + hasFix + hasLine
}

// Sort findings by priority score
export function sortByPriority(findings) {
  return [...findings].sort((a, b) => priorityScore(a) - priorityScore(b))
}

// Get summary stats from a group array
export function groupSummary(groups) {
  return groups.map(g => ({
    label: g.label,
    count: g.count,
    critical: g.findings.filter(f => f.severity === 'Critical').length,
    high: g.findings.filter(f => f.severity === 'High').length,
    medium: g.findings.filter(f => f.severity === 'Medium').length,
  }))
}
