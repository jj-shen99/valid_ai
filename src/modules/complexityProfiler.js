export const complexityProfiler = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'Nested loops detected',
      regex: /for\s*\(.*\)\s*\{[\s\S]*?for\s*\(/,
      severity: 'Medium',
      description: 'Nested loop creates O(n^2) or worse time complexity, which degrades rapidly with larger inputs.',
      suggestion: 'Refactor using hash maps, sets, or sorting + binary search to reduce to O(n log n) or O(n). Profile before and after.',
    },
    {
      name: 'Unbounded recursion risk',
      regex: /function\s+\w+\s*\([\s\S]*?\)\s*\{[\s\S]*?\w+\s*\(/,
      severity: 'High',
      description: 'Recursive function without visible base case guard. Stack overflow risk with deep recursion.',
      suggestion: 'Add explicit base case checks at function entry. Consider iterative rewrite or tail-call optimization. Add max-depth guards.',
    },
    {
      name: 'Inefficient sort usage',
      regex: /\.sort\s*\(|sorted\s*\(|Collections\.sort/,
      severity: 'Medium',
      description: 'Sort operation adds O(n log n) overhead. May be unnecessary if data is already ordered or if only min/max is needed.',
      suggestion: 'Check if data is pre-sorted. Use a heap or priority queue for top-k queries. Consider insertion sort for nearly-sorted data.',
    },
    {
      name: 'Full table scan pattern',
      regex: /SELECT\s+\*|\.find\s*\(|\.filter\s*\([\s\S]*?\.length/,
      severity: 'High',
      description: 'Unfiltered scan across entire dataset. Scales linearly and blocks on large collections.',
      suggestion: 'Add WHERE clauses, use indexed lookups, or implement pagination. Use .findIndex() for early termination.',
    },
    {
      name: 'Memory accumulation in loop',
      regex: /\w+\s*=\s*\[\][\s\S]*?for\s*\([\s\S]*?\w+\.push|while\s*\([\s\S]*?\w+\s*\+=|\.concat\s*\(/,
      severity: 'Medium',
      description: 'Growing data structure inside a loop may cause excessive memory consumption with large inputs.',
      suggestion: 'Use generators or streams for large datasets. Process in chunks with fixed-size buffers. Consider lazy evaluation.',
    },
    {
      name: 'String concatenation in loop',
      regex: /(?:for|while)\s*[\s\S]*?\+\s*=\s*["`']/,
      severity: 'Medium',
      description: 'String concatenation in a loop creates O(n^2) allocations due to immutable string copies.',
      suggestion: 'Use Array.join() in JS, StringBuilder in Java, or io.StringIO in Python. Collect parts in an array, then join once.',
    },
    {
      name: 'Synchronous blocking call',
      regex: /readFileSync|writeFileSync|execSync|spawnSync|XMLHttpRequest/,
      severity: 'High',
      description: 'Synchronous I/O blocks the event loop, freezing the application until the operation completes.',
      suggestion: 'Use async alternatives (readFile, writeFile, exec) with await/promises. Avoid sync I/O in server or UI code.',
    },
    {
      name: 'Excessive DOM manipulation',
      regex: /(?:getElementById|querySelector|appendChild|removeChild|insertBefore)\s*\(/,
      severity: 'Medium',
      description: 'Frequent DOM operations trigger layout reflows, which are among the most expensive browser operations.',
      suggestion: 'Batch DOM changes using DocumentFragment. Use virtual DOM frameworks (React, Vue). Minimize direct DOM access.',
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
            id: `comp-${idx}-${pattern.name}`,
            module: 'complexity',
            moduleName: 'Complexity Profiler',
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
