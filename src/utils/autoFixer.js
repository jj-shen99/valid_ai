/**
 * Auto-fix engine.
 *
 * Generates concrete code patches for findings that have fixable patterns.
 * Each fix is a { line, replace, with } object that can be applied to the source.
 */

// Post-process findings to attach auto-fix patches where applicable
const FIX_RULES = [
  {
    // Loose equality → strict equality
    module: 'failureMode',
    category: 'Type coercion issue',
    fix: (line) => {
      const match = /([^!=])={2}([^=])/.exec(line)
      if (match) return { replace: match[0], with: `${match[1]}===${match[2]}` }
      return null
    },
  },
  {
    // Silent catch → add console.error
    module: 'failureMode',
    category: 'Silent exception swallowing',
    fix: (line) => {
      const match = /catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/.exec(line)
      if (match) return { replace: match[0], with: `catch (${match[1]}) { console.error(${match[1]}) }` }
      const match2 = /catch\s*\(\s*\)\s*\{\s*\}/.exec(line)
      if (match2) return { replace: match2[0], with: 'catch (err) { console.error(err) }' }
      return null
    },
  },
  {
    // Off-by-one: <= length → < length
    module: 'failureMode',
    category: 'Off-by-one boundary error',
    fix: (line) => {
      const match = /(\w+)\s*<=\s*(\w+\.(?:length|size|count))/.exec(line)
      if (match) return { replace: match[0], with: `${match[1]} < ${match[2]}` }
      return null
    },
  },
  {
    // eval() → Function constructor or JSON.parse
    module: 'security',
    category: 'Code injection risk',
    fix: (line) => {
      const match = /eval\s*\(\s*(\w+)\s*\)/.exec(line)
      if (match) return { replace: match[0], with: `JSON.parse(${match[1]})` }
      return null
    },
  },
  {
    // innerHTML → textContent
    module: 'security',
    category: 'XSS vulnerability',
    fix: (line) => {
      const match = /\.innerHTML\s*=/.exec(line)
      if (match) return { replace: '.innerHTML =', with: '.textContent =' }
      return null
    },
  },
]

export function attachAutoFixes(findings, code) {
  const lines = code.split('\n')

  return findings.map(f => {
    // Skip if already has an autoFix
    if (f.autoFix) return f

    for (const rule of FIX_RULES) {
      if (f.module === rule.module && f.category === rule.category && f.lineNumber) {
        const lineText = lines[f.lineNumber - 1] || ''
        const fix = rule.fix(lineText)
        if (fix) {
          return { ...f, autoFix: { ...fix, line: f.lineNumber } }
        }
      }
    }
    return f
  })
}

export function applyFix(code, fix) {
  const lines = code.split('\n')
  if (fix.line && fix.line <= lines.length) {
    lines[fix.line - 1] = lines[fix.line - 1].replace(fix.replace, fix.with)
  }
  return lines.join('\n')
}

export function generatePatchText(finding) {
  if (!finding.autoFix) return null
  const { replace: from, with: to, line } = finding.autoFix
  return `Line ${line}:\n- ${from}\n+ ${to}`
}
