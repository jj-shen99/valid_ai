import { failureModeScanner } from './failureMode'
import { securityProbe } from './securityProbe'
import { hallucinationDetector } from './hallucinationDetector'
import { propertyGenerator } from './propertyGenerator'
import { complexityProfiler } from './complexityProfiler'
import { differentialRunner } from './differentialRunner'
import { oracleChecker } from './oracleChecker'
import { mutationScorer } from './mutationScorer'
import { promptTestabilityScore } from './promptTestability'
import { aiReviewAssistant } from './aiReviewAssistant'

const MODULE_REGISTRY = {
  failureMode: failureModeScanner,
  security: securityProbe,
  hallucination: hallucinationDetector,
  property: propertyGenerator,
  complexity: complexityProfiler,
  differential: differentialRunner,
  oracle: oracleChecker,
  mutation: mutationScorer,
  prompt: promptTestabilityScore,
  aiReview: aiReviewAssistant,
}

export const runAnalysis = async (code, language, selectedModules, prompt = '', apiKey = '') => {
  const findings = []

  for (const moduleName of selectedModules) {
    const moduleFunc = MODULE_REGISTRY[moduleName]
    if (moduleFunc) {
      try {
        let moduleFindings
        if (moduleName === 'prompt') {
          moduleFindings = moduleFunc(code, prompt)
        } else if (moduleName === 'aiReview') {
          moduleFindings = await moduleFunc(code, language, apiKey)
        } else {
          moduleFindings = moduleFunc(code, language)
        }
        findings.push(...moduleFindings)
      } catch (error) {
        console.error(`Error in module ${moduleName}:`, error)
      }
    }
  }

  return findings.sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

export const getModuleInfo = (moduleName) => {
  const info = {
    failureMode: {
      name: 'Failure Mode Scanner',
      icon: '🔍',
      chapter: 'Ch 3',
      description: 'Identifies AI-characteristic bugs: off-by-one boundaries, semantic drift, silent exception swallowing, and missing edge case branches.',
      estimatedTime: '~30s',
    },
    security: {
      name: 'Security Probe',
      icon: '🔒',
      chapter: 'Ch 13',
      description: 'Scans for vulnerabilities AI consistently generates: SQL injection, weak cryptography, JWT validation gaps, and session management flaws.',
      estimatedTime: '~45s',
    },
    hallucination: {
      name: 'Hallucination Detector',
      icon: '👻',
      chapter: 'Ch 2',
      description: 'Extracts all method and function calls and cross-references them against published package documentation.',
      estimatedTime: '~60s',
    },
  }
  return info[moduleName]
}
