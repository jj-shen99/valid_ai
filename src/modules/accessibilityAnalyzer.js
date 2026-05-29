/**
 * Accessibility Analyzer Module
 *
 * Detects common a11y issues in HTML/JSX code:
 * missing alt text, empty links, missing labels, ARIA misuse,
 * color contrast concerns, keyboard accessibility, etc.
 */

export const accessibilityAnalyzer = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const patterns = [
    {
      name: 'Missing alt attribute',
      regex: /<img\s+(?![^>]*\balt\b)[^>]*>/i,
      severity: 'High',
      description: 'Image element without alt attribute. Screen readers cannot describe the image to visually impaired users.',
      suggestion: 'Add a descriptive alt attribute: <img alt="description" />. Use alt="" for decorative images.',
    },
    {
      name: 'Empty link text',
      regex: /<a\s[^>]*>\s*<\/a>/i,
      severity: 'High',
      description: 'Anchor element with no text content. Screen readers will announce this as an empty link.',
      suggestion: 'Add descriptive text inside the link, or use aria-label for icon-only links.',
    },
    {
      name: 'Missing form label',
      regex: /<input\s+(?![^>]*\baria-label\b)(?![^>]*\baria-labelledby\b)(?![^>]*\bid\b)[^>]*>/i,
      severity: 'Medium',
      description: 'Form input without an associated label, aria-label, or aria-labelledby.',
      suggestion: 'Add a <label> element with a matching for/id pair, or add aria-label to the input.',
    },
    {
      name: 'Click handler without keyboard',
      regex: /onClick\s*=\s*\{(?![^}]*onKeyDown|onKeyPress|onKeyUp)/,
      severity: 'Medium',
      description: 'Element has onClick but no keyboard event handler. Keyboard-only users cannot activate this element.',
      suggestion: 'Add onKeyDown handler and ensure the element is focusable (tabIndex={0} or use a <button>).',
    },
    {
      name: 'Non-semantic div/span button',
      regex: /<(?:div|span)\s[^>]*onClick/i,
      severity: 'Medium',
      description: 'Using div/span with onClick instead of a semantic button element. Missing keyboard and screen reader support.',
      suggestion: 'Replace with <button> for clickable elements. Buttons provide built-in keyboard handling and ARIA semantics.',
    },
    {
      name: 'Missing lang attribute',
      regex: /<html\s+(?![^>]*\blang\b)[^>]*>/i,
      severity: 'Medium',
      description: 'HTML element missing lang attribute. Screen readers need this to select the correct pronunciation.',
      suggestion: 'Add lang attribute: <html lang="en">. Use the appropriate BCP 47 language tag.',
    },
    {
      name: 'Autofocus attribute',
      regex: /\bautoFocus\b|\bautofocus\b/i,
      severity: 'Info',
      description: 'autofocus can disorient screen reader users by moving focus unexpectedly on page load.',
      suggestion: 'Avoid autofocus in most cases. If needed, ensure it is the logical first interactive element.',
    },
    {
      name: 'Positive tabIndex',
      regex: /tabIndex\s*=\s*\{?\s*[1-9]/,
      severity: 'Medium',
      description: 'Positive tabIndex values create a confusing tab order that overrides natural document flow.',
      suggestion: 'Use tabIndex={0} to add to natural tab order, or tabIndex={-1} for programmatic focus only.',
    },
    {
      name: 'Missing ARIA role on custom widget',
      regex: /<div\s+(?=[^>]*(?:onClick|onKeyDown))(?![^>]*\brole\b)[^>]*>/i,
      severity: 'Medium',
      description: 'Interactive div without an ARIA role. Assistive technology cannot determine its purpose.',
      suggestion: 'Add an appropriate role (e.g., role="button", role="dialog") or use semantic HTML elements.',
    },
    {
      name: 'Color-only indicator',
      regex: /(?:color|background(?:-color)?)\s*:\s*(?:red|green|#[0-9a-f]{3,8})\b.*(?:error|success|warning|status)/i,
      severity: 'Info',
      description: 'Information conveyed by color alone. Users with color vision deficiency may miss the meaning.',
      suggestion: 'Add text labels, icons, or patterns alongside color to convey status. Never use color as the only indicator.',
    },
  ]

  const seenPatterns = {}

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('#')) return

    patterns.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        const key = pattern.name
        if (!seenPatterns[key]) {
          seenPatterns[key] = true
          findings.push({
            id: `a11y-${idx}-${key.replace(/\s/g, '-')}`,
            module: 'accessibility',
            moduleName: 'Accessibility Analyzer',
            severity: pattern.severity,
            category: key,
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
