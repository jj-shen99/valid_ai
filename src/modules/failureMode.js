export const failureModeScanner = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'Off-by-one boundary error',
      regex: /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*[<>]=\s*\w+\.length\s*;/,
      severity: 'High',
      chapter: 'Ch 3',
    },
    {
      name: 'Missing null/undefined check',
      regex: /\w+\.\w+\s*(?:=|==|===)/,
      severity: 'High',
      chapter: 'Ch 3',
    },
    {
      name: 'Silent exception swallowing',
      regex: /catch\s*\(\s*\w+\s*\)\s*\{\s*\}/,
      severity: 'Critical',
      chapter: 'Ch 3',
    },
    {
      name: 'Unbounded loop',
      regex: /while\s*\(\s*true\s*\)/,
      severity: 'High',
      chapter: 'Ch 3',
    },
    {
      name: 'Type coercion issue',
      regex: /==\s*(?!==)/,
      severity: 'Medium',
      chapter: 'Ch 3',
    },
  ]

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `fm-${idx}-${pattern.name}`,
          module: 'failureMode',
          moduleName: 'Failure Mode Scanner',
          severity: pattern.severity,
          category: pattern.name,
          description: `Detected potential ${pattern.name.toLowerCase()} pattern in code.`,
          lineNumber: idx + 1,
          suggestion: `Review this line for correctness. Consider adding explicit checks and error handling.`,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return findings
}
