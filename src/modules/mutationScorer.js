export const mutationScorer = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  // Analyze mutation-susceptible patterns
  const mutationTargets = [
    {
      name: 'Boundary comparison operator',
      regex: /(?:if|while|for)\s*\(.*[<>]=?\s*\d+|[<>]=?\s*\w+\.(?:length|size|count)/,
      severity: 'Medium',
      description: 'Boundary comparisons are prime mutation targets — changing < to <= or > to >= can introduce subtle bugs.',
      suggestion: 'Write boundary tests: test exact boundary value, one below, and one above. These catch operator-swap mutations.',
    },
    {
      name: 'Return value mutation risk',
      regex: /return\s+(?:true|false|\d+|null|undefined|""|\[\]|\{\})/,
      severity: 'Medium',
      description: 'Simple return values are easy mutation targets — changing return true to false or 0 to 1 can go undetected.',
      suggestion: 'Add assertions on return values. Test edge cases that produce each distinct return value.',
    },
    {
      name: 'Conditional branch without else',
      regex: /^\s*if\s*\(.*\)\s*\{?\s*$/,
      severity: 'Medium',
      description: 'Missing else branch means mutations removing the if-body may survive undetected.',
      suggestion: 'Test the case where the condition is false. Ensure the default path behavior is verified.',
    },
  ]

  // Track first occurrence per pattern to avoid flooding
  const seenPatterns = {}
  let targetCount = 0

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return

    mutationTargets.forEach((target) => {
      if (target.regex.test(line)) {
        targetCount++
        if (!seenPatterns[target.name]) {
          seenPatterns[target.name] = true
          findings.push({
            id: `mut-${idx}-${target.name}`,
            module: 'mutation',
            moduleName: 'Mutation Scorer',
            severity: target.severity,
            category: target.name,
            description: target.description,
            lineNumber: idx + 1,
            suggestion: target.suggestion,
            timestamp: new Date().toISOString(),
          })
        }
      }
    })
  })

  // Summary finding
  const testableLines = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length
  const mutationDensity = testableLines > 0 ? Math.round((targetCount / testableLines) * 100) : 0

  findings.unshift({
    id: 'mutation-summary',
    module: 'mutation',
    moduleName: 'Mutation Scorer',
    severity: mutationDensity > 60 ? 'High' : mutationDensity > 30 ? 'Medium' : 'Info',
    category: 'Mutation Density Score',
    description: `Found ${targetCount} mutation targets across ${testableLines} code lines (${mutationDensity}% density). ${mutationDensity > 50 ? 'High mutation surface — thorough tests critical.' : 'Moderate mutation surface.'}`,
    lineNumber: 1,
    suggestion: 'Run a mutation testing tool (Stryker for JS, mutmut for Python) to measure actual test kill rate. Aim for >80% mutation score.',
    timestamp: new Date().toISOString(),
  })

  return findings
}
