/**
 * Incremental / diff-only analysis support.
 *
 * Tracks previous code submissions per-language and computes which
 * line ranges changed, so downstream consumers can filter findings
 * to only the modified regions.
 */

// Simple FNV-1a-style hash for fast comparison (not cryptographic)
function quickHash(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16)
}

// Per-line diff: returns Set of 1-indexed changed line numbers
export function computeChangedLines(oldCode, newCode) {
  if (!oldCode) return null // null = "all lines are new"
  const oldLines = oldCode.split('\n')
  const newLines = newCode.split('\n')
  const changed = new Set()

  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) {
      // Mark the changed line ± context of 2 lines (findings may reference nearby lines)
      for (let j = Math.max(0, i - 2); j <= Math.min(newLines.length - 1, i + 2); j++) {
        changed.add(j + 1) // 1-indexed
      }
    }
  }
  return changed
}

// Filter findings to only those on changed lines (or keep all if changedLines is null)
export function filterByChangedLines(findings, changedLines) {
  if (!changedLines) return findings
  return findings.filter(f => {
    // If finding has no lineNumber, keep it (global finding)
    if (!f.lineNumber) return true
    return changedLines.has(f.lineNumber)
  })
}

// Cache of previous code per language key
const codeCache = new Map()

export function getLastCode(language) {
  return codeCache.get(language) || null
}

export function setLastCode(language, code) {
  codeCache.set(language, code)
}

export function getCodeHash(code) {
  return quickHash(code)
}

export function hasCodeChanged(language, code) {
  const prev = codeCache.get(language)
  if (!prev) return true
  return quickHash(prev) !== quickHash(code)
}
