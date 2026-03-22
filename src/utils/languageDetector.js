export const detectLanguage = (code) => {
  const patterns = {
    python: [
      /^\s*def\s+\w+\s*\(/m,
      /^\s*import\s+\w+/m,
      /^\s*from\s+\w+\s+import/m,
      /^\s*class\s+\w+\s*:/m,
      /print\s*\(/,
    ],
    javascript: [
      /function\s+\w+\s*\(/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /import\s+.*\s+from\s+['"`]/,
      /require\s*\(/,
    ],
    typescript: [
      /:\s*(string|number|boolean|any|void|interface|type)\b/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=/,
    ],
    java: [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /import\s+java\./,
      /System\.out\.println/,
    ],
    go: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /import\s*\(/,
    ],
    csharp: [
      /using\s+\w+/,
      /public\s+class\s+\w+/,
      /namespace\s+\w+/,
      /Console\.WriteLine/,
    ],
  }

  const scores = {}
  for (const [lang, patternList] of Object.entries(patterns)) {
    scores[lang] = patternList.filter(p => p.test(code)).length
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'javascript'

  return Object.entries(scores).find(([_, score]) => score === maxScore)[0]
}
