/**
 * Quality Gate
 *
 * Configurable severity thresholds that determine pass/fail/warn
 * for analysis runs. Used for CI/CD gates and visual indicators.
 */

const STORAGE_KEY = 'validai_quality_gate'

const DEFAULT_THRESHOLDS = {
  minScore: 70,
  maxCritical: 0,
  maxHigh: 3,
  maxMedium: 10,
  maxTotal: 20,
}

export function getThresholds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) } : { ...DEFAULT_THRESHOLDS }
  } catch {
    return { ...DEFAULT_THRESHOLDS }
  }
}

export function saveThresholds(thresholds) {
  const merged = { ...DEFAULT_THRESHOLDS, ...thresholds }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  return merged
}

export function resetThresholds() {
  localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_THRESHOLDS }
}

export function evaluateGate(findings, score, thresholds) {
  const config = thresholds || getThresholds()
  const counts = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Info: 0,
  }

  findings.forEach(f => {
    if (counts[f.severity] !== undefined) counts[f.severity]++
  })

  const violations = []

  if (score < config.minScore) {
    violations.push({
      rule: 'minScore',
      message: `Score ${score}% is below minimum ${config.minScore}%`,
      actual: score,
      threshold: config.minScore,
    })
  }

  if (counts.Critical > config.maxCritical) {
    violations.push({
      rule: 'maxCritical',
      message: `${counts.Critical} critical issues exceed limit of ${config.maxCritical}`,
      actual: counts.Critical,
      threshold: config.maxCritical,
    })
  }

  if (counts.High > config.maxHigh) {
    violations.push({
      rule: 'maxHigh',
      message: `${counts.High} high issues exceed limit of ${config.maxHigh}`,
      actual: counts.High,
      threshold: config.maxHigh,
    })
  }

  if (counts.Medium > config.maxMedium) {
    violations.push({
      rule: 'maxMedium',
      message: `${counts.Medium} medium issues exceed limit of ${config.maxMedium}`,
      actual: counts.Medium,
      threshold: config.maxMedium,
    })
  }

  const actionable = findings.filter(f => f.severity !== 'Info').length
  if (actionable > config.maxTotal) {
    violations.push({
      rule: 'maxTotal',
      message: `${actionable} total findings exceed limit of ${config.maxTotal}`,
      actual: actionable,
      threshold: config.maxTotal,
    })
  }

  const hasCriticalViolation = violations.some(v => v.rule === 'maxCritical' || v.rule === 'minScore')

  return {
    status: violations.length === 0 ? 'pass' : hasCriticalViolation ? 'fail' : 'warn',
    violations,
    counts,
    score,
    thresholds: config,
  }
}

export function formatGateResult(result) {
  const icon = result.status === 'pass' ? '\u2705' : result.status === 'fail' ? '\u274c' : '\u26a0\ufe0f'
  const lines = [`${icon} Quality Gate: **${result.status.toUpperCase()}**`, '']

  if (result.violations.length > 0) {
    result.violations.forEach(v => {
      lines.push(`- ${v.message}`)
    })
  } else {
    lines.push('All thresholds met.')
  }

  return lines.join('\n')
}

export { DEFAULT_THRESHOLDS }
