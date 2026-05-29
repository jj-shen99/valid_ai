import { failureModeScanner } from '../modules/failureMode'
import { securityProbe } from '../modules/securityProbe'
import { hallucinationDetector } from '../modules/hallucinationDetector'
import { propertyGenerator } from '../modules/propertyGenerator'
import { complexityProfiler } from '../modules/complexityProfiler'
import { differentialRunner } from '../modules/differentialRunner'
import { oracleChecker } from '../modules/oracleChecker'
import { mutationScorer } from '../modules/mutationScorer'

const MODULE_REGISTRY = {
  failureMode: failureModeScanner,
  security: securityProbe,
  hallucination: hallucinationDetector,
  property: propertyGenerator,
  complexity: complexityProfiler,
  differential: differentialRunner,
  oracle: oracleChecker,
  mutation: mutationScorer,
}

self.onmessage = function (e) {
  const { code, language, modules, id } = e.data
  const findings = []

  for (const moduleName of modules) {
    const moduleFunc = MODULE_REGISTRY[moduleName]
    if (moduleFunc) {
      try {
        const moduleFindings = moduleFunc(code, language)
        findings.push(...moduleFindings)
      } catch (error) {
        console.error(`[Worker] Error in module ${moduleName}:`, error)
      }
    }
  }

  findings.sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  self.postMessage({ id, findings })
}
