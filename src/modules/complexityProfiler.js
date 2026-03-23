export const complexityProfiler = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'Nested loops detected',
      regex: /for\s*\(.*\)\s*\{[\s\S]*?for\s*\(/,
      severity: 'Medium',
      chapter: 'Ch 9',
      suggestion: 'Consider refactoring nested loops. O(n²) complexity can be problematic for large inputs.',
    },
    {
      name: 'Unbounded recursion',
      regex: /function\s+\w+\s*\([\s\S]*?\)\s*\{[\s\S]*?\w+\s*\(/,
      severity: 'High',
      chapter: 'Ch 9',
      suggestion: 'Verify recursion has proper base case. Consider iterative approach or memoization.',
    },
    {
      name: 'Inefficient sort usage',
      regex: /\.sort\s*\(|sorted\s*\(|Collections\.sort/,
      severity: 'Medium',
      chapter: 'Ch 9',
      suggestion: 'Verify sort is necessary. Consider if data structure or algorithm can be optimized.',
    },
    {
      name: 'Full table scan pattern',
      regex: /SELECT\s+\*|\.find\s*\(|\.filter\s*\([\s\S]*?\.length/,
      severity: 'High',
      chapter: 'Ch 9',
      suggestion: 'Consider using indexed queries or early termination. Full scans scale poorly.',
    },
    {
      name: 'Memory accumulation in loop',
      regex: /\w+\s*=\s*\[\][\s\S]*?for\s*\([\s\S]*?\w+\.push|while\s*\([\s\S]*?\w+\s*\+=|\.concat\s*\(/,
      severity: 'Medium',
      chapter: 'Ch 9',
      suggestion: 'Monitor memory usage in loops. Consider streaming or chunking large datasets.',
    },
  ]

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `comp-${idx}-${pattern.name}`,
          module: 'complexity',
          moduleName: 'Complexity Profiler',
          severity: pattern.severity,
          category: pattern.name,
          description: `Detected potential performance issue: ${pattern.name}`,
          lineNumber: idx + 1,
          suggestion: pattern.suggestion,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return findings
}
