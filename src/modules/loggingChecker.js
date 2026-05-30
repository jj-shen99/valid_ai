/**
 * Logging & Observability Checker
 *
 * Detects missing error logging, console.log in production,
 * PII in logs, and missing structured logging metadata.
 */

const PII_PATTERNS = [
  'password', 'passwd', 'secret', 'token', 'apiKey', 'api_key',
  'ssn', 'creditCard', 'credit_card', 'cardNumber', 'card_number',
  'socialSecurity', 'social_security', 'dob', 'dateOfBirth',
]

const PATTERNS = [
  {
    name: 'console.log in production code',
    severity: 'Medium',
    pattern: /console\.log\s*\(/,
    check: (match, allCode, lineIdx, lines) => !lines[lineIdx].trim().startsWith('//'),
    description: 'console.log should not be in production code — use a proper logging library.',
    suggestion: 'Replace with a structured logger (e.g., winston, pino) or remove debug logging.',
  },
  {
    name: 'PII in log statement',
    severity: 'Critical',
    pattern: /console\.\w+\s*\([^)]*(?:password|passwd|secret|token|apiKey|api_key|ssn|creditCard|credit_card|cardNumber|card_number|socialSecurity|social_security)/i,
    description: 'Potentially sensitive data (PII/secrets) being logged — this is a security and compliance risk.',
    suggestion: 'Remove PII from log statements or mask sensitive fields before logging.',
  },
  {
    name: 'Missing error logging in catch',
    severity: 'High',
    pattern: /catch\s*\(\s*(\w+)\s*\)\s*\{/,
    check: (match, allCode, lineIdx, lines) => {
      const errVar = match[1]
      // Check if the error is logged in the catch block
      for (let i = lineIdx + 1; i < Math.min(lineIdx + 10, lines.length); i++) {
        const l = lines[i].trim()
        if (l === '}') return true // End of catch without logging
        if (l.includes(`console.`) || l.includes(`log.`) || l.includes(`logger.`) || l.includes(`logging.`)) return false
        if (new RegExp(`\\b${errVar}\\b`).test(l)) return false // Error variable is used
      }
      return false
    },
    description: 'Catch block does not log the error — failures will be invisible in production.',
    suggestion: 'Add error logging: console.error(err) or logger.error({ err }, "operation failed").',
  },
  {
    name: 'String concatenation in log',
    severity: 'Info',
    pattern: /console\.\w+\s*\(\s*['"`][^'"`]*['"`]\s*\+/,
    description: 'String concatenation in log statements — use template literals or structured logging.',
    suggestion: 'Use template literals: console.error(`Failed: ${err.message}`) or structured logging.',
  },
  {
    name: 'Missing log level differentiation',
    severity: 'Medium',
    pattern: /console\.log\s*\(\s*['"`](?:error|fail|warn|critical)/i,
    description: 'Error/warning message logged with console.log instead of appropriate log level.',
    suggestion: 'Use console.error() for errors, console.warn() for warnings instead of console.log().',
  },
  {
    name: 'Verbose debug logging left in',
    severity: 'Info',
    pattern: /console\.(?:log|debug)\s*\(\s*['"`](?:debug|DEBUG|entering|exiting|here|test|TODO|FIXME|XXX)/,
    description: 'Debug/trace logging left in code — likely should be removed before production.',
    suggestion: 'Remove debug logging or gate behind a DEBUG environment variable.',
  },
  {
    name: 'Large object logged directly',
    severity: 'Medium',
    pattern: /console\.\w+\s*\(\s*(?:JSON\.stringify\s*\(\s*)?(?:req|request|response|res|body|data|state|props|config)\s*\)/,
    description: 'Logging entire objects may expose sensitive data and create performance issues.',
    suggestion: 'Log specific fields: logger.info({ userId: req.user.id, path: req.path }).',
  },
  {
    name: 'Missing request correlation ID',
    severity: 'Info',
    pattern: /(?:app|router|server)\s*\.(?:get|post|put|delete|patch|use)\s*\(/,
    check: (line, allCode) => {
      return !allCode.includes('correlationId') && !allCode.includes('requestId') && !allCode.includes('traceId') && !allCode.includes('x-request-id')
    },
    description: 'HTTP handlers without request correlation IDs — makes distributed tracing difficult.',
    suggestion: 'Add correlation/request ID middleware for distributed tracing.',
  },
]

export const loggingChecker = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seen = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return

    for (const rule of PATTERNS) {
      const match = line.match(rule.pattern)
      if (!match) continue
      if (rule.check && !rule.check(match, code, idx, lines)) continue

      const key = `${rule.name}-${idx}`
      if (seen.has(key)) continue
      seen.add(key)

      findings.push({
        id: `log-${idx}-${findings.length}`,
        module: 'logging',
        moduleName: 'Logging Checker',
        severity: rule.severity,
        category: rule.name,
        description: `${rule.description} (line ${idx + 1})`,
        lineNumber: idx + 1,
        codeSnippet: trimmed.substring(0, 120),
        suggestion: rule.suggestion,
        timestamp: new Date().toISOString(),
      })
    }
  })

  return findings
}
