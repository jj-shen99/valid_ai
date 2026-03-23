export const securityProbe = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'SQL injection via string interpolation',
      regex: /(?:query|sql|SELECT|INSERT|UPDATE|DELETE|WHERE)\s*(?:=|\+=)\s*["`'].*(?:\$\{|\{|\+\s*\w).*["`']|\.(?:query|execute|prepare)\s*\(\s*["`'].*\+|f["`'](?:SELECT|INSERT|UPDATE|DELETE|WHERE)\b/i,
      severity: 'Critical',
      owasp: 'A03:2021 – Injection',
      suggestion: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.',
    },
    {
      name: 'Weak cryptography usage',
      regex: /\bmd5\b|\bsha1\b|\bDES\b|\bRC4\b|crypto\.createCipher\b|hashlib\.md5/,
      severity: 'High',
      owasp: 'A02:2021 – Cryptographic Failures',
      suggestion: 'Use SHA-256+ for hashing, AES-256-GCM for encryption, bcrypt/argon2 for passwords. MD5 and SHA1 are cryptographically broken.',
    },
    {
      name: 'JWT validation gap',
      regex: /jwt\.verify\s*\(\s*\w+\s*,\s*["`']["`']\s*\)|jwt\.decode\s*\(|algorithms?\s*:\s*\[\s*['"]none['"]/i,
      severity: 'Critical',
      owasp: 'A01:2021 – Broken Access Control',
      suggestion: 'Always verify JWT signatures with a strong secret. Never use jwt.decode() for auth — it skips signature verification. Block the "none" algorithm.',
    },
    {
      name: 'Hardcoded credentials',
      regex: /(?:password|api_key|secret|token|auth)\s*[:=]\s*["`'][^"`']{4,}["`']/i,
      severity: 'Critical',
      owasp: 'A05:2021 – Security Misconfiguration',
      suggestion: 'Move credentials to environment variables or a secrets manager. Never commit secrets to source control.',
    },
    {
      name: 'Command injection risk',
      regex: /\bexec\s*\(|\bsystem\s*\(|\beval\s*\(|subprocess\.call\s*\(|child_process|os\.popen/,
      severity: 'Critical',
      owasp: 'A03:2021 – Injection',
      suggestion: 'Avoid exec/eval with user input. Use subprocess with shell=False and argument lists. Sanitize and validate all inputs.',
    },
    {
      name: 'Insecure deserialization',
      regex: /pickle\.loads|yaml\.load\s*\((?!.*Loader)|yaml\.unsafe_load|unserialize\s*\(/,
      severity: 'High',
      owasp: 'A08:2021 – Software and Data Integrity Failures',
      suggestion: 'Use yaml.safe_load() instead of yaml.load(). Avoid pickle for untrusted data — use JSON or protobuf instead.',
    },
    {
      name: 'Cross-site scripting (XSS)',
      regex: /innerHTML\s*=|\.html\s*\(|document\.write\s*\(|dangerouslySetInnerHTML/,
      severity: 'High',
      owasp: 'A03:2021 – Injection',
      suggestion: 'Use textContent instead of innerHTML. Sanitize HTML with DOMPurify. Avoid dangerouslySetInnerHTML unless content is fully trusted.',
    },
    {
      name: 'Open redirect vulnerability',
      regex: /redirect\s*\(\s*(?:req\.|request\.)|\blocation\s*=\s*(?:req|request|params|query)/,
      severity: 'High',
      owasp: 'A01:2021 – Broken Access Control',
      suggestion: 'Validate redirect URLs against an allowlist of trusted domains. Never redirect to user-controlled URLs directly.',
    },
    {
      name: 'Missing HTTPS enforcement',
      regex: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/,
      severity: 'Medium',
      owasp: 'A02:2021 – Cryptographic Failures',
      suggestion: 'Use HTTPS for all external connections to prevent man-in-the-middle attacks. Enforce HSTS headers.',
    },
    {
      name: 'Path traversal risk',
      regex: /\.\.\/|path\.join\s*\(.*(?:req|request|params|query)|readFile\s*\(.*\+/,
      severity: 'High',
      owasp: 'A01:2021 – Broken Access Control',
      suggestion: 'Sanitize file paths and resolve them against a base directory. Reject paths containing ".." sequences.',
    },
    {
      name: 'Disabled security controls',
      regex: /verify\s*[:=]\s*false|rejectUnauthorized\s*[:=]\s*false|CSRF.*disable|cors\(\s*\)/i,
      severity: 'High',
      owasp: 'A05:2021 – Security Misconfiguration',
      suggestion: 'Never disable SSL verification or CSRF protection in production. Configure CORS with specific origins, not wildcard.',
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
          description: `${pattern.name}. OWASP: ${pattern.owasp}`,
          lineNumber: idx + 1,
          suggestion: pattern.suggestion,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return findings
}
