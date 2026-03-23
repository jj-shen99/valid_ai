export const differentialRunner = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  // 1. Detect versioned/duplicate implementations (functions with V2, New, Alt, etc.)
  const versionedFuncRegex = /(?:function\s+|const\s+|let\s+|var\s+)(\w+(?:V2|V3|New|Alt|Old|Updated|Improved|Refactored|Legacy|Original|Deprecated))\s*(?:=\s*(?:\(|function)|[\(])/i
  const funcDefs = []
  lines.forEach((line, idx) => {
    const match = line.match(versionedFuncRegex)
    if (match) {
      funcDefs.push({ name: match[1], line: idx + 1, code: line.trim() })
    }
  })
  funcDefs.forEach(fn => {
    findings.push({
      id: `diff-version-${fn.line}`,
      module: 'differential',
      moduleName: 'Differential Runner',
      severity: 'Medium',
      category: 'Versioned function detected',
      description: `"${fn.name}" at line ${fn.line} appears to be a versioned implementation. This should be differentially tested against the original to ensure behavioral equivalence.`,
      lineNumber: fn.line,
      codeSnippet: fn.code,
      suggestion: 'Run both versions with identical inputs (including edge cases: empty, null, large, boundary values) and assert outputs match. Remove the old version once verified.',
      timestamp: new Date().toISOString(),
    })
  })

  // 2. Detect custom implementations of standard algorithms
  const customAlgoPatterns = [
    { regex: /function\s+(\w*(?:sort|Sort)\w*)\s*\(/, name: 'sort', builtin: 'Array.prototype.sort()' },
    { regex: /function\s+(\w*(?:search|Search|binarySearch|linearSearch)\w*)\s*\(/, name: 'search', builtin: 'Array.prototype.find/indexOf' },
    { regex: /function\s+(\w*(?:parse|Parse)(?:JSON|Xml|Csv|Url|Int|Float)\w*)\s*\(/, name: 'parser', builtin: 'JSON.parse / parseInt / parseFloat' },
    { regex: /function\s+(\w*(?:deepClone|deepCopy|clone|copy))\s*\(/i, name: 'deep clone', builtin: 'structuredClone()' },
    { regex: /function\s+(\w*(?:debounce|throttle))\s*\(/i, name: 'rate limiter', builtin: 'lodash.debounce/throttle' },
    { regex: /function\s+(\w*(?:flatten|flat)(?:ten|Array)?)\s*\(/i, name: 'flatten', builtin: 'Array.prototype.flat()' },
  ]
  lines.forEach((line, idx) => {
    customAlgoPatterns.forEach(pat => {
      const match = line.match(pat.regex)
      if (match) {
        findings.push({
          id: `diff-algo-${idx}-${pat.name}`,
          module: 'differential',
          moduleName: 'Differential Runner',
          severity: 'Medium',
          category: `Custom ${pat.name} implementation`,
          description: `Custom "${match[1]}" function at line ${idx + 1} reimplements standard functionality. Differential test against ${pat.builtin} to verify correctness.`,
          lineNumber: idx + 1,
          codeSnippet: line.trim(),
          suggestion: `Compare output of "${match[1]}" against ${pat.builtin} with randomized inputs, empty arrays, single elements, already-sorted data, and large datasets.`,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  // 3. Detect complex regex patterns that should be tested against reference strings
  const complexRegexPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:new\s+RegExp\s*\(\s*(['"`])(.{15,})\2|\/(.{15,})\/[gimsuvy]*)/
  lines.forEach((line, idx) => {
    const match = line.match(complexRegexPattern)
    if (match) {
      const varName = match[1]
      findings.push({
        id: `diff-regex-${idx}`,
        module: 'differential',
        moduleName: 'Differential Runner',
        severity: 'Medium',
        category: 'Complex regex pattern',
        description: `Complex regex "${varName}" at line ${idx + 1} has 15+ characters. Complex patterns are prone to ReDoS, missed edge cases, and engine-specific behavior.`,
        lineNumber: idx + 1,
        codeSnippet: line.trim(),
        suggestion: 'Test against a comprehensive corpus of matching and non-matching strings. Check for catastrophic backtracking with nested quantifiers. Compare behavior across engines.',
        timestamp: new Date().toISOString(),
      })
    }
  })

  // 4. Detect data transformation chains that should produce deterministic results
  const transformChainRegex = /\.(?:map|filter|reduce|flatMap)\s*\([^)]*\)\s*\.(?:map|filter|reduce|flatMap)\s*\(/
  lines.forEach((line, idx) => {
    if (transformChainRegex.test(line)) {
      findings.push({
        id: `diff-chain-${idx}`,
        module: 'differential',
        moduleName: 'Differential Runner',
        severity: 'Medium',
        category: 'Chained data transformation',
        description: `Chained transformation at line ${idx + 1} combines multiple map/filter/reduce operations. Verify intermediate and final results against a known reference dataset.`,
        lineNumber: idx + 1,
        codeSnippet: line.trim().substring(0, 120),
        suggestion: 'Break chain into named intermediate steps for testability. Write snapshot tests with known inputs. Verify order-independence if applicable.',
        timestamp: new Date().toISOString(),
      })
    }
  })

  // 5. Detect functions with the same name defined multiple times (potential conflict)
  const funcNameRegex = /(?:function\s+|(?:const|let|var)\s+)(\w+)\s*(?:=\s*(?:\(|function\s*\()|\()/
  const funcNames = {}
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return
    const match = line.match(funcNameRegex)
    if (match) {
      const name = match[1]
      if (funcNames[name]) {
        funcNames[name].push(idx + 1)
      } else {
        funcNames[name] = [idx + 1]
      }
    }
  })
  Object.entries(funcNames).forEach(([name, lineNums]) => {
    if (lineNums.length > 1) {
      findings.push({
        id: `diff-duplicate-${name}`,
        module: 'differential',
        moduleName: 'Differential Runner',
        severity: 'High',
        category: 'Duplicate function definition',
        description: `Function "${name}" is defined ${lineNums.length} times (lines ${lineNums.join(', ')}). This may cause shadowing, unexpected behavior, or indicate an incomplete refactor.`,
        lineNumber: lineNums[0],
        codeSnippet: `Defined at lines: ${lineNums.join(', ')}`,
        suggestion: `Verify both definitions produce identical results. If they differ, one is likely a bug. Remove the duplicate and ensure all callers reference the correct version.`,
        timestamp: new Date().toISOString(),
      })
    }
  })

  return findings
}
