export const failureModeScanner = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'Off-by-one boundary error',
      regex: /for\s*\(\s*(?:let|var|int)\s+\w+\s*=\s*0\s*;\s*\w+\s*[<>]=\s*\w+\.(?:length|size|count)\s*;/,
      severity: 'High',
      description: 'Loop boundary uses <= with .length, causing potential off-by-one access beyond array bounds.',
      suggestion: 'Use strict < comparison with .length. Off-by-one errors are the #1 AI-generated boundary bug.',
    },
    {
      name: 'Missing null/undefined check',
      regex: /(?<!\?\.)(\w+)\.(\w+)\s*(?:\(|=(?!=))/,
      severity: 'High',
      description: 'Property access or assignment without null/undefined guard. AI-generated code often skips defensive checks.',
      suggestion: 'Add optional chaining (?.) or explicit null checks before property access. Consider using TypeScript strict mode.',
    },
    {
      name: 'Silent exception swallowing',
      regex: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/,
      severity: 'Critical',
      description: 'Empty catch block silently swallows errors, hiding failures and making debugging impossible.',
      suggestion: 'At minimum, log the error. Better: re-throw, return an error type, or handle the specific exception class.',
    },
    {
      name: 'Unbounded loop',
      regex: /while\s*\(\s*true\s*\)|while\s*\(\s*1\s*\)|for\s*\(\s*;\s*;\s*\)/,
      severity: 'High',
      description: 'Infinite loop without visible termination condition. AI often generates these without proper break guards.',
      suggestion: 'Add an explicit iteration limit, timeout, or watchdog. Use a bounded loop with a max iteration count.',
    },
    {
      name: 'Type coercion issue',
      regex: /[^!=]==[^=]/,
      severity: 'Medium',
      description: 'Loose equality (==) can produce unexpected results due to JavaScript type coercion rules.',
      suggestion: 'Use strict equality (===) to avoid implicit type conversion. This prevents subtle comparison bugs.',
    },
    {
      name: 'Floating point comparison',
      regex: /(?:===?|!==?)\s*(?:\d+\.\d+|parseFloat|toFixed)/,
      severity: 'Medium',
      description: 'Direct floating-point comparison can fail due to IEEE 754 precision issues.',
      suggestion: 'Use an epsilon-based comparison (Math.abs(a - b) < epsilon) or a library like decimal.js for precise arithmetic.',
    },
    {
      name: 'Unreachable code after return',
      regex: /return\s+[^;]+;\s*\n\s*(?!}|\s*$)\w/,
      severity: 'Medium',
      description: 'Code appears after a return statement and will never execute.',
      suggestion: 'Remove dead code after the return statement or restructure the control flow.',
    },
    {
      name: 'Magic number',
      regex: /(?:if|while|for|return|===?|!==?|[+\-*/])\s*(?:(?<!\w)(?:[2-9]\d{2,}|1\d{3,})(?!\w))/,
      severity: 'Info',
      description: 'Unexplained numeric literal detected. Magic numbers reduce code readability and maintainability.',
      suggestion: 'Extract magic numbers into named constants with descriptive names (e.g., MAX_RETRIES, TIMEOUT_MS).',
    },
    {
      name: 'Implicit global variable',
      regex: /^\s+(\w+)\s*=\s*(?!.*(?:const|let|var|function|class|import))/,
      severity: 'High',
      description: 'Variable assignment without declaration keyword may create an implicit global variable.',
      suggestion: 'Always declare variables with const, let, or var. Enable strict mode to catch accidental globals.',
    },
  ]

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `fm-${idx}-${pattern.name}`,
          module: 'failureMode',
          moduleName: 'Failure Mode Scanner',
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

  return findings
}
