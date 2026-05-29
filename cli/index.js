#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs'
import { resolve, extname } from 'path'
import { failureModeScanner } from '../src/modules/failureMode.js'
import { securityProbe } from '../src/modules/securityProbe.js'
import { hallucinationDetector } from '../src/modules/hallucinationDetector.js'
import { propertyGenerator } from '../src/modules/propertyGenerator.js'
import { complexityProfiler } from '../src/modules/complexityProfiler.js'
import { differentialRunner } from '../src/modules/differentialRunner.js'
import { oracleChecker } from '../src/modules/oracleChecker.js'
import { mutationScorer } from '../src/modules/mutationScorer.js'
import { typescriptAnalyzer } from '../src/modules/typescriptAnalyzer.js'

const MODULE_REGISTRY = {
  failureMode: { fn: failureModeScanner, name: 'Failure Mode Scanner' },
  security: { fn: securityProbe, name: 'Security Probe' },
  hallucination: { fn: hallucinationDetector, name: 'Hallucination Detector' },
  property: { fn: propertyGenerator, name: 'Property Generator' },
  complexity: { fn: complexityProfiler, name: 'Complexity Profiler' },
  differential: { fn: differentialRunner, name: 'Differential Runner' },
  oracle: { fn: oracleChecker, name: 'Oracle Checker' },
  mutation: { fn: mutationScorer, name: 'Mutation Scorer' },
  typescript: { fn: typescriptAnalyzer, name: 'TypeScript Analyzer' },
}

const EXT_TO_LANG = {
  '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
  '.ts': 'typescript', '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.cpp': 'cpp', '.cc': 'cpp', '.c': 'c', '.h': 'cpp',
}

const SEV_ORDER = { Critical: 0, High: 1, Medium: 2, Info: 3 }
const SEV_COLORS = { Critical: '\x1b[31m', High: '\x1b[33m', Medium: '\x1b[93m', Info: '\x1b[36m' }
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'

function usage() {
  console.log(`
${BOLD}ValidAI CLI${RESET} — Analyze code quality from the command line

${BOLD}Usage:${RESET}
  node cli/index.js <file> [options]

${BOLD}Options:${RESET}
  --modules <list>   Comma-separated modules (default: all)
                     Available: ${Object.keys(MODULE_REGISTRY).join(', ')}
  --format <type>    Output format: text, json, sarif (default: text)
  --min-severity <s> Minimum severity: Critical, High, Medium, Info (default: Medium)
  --help             Show this help message

${BOLD}Examples:${RESET}
  node cli/index.js src/app.js
  node cli/index.js src/app.js --modules security,failureMode
  node cli/index.js src/app.js --format json --min-severity High
`)
}

function parseArgs(argv) {
  const args = { file: null, modules: Object.keys(MODULE_REGISTRY), format: 'text', minSeverity: 'Medium' }
  let i = 2

  while (i < argv.length) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') { usage(); process.exit(0) }
    else if (arg === '--modules' && argv[i + 1]) { args.modules = argv[++i].split(','); }
    else if (arg === '--format' && argv[i + 1]) { args.format = argv[++i]; }
    else if (arg === '--min-severity' && argv[i + 1]) { args.minSeverity = argv[++i]; }
    else if (!arg.startsWith('-')) { args.file = arg; }
    i++
  }
  return args
}

function detectLanguage(filePath) {
  const ext = extname(filePath).toLowerCase()
  return EXT_TO_LANG[ext] || 'javascript'
}

function formatText(findings, filePath) {
  if (findings.length === 0) {
    console.log(`\n${BOLD}✓ No issues found${RESET} in ${filePath}\n`)
    return
  }

  console.log(`\n${BOLD}ValidAI Analysis: ${filePath}${RESET}`)
  console.log(`${DIM}${'─'.repeat(60)}${RESET}`)
  console.log(`Found ${BOLD}${findings.length}${RESET} issue(s)\n`)

  findings.forEach((f, i) => {
    const sevColor = SEV_COLORS[f.severity] || ''
    console.log(`  ${DIM}${i + 1}.${RESET} ${sevColor}${BOLD}[${f.severity}]${RESET} ${f.category}`)
    console.log(`     ${DIM}Module:${RESET} ${f.moduleName}  ${DIM}Line:${RESET} ${f.lineNumber || '-'}`)
    console.log(`     ${f.description}`)
    if (f.suggestion) console.log(`     ${DIM}Fix:${RESET} ${f.suggestion}`)
    if (f.autoFix) console.log(`     ${DIM}Patch:${RESET} ${f.autoFix.replace} → ${f.autoFix.with}`)
    console.log()
  })

  const critical = findings.filter(f => f.severity === 'Critical').length
  const high = findings.filter(f => f.severity === 'High').length
  const medium = findings.filter(f => f.severity === 'Medium').length
  const score = Math.max(0, Math.round(100 - ((critical * 10 + high * 5 + medium * 2) / Math.max(findings.length, 1)) * 10))
  console.log(`${DIM}${'─'.repeat(60)}${RESET}`)
  console.log(`${BOLD}Quality Score:${RESET} ${score >= 80 ? '\x1b[32m' : score >= 50 ? '\x1b[33m' : '\x1b[31m'}${score}/100${RESET}\n`)

  // Exit with non-zero if critical issues found
  if (critical > 0) process.exitCode = 1
}

function formatJSON(findings) {
  console.log(JSON.stringify({ findings, count: findings.length, timestamp: new Date().toISOString() }, null, 2))
}

function formatSARIF(findings, filePath) {
  const sarif = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'ValidAI', version: '0.6.0', informationUri: 'https://github.com/jj-shen99/valid_ai' } },
      results: findings.map(f => ({
        ruleId: f.id,
        level: f.severity === 'Critical' ? 'error' : f.severity === 'High' ? 'warning' : 'note',
        message: { text: f.description },
        locations: f.lineNumber ? [{ physicalLocation: { artifactLocation: { uri: filePath }, region: { startLine: f.lineNumber } } }] : [],
      })),
    }],
  }
  console.log(JSON.stringify(sarif, null, 2))
}

// ─── Main ───
const args = parseArgs(process.argv)

if (!args.file) { usage(); process.exit(1) }

const filePath = resolve(args.file)
if (!existsSync(filePath)) { console.error(`Error: File not found: ${filePath}`); process.exit(1) }

const code = readFileSync(filePath, 'utf-8')
const language = detectLanguage(filePath)

let findings = []
for (const modName of args.modules) {
  const mod = MODULE_REGISTRY[modName]
  if (!mod) { console.warn(`Warning: Unknown module "${modName}", skipping`); continue }
  try {
    findings.push(...mod.fn(code, language))
  } catch (err) {
    console.error(`Error in module ${modName}:`, err.message)
  }
}

// Filter by min severity
const minOrder = SEV_ORDER[args.minSeverity] ?? 2
findings = findings
  .filter(f => (SEV_ORDER[f.severity] ?? 3) <= minOrder)
  .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])

if (args.format === 'json') formatJSON(findings)
else if (args.format === 'sarif') formatSARIF(findings, args.file)
else formatText(findings, args.file)
