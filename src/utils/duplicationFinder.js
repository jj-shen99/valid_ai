/**
 * Code Duplication Finder
 *
 * Detects duplicate or near-duplicate code blocks
 * using normalized line hashing and sliding window comparison.
 */

const MIN_BLOCK_SIZE = 3 // Minimum lines for a duplicate block
const MAX_RESULTS = 20

function normalizeLine(line) {
  return line
    .replace(/\s+/g, ' ')
    .replace(/['"`]/g, '"')
    .replace(/\b\w+\b/g, (word) => {
      // Keep keywords, replace identifiers with placeholder
      const keywords = new Set([
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
        'continue', 'return', 'function', 'const', 'let', 'var', 'class',
        'import', 'export', 'default', 'try', 'catch', 'finally', 'throw',
        'new', 'delete', 'typeof', 'instanceof', 'void', 'async', 'await',
        'yield', 'true', 'false', 'null', 'undefined', 'this', 'super',
      ])
      return keywords.has(word) ? word : '_ID_'
    })
    .trim()
}

function hashBlock(lines) {
  return lines.map(normalizeLine).join('\n')
}

export function findDuplicates(code, blockSize = MIN_BLOCK_SIZE) {
  const lines = code.split('\n')
  if (lines.length < blockSize * 2) return []

  const blockMap = new Map()
  const duplicates = []

  // Sliding window
  for (let i = 0; i <= lines.length - blockSize; i++) {
    const block = lines.slice(i, i + blockSize)
    // Skip blocks that are all whitespace/braces
    const meaningful = block.filter(l => l.trim().length > 2 && l.trim() !== '{' && l.trim() !== '}')
    if (meaningful.length < 2) continue

    const hash = hashBlock(block)
    if (blockMap.has(hash)) {
      const firstOccurrence = blockMap.get(hash)
      // Avoid overlapping reports
      if (Math.abs(firstOccurrence - i) >= blockSize) {
        duplicates.push({
          firstLine: firstOccurrence + 1,
          secondLine: i + 1,
          blockSize,
          lines: block.map(l => l.trimEnd()),
          hash,
        })
      }
    } else {
      blockMap.set(hash, i)
    }
  }

  // Deduplicate overlapping ranges
  const seen = new Set()
  return duplicates.filter(d => {
    const key = `${d.firstLine}-${d.secondLine}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, MAX_RESULTS)
}

export function getDuplicationScore(code, blockSize = MIN_BLOCK_SIZE) {
  const lines = code.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return { score: 0, percentage: 0, duplicates: [] }

  const dupes = findDuplicates(code, blockSize)
  const duplicatedLines = new Set()
  dupes.forEach(d => {
    for (let i = 0; i < d.blockSize; i++) {
      duplicatedLines.add(d.firstLine + i)
      duplicatedLines.add(d.secondLine + i)
    }
  })

  const percentage = Math.round((duplicatedLines.size / lines.length) * 100)
  return {
    score: Math.max(0, 100 - percentage * 2),
    percentage,
    duplicateCount: dupes.length,
    duplicatedLineCount: duplicatedLines.size,
    totalLines: lines.length,
    duplicates: dupes,
  }
}

export function formatDuplicateReport(duplicationResult) {
  const { percentage, duplicateCount, duplicatedLineCount, totalLines, duplicates } = duplicationResult
  const lines = [
    `## Code Duplication Report`,
    '',
    `- **Duplication:** ${percentage}% (${duplicatedLineCount} of ${totalLines} lines)`,
    `- **Duplicate blocks:** ${duplicateCount}`,
    '',
  ]

  if (duplicates.length > 0) {
    lines.push('### Duplicate Blocks', '')
    duplicates.slice(0, 10).forEach((d, i) => {
      lines.push(`**${i + 1}.** Lines ${d.firstLine}–${d.firstLine + d.blockSize - 1} ↔ Lines ${d.secondLine}–${d.secondLine + d.blockSize - 1}`)
      lines.push('```')
      d.lines.forEach(l => lines.push(l))
      lines.push('```')
      lines.push('')
    })
  }

  return lines.join('\n')
}
