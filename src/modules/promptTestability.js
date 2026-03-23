export const promptTestabilityScore = (code, prompt) => {
  const findings = []
  let score = 0
  const maxScore = 5

  if (!prompt) {
    findings.push({
      id: 'prompt-missing',
      module: 'prompt',
      moduleName: 'Prompt Testability Score',
      severity: 'Info',
      category: 'Prompt not provided',
      description: 'No generation prompt provided. Testability analysis requires the original prompt.',
      lineNumber: 1,
      suggestion: 'Provide the prompt used to generate this code for more accurate testability scoring.',
      timestamp: new Date().toISOString(),
    })
    return findings
  }

  const checks = [
    {
      name: 'Dependency injection',
      regex: /inject|dependency|parameter|argument/i,
      weight: 1,
    },
    {
      name: 'Error semantics',
      regex: /error|exception|throw|catch|handle|fail/i,
      weight: 1,
    },
    {
      name: 'Pure functions',
      regex: /pure|side.?effect|immutable|functional/i,
      weight: 1,
    },
    {
      name: 'Edge cases',
      regex: /edge case|boundary|corner case|null|undefined|empty/i,
      weight: 1,
    },
    {
      name: 'Constraints',
      regex: /constraint|limit|maximum|minimum|range|valid/i,
      weight: 1,
    },
  ]

  checks.forEach((check) => {
    if (check.regex.test(prompt)) {
      score += check.weight
    } else {
      findings.push({
        id: `prompt-${check.name}`,
        module: 'prompt',
        moduleName: 'Prompt Testability Score',
        severity: 'Medium',
        category: `Missing: ${check.name}`,
        description: `Prompt does not explicitly mention ${check.name.toLowerCase()}.`,
        lineNumber: 1,
        suggestion: `Improve prompt clarity by explicitly specifying ${check.name.toLowerCase()} requirements.`,
        timestamp: new Date().toISOString(),
      })
    }
  })

  const testabilityPercent = Math.round((score / maxScore) * 100)
  
  findings.unshift({
    id: 'prompt-score',
    module: 'prompt',
    moduleName: 'Prompt Testability Score',
    severity: testabilityPercent >= 80 ? 'Info' : 'Medium',
    category: 'Testability Score',
    description: `Prompt testability score: ${testabilityPercent}%. ${score}/${maxScore} criteria met.`,
    lineNumber: 1,
    suggestion: `Focus on improving prompt clarity for untested criteria. Better prompts lead to more testable code.`,
    timestamp: new Date().toISOString(),
  })

  return findings
}
