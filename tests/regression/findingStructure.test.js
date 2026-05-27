/**
 * Finding Structure Regression Tests
 * 
 * Ensures every module's output conforms to the standard finding schema.
 * Prevents regressions where fields are missing, misspelled, or wrong type.
 * 
 * Standard schema:
 *   id: string
 *   module: string
 *   moduleName: string
 *   severity: 'Critical' | 'High' | 'Medium' | 'Info'
 *   category: string
 *   description: string
 *   lineNumber: number (>= 1)
 *   suggestion: string
 *   timestamp: string (ISO 8601)
 *   codeSnippet?: string
 */
import { describe, it, expect } from 'vitest'
import { failureModeScanner } from '../../src/modules/failureMode'
import { securityProbe } from '../../src/modules/securityProbe'
import { hallucinationDetector } from '../../src/modules/hallucinationDetector'
import { complexityProfiler } from '../../src/modules/complexityProfiler'
import { oracleChecker } from '../../src/modules/oracleChecker'
import { propertyGenerator } from '../../src/modules/propertyGenerator'
import { mutationScorer } from '../../src/modules/mutationScorer'
import { differentialRunner } from '../../src/modules/differentialRunner'

const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Info']

function validateFinding(f) {
  expect(typeof f.id).toBe('string')
  expect(f.id.length).toBeGreaterThan(0)
  expect(typeof f.module).toBe('string')
  expect(typeof f.moduleName).toBe('string')
  expect(VALID_SEVERITIES).toContain(f.severity)
  expect(typeof f.category).toBe('string')
  expect(f.category.length).toBeGreaterThan(0)
  expect(typeof f.description).toBe('string')
  expect(f.description.length).toBeGreaterThan(0)
  expect(typeof f.lineNumber).toBe('number')
  expect(f.lineNumber).toBeGreaterThanOrEqual(1)
  expect(typeof f.suggestion).toBe('string')
  expect(f.suggestion.length).toBeGreaterThan(0)
  expect(typeof f.timestamp).toBe('string')
  expect(new Date(f.timestamp).toISOString()).toBe(f.timestamp)
}

// Code samples that trigger at least one finding per module
const TRIGGER_SAMPLES = {
  failureMode: 'try { x() } catch (e) {}',
  security: 'eval(userInput)',
  hallucination: 'myLib.nonExistentMethod()',
  complexity: 'arr.sort((a, b) => a - b)',
  oracle: 'return null',
  property: 'function f(a, b, c, d, e) { return a }',
  mutation: 'if (x < 10) { return true }',
  differential: 'function sortV1(arr) { return arr.sort() }\nfunction sortV2(arr) { return arr.sort() }',
}

const MODULE_MAP = {
  failureMode: { fn: failureModeScanner, expectedModule: 'failureMode', expectedModuleName: 'Failure Mode Scanner' },
  security: { fn: securityProbe, expectedModule: 'security', expectedModuleName: 'Security Probe' },
  hallucination: { fn: hallucinationDetector, expectedModule: 'hallucination', expectedModuleName: 'Hallucination Detector' },
  complexity: { fn: complexityProfiler, expectedModule: 'complexity', expectedModuleName: 'Complexity Profiler' },
  oracle: { fn: oracleChecker, expectedModule: 'oracle', expectedModuleName: 'Oracle Checker' },
  property: { fn: propertyGenerator, expectedModule: 'property', expectedModuleName: 'Property Generator' },
  mutation: { fn: mutationScorer, expectedModule: 'mutation', expectedModuleName: 'Mutation Scorer' },
  differential: { fn: differentialRunner, expectedModule: 'differential', expectedModuleName: 'Differential Runner' },
}

describe('Finding Structure Regression', () => {
  Object.entries(MODULE_MAP).forEach(([key, { fn, expectedModule, expectedModuleName }]) => {
    describe(`${expectedModuleName} findings`, () => {
      it('returns an array', () => {
        const result = fn(TRIGGER_SAMPLES[key], 'javascript')
        expect(Array.isArray(result)).toBe(true)
      })

      it('all findings conform to standard schema', () => {
        const findings = fn(TRIGGER_SAMPLES[key], 'javascript')
        expect(findings.length).toBeGreaterThan(0)
        findings.forEach(f => validateFinding(f))
      })

      it('module field matches expected value', () => {
        const findings = fn(TRIGGER_SAMPLES[key], 'javascript')
        findings.forEach(f => {
          expect(f.module).toBe(expectedModule)
          expect(f.moduleName).toBe(expectedModuleName)
        })
      })

      it('no duplicate IDs within a single run', () => {
        const findings = fn(TRIGGER_SAMPLES[key], 'javascript')
        const ids = findings.map(f => f.id)
        expect(new Set(ids).size).toBe(ids.length)
      })
    })
  })

  describe('Cross-module ID uniqueness', () => {
    it('finding IDs are unique across all modules', () => {
      const allIds = []
      Object.entries(MODULE_MAP).forEach(([key, { fn }]) => {
        const findings = fn(TRIGGER_SAMPLES[key], 'javascript')
        allIds.push(...findings.map(f => f.id))
      })
      expect(new Set(allIds).size).toBe(allIds.length)
    })
  })

  describe('codeSnippet presence', () => {
    const modulesWithSnippet = ['failureMode', 'security', 'hallucination', 'complexity', 'oracle', 'property']

    modulesWithSnippet.forEach(key => {
      it(`${key} findings include codeSnippet`, () => {
        const findings = MODULE_MAP[key].fn(TRIGGER_SAMPLES[key], 'javascript')
        findings.forEach(f => {
          expect(f).toHaveProperty('codeSnippet')
          expect(typeof f.codeSnippet).toBe('string')
          expect(f.codeSnippet.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
