/**
 * Error Handling Auditor
 *
 * Detects uncaught promise rejections, missing .catch(),
 * generic error types, swallowed errors, and error-first
 * callbacks without checks.
 */

const PATTERNS = [
  {
    name: 'Uncaught promise (no .catch or try/catch)',
    severity: 'High',
    pattern: /\.\s*then\s*\(/,
    check: (match, allCode, lineIdx, lines) => !lines[lineIdx].includes('.catch(') && !lines[lineIdx].includes('.catch ('),
    description: 'Promise chain without .catch() — rejected promise will be silently swallowed.',
    suggestion: 'Add .catch() handler or wrap in try/catch with await.',
  },
  {
    name: 'Empty catch block',
    severity: 'High',
    pattern: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/,
    description: 'Empty catch block silently swallows errors, making debugging impossible.',
    suggestion: 'At minimum, log the error: catch(e) { console.error(e) }',
  },
  {
    name: 'Generic Error thrown',
    severity: 'Medium',
    pattern: /throw\s+new\s+Error\s*\(\s*['"`]/,
    check: (match, allCode, lineIdx, lines) => {
      // Flag only very generic messages
      const msg = lines[lineIdx].match(/Error\s*\(\s*['"`]([^'"`]*)/)
      if (!msg) return false
      const generic = ['error', 'something went wrong', 'unknown error', 'failed', 'error occurred', 'an error']
      return generic.some(g => msg[1].toLowerCase().includes(g) && msg[1].length < 30)
    },
    description: 'Generic error message provides insufficient context for debugging.',
    suggestion: 'Use descriptive error messages including what failed and why.',
  },
  {
    name: 'Error-first callback without check',
    severity: 'High',
    pattern: /\(\s*(err|error|e)\s*[,)]/,
    check: (match, allCode, lineIdx, lines) => {
      const theLine = lines[lineIdx].trim()
      // Skip catch blocks, if statements, function declarations
      if (/catch\s*\(/.test(theLine)) return false
      if (/\bif\s*\(/.test(theLine)) return false
      if (/\bwhile\s*\(/.test(theLine)) return false
      if (/\bfor\s*\(/.test(theLine)) return false
      if (/function\s+\w+\s*\(/.test(theLine)) return false
      const errParam = theLine.match(/\(\s*(err|error|e)\s*[,)]/)?.[1]
      if (!errParam) return false
      // Check next few lines for error check
      for (let i = lineIdx + 1; i < Math.min(lineIdx + 5, lines.length); i++) {
        if (lines[i].includes(`if (${errParam}`) || lines[i].includes(`if(${errParam}`)) return false
        if (lines[i].includes(`${errParam} &&`) || lines[i].includes(`${errParam})`)) return false
      }
      return true
    },
    description: 'Error-first callback parameter is not checked — errors will be silently ignored.',
    suggestion: 'Add if (err) { ... } check at the start of error-first callbacks.',
  },
  {
    name: 'Catch with only console.log',
    severity: 'Medium',
    pattern: /catch\s*\(\s*(\w+)\s*\)\s*\{/,
    check: (match, allCode, lineIdx, lines) => {
      const errVar = match[1]
      // Check if catch block only has console.log
      for (let i = lineIdx + 1; i < Math.min(lineIdx + 5, lines.length); i++) {
        const l = lines[i].trim()
        if (l === '}') return true // Block ended, only had console.log (or nothing before)
        if (l.startsWith('console.log(') && !l.includes('throw') && !l.includes('return')) continue
        return false // Has other statements
      }
      return false
    },
    description: 'Catch block only logs the error without rethrowing or handling it.',
    suggestion: 'Consider rethrowing, returning an error state, or using console.error instead of console.log.',
  },
  {
    name: 'Missing error handling for async/await',
    severity: 'High',
    pattern: /await\s+\w+/,
    check: (match, allCode, lineIdx, lines) => {
      // Check if the await is inside a try block
      let tryDepth = 0
      for (let i = 0; i <= lineIdx; i++) {
        if (/\btry\s*\{/.test(lines[i])) tryDepth++
        if (/\bcatch\s*\(/.test(lines[i])) tryDepth--
      }
      return tryDepth <= 0
    },
    description: 'await expression not wrapped in try/catch — rejected promise will throw unhandled.',
    suggestion: 'Wrap await calls in try/catch or add .catch() to the promise.',
  },
  {
    name: 'Re-throwing without context',
    severity: 'Medium',
    pattern: /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?throw\s+\1\s*[;\n]/,
    simplePattern: /throw\s+(err|error|e)\s*;/,
    check: (match, allCode, lineIdx, lines) => {
      // Check if we're in a catch block
      for (let i = lineIdx - 1; i >= Math.max(0, lineIdx - 10); i--) {
        if (/catch\s*\(/.test(lines[i])) return true
      }
      return false
    },
    description: 'Error is re-thrown without adding context — stack trace may be lost.',
    suggestion: 'Wrap in a new Error with context: throw new Error(`Operation failed: ${err.message}`).',
  },
  {
    name: 'Unhandled rejection listener missing',
    severity: 'Info',
    pattern: /new\s+Promise\s*\(/,
    check: (match, allCode) => {
      return !allCode.includes('unhandledrejection') && !allCode.includes('.catch(') && allCode.split('new Promise').length > 2
    },
    description: 'Multiple Promises without global unhandled rejection handler.',
    suggestion: 'Add process.on("unhandledRejection") or window.addEventListener("unhandledrejection") handler.',
  },
]

export const errorHandlingAuditor = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern) || (rule.simplePattern && line.match(rule.simplePattern))
      if (!match) continue
      if (rule.check && !rule.check(match, code, idx, lines)) continue

      const key = `${rule.name}-${idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `errh-${idx}-${findings.length}`,
        module: 'errorHandling',
        moduleName: 'Error Handling Auditor',
        severity: rule.severity,
        category: rule.name,
        description: `${rule.description} (line ${idx + 1})`,
        lineNumber: idx + 1,
        codeSnippet: trimmed.substring(0, 120),
        suggestion: rule.suggestion,
        timestamp: new Date().toISOString(),
      })
    }
  })

  return findings
}
