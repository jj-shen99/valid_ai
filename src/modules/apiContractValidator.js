/**
 * API Contract Validator
 *
 * Parses JSDoc/TypeDoc annotations and verifies implementations
 * match declared contracts (param types, return types, throws).
 */

const PATTERNS = [
  {
    name: 'Missing @param documentation',
    severity: 'Info',
    pattern: /function\s+(\w+)\s*\(([^)]+)\)/,
    check: (match, allCode, lineIdx, lines) => {
      // Look for JSDoc block above the function
      const docBlock = []
      for (let i = lineIdx - 1; i >= Math.max(0, lineIdx - 15); i--) {
        const l = lines[i].trim()
        if (l.startsWith('*') || l.startsWith('/**') || l.startsWith('*/')) docBlock.push(l)
        else if (l === '') continue
        else break
      }
      if (docBlock.length === 0) return false // No doc block = separate issue
      const params = match[2].split(',').map(p => p.trim().replace(/[=:].*/g, '').replace(/\.{3}/, ''))
      const docText = docBlock.join(' ')
      return params.some(p => p && !docText.includes(`@param`) || (p && docText.includes('@param') && !docText.includes(p)))
    },
    desc: (match) => `Function "${match[1]}" has parameters not documented with @param.`,
    suggestion: 'Add @param JSDoc tags for all function parameters.',
  },
  {
    name: 'Missing @returns documentation',
    severity: 'Info',
    pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{/,
    check: (match, allCode, lineIdx, lines) => {
      // Check if function returns a value
      const funcBody = []
      let braceCount = 0
      let started = false
      for (let i = lineIdx; i < Math.min(lineIdx + 50, lines.length); i++) {
        for (const ch of lines[i]) {
          if (ch === '{') { braceCount++; started = true }
          if (ch === '}') braceCount--
        }
        funcBody.push(lines[i])
        if (started && braceCount === 0) break
      }
      const body = funcBody.join('\n')
      if (!/return\s+\S/.test(body)) return false // No return value

      // Check for JSDoc @returns
      const docBlock = []
      for (let i = lineIdx - 1; i >= Math.max(0, lineIdx - 15); i--) {
        const l = lines[i].trim()
        if (l.startsWith('*') || l.startsWith('/**') || l.startsWith('*/')) docBlock.push(l)
        else if (l === '') continue
        else break
      }
      if (docBlock.length === 0) return true // Has return but no doc at all
      return !docBlock.join(' ').includes('@return')
    },
    desc: (match) => `Function "${match[1]}" returns a value but has no @returns documentation.`,
    suggestion: 'Add @returns JSDoc tag describing the return value.',
  },
  {
    name: 'Undocumented thrown error',
    severity: 'Medium',
    pattern: /throw\s+new\s+(\w*Error)/,
    check: (match, allCode, lineIdx, lines) => {
      // Look for @throws in the containing function's JSDoc
      for (let i = lineIdx; i >= Math.max(0, lineIdx - 50); i--) {
        if (/function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\()/.test(lines[i])) {
          const docBlock = []
          for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
            const l = lines[j].trim()
            if (l.startsWith('*') || l.startsWith('/**') || l.startsWith('*/')) docBlock.push(l)
            else if (l === '') continue
            else break
          }
          return !docBlock.join(' ').includes('@throws')
        }
      }
      return true
    },
    desc: (match) => `Thrown ${match[1]} is not documented with @throws.`,
    suggestion: 'Add @throws JSDoc tag to document possible exceptions.',
  },
  {
    name: 'Type mismatch in JSDoc',
    severity: 'Medium',
    pattern: /@param\s*\{(\w+)\}\s*(\w+)/,
    check: (match, allCode, lineIdx, lines) => {
      const declaredType = match[1].toLowerCase()
      const paramName = match[2]
      // Search for type checks in the function body that contradict
      for (let i = lineIdx + 1; i < Math.min(lineIdx + 30, lines.length); i++) {
        const l = lines[i]
        if (l.includes(`typeof ${paramName}`) && l.includes(`=== '`)) {
          const typeCheck = l.match(/typeof\s+\w+\s*===?\s*'(\w+)'/)
          if (typeCheck && typeCheck[1] !== declaredType && declaredType !== 'any' && declaredType !== '*') {
            return true
          }
        }
      }
      return false
    },
    desc: (match) => `Declared type {${match[1]}} for "${match[2]}" may not match runtime type checks.`,
    suggestion: 'Ensure JSDoc type annotations match actual type guards in the implementation.',
  },
  {
    name: 'Missing function documentation',
    severity: 'Info',
    pattern: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/,
    check: (match, allCode, lineIdx, lines) => {
      // Skip short/trivial functions
      if (['constructor', 'render', 'toString', 'valueOf'].includes(match[1])) return false
      // Check if previous lines have JSDoc
      for (let i = lineIdx - 1; i >= Math.max(0, lineIdx - 3); i--) {
        const l = lines[i].trim()
        if (l === '*/') return false
        if (l === '' || l.startsWith('//')) continue
        break
      }
      return true
    },
    desc: (match) => `Function "${match[1]}" has no JSDoc documentation.`,
    suggestion: 'Add JSDoc comment block above exported/public functions.',
  },
  {
    name: 'Inconsistent return type',
    severity: 'High',
    pattern: /@returns?\s*\{(\w+)\}/,
    check: (match, allCode, lineIdx, lines) => {
      const declaredReturn = match[1].toLowerCase()
      // Find the function and look for contradicting returns
      for (let i = lineIdx + 1; i < Math.min(lineIdx + 50, lines.length); i++) {
        const l = lines[i].trim()
        if (declaredReturn === 'void' && /return\s+\S/.test(l) && !l.startsWith('//')) return true
        if (declaredReturn === 'number' && /return\s+['"`]/.test(l)) return true
        if (declaredReturn === 'string' && /return\s+\d+\s*[;\n]/.test(l)) return true
        if (declaredReturn === 'boolean' && /return\s+(?:\d+|['"`])/.test(l)) return true
      }
      return false
    },
    desc: (match) => `Declared return type {${match[1]}} appears inconsistent with actual return statements.`,
    suggestion: 'Fix the @returns type or correct the implementation to match the documented contract.',
  },
]

export const apiContractValidator = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern)
      if (!match) continue
      if (rule.check && !rule.check(match, code, idx, lines)) continue

      const key = `${rule.name}-${match[1] || idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `contract-${idx}-${findings.length}`,
        module: 'apiContract',
        moduleName: 'API Contract Validator',
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

  return findings
}
