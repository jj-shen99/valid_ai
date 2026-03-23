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
    md += `\n`
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
          },
        })),
      },
    ],
  }
  
  const dataStr = JSON.stringify(sarifReport, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, `validai-report-${Date.now()}.sarif`)
}

export const exportAsHTML = (findings, metadata) => {
  const critical = findings.filter(f => f.severity === 'Critical').length
  const high = findings.filter(f => f.severity === 'High').length
  const medium = findings.filter(f => f.severity === 'Medium').length
  const info = findings.filter(f => f.severity === 'Info').length
  const weighted = (critical * 10) + (high * 5) + (medium * 2) + (info * 0.5)
  const avgPenalty = findings.length > 0 ? weighted / findings.length : 0
  const score = findings.length === 0 ? 100 : Math.max(0, Math.round(100 - avgPenalty * 10))

  // Module counts for bar chart
  const moduleCounts = {}
  findings.forEach(f => {
    const m = f.moduleName || f.module || 'Unknown'
    moduleCounts[m] = (moduleCounts[m] || 0) + 1
  })
  const moduleEntries = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])
  const maxModuleCount = Math.max(...moduleEntries.map(e => e[1]), 1)

  // Pie chart data
  const pieData = [
    { label: 'Critical', count: critical, color: '#ef4444' },
    { label: 'High', count: high, color: '#f97316' },
    { label: 'Medium', count: medium, color: '#eab308' },
    { label: 'Info', count: info, color: '#3b82f6' },
  ].filter(d => d.count > 0)
  const total = findings.length || 1

  // Generate SVG pie chart
  let pieSlices = ''
  let cumAngle = 0
  pieData.forEach(d => {
    const angle = (d.count / total) * 360
    const startAngle = cumAngle
    const endAngle = cumAngle + angle
    const largeArc = angle > 180 ? 1 : 0
    const rad = Math.PI / 180
    const x1 = 100 + 80 * Math.cos((startAngle - 90) * rad)
    const y1 = 100 + 80 * Math.sin((startAngle - 90) * rad)
    const x2 = 100 + 80 * Math.cos((endAngle - 90) * rad)
    const y2 = 100 + 80 * Math.sin((endAngle - 90) * rad)
    if (angle >= 359.9) {
      pieSlices += `<circle cx="100" cy="100" r="80" fill="${d.color}" />`
    } else {
      pieSlices += `<path d="M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z" fill="${d.color}" />`
    }
    cumAngle += angle
  })

  const pieLegend = pieData.map(d =>
    `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:16px;"><span style="width:12px;height:12px;border-radius:2px;background:${d.color};display:inline-block;"></span>${d.label}: ${d.count} (${Math.round(d.count / total * 100)}%)</span>`
  ).join('')

  // Bar chart SVG
  const barHeight = 28
  const barGap = 6
  const barChartHeight = moduleEntries.length * (barHeight + barGap) + 10
  const barSvg = moduleEntries.map(([ name, count ], i) => {
    const y = i * (barHeight + barGap) + 5
    const width = Math.max(4, (count / maxModuleCount) * 320)
    return `<g>
      <text x="0" y="${y + 18}" font-size="12" fill="#374151" font-family="system-ui">${name}</text>
      <rect x="200" y="${y}" width="${width}" height="${barHeight}" rx="4" fill="#6366f1" opacity="0.85" />
      <text x="${200 + width + 6}" y="${y + 18}" font-size="12" fill="#6b7280" font-family="system-ui">${count}</text>
    </g>`
  }).join('')

  const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#ca8a04' : '#dc2626'
  const timestamp = new Date().toLocaleString()

  const findingsRows = findings.map((f, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:8px 12px;font-size:13px;">${i + 1}</td>
      <td style="padding:8px 12px;"><span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;color:#fff;background:${
        f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : f.severity === 'Medium' ? '#eab308' : '#3b82f6'
      };">${f.severity}</span></td>
      <td style="padding:8px 12px;font-size:13px;font-weight:500;">${f.category || ''}</td>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;">${f.moduleName || f.module || ''}</td>
      <td style="padding:8px 12px;font-size:13px;">${f.description || ''}</td>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;">${f.lineNumber || '-'}</td>
      <td style="padding:8px 12px;font-size:12px;color:#4b5563;">${f.suggestion || ''}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ValidAI Analysis Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; color: #111827; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 28px 32px; border-radius: 12px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .grid { display: grid; gap: 16px; margin-bottom: 24px; }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }
    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; }
    .card h3 { font-size: 13px; color: #6b7280; font-weight: 500; margin-bottom: 6px; }
    .card .value { font-size: 28px; font-weight: 700; }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #111827; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
    @media (max-width: 768px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } .grid-2 { grid-template-columns: 1fr; } }
    @media print { body { background: #fff; } .container { padding: 16px; } .header { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ValidAI Analysis Report</h1>
      <p>Generated: ${timestamp} &nbsp;|&nbsp; Language: ${metadata.language || 'N/A'} &nbsp;|&nbsp; Modules: ${(metadata.modules || []).join(', ') || 'N/A'} &nbsp;|&nbsp; Source: ${metadata.source || 'code'}</p>
    </div>

    <div class="grid grid-4">
      <div class="card">
        <h3>Quality Score</h3>
        <div class="value" style="color:${scoreColor};">${score}%</div>
        <p style="font-size:11px;color:#9ca3af;margin-top:4px;">100 − (C×10 + H×5 + M×2 + I×0.5)</p>
      </div>
      <div class="card">
        <h3>Critical</h3>
        <div class="value" style="color:#ef4444;">${critical}</div>
      </div>
      <div class="card">
        <h3>High</h3>
        <div class="value" style="color:#f97316;">${high}</div>
      </div>
      <div class="card">
        <h3>Medium / Info</h3>
        <div class="value" style="color:#eab308;">${medium}</div>
        <p style="font-size:13px;color:#3b82f6;margin-top:2px;">+ ${info} info</p>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <p class="section-title">Severity Distribution</p>
        <div style="display:flex;align-items:center;gap:24px;">
          <svg width="200" height="200" viewBox="0 0 200 200">${pieSlices}${findings.length === 0 ? '<circle cx="100" cy="100" r="80" fill="#e5e7eb" />' : ''}</svg>
          <div style="font-size:12px;line-height:2;">${pieLegend}</div>
        </div>
      </div>
      <div class="card">
        <p class="section-title">Findings by Module</p>
        ${moduleEntries.length === 0 ? '<p style="font-size:13px;color:#9ca3af;">No findings</p>' :
          `<svg width="100%" height="${barChartHeight}" viewBox="0 0 560 ${barChartHeight}">${barSvg}</svg>`}
      </div>
    </div>

    <div class="card" style="margin-top:24px;">
      <p class="section-title">All Findings (${findings.length})</p>
      ${findings.length === 0 ? '<p style="font-size:13px;color:#9ca3af;">No findings detected — code looks clean.</p>' :
      `<div style="overflow-x:auto;"><table>
        <thead><tr>
          <th>#</th><th>Severity</th><th>Category</th><th>Module</th><th>Description</th><th>Line</th><th>Suggestion</th>
        </tr></thead>
        <tbody>${findingsRows}</tbody>
      </table></div>`}
    </div>

    <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
      Generated by ValidAI &mdash; Making AI-generated code safer, more reliable, and production-ready.
    </div>
  </div>
</body>
</html>`

  const dataBlob = new Blob([html], { type: 'text/html' })
  downloadFile(dataBlob, `validai-report-${Date.now()}.html`)
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
