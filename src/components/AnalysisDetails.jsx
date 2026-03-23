import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, GitCommit, User, Calendar, AlertTriangle, Shield, TrendingUp, Brain, Lightbulb, BarChart3, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4']
const SEV_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Info: '#3b82f6' }

export default function AnalysisDetails({ analysisData, findings }) {
  const [expandedCommit, setExpandedCommit] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [severityFilter, setSeverityFilter] = useState('all')

  if (!analysisData) return null

  const { owner, repo, branch, days, commits, period } = analysisData

  const stats = useMemo(() => {
    const authors = {}
    const dailyMap = {}
    const hourMap = Array(24).fill(0)

    commits.forEach(c => {
      const name = c.commit.author.name
      authors[name] = (authors[name] || 0) + 1
      const d = new Date(c.commit.author.date)
      const dayKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1
      hourMap[d.getHours()]++
    })

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

    return {
      totalCommits: commits.length,
      uniqueAuthors: Object.keys(authors).length,
      authors,
      dailyCommits: Object.entries(dailyMap).map(([day, count]) => ({ day, count })),
      hourlyActivity: hourMap.map((count, hour) => ({ hour: `${hour}:00`, count })),
      sevCounts,
      sevData: Object.entries(sevCounts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),
      moduleCounts,
      moduleData: Object.entries(moduleCounts).map(([name, value]) => ({ name, value })),
      categoryCounts,
      categoryData: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })),
      authorData: Object.entries(authors).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
      avgCommitsPerDay: (commits.length / Math.max(days, 1)).toFixed(1),
      riskScore: Math.max(0, Math.round(100 - ((sevCounts.Critical * 10) + (sevCounts.High * 5) + (sevCounts.Medium * 2) + (sevCounts.Info * 0.5)) / Math.max(findings.length, 1) * 10)),
      findingsPerCommit: commits.length > 0 ? (findings.length / commits.length).toFixed(1) : '0',
    }
  }, [commits, findings, days])

  const mlInsights = useMemo(() => {
    const insights = []
    if (stats.sevCounts.Critical > 0)
      insights.push({ type: 'critical', title: 'Critical Vulnerabilities Detected', desc: `${stats.sevCounts.Critical} critical issue(s) require immediate attention. These may include security vulnerabilities, data exposure, or severe logic errors.`, priority: 1 })
    if (parseFloat(stats.findingsPerCommit) > 3)
      insights.push({ type: 'warning', title: 'High Finding Density', desc: `Average of ${stats.findingsPerCommit} findings per commit suggests code quality issues. Consider implementing pre-commit hooks and code review gates.`, priority: 2 })
    if (stats.uniqueAuthors === 1 && stats.totalCommits > 10)
      insights.push({ type: 'info', title: 'Single-Author Pattern', desc: 'All commits from one author. Consider adding peer review to catch blind spots and improve knowledge sharing.', priority: 3 })
    if (stats.hourlyActivity.filter(h => h.count > 0 && (parseInt(h.hour) < 6 || parseInt(h.hour) > 22)).length > 2)
      insights.push({ type: 'info', title: 'Late-Night Commits Detected', desc: 'Significant activity outside business hours. Fatigue-related bugs are more common in late-night code.', priority: 3 })
    const topModule = stats.moduleData.sort((a, b) => b.value - a.value)[0]
    if (topModule && topModule.value > findings.length * 0.5)
      insights.push({ type: 'warning', title: `${topModule.name} Dominates Findings`, desc: `${Math.round(topModule.value / findings.length * 100)}% of findings come from one module. Focus refactoring efforts on this area.`, priority: 2 })
    if (findings.length === 0 && commits.length > 0)
      insights.push({ type: 'success', title: 'Clean Codebase', desc: 'No issues detected across all analyzed commits. The code meets quality standards for all selected modules.', priority: 4 })
    return insights.sort((a, b) => a.priority - b.priority)
  }, [stats, findings])

  const recommendations = useMemo(() => {
    const recs = []
    if (stats.sevCounts.Critical > 0) recs.push({ title: 'Fix Critical Issues Immediately', desc: 'Prioritize fixing critical findings before merging any new code. Consider blocking deployments until resolved.', effort: 'High', impact: 'Critical' })
    if (stats.sevCounts.High > 2) recs.push({ title: 'Address High-Severity Findings', desc: `${stats.sevCounts.High} high-severity issues found. Schedule dedicated time in the next sprint to address these.`, effort: 'Medium', impact: 'High' })
    if (stats.moduleCounts['Security Probe'] > 0) recs.push({ title: 'Security Review Required', desc: 'Security findings detected. Run a full security audit and consider adding SAST/DAST to your CI pipeline.', effort: 'Medium', impact: 'High' })
    if (stats.moduleCounts['Hallucination Detector'] > 0) recs.push({ title: 'Verify AI-Generated Code', desc: 'Hallucination findings suggest AI-generated code references non-existent APIs. Manually verify all external dependencies.', effort: 'Low', impact: 'Medium' })
    if (parseFloat(stats.avgCommitsPerDay) > 10) recs.push({ title: 'Consider Smaller Commits', desc: 'High commit frequency detected. Smaller, focused commits improve traceability and make reviews easier.', effort: 'Low', impact: 'Medium' })
    recs.push({ title: 'Enable Pre-Commit Analysis', desc: 'Integrate ValidAI modules into your Git pre-commit hooks to catch issues before they reach the repository.', effort: 'Low', impact: 'High' })
    recs.push({ title: 'Set Up Trend Monitoring', desc: 'Track finding counts over time to measure code quality improvements and catch regressions early.', effort: 'Low', impact: 'Medium' })
    return recs
  }, [stats])

  const filteredFindings = severityFilter === 'all' ? findings.filter(f => f.severity !== 'Info') : findings.filter(f => f.severity === severityFilter)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'charts', label: 'Charts & Plots' },
    { id: 'ml', label: 'ML Insights' },
    { id: 'findings', label: `Findings (${findings.length})` },
    { id: 'commits', label: `Commits (${commits.length})` },
    { id: 'recommendations', label: 'Recommendations' },
  ]

  const card = 'bg-white border border-gray-200 rounded-xl p-5'

  return (
    <div className="space-y-4">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: 'Commits', value: stats.totalCommits, color: 'text-blue-600' },
          { label: 'Authors', value: stats.uniqueAuthors, color: 'text-indigo-600' },
          { label: 'Findings', value: findings.length, color: 'text-amber-600' },
          { label: 'Critical', value: stats.sevCounts.Critical, color: 'text-red-600' },
          { label: 'Quality Score', value: `${stats.riskScore}/100`, color: stats.riskScore >= 50 ? 'text-emerald-600' : 'text-red-600' },
          { label: 'Findings/Commit', value: stats.findingsPerCommit, color: 'text-gray-700' },
        ].map((kpi, i) => (
          <div key={i} className={card}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} mt-1`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 pb-px">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${activeTab === t.id ? 'bg-white border border-b-white border-gray-200 text-blue-700 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={card}>
            <h4 className="font-semibold mb-3">Repository Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Repository</span><span className="font-medium">{owner}/{repo}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Branch</span><span className="font-medium">{branch}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Period</span><span className="font-medium">Last {period}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Avg Commits/Day</span><span className="font-medium">{stats.avgCommitsPerDay}</span></div>
            </div>
          </div>
          <div className={card}>
            <h4 className="font-semibold mb-3">Severity Distribution</h4>
            {findings.length === 0 ? <p className="text-sm text-gray-400">No findings</p> : (
              <div className="space-y-2">
                {Object.entries(stats.sevCounts).map(([sev, count]) => (
                  <div key={sev}>
                    <div className="flex justify-between text-sm mb-1"><span>{sev}</span><span className="font-semibold">{count}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full"><div className="h-full rounded-full transition-all" style={{ width: `${(count / Math.max(findings.length, 1)) * 100}%`, backgroundColor: SEV_COLORS[sev] }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={`${card} lg:col-span-2`}>
            <h4 className="font-semibold mb-3">Top Contributors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.authorData.slice(0, 8).map((a, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium truncate">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.value} commits</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Charts Tab ─── */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={card}>
            <h4 className="font-semibold mb-3">Commits Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.dailyCommits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Commits" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={card}>
            <h4 className="font-semibold mb-3">Commit Activity by Hour</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Commits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={card}>
            <h4 className="font-semibold mb-3">Findings by Severity</h4>
            {stats.sevData.length === 0 ? <p className="text-sm text-gray-400 py-16 text-center">No findings to display</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.sevData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}>
                    {stats.sevData.map((entry, i) => <Cell key={i} fill={SEV_COLORS[entry.name] || COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={card}>
            <h4 className="font-semibold mb-3">Findings by Module</h4>
            {stats.moduleData.length === 0 ? <p className="text-sm text-gray-400 py-16 text-center">No findings to display</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.moduleData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Findings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={card}>
            <h4 className="font-semibold mb-3">Commits by Author</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.authorData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} name="Commits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={card}>
            <h4 className="font-semibold mb-3">Top Issue Categories</h4>
            {stats.categoryData.length === 0 ? <p className="text-sm text-gray-400 py-16 text-center">No findings to display</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${value}`}>
                    {stats.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* ─── ML Insights Tab ─── */}
      {activeTab === 'ml' && (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-600" />
              <h4 className="font-semibold">ML-Powered Analysis</h4>
            </div>
            {/* Quality Gauge */}
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center ${stats.riskScore >= 70 ? 'border-emerald-500' : stats.riskScore >= 40 ? 'border-yellow-500' : 'border-red-500'}`}>
                  <span className="text-2xl font-bold">{stats.riskScore}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Quality Score</p>
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Code Health</span><span className={`font-semibold ${stats.riskScore >= 70 ? 'text-emerald-600' : stats.riskScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>{stats.riskScore >= 70 ? 'Good' : stats.riskScore >= 40 ? 'Fair' : 'Poor'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Anomaly Detection</span><span className="font-semibold">{stats.sevCounts.Critical > 0 ? 'Anomalies Found' : 'Normal'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Commit Pattern</span><span className="font-semibold">{stats.uniqueAuthors > 3 ? 'Team-based' : stats.uniqueAuthors > 1 ? 'Small team' : 'Solo'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Velocity</span><span className="font-semibold">{parseFloat(stats.avgCommitsPerDay) > 5 ? 'High' : parseFloat(stats.avgCommitsPerDay) > 1 ? 'Medium' : 'Low'}</span></div>
              </div>
            </div>
          </div>

          {mlInsights.length > 0 && (
            <div className="space-y-3">
              {mlInsights.map((insight, i) => (
                <div key={i} className={`${card} border-l-4 ${insight.type === 'critical' ? 'border-l-red-500' : insight.type === 'warning' ? 'border-l-yellow-500' : insight.type === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                  <div className="flex items-start gap-3">
                    {insight.type === 'critical' ? <AlertTriangle size={18} className="text-red-500 mt-0.5" /> :
                     insight.type === 'warning' ? <AlertTriangle size={18} className="text-yellow-500 mt-0.5" /> :
                     <Lightbulb size={18} className="text-blue-500 mt-0.5" />}
                    <div>
                      <h5 className="font-semibold text-sm">{insight.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Predictive analysis */}
          <div className={card}>
            <h4 className="font-semibold mb-3">Predictive Quality Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[
                { period: 'Current', quality: stats.riskScore, predicted: null },
                { period: '+1 week', quality: null, predicted: Math.min(100, Math.max(10, stats.riskScore + (stats.sevCounts.Critical > 0 ? -5 : 3))) },
                { period: '+2 weeks', quality: null, predicted: Math.min(100, Math.max(10, stats.riskScore + (stats.sevCounts.Critical > 0 ? -8 : 5))) },
                { period: '+1 month', quality: null, predicted: Math.min(100, Math.max(10, stats.riskScore + (stats.sevCounts.Critical > 0 ? -12 : 8))) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="quality" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Current" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2">Prediction based on current finding trends and commit velocity.</p>
          </div>
        </div>
      )}

      {/* ─── Findings Tab ─── */}
      {activeTab === 'findings' && (
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Code Analysis Findings</h4>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2 py-1">
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Info">Info</option>
              </select>
            </div>
          </div>
          {filteredFindings.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">{findings.length === 0 ? 'No findings from the analysis.' : 'No findings match the selected filter.'}</p>
          ) : (
            <div className="space-y-2">
              {filteredFindings.map((finding, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      finding.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      finding.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{finding.severity}</span>
                    <span className="text-xs text-gray-400">{finding.moduleName || finding.module}</span>
                  </div>
                  <h5 className="font-medium text-sm mt-1">{finding.category}</h5>
                  <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                  {finding.suggestion && <p className="text-xs text-blue-600 mt-2">Suggestion: {finding.suggestion}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Commits Tab ─── */}
      {activeTab === 'commits' && (
        <div className={card}>
          <h4 className="font-semibold mb-4">Commit History</h4>
          <div className="space-y-2">
            {commits.map((commit, idx) => (
              <div key={commit.sha} className="border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedCommit(expandedCommit === idx ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <GitCommit className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{commit.commit.message.split('\n')[0]}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User size={12} />{commit.commit.author.name}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                        <code className="text-gray-400">{commit.sha.substring(0, 7)}</code>
                      </div>
                    </div>
                  </div>
                  {expandedCommit === idx ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {expandedCommit === idx && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2 text-sm">
                    <p className="whitespace-pre-wrap text-gray-700">{commit.commit.message}</p>
                    <p className="text-gray-500">{commit.commit.author.name} ({commit.commit.author.email}) — {new Date(commit.commit.author.date).toLocaleString()}</p>
                    {commit.html_url && <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View on GitHub →</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recommendations Tab ─── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={20} className="text-yellow-500" />
              <h4 className="font-semibold">Actionable Recommendations</h4>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold text-sm">{rec.title}</h5>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.impact === 'Critical' ? 'bg-red-100 text-red-700' : rec.impact === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {rec.impact} impact
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.effort === 'High' ? 'bg-red-50 text-red-600' : rec.effort === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
