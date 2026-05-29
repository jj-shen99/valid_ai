/**
 * Custom Rules Engine
 *
 * Runs user-defined regex-based rules alongside built-in modules.
 * Rules are stored in localStorage and managed via the Settings page.
 */

const STORAGE_KEY = 'validai_custom_rules'

export function getCustomRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCustomRules(rules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

let _ruleCounter = 0
export function addCustomRule(rule) {
  const rules = getCustomRules()
  rules.push({ ...rule, id: `custom-${Date.now()}-${++_ruleCounter}`, enabled: true })
  saveCustomRules(rules)
  return rules
}

export function removeCustomRule(ruleId) {
  const rules = getCustomRules().filter(r => r.id !== ruleId)
  saveCustomRules(rules)
  return rules
}

export function toggleCustomRule(ruleId) {
  const rules = getCustomRules().map(r =>
    r.id === ruleId ? { ...r, enabled: !r.enabled } : r
  )
  saveCustomRules(rules)
  return rules
}

export const customRulesRunner = (code, _language) => {
  const rules = getCustomRules().filter(r => r.enabled)
  if (rules.length === 0) return []

  const findings = []
  const lines = code.split('\n')

  rules.forEach(rule => {
    let regex
    try {
      regex = new RegExp(rule.pattern, rule.flags || 'i')
    } catch {
      return
    }

    let found = false
    lines.forEach((line, idx) => {
      if (found) return
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) return

      if (regex.test(line)) {
        found = true
        findings.push({
          id: `${rule.id}-${idx}`,
          module: 'customRules',
          moduleName: 'Custom Rule',
          severity: rule.severity || 'Medium',
          category: rule.name || 'Custom Rule',
          description: `${rule.message || 'Custom rule matched'} (line ${idx + 1})`,
          lineNumber: idx + 1,
          codeSnippet: trimmed.substring(0, 120),
          suggestion: rule.suggestion || '',
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return findings
}
