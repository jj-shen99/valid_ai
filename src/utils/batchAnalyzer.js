/**
 * Batch Analyzer
 *
 * Processes multiple files in sequence, aggregates findings,
 * and computes per-file and overall statistics.
 */

import { runAnalysis } from '../modules/analysisEngine'
import { attachAutoFixes } from './autoFixer'

const EXT_TO_LANG = {
  py: 'python',
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  java: 'java',
  go: 'go',
  cs: 'csharp',
}

export function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return EXT_TO_LANG[ext] || 'javascript'
}

export async function analyzeBatch(files, selectedModules, onProgress) {
  const results = []
  let totalFindings = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (onProgress) onProgress({ current: i + 1, total: files.length, filename: file.name })

    const language = detectLanguage(file.name)

    try {
      const rawFindings = await runAnalysis(file.content, language, selectedModules)
      const findings = attachAutoFixes(rawFindings, file.content)

      const actionable = findings.filter(f => f.severity !== 'Info')
      const critical = actionable.filter(f => f.severity === 'Critical').length
      const high = actionable.filter(f => f.severity === 'High').length
      const medium = actionable.filter(f => f.severity === 'Medium').length
      const weighted = (critical * 10) + (high * 5) + (medium * 2)
      const avgPenalty = actionable.length > 0 ? weighted / actionable.length : 0
      const score = actionable.length === 0 ? 100 : Math.max(0, Math.round(100 - avgPenalty * 10))

      results.push({
        filename: file.name,
        language,
        findings,
        score: Math.min(100, score),
        stats: { critical, high, medium, total: findings.length },
      })
      totalFindings += findings.length
    } catch (error) {
      results.push({
        filename: file.name,
        language,
        findings: [],
        score: 0,
        error: error.message,
        stats: { critical: 0, high: 0, medium: 0, total: 0 },
      })
    }
  }

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0

  return {
    results,
    summary: {
      fileCount: files.length,
      totalFindings,
      avgScore,
      worstFile: results.reduce((worst, r) => (r.score < (worst?.score ?? 101) ? r : worst), null),
    },
  }
}

export async function readFilesFromInput(fileList) {
  const files = []
  for (const file of fileList) {
    const content = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
    files.push({ name: file.name, content, size: file.size })
  }
  return files
}
