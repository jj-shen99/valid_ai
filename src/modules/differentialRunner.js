export const differentialRunner = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  // Detect patterns that benefit from differential testing
  const patterns = [
    {
      name: 'Multiple implementations detected',
      regex: /function\s+\w+(?:V2|New|Alt|Updated|Improved|Refactored)\s*\(/i,
      severity: 'Info',
      description: 'Function name suggests a versioned implementation. Ideal candidate for differential testing against the original.',
      suggestion: 'Run both versions with identical inputs and compare outputs. Use fuzzing to find divergent edge cases.',
    },
    {
      name: 'Algorithm reimplementation',
      regex: /(?:sort|search|parse|encode|decode|hash|compress|serialize)\s*\(/i,
      severity: 'Info',
      description: 'Standard algorithm implementation detected. Can be differentially tested against the standard library version.',
      suggestion: 'Compare output against the built-in implementation (e.g., Array.sort vs custom sort). Test with randomized and edge-case inputs.',
    },
    {
      name: 'Data transformation function',
      regex: /(?:transform|convert|map|translate|format|normalize)\s*\(/i,
      severity: 'Info',
      description: 'Data transformation detected. These are excellent differential testing candidates — input→output should be deterministic.',
      suggestion: 'Write round-trip tests: transform(inverse(x)) === x. Compare with reference implementations for known inputs.',
    },
    {
      name: 'Regex pattern usage',
      regex: /new\s+RegExp\s*\(|\/[^/]+\/[gimsuvy]*/,
      severity: 'Medium',
      description: 'Regex patterns can have subtle matching differences across engines. Differential testing catches edge cases.',
      suggestion: 'Test regex against a comprehensive set of matching and non-matching strings. Compare behavior across engines if applicable.',
    },
    {
      name: 'Mathematical computation',
      regex: /Math\.\w+\s*\(|sqrt|pow|log|sin|cos|tan|ceil|floor|round/,
      severity: 'Info',
      description: 'Numerical computation detected. Floating-point results can vary across implementations.',
      suggestion: 'Compare against a reference implementation with tolerance for floating-point differences (epsilon comparison).',
    },
  ]

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `diff-${idx}-${pattern.name}`,
          module: 'differential',
          moduleName: 'Differential Runner',
          severity: pattern.severity,
          category: pattern.name,
          description: pattern.description,
          lineNumber: idx + 1,
          suggestion: pattern.suggestion,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  if (findings.length === 0) {
    findings.push({
      id: 'diff-none',
      module: 'differential',
      moduleName: 'Differential Runner',
      severity: 'Info',
      category: 'No differential targets found',
      description: 'No obvious differential testing candidates detected in this code.',
      lineNumber: 1,
      suggestion: 'Provide a reference implementation alongside your code to enable full differential testing.',
      timestamp: new Date().toISOString(),
    })
  }

  return findings
}
