export const mutationScorer = (code, language) => {
  const findings = []

  findings.push({
    id: 'mutation-tests',
    module: 'mutation',
    moduleName: 'Mutation Scorer',
    severity: 'Info',
    category: 'Test suite required',
    description: 'Mutation Scorer requires an existing test suite to evaluate.',
    lineNumber: 1,
    suggestion: 'Provide your test suite alongside the code. Mutation Scorer will apply semantic mutations and report what percentage your tests catch.',
    timestamp: new Date().toISOString(),
  })

  return findings
}
