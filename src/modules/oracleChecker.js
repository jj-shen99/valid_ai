export const oracleChecker = (code, language) => {
  const findings = []

  findings.push({
    id: 'oracle-spec',
    module: 'oracle',
    moduleName: 'Oracle Checker',
    severity: 'Info',
    category: 'Specification required',
    description: 'Oracle Checker requires a specification to validate code behavior against.',
    lineNumber: 1,
    suggestion: 'Provide a specification in plain English or JSON schema format. This enables comparison of code behavior against stated requirements.',
    timestamp: new Date().toISOString(),
  })

  return findings
}
