/**
 * Race Condition Detector
 *
 * Detects shared mutable state in async/concurrent code,
 * missing locks, non-atomic operations, and promise race hazards.
 */

const PATTERNS = [
  {
    name: 'Shared mutable state in async',
    severity: 'High',
    pattern: /(?:let|var)\s+(\w+)\s*=[\s\S]*?async\s+(?:function|\()/,
    simplePattern: /(?:let|var)\s+\w+\s*=[^;]*\n[\s\S]{0,200}?async\s/,
    description: 'Mutable variable declared outside async scope may cause race conditions when accessed concurrently.',
    suggestion: 'Use local variables inside async functions, or protect shared state with a mutex/lock pattern.',
  },
  {
    name: 'Unguarded Promise.all with shared state',
    severity: 'High',
    pattern: /Promise\.all\s*\(/,
    check: (line, allCode) => {
      // Check if there's mutable state modification nearby
      const idx = allCode.indexOf(line)
      const context = allCode.substring(Math.max(0, idx - 300), idx + 300)
      return /(?:let|var)\s+\w+/.test(context) && /\+\+|\-\-|\+=|\-=/.test(context)
    },
    description: 'Promise.all with shared mutable state — concurrent promises may produce inconsistent results.',
    suggestion: 'Use Promise.all with .map() returning new values instead of mutating shared state.',
  },
  {
    name: 'Non-atomic read-modify-write',
    severity: 'Medium',
    pattern: /(\w+)\s*=\s*\1\s*[\+\-\*\/]/,
    check: (line, allCode) => /async|await|Promise|setTimeout|setInterval/.test(allCode),
    description: 'Read-modify-write operation in async context is not atomic and may lose updates.',
    suggestion: 'Use atomic operations or protect with a lock/mutex pattern.',
  },
  {
    name: 'setTimeout/setInterval state mutation',
    severity: 'Medium',
    pattern: /set(?:Timeout|Interval)\s*\(\s*(?:function|\(|async)[\s\S]*?(?:\+\+|\-\-|\+=|\-=|=\s*\w)/,
    simplePattern: /set(?:Timeout|Interval)\s*\(/,
    check: (line, allCode, lineIdx, lines) => {
      // Look for state mutation in the callback body
      for (let i = lineIdx; i < Math.min(lineIdx + 5, lines.length); i++) {
        if (/\+\+|\-\-|\+=|\-=/.test(lines[i]) || /\w+\s*=\s*(?!>|=)/.test(lines[i])) return true
      }
      return false
    },
    description: 'Timer callback mutates state that may be accessed concurrently.',
    suggestion: 'Use functional state updates or queue-based patterns for timer callbacks.',
  },
  {
    name: 'Missing await on async call',
    severity: 'High',
    pattern: /(?:^|[;{}\s])\s*\w+\s*\.\s*(?:save|update|delete|insert|write|push|send|post|put|patch)\s*\(/,
    check: (line) => {
      const trimmed = line.trim()
      return !trimmed.startsWith('await') && !trimmed.startsWith('return') && !trimmed.includes('then(') && !trimmed.includes('.catch(')
    },
    description: 'Async operation may not be awaited — subsequent code may execute before completion.',
    suggestion: 'Add await before async operations or chain with .then() to ensure ordering.',
  },
  {
    name: 'Event listener shared state',
    severity: 'Medium',
    pattern: /addEventListener\s*\(\s*['"`]\w+['"`]\s*,/,
    check: (line, allCode) => {
      return /(?:let|var)\s+\w+\s*=/.test(allCode) && !/removeEventListener/.test(allCode)
    },
    description: 'Event listener may access shared mutable state without cleanup, risking stale closures.',
    suggestion: 'Use removeEventListener for cleanup and avoid closing over mutable variables.',
  },
  {
    name: 'Unprotected global counter',
    severity: 'Medium',
    pattern: /(?:let|var)\s+(?:count|counter|total|sum|idx|index)\s*=\s*0/,
    check: (line, allCode) => /async|Promise|setTimeout|setInterval|addEventListener/.test(allCode),
    description: 'Global counter in concurrent context — increments/decrements may be lost.',
    suggestion: 'Use atomic counters or protect with a serialization mechanism.',
  },
]

export const raceConditionDetector = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern) || (rule.simplePattern && line.match(rule.simplePattern))
      if (!match) continue
      if (rule.check && !rule.check(line, code, idx, lines)) continue

      const key = `${rule.name}-${idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `race-${idx}-${findings.length}`,
        module: 'raceCondition',
        moduleName: 'Race Condition Detector',
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
