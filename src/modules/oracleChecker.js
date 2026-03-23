export const oracleChecker = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  // Detect patterns where oracle/spec validation is missing
  const patterns = [
    {
      name: 'Missing input validation',
      regex: /function\s+(\w+)\s*\([^)]+\)\s*\{(?!\s*(?:if|throw|assert))/,
      severity: 'Medium',
      description: 'Function accepts parameters but has no visible input validation or precondition checks at entry.',
      suggestion: 'Add guard clauses or assertions at function entry to validate inputs. Define and enforce function contracts.',
    },
    {
      name: 'Missing return type consistency',
      regex: /return\s+null|return\s+undefined|return\s*;/,
      severity: 'Medium',
      description: 'Function returns null/undefined in some paths, which may violate caller expectations.',
      suggestion: 'Ensure consistent return types across all paths. Use Result/Either types or throw typed errors instead of returning null.',
    },
    {
      name: 'Unvalidated API response',
      regex: /(?:fetch|axios|\.get|\.post)\s*\(.*\)\s*\.then|await\s+(?:fetch|axios)\s*\(.*\)(?!.*(?:schema|validate|zod|joi|assert))/,
      severity: 'High',
      description: 'API response data used without schema validation. External data can have unexpected shape.',
      suggestion: 'Validate API responses with a schema library (zod, joi, ajv). Never trust external data shapes.',
    },
    {
      name: 'Missing error contract',
      regex: /catch\s*\(\s*\w+\s*\)\s*\{[^}]*(?:console|log|print)/,
      severity: 'Medium',
      description: 'Error handler only logs the error without propagating or transforming it. Callers may not know about failures.',
      suggestion: 'Define an error handling contract: re-throw with context, return error objects, or emit error events for callers to handle.',
    },
  ]

  const seenPatterns = {}

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('#')) return

    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        if (!seenPatterns[pattern.name]) {
          seenPatterns[pattern.name] = true
          findings.push({
            id: `oracle-${idx}-${pattern.name}`,
            module: 'oracle',
            moduleName: 'Oracle Checker',
            severity: pattern.severity,
            category: pattern.name,
            description: `${pattern.description} (line ${idx + 1})`,
            lineNumber: idx + 1,
            codeSnippet: trimmed.substring(0, 120),
            suggestion: pattern.suggestion,
            timestamp: new Date().toISOString(),
          })
        }
      }
    })
  })

  return findings
}
