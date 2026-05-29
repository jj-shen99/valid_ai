/**
 * TypeScript-Aware Analyzer
 *
 * Detects TS-specific anti-patterns that the generic modules miss:
 * - `any` type abuse
 * - Missing return types on exported/public functions
 * - Unsafe type assertions (`as any`, `as unknown as X`)
 * - Non-null assertions (`!.`) overuse
 * - Implicit `any` from missing parameter types
 * - `@ts-ignore` / `@ts-nocheck` suppression abuse
 */

export const typescriptAnalyzer = (code, language) => {
  if (language !== 'typescript' && language !== 'tsx') return []

  const findings = []
  const lines = code.split('\n')
  const seenPatterns = {}

  const patterns = [
    {
      name: 'Explicit any type',
      regex: /:\s*any\b(?!\s*\[)(?!\s*=>)/,
      severity: 'Medium',
      description: 'Explicit `any` type annotation defeats TypeScript\'s type safety.',
      suggestion: 'Replace `any` with a specific type, `unknown` for truly dynamic values, or a generic parameter.',
      autoFix: { pattern: /:\s*any\b/, replace: ': unknown' },
    },
    {
      name: 'Unsafe as-any assertion',
      regex: /\bas\s+any\b/,
      severity: 'High',
      description: 'Casting to `any` bypasses all type checking and can mask runtime errors.',
      suggestion: 'Use `as unknown as TargetType` if a cast is truly necessary, or fix the upstream type.',
      autoFix: { pattern: /as\s+any/, replace: 'as unknown' },
    },
    {
      name: 'Double assertion (as unknown as)',
      regex: /as\s+unknown\s+as\s+\w/,
      severity: 'Medium',
      description: 'Double assertion (`as unknown as X`) is a code smell indicating a type mismatch that should be resolved.',
      suggestion: 'Investigate why the types don\'t align. Use type guards, generics, or refactor the data flow.',
    },
    {
      name: 'Non-null assertion overuse',
      regex: /\w+!\.|\w+!\[|\w+!\(/,
      severity: 'Medium',
      description: 'Non-null assertion operator (`!`) suppresses null checks without runtime safety.',
      suggestion: 'Use optional chaining (`?.`) or add an explicit null check to handle the undefined case safely.',
      autoFix: { pattern: /(\w+)!([\.\[\(])/, replace: '$1?$2' },
    },
    {
      name: '@ts-ignore suppression',
      regex: /@ts-ignore|@ts-nocheck/,
      severity: 'High',
      description: 'TypeScript error suppression hides type errors that may indicate real bugs.',
      suggestion: 'Fix the underlying type error instead of suppressing it. Use `@ts-expect-error` only for documented edge cases.',
    },
    {
      name: 'Untyped function parameter',
      regex: /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:function|\())\s*\((?:[^)]*,\s*)?\w+\s*[,)]/,
      severity: 'Medium',
      description: 'Function parameter without type annotation will be implicitly `any`.',
      suggestion: 'Add explicit type annotations to all function parameters for better type safety and IDE support.',
      guard: (line) => !/:/.test(line.split('(')[1] || ''),
    },
    {
      name: 'Missing return type on export',
      regex: /^export\s+(?:default\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{/,
      severity: 'Medium',
      description: 'Exported function lacks a return type annotation, making the public API contract unclear.',
      suggestion: 'Add an explicit return type annotation to exported functions (e.g., `: Promise<Result>`).',
      guard: (line) => !line.includes('):'),
    },
    {
      name: 'Type assertion in JSX',
      regex: /<\w+.*\{.*\bas\s+\w+.*\}/,
      severity: 'Medium',
      description: 'Type assertion inside JSX expression may mask rendering bugs.',
      suggestion: 'Move the assertion out of JSX into a typed variable, or use a type guard function.',
    },
  ]

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return

    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        if (pattern.guard && !pattern.guard(line)) return
        const key = pattern.name
        if (!seenPatterns[key]) {
          seenPatterns[key] = true
          const finding = {
            id: `ts-${idx}-${key.replace(/\s/g, '-')}`,
            module: 'typescript',
            moduleName: 'TypeScript Analyzer',
            severity: pattern.severity,
            category: pattern.name,
            description: `${pattern.description} (line ${idx + 1})`,
            lineNumber: idx + 1,
            codeSnippet: trimmed.substring(0, 120),
            suggestion: pattern.suggestion,
            timestamp: new Date().toISOString(),
          }
          if (pattern.autoFix) {
            const match = pattern.autoFix.pattern.exec(line)
            if (match) {
              finding.autoFix = {
                replace: match[0],
                with: match[0].replace(pattern.autoFix.pattern, pattern.autoFix.replace),
                line: idx + 1,
              }
            }
          }
          findings.push(finding)
        }
      }
    })
  })

  return findings
}
