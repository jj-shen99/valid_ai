/**
 * Dead Code Detector
 *
 * Detects potentially unused variables, unreachable code,
 * unused imports, and empty function bodies.
 */

const PATTERNS = [
  {
    name: 'Unused variable assignment',
    severity: 'Medium',
    pattern: /^\s*(?:const|let|var)\s+(\w+)\s*=\s*.+/,
    check: (match, allCode, line) => {
      const varName = match[1]
      // Skip common exceptions
      if (['_', '__', 'unused', 'ignore'].includes(varName)) return false
      // Count occurrences in full code (excluding the declaration line)
      const lines = allCode.split('\n')
      let useCount = 0
      lines.forEach((l, i) => {
        if (i === line) return
        if (new RegExp(`\\b${varName}\\b`).test(l)) useCount++
      })
      return useCount === 0
    },
    desc: (match) => `Variable "${match[1]}" is declared but never used elsewhere in the code.`,
    suggestion: 'Remove the unused variable or prefix with underscore if intentional.',
  },
  {
    name: 'Unreachable code after return',
    severity: 'Medium',
    pattern: /^\s*return\b.*;\s*$/,
    check: (match, allCode, lineIdx) => {
      const lines = allCode.split('\n')
      const next = lines[lineIdx + 1]
      if (!next) return false
      const trimmed = next.trim()
      // Next line has code that's not a closing brace or empty
      return trimmed.length > 0 && trimmed !== '}' && trimmed !== '});' && !trimmed.startsWith('//')
    },
    desc: () => 'Code after a return statement is unreachable and will never execute.',
    suggestion: 'Remove the unreachable code or restructure the logic.',
  },
  {
    name: 'Empty function body',
    severity: 'Info',
    pattern: /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))\s*\{?\s*\}?\s*$/,
    simplePattern: /function\s+\w+\s*\([^)]*\)\s*\{\s*\}/,
    desc: () => 'Function has an empty body — it may be a stub or incomplete implementation.',
    suggestion: 'Implement the function body or add a TODO comment if intentional.',
  },
  {
    name: 'Commented-out code block',
    severity: 'Info',
    pattern: /^\s*\/\/\s*(?:const|let|var|function|if|for|while|return|import|export)\s/,
    desc: () => 'Commented-out code detected. This adds noise and may confuse maintainers.',
    suggestion: 'Remove commented-out code. Use version control to recover old code if needed.',
  },
  {
    name: 'Unused import',
    severity: 'Medium',
    pattern: /^\s*import\s+(?:\{?\s*(\w+)(?:\s*,\s*\w+)*\s*\}?)\s+from\s+/,
    check: (match, allCode, lineIdx) => {
      const imported = match[1]
      if (!imported || imported === 'React') return false
      const lines = allCode.split('\n')
      let useCount = 0
      lines.forEach((l, i) => {
        if (i === lineIdx) return
        if (new RegExp(`\\b${imported}\\b`).test(l)) useCount++
      })
      return useCount === 0
    },
    desc: (match) => `Import "${match[1]}" appears unused in the rest of the file.`,
    suggestion: 'Remove unused imports to reduce bundle size and improve clarity.',
  },
]

export const deadCodeDetector = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('*')) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern)
      if (!match) continue

      // Run additional check if present
      if (rule.check && !rule.check(match, code, idx)) continue

      const key = `${rule.name}-${idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `dead-${idx}-${rule.name.replace(/\s/g, '-')}`,
        module: 'deadCode',
        moduleName: 'Dead Code Detector',
        severity: rule.severity,
        category: rule.name,
        description: `${rule.desc(match)} (line ${idx + 1})`,
        lineNumber: idx + 1,
        codeSnippet: trimmed.substring(0, 120),
        suggestion: rule.suggestion,
        timestamp: new Date().toISOString(),
      })
    }
  })

  // Check for empty functions via multi-line scan
  const emptyFnRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{\s*\}/g
  let efMatch
  while ((efMatch = emptyFnRegex.exec(code)) !== null) {
    const lineNum = code.substring(0, efMatch.index).split('\n').length
    const key = `empty-fn-${efMatch[1]}`
    if (!seen.has(key)) {
      seen.add(key)
      findings.push({
        id: `dead-${lineNum}-empty-fn`,
        module: 'deadCode',
        moduleName: 'Dead Code Detector',
        severity: 'Info',
        category: 'Empty function body',
        description: `Function "${efMatch[1]}" has an empty body. (line ${lineNum})`,
        lineNumber: lineNum,
        codeSnippet: efMatch[0].substring(0, 120),
        suggestion: 'Implement the function body or add a TODO comment if intentional.',
        timestamp: new Date().toISOString(),
      })
    }
  }

  return findings
}
