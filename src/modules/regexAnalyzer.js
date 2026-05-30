/**
 * Regex Complexity Analyzer
 *
 * Flags ReDoS-vulnerable patterns, catastrophic backtracking,
 * overly complex regex, and unnecessary captures.
 */

const PATTERNS = [
  {
    name: 'Potential ReDoS pattern',
    severity: 'Critical',
    pattern: /\/([^/]+)\/[gimsuy]*/,
    check: (match) => {
      const regex = match[1]
      // Nested quantifiers: (a+)+ or (a*)*
      if (/\([^)]*[+*][^)]*\)\s*[+*]/.test(regex)) return true
      // Overlapping alternation with quantifiers: (a|a)+
      if (/\(([^|)]+)\|(\1)[^)]*\)\s*[+*]/.test(regex)) return true
      // Nested repetition: .+.+ or .*.*
      if (/\.\+[\s\S]*\.\+/.test(regex) || /\.\*[\s\S]*\.\*/.test(regex)) return true
      return false
    },
    description: 'Regular expression may be vulnerable to ReDoS (Regular expression Denial of Service).',
    suggestion: 'Avoid nested quantifiers and overlapping alternations. Use atomic groups or possessive quantifiers if supported.',
  },
  {
    name: 'Overly complex regex',
    severity: 'Medium',
    pattern: /\/([^/]{40,})\/[gimsuy]*/,
    description: 'Regular expression exceeds 40 characters — consider breaking into smaller patterns or using named groups.',
    suggestion: 'Break complex regex into smaller, documented patterns or use a regex builder library.',
  },
  {
    name: 'Unnecessary capture group',
    severity: 'Info',
    pattern: /\/([^/]+)\/[gimsuy]*/,
    check: (match, allCode, lineIdx, lines) => {
      const regex = match[1]
      const captures = (regex.match(/\((?!\?)/g) || []).length
      if (captures === 0) return false
      // Check if capture is used (match[1], $1, etc.)
      const line = lines[lineIdx]
      return captures > 0 && !/\$\d|\[\d\]|match\[|group\(/.test(line) && !/\.replace\s*\(/.test(line)
    },
    description: 'Regex has capture groups but results may not be used — use non-capturing (?:...) instead.',
    suggestion: 'Replace (pattern) with (?:pattern) when capture is not needed, for better performance.',
  },
  {
    name: 'Global flag with test()',
    severity: 'Medium',
    pattern: /\/[^/]+\/[^/]*g[^/]*\.test\s*\(/,
    description: 'Using .test() with global flag causes lastIndex state — may produce inconsistent results.',
    suggestion: 'Remove the g flag when using .test(), or reset lastIndex before each call.',
  },
  {
    name: 'Unescaped special character',
    severity: 'Medium',
    pattern: /new\s+RegExp\s*\(\s*['"`]([^'"`]+)['"`]/,
    check: (match) => {
      const pattern = match[1]
      // Check for common unescaped characters in string-based regex
      return /(?<!\\)[.+*?^${}()|[\]]/.test(pattern) && !/\\[.+*?^${}()|[\]]/.test(pattern)
    },
    description: 'RegExp constructed from string may have unescaped special characters.',
    suggestion: 'Escape special regex characters or use regex literal syntax instead of new RegExp().',
  },
  {
    name: 'Greedy quantifier in user input context',
    severity: 'High',
    pattern: /new\s+RegExp\s*\(\s*(?:\w+|\`[^`]*\$\{)/,
    description: 'Dynamic RegExp with user-provided input — may enable ReDoS attacks.',
    suggestion: 'Sanitize user input with escapeRegex() before constructing RegExp, or use string methods instead.',
  },
  {
    name: 'Missing regex flags',
    severity: 'Info',
    pattern: /\/([^/]+)\/(?=[^gimsuy\s;,)\]}]|$)/,
    check: (match) => {
      const regex = match[1]
      // Only flag if it looks like it should be case-insensitive
      return /[A-Z]/.test(regex) && /[a-z]/.test(regex) && regex.length > 5
    },
    description: 'Regex may need the i (case-insensitive) flag based on mixed-case character classes.',
    suggestion: 'Consider adding the i flag for case-insensitive matching.',
  },
]

export const regexAnalyzer = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern)
      if (!match) continue
      if (rule.check && !rule.check(match, code, idx, lines)) continue

      const key = `${rule.name}-${idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `regex-${idx}-${findings.length}`,
        module: 'regexAnalysis',
        moduleName: 'Regex Complexity Analyzer',
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
