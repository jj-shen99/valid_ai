export const oracleChecker = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  // Detect patterns where oracle/spec validation is missing
  const patterns = [
    {
      name: 'Missing input validation',
      regex: /function\s+\w+\s*\([^)]+\)\s*\{(?!\s*(?:if|throw|assert))/,
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
      name: 'Assertion-free function',
      regex: /function\s+\w+\s*\([^)]*\)\s*\{(?:(?!assert|expect|should|must|throw|if\s*\()[\s\S])*?\}/,
      severity: 'Info',
      description: 'Function body contains no assertions, contracts, or validation logic.',
      suggestion: 'Add pre/post-condition assertions using assert() or invariant checks. These serve as executable specifications.',
    },
    {
      name: 'Unvalidated API response',
      regex: /(?:fetch|axios|request)\s*\([\s\S]*?\.(?:json|data|body)(?!\s*\?\s*\.)/,
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

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `oracle-${idx}-${pattern.name}`,
          module: 'oracle',
          moduleName: 'Oracle Checker',
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
      id: 'oracle-clean',
      module: 'oracle',
      moduleName: 'Oracle Checker',
      severity: 'Info',
      category: 'No oracle issues detected',
      description: 'No specification violation patterns found. Consider adding formal contracts for critical functions.',
      lineNumber: 1,
      suggestion: 'Add JSDoc @throws and @returns annotations. Consider design-by-contract patterns for business logic.',
      timestamp: new Date().toISOString(),
    })
  }

  return findings
}
