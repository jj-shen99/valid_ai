export const aiReviewAssistant = async (code, language, apiKey) => {
  const findings = []

  if (!apiKey) {
    findings.push({
      id: 'ai-review-no-key',
      module: 'aiReview',
      moduleName: 'AI Review Assistant',
      severity: 'Info',
      category: 'API key required',
      description: 'AI Review Assistant requires a Claude API key to function.',
      lineNumber: 1,
      suggestion: 'Add your Claude API key in Settings to enable AI-powered code review.',
      chapterLink: 'Ch 11',
      timestamp: new Date().toISOString(),
    })
    return findings
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Review this ${language} code for AI-generated anti-patterns and issues. Focus on: omniscient functions, cargo-cult design patterns, leaky abstractions, and inconsistent naming. Return findings as JSON array with fields: severity (Critical/High/Medium/Info), title, explanation, fix.

Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON array, no other text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      findings.push({
        id: 'ai-review-error',
        module: 'aiReview',
        moduleName: 'AI Review Assistant',
        severity: 'Info',
        category: 'API error',
        description: 'Could not reach Claude API. Check your API key and internet connection.',
        lineNumber: 1,
        suggestion: 'Verify your API key is valid and has sufficient quota.',
        chapterLink: 'Ch 11',
        timestamp: new Date().toISOString(),
      })
      return findings
    }

    const data = await response.json()
    const content = data.content[0].text

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed.map((f, idx) => ({
          id: `ai-review-${idx}`,
          module: 'aiReview',
          moduleName: 'AI Review Assistant',
          severity: f.severity || 'Info',
          category: f.title || 'AI Finding',
          description: f.explanation || '',
          lineNumber: 1,
          suggestion: f.fix || 'Review the code and apply the suggested fix.',
          chapterLink: 'Ch 11',
          timestamp: new Date().toISOString(),
        }))
      }
    } catch (e) {
      findings.push({
        id: 'ai-review-parse',
        module: 'aiReview',
        moduleName: 'AI Review Assistant',
        severity: 'Info',
        category: 'Response parsing',
        description: 'AI response could not be parsed. Manual review recommended.',
        lineNumber: 1,
        suggestion: 'Check the raw API response or try again.',
        chapterLink: 'Ch 11',
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    findings.push({
      id: 'ai-review-exception',
      module: 'aiReview',
      moduleName: 'AI Review Assistant',
      severity: 'Info',
      category: 'Network error',
      description: `Error calling Claude API: ${error.message}`,
      lineNumber: 1,
      suggestion: 'Check your internet connection and API key.',
      chapterLink: 'Ch 11',
      timestamp: new Date().toISOString(),
    })
  }

  return findings
}
