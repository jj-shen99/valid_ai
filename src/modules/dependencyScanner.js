/**
 * Dependency Vulnerability Scanner
 *
 * Detects known vulnerable or deprecated dependency patterns
 * in import/require statements and package manifests.
 */

const VULNERABLE_PACKAGES = [
  { name: 'event-stream', severity: 'Critical', cve: 'CVE-2018-16396', desc: 'Compromised package with cryptocurrency-stealing malware.' },
  { name: 'ua-parser-js', severity: 'Critical', cve: 'CVE-2021-27292', desc: 'Hijacked package with cryptominer and password stealer.' },
  { name: 'colors', severity: 'High', cve: 'CVE-2022-0155', desc: 'Sabotaged package prints gibberish to console in protest.' },
  { name: 'faker', severity: 'High', cve: 'N/A', desc: 'Sabotaged package — replaced with empty module by maintainer.' },
  { name: 'node-ipc', severity: 'Critical', cve: 'CVE-2022-23812', desc: 'Protestware that overwrites files on systems with Russian/Belarusian IPs.' },
  { name: 'lodash', severity: 'Info', cve: 'CVE-2021-23337', desc: 'Prototype pollution in older versions. Upgrade to >=4.17.21.' },
  { name: 'moment', severity: 'Info', cve: 'N/A', desc: 'Deprecated — consider day.js or date-fns as lighter alternatives.' },
  { name: 'request', severity: 'Info', cve: 'N/A', desc: 'Deprecated — use fetch, axios, or got instead.' },
  { name: 'left-pad', severity: 'Medium', cve: 'N/A', desc: 'Unmaintained micro-dependency. Use String.prototype.padStart() instead.' },
  { name: 'serialize-javascript', severity: 'High', cve: 'CVE-2020-7660', desc: 'Remote code execution via crafted input in older versions.' },
]

const DEPRECATED_PATTERNS = [
  { pattern: /require\s*\(\s*['"]crypto['"]\s*\)/, name: 'Node crypto without modern API', severity: 'Info', desc: 'Consider using Web Crypto API or sodium-native for new projects.' },
  { pattern: /new\s+Buffer\s*\(/, name: 'Buffer() constructor', severity: 'Medium', desc: 'Buffer() is deprecated. Use Buffer.from(), Buffer.alloc(), or Buffer.allocUnsafe() instead.' },
  { pattern: /require\s*\(\s*['"]fs['"]\s*\)[\s\S]*?(?:readFileSync|writeFileSync)/, name: 'Sync filesystem operations', severity: 'Medium', desc: 'Prefer async fs methods (fs.promises) for non-blocking I/O.' },
]

export const dependencyScanner = (code, language) => {
  const findings = []
  const lines = code.split('\n')
  const seenPackages = new Set()

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return

    // Check for vulnerable package imports
    for (const pkg of VULNERABLE_PACKAGES) {
      const patterns = [
        new RegExp(`require\\s*\\(\\s*['"]${pkg.name}(?:/[^'"]*)?['"]\\s*\\)`),
        new RegExp(`from\\s+['"]${pkg.name}(?:/[^'"]*)?['"]`),
        new RegExp(`import\\s+['"]${pkg.name}(?:/[^'"]*)?['"]`),
        new RegExp(`"${pkg.name}"\\s*:\\s*"`),
      ]

      for (const pattern of patterns) {
        if (pattern.test(line) && !seenPackages.has(pkg.name)) {
          seenPackages.add(pkg.name)
          findings.push({
            id: `dep-${idx}-${pkg.name}`,
            module: 'dependency',
            moduleName: 'Dependency Scanner',
            severity: pkg.severity,
            category: `Vulnerable dependency: ${pkg.name}`,
            description: `${pkg.desc}${pkg.cve !== 'N/A' ? ` (${pkg.cve})` : ''} (line ${idx + 1})`,
            lineNumber: idx + 1,
            codeSnippet: trimmed.substring(0, 120),
            suggestion: `Review and update or replace "${pkg.name}". Check npm audit for specific version vulnerabilities.`,
            timestamp: new Date().toISOString(),
          })
          break
        }
      }
    }

    // Check for deprecated patterns
    for (const dep of DEPRECATED_PATTERNS) {
      if (dep.pattern.test(line) && !seenPackages.has(dep.name)) {
        seenPackages.add(dep.name)
        findings.push({
          id: `dep-${idx}-${dep.name.replace(/\s/g, '-')}`,
          module: 'dependency',
          moduleName: 'Dependency Scanner',
          severity: dep.severity,
          category: dep.name,
          description: `${dep.desc} (line ${idx + 1})`,
          lineNumber: idx + 1,
          codeSnippet: trimmed.substring(0, 120),
          suggestion: dep.desc,
          timestamp: new Date().toISOString(),
        })
      }
    }
  })

  return findings
}

export { VULNERABLE_PACKAGES }
