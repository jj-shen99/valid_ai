export const differentialRunner = (code, language) => {
  const findings = []

  findings.push({
    id: 'diff-setup',
    module: 'differential',
    moduleName: 'Differential Runner',
    severity: 'Info',
    category: 'Reference implementation needed',
    description: 'Differential Runner requires a reference implementation to compare against.',
    lineNumber: 1,
    suggestion: 'Provide a reference implementation or alternative version of the same function to enable differential testing.',
    timestamp: new Date().toISOString(),
  })

  return findings
}
