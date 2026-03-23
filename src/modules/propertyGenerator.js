export const propertyGenerator = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const functionPattern = /function\s+(\w+)\s*\(([^)]*)\)|const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return

    const funcMatch = functionPattern.exec(line)
    if (funcMatch) {
      const funcName = funcMatch[1] || funcMatch[3]
      const params = (funcMatch[2] || funcMatch[4]).split(',').filter(p => p.trim())

      if (params.length > 3) {
        findings.push({
          id: `prop-${idx}-many-params`,
          module: 'property',
          moduleName: 'Property Generator',
          severity: 'Medium',
          category: 'High parameter count',
          description: `Function "${funcName}" has ${params.length} parameters at line ${idx + 1}. High parameter counts reduce testability and suggest the function does too much.`,
          lineNumber: idx + 1,
          codeSnippet: trimmed.substring(0, 120),
          suggestion: `Refactor "${funcName}" to accept a configuration object or use dependency injection. This improves testability and property-based test generation.`,
          timestamp: new Date().toISOString(),
        })
      }
    }
  })

  return findings
}
