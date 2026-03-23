export const securityProbe = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'SQL injection via string interpolation',
      regex: /query\s*=\s*["`'].*\$\{.*\}.*["`']|f["`'].*\{.*\}.*["`']|query\s*\+=\s*\w+/,
      severity: 'Critical',
      chapter: 'Ch 13',
      owasp: 'A03:2021 – Injection',
    },
    {
      name: 'Weak cryptography usage',
      regex: /md5|sha1|DES|RC4|crypto\.createCipher/,
      severity: 'High',
      chapter: 'Ch 13',
      owasp: 'A02:2021 – Cryptographic Failures',
    },
    {
      name: 'JWT validation gap',
      regex: /jwt\.verify\s*\(\s*\w+\s*,\s*["`']["`']\s*\)|jwt\.decode\s*\(/,
      severity: 'Critical',
      chapter: 'Ch 13',
      owasp: 'A01:2021 – Broken Access Control',
    },
    {
      name: 'Hardcoded credentials',
      regex: /password\s*=\s*["`']|api_key\s*=\s*["`']|secret\s*=\s*["`']/i,
      severity: 'Critical',
      chapter: 'Ch 13',
      owasp: 'A05:2021 – Security Misconfiguration',
    },
    {
      name: 'Command injection risk',
      regex: /exec\s*\(|system\s*\(|eval\s*\(|subprocess\.call\s*\(/,
      severity: 'Critical',
      chapter: 'Ch 13',
      owasp: 'A03:2021 – Injection',
    },
    {
      name: 'Insecure deserialization',
      regex: /pickle\.loads|yaml\.load|json\.loads\s*\(.*\)|eval\s*\(/,
      severity: 'High',
      chapter: 'Ch 13',
      owasp: 'A08:2021 – Software and Data Integrity Failures',
    },
  ]

  lines.forEach((line, idx) => {
    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `sec-${idx}-${pattern.name}`,
          module: 'security',
          moduleName: 'Security Probe',
          severity: pattern.severity,
          category: pattern.name,
          description: `Security vulnerability detected: ${pattern.name}. ${pattern.owasp}`,
          lineNumber: idx + 1,
          suggestion: `Review this code for security implications. Use parameterized queries, secure cryptography, and proper input validation.`,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return findings
}
