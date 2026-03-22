export const propertyGenerator = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)|const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/
  const docstringPattern = /\/\*\*[\s\S]*?\*\/|\/\/\s*@/

  lines.forEach((line, idx) => {
    const funcMatch = functionPattern.exec(line)
    if (funcMatch) {
      const funcName = funcMatch[1] || funcMatch[3]
      const params = (funcMatch[2] || funcMatch[4]).split(',').filter(p => p.trim())

      if (params.length === 0) {
        findings.push({
          id: `prop-${idx}-no-params`,
          module: 'property',
          moduleName: 'Property Generator',
          severity: 'Info',
          category: 'Pure function detected',
          description: `Function ${funcName} appears to be pure with no parameters. Consider adding property-based tests.`,
          lineNumber: idx + 1,
          suggestion: `Generate property tests for ${funcName} using Hypothesis (Python) or fast-check (JS). Test invariants and round-trip properties.`,
          chapterLink: 'Ch 7',
          timestamp: new Date().toISOString(),
        })
      }

      if (params.length > 3) {
        findings.push({
          id: `prop-${idx}-many-params`,
          module: 'property',
          moduleName: 'Property Generator',
          severity: 'Medium',
          category: 'High parameter count',
          description: `Function ${funcName} has ${params.length} parameters. Consider dependency injection for testability.`,
          lineNumber: idx + 1,
          suggestion: `Refactor to accept a configuration object or use dependency injection. This improves testability and property-based test generation.`,
          chapterLink: 'Ch 7',
          timestamp: new Date().toISOString(),
        })
      }
    }
  })

  return findings
}
