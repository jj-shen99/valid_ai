/**
 * Code Complexity Metrics
 *
 * Computes cyclomatic complexity, cognitive complexity,
 * lines of code, and function-level breakdown.
 */

// Count decision points for cyclomatic complexity
export function cyclomaticComplexity(code) {
  const decisionPoints = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /\?\?/g,
    /\?\./g,
    /&&/g,
    /\|\|/g,
    /\?[^?.:]/g,
  ]

  let count = 1 // base path
  for (const pattern of decisionPoints) {
    const matches = code.match(pattern)
    if (matches) count += matches.length
  }
  return count
}

// Cognitive complexity: nesting-aware weighting
export function cognitiveComplexity(code) {
  const lines = code.split('\n')
  let score = 0
  let nesting = 0

  const incrementors = /\b(if|else\s+if|for|while|switch|catch)\b/
  const nestingOpeners = /\{/g
  const nestingClosers = /\}/g

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue

    if (incrementors.test(trimmed)) {
      score += 1 + nesting
    }

    // Track nesting depth
    const opens = (trimmed.match(nestingOpeners) || []).length
    const closes = (trimmed.match(nestingClosers) || []).length
    nesting += opens - closes
    if (nesting < 0) nesting = 0
  }

  return score
}

// Lines of code (excluding blanks and comments)
export function logicalLOC(code) {
  const lines = code.split('\n')
  return lines.filter(l => {
    const t = l.trim()
    return t && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*') && !t.startsWith('#')
  }).length
}

// Extract function-level metrics
export function functionMetrics(code) {
  const funcPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*\([^)]*\)\s*\{)/g
  const functions = []
  let match

  while ((match = funcPattern.exec(code)) !== null) {
    const name = match[1] || match[2] || match[3]
    if (!name) continue

    // Find the function body (rough heuristic: from match to matching brace count)
    const startIdx = match.index
    let braceCount = 0
    let started = false
    let endIdx = startIdx

    for (let i = startIdx; i < code.length; i++) {
      if (code[i] === '{') { braceCount++; started = true }
      if (code[i] === '}') braceCount--
      if (started && braceCount === 0) { endIdx = i + 1; break }
    }

    const body = code.slice(startIdx, endIdx)
    const cc = cyclomaticComplexity(body)
    const cog = cognitiveComplexity(body)
    const loc = logicalLOC(body)
    const params = (body.match(/\(([^)]*)\)/) || ['', ''])[1]
      .split(',').filter(p => p.trim()).length

    functions.push({ name, cyclomaticComplexity: cc, cognitiveComplexity: cog, loc, params })
  }

  return functions
}

// Overall complexity summary
export function complexitySummary(code) {
  const cc = cyclomaticComplexity(code)
  const cog = cognitiveComplexity(code)
  const loc = logicalLOC(code)
  const funcs = functionMetrics(code)

  const avgCC = funcs.length > 0
    ? Math.round((funcs.reduce((s, f) => s + f.cyclomaticComplexity, 0) / funcs.length) * 10) / 10
    : cc

  let grade = 'A'
  if (cc > 40 || cog > 50) grade = 'F'
  else if (cc > 30 || cog > 35) grade = 'D'
  else if (cc > 20 || cog > 25) grade = 'C'
  else if (cc > 10 || cog > 15) grade = 'B'

  return {
    cyclomaticComplexity: cc,
    cognitiveComplexity: cog,
    logicalLOC: loc,
    functionCount: funcs.length,
    avgCyclomaticComplexity: avgCC,
    grade,
    functions: funcs,
  }
}
