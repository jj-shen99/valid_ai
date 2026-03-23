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

export const exportGitHubReportAsHTML = (analysisData, findings) => {
  const { owner, repo, branch, days, commits, period } = analysisData

  // Severity counts
  const sevCounts = { Critical: 0, High: 0, Medium: 0, Info: 0 }
  const moduleCounts = {}
  const categoryCounts = {}
  findings.forEach(f => {
    sevCounts[f.severity] = (sevCounts[f.severity] || 0) + 1
    const mod = f.moduleName || f.module || 'Unknown'
    moduleCounts[mod] = (moduleCounts[mod] || 0) + 1
    const cat = f.category || 'General'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  })

  const weighted = (sevCounts.Critical * 10) + (sevCounts.High * 5) + (sevCounts.Medium * 2) + (sevCounts.Info * 0.5)
  const avgPenalty = findings.length > 0 ? weighted / findings.length : 0
  const qualityScore = findings.length === 0 ? 100 : Math.max(0, Math.round(100 - avgPenalty * 10))
  const scoreColor = qualityScore >= 70 ? '#059669' : qualityScore >= 40 ? '#ca8a04' : '#dc2626'

  // Authors
  const authors = {}
  const dailyMap = {}
  commits.forEach(c => {
    const name = c.commit.author.name
    authors[name] = (authors[name] || 0) + 1
    const d = new Date(c.commit.author.date)
    const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1
  })
  const authorEntries = Object.entries(authors).sort((a, b) => b[1] - a[1])
  const dailyEntries = Object.entries(dailyMap)

  // SVG pie chart for severity
  const pieData = [
    { label: 'Critical', count: sevCounts.Critical, color: '#ef4444' },
    { label: 'High', count: sevCounts.High, color: '#f97316' },
    { label: 'Medium', count: sevCounts.Medium, color: '#eab308' },
    { label: 'Info', count: sevCounts.Info, color: '#3b82f6' },
  ].filter(d => d.count > 0)
  const total = findings.length || 1
  let pieSlices = '', cumAngle = 0
  pieData.forEach(d => {
    const angle = (d.count / total) * 360
    const largeArc = angle > 180 ? 1 : 0
    const rad = Math.PI / 180
    const x1 = 80 + 65 * Math.cos((cumAngle - 90) * rad)
    const y1 = 80 + 65 * Math.sin((cumAngle - 90) * rad)
    const x2 = 80 + 65 * Math.cos((cumAngle + angle - 90) * rad)
    const y2 = 80 + 65 * Math.sin((cumAngle + angle - 90) * rad)
    if (angle >= 359.9) pieSlices += `<circle cx="80" cy="80" r="65" fill="${d.color}" />`
    else pieSlices += `<path d="M80,80 L${x1},${y1} A65,65 0 ${largeArc},1 ${x2},${y2} Z" fill="${d.color}" />`
    cumAngle += angle
  })
  const pieLegend = pieData.map(d =>
    `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:14px;"><span style="width:10px;height:10px;border-radius:2px;background:${d.color};display:inline-block;"></span>${d.label}: ${d.count}</span>`
  ).join('')

  // SVG bar chart for modules
  const moduleEntries = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])
  const maxMod = Math.max(...moduleEntries.map(e => e[1]), 1)
  const barH = 24, barGap = 4
  const barChartH = moduleEntries.length * (barH + barGap) + 10
  const barSvg = moduleEntries.map(([name, count], i) => {
    const y = i * (barH + barGap) + 5
    const w = Math.max(4, (count / maxMod) * 280)
    return `<g><text x="0" y="${y + 16}" font-size="11" fill="#374151" font-family="system-ui">${name}</text><rect x="180" y="${y}" width="${w}" height="${barH}" rx="3" fill="#6366f1" opacity="0.85" /><text x="${180 + w + 5}" y="${y + 16}" font-size="11" fill="#6b7280" font-family="system-ui">${count}</text></g>`
  }).join('')

  // SVG daily commits sparkline
  const maxDaily = Math.max(...dailyEntries.map(e => e[1]), 1)
  const sparkW = 500, sparkH = 80
  const sparkPoints = dailyEntries.map(([ , count], i) => {
    const x = dailyEntries.length > 1 ? (i / (dailyEntries.length - 1)) * sparkW : sparkW / 2
    const y = sparkH - (count / maxDaily) * (sparkH - 10) 
    return `${x},${y}`
  }).join(' ')
  const sparkLabels = dailyEntries.length <= 10 ? dailyEntries.map(([day], i) => {
    const x = dailyEntries.length > 1 ? (i / (dailyEntries.length - 1)) * sparkW : sparkW / 2
    return `<text x="${x}" y="${sparkH + 14}" font-size="9" fill="#9ca3af" text-anchor="middle" font-family="system-ui">${day}</text>`
  }).join('') : ''

  // ML insights
  const insights = []
  if (sevCounts.Critical > 0) insights.push({ icon: '🔴', title: 'Critical Vulnerabilities Detected', desc: `${sevCounts.Critical} critical issue(s) require immediate attention.` })
  const fpc = commits.length > 0 ? (findings.length / commits.length).toFixed(1) : '0'
  if (parseFloat(fpc) > 3) insights.push({ icon: '⚠️', title: 'High Finding Density', desc: `Average of ${fpc} findings per commit suggests code quality issues.` })
  if (Object.keys(authors).length === 1 && commits.length > 10) insights.push({ icon: 'ℹ️', title: 'Single-Author Pattern', desc: 'All commits from one author. Consider adding peer review.' })
  if (findings.length === 0 && commits.length > 0) insights.push({ icon: '✅', title: 'Clean Codebase', desc: 'No issues detected across all analyzed commits.' })
  const insightsHTML = insights.map(i => `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:8px;"><span style="font-size:16px;margin-right:8px;">${i.icon}</span><strong style="font-size:13px;">${i.title}</strong><p style="font-size:12px;color:#6b7280;margin:4px 0 0;">${i.desc}</p></div>`).join('')

  // Recommendations
  const recs = []
  if (sevCounts.Critical > 0) recs.push({ title: 'Fix Critical Issues Immediately', desc: 'Prioritize fixing critical findings before merging new code.', impact: 'Critical' })
  if (sevCounts.High > 2) recs.push({ title: 'Address High-Severity Findings', desc: `${sevCounts.High} high-severity issues found. Schedule dedicated time.`, impact: 'High' })
  if (moduleCounts['Security Probe'] > 0) recs.push({ title: 'Security Review Required', desc: 'Security findings detected. Run a full security audit.', impact: 'High' })
  if (moduleCounts['Hallucination Detector'] > 0) recs.push({ title: 'Verify AI-Generated Code', desc: 'Hallucination findings suggest AI-generated code references non-existent APIs.', impact: 'Medium' })
  recs.push({ title: 'Enable Pre-Commit Analysis', desc: 'Integrate ValidAI modules into Git pre-commit hooks.', impact: 'Medium' })
  const recsHTML = recs.map(r => {
    const c = r.impact === 'Critical' ? '#ef4444' : r.impact === 'High' ? '#f97316' : '#3b82f6'
    return `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:start;"><div><strong style="font-size:13px;">${r.title}</strong><p style="font-size:12px;color:#6b7280;margin:4px 0 0;">${r.desc}</p></div><span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:9999px;color:#fff;background:${c};white-space:nowrap;">${r.impact}</span></div>`
  }).join('')

  // Top categories
  const catEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const catHTML = catEntries.map(([name, count]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:12px;"><span>${name}</span><span style="font-weight:600;">${count}</span></div>`).join('')

  // Findings table
  const findingsRows = findings.map((f, i) => `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:6px 10px;font-size:12px;">${i + 1}</td><td style="padding:6px 10px;"><span style="display:inline-block;padding:1px 7px;border-radius:9999px;font-size:10px;font-weight:600;color:#fff;background:${f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : f.severity === 'Medium' ? '#eab308' : '#3b82f6'};">${f.severity}</span></td><td style="padding:6px 10px;font-size:12px;font-weight:500;">${f.category || ''}</td><td style="padding:6px 10px;font-size:12px;color:#6b7280;">${f.moduleName || f.module || ''}</td><td style="padding:6px 10px;font-size:12px;">${f.description || ''}</td><td style="padding:6px 10px;font-size:11px;color:#4b5563;">${f.suggestion || ''}</td></tr>`).join('')

  const timestamp = new Date().toLocaleString()

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>ValidAI GitHub Report — ${owner}/${repo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;color:#111827}
.c{max-width:1100px;margin:0 auto;padding:28px 24px}
.hdr{background:linear-gradient(135deg,#1f2937,#374151);color:#fff;padding:24px 28px;border-radius:12px;margin-bottom:20px}
.hdr h1{font-size:20px;font-weight:700;margin-bottom:4px}
.hdr p{font-size:12px;opacity:.8}
.g{display:grid;gap:14px;margin-bottom:20px}
.g6{grid-template-columns:repeat(6,1fr)}.g2{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:repeat(3,1fr)}
.cd{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px}
.cd h3{font-size:12px;color:#6b7280;font-weight:500;margin-bottom:4px}
.cd .v{font-size:24px;font-weight:700}
.st{font-size:14px;font-weight:600;margin-bottom:10px;color:#111827}
table{width:100%;border-collapse:collapse}
th{padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;background:#f9fafb;border-bottom:2px solid #e5e7eb}
@media(max-width:768px){.g6{grid-template-columns:repeat(3,1fr)}.g2,.g3{grid-template-columns:1fr}}
@media print{body{background:#fff}.c{padding:12px}}
</style>
</head>
<body>
<div class="c">
<div class="hdr">
  <h1>GitHub Repository Analysis Report</h1>
  <p>${owner}/${repo} · Branch: ${branch} · Last ${period || days + ' days'} · ${commits.length} commits analyzed · Generated: ${timestamp}</p>
</div>

<div class="g g6">
  <div class="cd"><h3>Quality Score</h3><div class="v" style="color:${scoreColor}">${qualityScore}%</div></div>
  <div class="cd"><h3>Commits</h3><div class="v" style="color:#3b82f6">${commits.length}</div></div>
  <div class="cd"><h3>Authors</h3><div class="v" style="color:#6366f1">${Object.keys(authors).length}</div></div>
  <div class="cd"><h3>Findings</h3><div class="v" style="color:#d97706">${findings.length}</div></div>
  <div class="cd"><h3>Critical</h3><div class="v" style="color:#ef4444">${sevCounts.Critical}</div></div>
  <div class="cd"><h3>Findings/Commit</h3><div class="v" style="color:#374151">${fpc}</div></div>
</div>

<div class="g g2">
  <div class="cd">
    <p class="st">Severity Distribution</p>
    <div style="display:flex;align-items:center;gap:20px;">
      <svg width="160" height="160" viewBox="0 0 160 160">${pieSlices}${findings.length === 0 ? '<circle cx="80" cy="80" r="65" fill="#e5e7eb"/>' : ''}</svg>
      <div style="font-size:11px;line-height:2;">${pieLegend}</div>
    </div>
  </div>
  <div class="cd">
    <p class="st">Findings by Module</p>
    ${moduleEntries.length === 0 ? '<p style="font-size:12px;color:#9ca3af;">No findings</p>' : `<svg width="100%" height="${barChartH}" viewBox="0 0 500 ${barChartH}">${barSvg}</svg>`}
  </div>
</div>

<div class="g g2">
  <div class="cd">
    <p class="st">Commit Activity</p>
    ${dailyEntries.length > 0 ? `<svg width="100%" height="${sparkH + 20}" viewBox="0 0 ${sparkW} ${sparkH + 20}"><polyline points="${sparkPoints}" fill="none" stroke="#3b82f6" stroke-width="2"/>${sparkLabels}</svg>` : '<p style="font-size:12px;color:#9ca3af;">No data</p>'}
  </div>
  <div class="cd">
    <p class="st">Top Contributors</p>
    ${authorEntries.map(([name, count]) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:12px;"><span>${name}</span><span style="font-weight:600;">${count} commits</span></div>`).join('')}
  </div>
</div>

<div class="g g3">
  <div class="cd">
    <p class="st">ML Insights</p>
    ${insights.length === 0 ? '<p style="font-size:12px;color:#9ca3af;">No notable patterns detected.</p>' : insightsHTML}
  </div>
  <div class="cd">
    <p class="st">Recommendations</p>
    ${recsHTML}
  </div>
  <div class="cd">
    <p class="st">Top Issue Categories</p>
    ${catEntries.length === 0 ? '<p style="font-size:12px;color:#9ca3af;">None</p>' : catHTML}
  </div>
</div>

<div class="cd" style="margin-bottom:20px;">
  <p class="st">All Findings (${findings.length})</p>
  ${findings.length === 0 ? '<p style="font-size:12px;color:#9ca3af;">No findings — code looks clean.</p>' :
  `<div style="overflow-x:auto;"><table><thead><tr><th>#</th><th>Severity</th><th>Category</th><th>Module</th><th>Description</th><th>Suggestion</th></tr></thead><tbody>${findingsRows}</tbody></table></div>`}
</div>

<div style="text-align:center;padding-top:14px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;">
  Generated by ValidAI &mdash; Making AI-generated code safer, more reliable, and production-ready.
</div>
</div>
</body>
</html>`

  const dataBlob = new Blob([html], { type: 'text/html' })
  downloadFile(dataBlob, `validai-github-${owner}-${repo}-${Date.now()}.html`)
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
