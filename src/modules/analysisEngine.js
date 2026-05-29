import { computeChangedLines, filterByChangedLines, getLastCode, setLastCode, hasCodeChanged } from '../utils/diffAnalyzer'
import { failureModeScanner } from './failureMode'
import { securityProbe } from './securityProbe'
import { hallucinationDetector } from './hallucinationDetector'
import { propertyGenerator } from './propertyGenerator'
import { complexityProfiler } from './complexityProfiler'
import { differentialRunner } from './differentialRunner'
import { oracleChecker } from './oracleChecker'
import { mutationScorer } from './mutationScorer'
import { aiReviewAssistant } from './aiReviewAssistant'
import { typescriptAnalyzer } from './typescriptAnalyzer'
import { customRulesRunner } from './customRules'
import { accessibilityAnalyzer } from './accessibilityAnalyzer'
import { dependencyScanner } from './dependencyScanner'
import { runWithTiming } from '../utils/perfTracker'

const MODULE_REGISTRY = {
  failureMode: failureModeScanner,
  security: securityProbe,
  hallucination: hallucinationDetector,
  property: propertyGenerator,
  complexity: complexityProfiler,
  differential: differentialRunner,
  oracle: oracleChecker,
  mutation: mutationScorer,
  typescript: typescriptAnalyzer,
  customRules: customRulesRunner,
  accessibility: accessibilityAnalyzer,
  dependency: dependencyScanner,
  aiReview: aiReviewAssistant,
}

// ─── Web Worker pool ───
let worker = null
let jobId = 0
const pending = new Map()

function getWorker() {
  if (!worker) {
    try {
      worker = new Worker(
        new URL('../workers/analysisWorker.js', import.meta.url),
        { type: 'module' }
      )
      worker.onmessage = (e) => {
        const { id, findings } = e.data
        const resolver = pending.get(id)
        if (resolver) {
          resolver(findings)
          pending.delete(id)
        }
      }
      worker.onerror = (err) => {
        console.warn('[Worker] error, falling back to main thread', err)
        worker = null
        // Reject all pending jobs so they fall back
        for (const [id, resolver] of pending) {
          resolver(null)
          pending.delete(id)
        }
      }
    } catch {
      worker = null
    }
  }
  return worker
}

function runOnWorker(code, language, modules) {
  return new Promise((resolve) => {
    const w = getWorker()
    if (!w) { resolve(null); return }
    const id = ++jobId
    pending.set(id, resolve)
    w.postMessage({ id, code, language, modules })
    // Timeout safety: resolve null after 30s
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id)
        resolve(null)
      }
    }, 30000)
  })
}

function runOnMainThread(code, language, modules) {
  const findings = []
  for (const moduleName of modules) {
    const moduleFunc = MODULE_REGISTRY[moduleName]
    if (moduleFunc) {
      try {
        findings.push(...moduleFunc(code, language))
      } catch (error) {
        console.error(`Error in module ${moduleName}:`, error)
      }
    }
  }
  return findings
}

