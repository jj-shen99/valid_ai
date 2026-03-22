export const exportAsJSON = (findings, metadata) => {
  const report = {
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
    summary: {
      totalFindings: findings.length,
      critical: findings.filter(f => f.severity === 'Critical').length,
      high: findings.filter(f => f.severity === 'High').length,
      medium: findings.filter(f => f.severity === 'Medium').length,
      info: findings.filter(f => f.severity === 'Info').length,
    },
    findings: findings.map(f => ({
      id: f.id,
      severity: f.severity,
      category: f.category,
      module: f.module,
      description: f.description,
      lineNumber: f.lineNumber,
      suggestion: f.suggestion,
      chapter: f.chapterLink,
    })),
  }
  
  const dataStr = JSON.stringify(report, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, `validai-report-${Date.now()}.json`)
}

export const exportAsMarkdown = (findings, metadata) => {
  let md = `# ValidAI Report\n\n`
  md += `**Generated:** ${new Date().toISOString()}\n`
  md += `**Language:** ${metadata.language}\n`
  md += `**Modules:** ${metadata.modules.join(', ')}\n\n`
  
  md += `## Summary\n\n`
  md += `- **Total Findings:** ${findings.length}\n`
  md += `- **Critical:** ${findings.filter(f => f.severity === 'Critical').length}\n`
  md += `- **High:** ${findings.filter(f => f.severity === 'High').length}\n`
  md += `- **Medium:** ${findings.filter(f => f.severity === 'Medium').length}\n`
  md += `- **Info:** ${findings.filter(f => f.severity === 'Info').length}\n\n`
  
  md += `## Findings\n\n`
  findings.forEach((f, idx) => {
    md += `### ${idx + 1}. ${f.category} (${f.severity})\n\n`
    md += `**Module:** ${f.moduleName}\n`
    md += `**Line:** ${f.lineNumber}\n`
    md += `**Description:** ${f.description}\n`
    md += `**Suggestion:** ${f.suggestion}\n`
    md += `**Chapter:** ${f.chapterLink}\n\n`
  })
  
  const dataBlob = new Blob([md], { type: 'text/markdown' })
  downloadFile(dataBlob, `validai-report-${Date.now()}.md`)
}

export const exportAsSARIF = (findings, metadata) => {
  const sarifReport = {
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'ValidAI',
            version: '0.1.0',
            informationUri: 'https://github.com/jj-shen99/valid_ai',
          },
        },
        results: findings.map(f => ({
          ruleId: f.module,
          message: {
            text: f.description,
          },
          level: f.severity.toLowerCase(),
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: metadata.filename || 'code.txt',
                },
                region: {
                  startLine: f.lineNumber,
                },
              },
            },
          ],
          properties: {
            category: f.category,
            suggestion: f.suggestion,
            chapter: f.chapterLink,
          },
        })),
      },
    ],
  }
  
  const dataStr = JSON.stringify(sarifReport, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, `validai-report-${Date.now()}.sarif`)
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