export const runAnalysis = async (code, language, selectedModules, prompt = '', apiKey = '', { incremental = false } = {}) => {
  const syncModules = selectedModules.filter(m => m !== 'aiReview')
  const hasAI = selectedModules.includes('aiReview')

  // Incremental diff: compute changed lines vs previous submission
  let changedLines = null
  if (incremental) {
    const prev = getLastCode(language)
    if (prev && !hasCodeChanged(language, code)) {
      // Code is identical to previous run — return empty
      return []
    }
    changedLines = computeChangedLines(prev, code)
  }

  // Run sync modules on Web Worker (falls back to main thread)
  let findings = []
  if (syncModules.length > 0) {
    const workerResult = await runOnWorker(code, language, syncModules)
    findings = workerResult != null ? workerResult : runOnMainThread(code, language, syncModules)
  }

  // AI Review stays on main thread (network-bound)
  if (hasAI) {
    try {
      const aiFindings = await aiReviewAssistant(code, language, apiKey)
      findings.push(...aiFindings)
    } catch (error) {
      console.error('Error in module aiReview:', error)
    }
  }

  // Filter to changed lines when in incremental mode
  if (incremental && changedLines) {
    findings = filterByChangedLines(findings, changedLines)
  }

  // Cache current code for future diffs
  setLastCode(language, code)

  return findings.sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

// Timed variant: returns { findings, timings, totalDuration }
export const runAnalysisTimed = async (code, language, selectedModules, prompt = '', apiKey = '') => {
  const syncModules = selectedModules.filter(m => m !== 'aiReview')
  const hasAI = selectedModules.includes('aiReview')

  const { findings, timings, totalDuration } = await runWithTiming(
    syncModules, MODULE_REGISTRY, code, language
  )

  if (hasAI) {
    const start = performance.now()
    try {
      const aiFindings = await aiReviewAssistant(code, language, apiKey)
      findings.push(...aiFindings)
      timings.aiReview = { duration: Math.round((performance.now() - start) * 100) / 100, findingCount: aiFindings.length }
    } catch (error) {
      timings.aiReview = { duration: Math.round((performance.now() - start) * 100) / 100, error: error.message }
    }
  }

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return { findings, timings, totalDuration }
}

export const getModuleInfo = (moduleName) => {
  const info = {
    failureMode: {
      name: 'Failure Mode Scanner',
      icon: '🔍',
      description: 'Detects AI-characteristic bugs: off-by-one errors, silent exceptions, unbounded loops, type coercion, magic numbers, and implicit globals.',
      estimatedTime: '~5s',
    },
    security: {
      name: 'Security Probe',
      icon: '🔒',
      description: 'Scans for OWASP Top 10 vulnerabilities: SQL injection, XSS, hardcoded credentials, weak crypto, path traversal, and disabled security controls.',
      estimatedTime: '~5s',
    },
    hallucination: {
      name: 'Hallucination Detector',
      icon: '👻',
      description: 'Cross-references method calls against known APIs to detect non-existent or hallucinated function calls generated by AI.',
      estimatedTime: '~5s',
    },
    property: {
      name: 'Property Generator',
      icon: '🎯',
      description: 'Analyzes function signatures for testability: detects pure functions, high parameter counts, and suggests property-based test strategies.',
      estimatedTime: '~3s',
    },
    complexity: {
      name: 'Complexity Profiler',
      icon: '📊',
      description: 'Identifies performance risks: nested loops, sync blocking, excessive DOM manipulation, string concatenation in loops, and memory leaks.',
      estimatedTime: '~5s',
    },
    differential: {
      name: 'Differential Runner',
      icon: '⚖️',
      description: 'Identifies differential testing candidates: versioned functions, algorithm re-implementations, data transformations, and regex patterns.',
      estimatedTime: '~3s',
    },
    oracle: {
      name: 'Oracle Checker',
      icon: '📋',
      description: 'Validates code contracts: missing input validation, inconsistent return types, unvalidated API responses, and missing error contracts.',
      estimatedTime: '~5s',
    },
    mutation: {
      name: 'Mutation Scorer',
      icon: '🧬',
      description: 'Scores mutation testing susceptibility: boundary operators, boolean negation targets, return value mutations, and conditional branches.',
      estimatedTime: '~5s',
    },

    typescript: {
      name: 'TypeScript Analyzer',
      icon: '🔷',
      description: 'Detects TS-specific anti-patterns: any abuse, missing return types, unsafe assertions, @ts-ignore suppression, and non-null assertion overuse.',
      estimatedTime: '~3s',
    },
    accessibility: {
      name: 'Accessibility Analyzer',
      icon: '♿',
      description: 'Detects a11y issues: missing alt text, empty links, form labels, keyboard accessibility, ARIA misuse, and color-only indicators.',
      estimatedTime: '~2s',
    },
    dependency: {
      name: 'Dependency Scanner',
      icon: '📦',
      description: 'Detects vulnerable, deprecated, or compromised package imports and dependency patterns in code.',
      estimatedTime: '~1s',
    },
    customRules: {
      name: 'Custom Rules',
      icon: '📝',
      description: 'User-defined regex-based rules configured in Settings. Create custom patterns to enforce team coding standards.',
      estimatedTime: '~1s',
    },
    aiReview: {
      name: 'AI Review Assistant',
      icon: '🤖',
      description: 'Claude-powered code review targeting AI anti-patterns: omniscient functions, cargo-cult patterns, leaky abstractions, and naming issues.',
      estimatedTime: '~15s',
    },
  }
  return info[moduleName]
}
