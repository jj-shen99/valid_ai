import React, { useMemo } from 'react'
import { useStore } from '../store'
import TrendChart from '../components/TrendChart'
import SubmissionHistory from '../components/SubmissionHistory'
import SVGLineChart from '../components/charts/SVGLineChart'
import SVGBarChart from '../components/charts/SVGBarChart'
import SVGPieChart from '../components/charts/SVGPieChart'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Bug, Zap, Github, FileText } from 'lucide-react'

const SEVERITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Info: '#3b82f6' }

export default function TrendHistory() {
  const submissions = useStore((state) => state.submissions)

  const handleDelete = (index) => {
    const newSubmissions = submissions.filter((_, i) => i !== index)
    useStore.setState({ submissions: newSubmissions })
  }

  const handleSelect = (submission) => {
    console.log('Selected submission:', submission)
  }

  const stats = useMemo(() => {
    const scores = submissions.map(s => s.score || 0)
    const allFindings = submissions.flatMap(s => s.findings || [])
    const recentSubs = submissions.slice(0, 5)
    const olderSubs = submissions.slice(5, 10)
    const recentAvg = recentSubs.length > 0 ? Math.round(recentSubs.reduce((a, s) => a + (s.score || 0), 0) / recentSubs.length) : 0
    const olderAvg = olderSubs.length > 0 ? Math.round(olderSubs.reduce((a, s) => a + (s.score || 0), 0) / olderSubs.length) : 0
    const trend = recentAvg - olderAvg

    return {
      totalSubmissions: submissions.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
      totalFindings: allFindings.length,
      critical: allFindings.filter(f => f.severity === 'Critical').length,
      high: allFindings.filter(f => f.severity === 'High').length,
      medium: allFindings.filter(f => f.severity === 'Medium').length,
      info: allFindings.filter(f => f.severity === 'Info').length,
      trend,
      githubCount: submissions.filter(s => s.source === 'github').length,
      codeCount: submissions.filter(s => s.source !== 'github').length,
    }
  }, [submissions])

  // Severity pie data
  const severityPieData = useMemo(() => [
    { name: 'Critical', value: stats.critical, color: SEVERITY_COLORS.Critical },
    { name: 'High', value: stats.high, color: SEVERITY_COLORS.High },
    { name: 'Medium', value: stats.medium, color: SEVERITY_COLORS.Medium },
    { name: 'Info', value: stats.info, color: SEVERITY_COLORS.Info },
  ].filter(d => d.value > 0), [stats])

  // Module frequency
  const moduleFrequency = useMemo(() => {
    const allFindings = submissions.flatMap(s => s.findings || [])
    const counts = {}
    allFindings.forEach(f => {
      const name = f.moduleName || f.module || 'Unknown'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.length > 18 ? name.slice(0, 16) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [submissions])

  // Score over time (area chart)
  const scoreOverTime = useMemo(() => {
    return submissions.slice().reverse().map((s, i) => ({
      name: s.timestamp ? new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `#${i + 1}`,
      score: s.score || 0,
      findings: s.findings?.length || 0,
    }))
  }, [submissions])

  const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus
  const trendColor = stats.trend > 0 ? 'text-emerald-600' : stats.trend < 0 ? 'text-red-600' : 'text-gray-400'

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 -mx-6 px-6 py-2 text-white flex items-center justify-between">
        <h2 className="text-sm font-bold">Trends & History <span className="font-normal text-amber-200 ml-2 text-xs">Track code quality improvements and analysis history</span></h2>
        <span className="text-xs text-amber-200 whitespace-nowrap ml-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Analyses</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <FileText size={11} /> {stats.codeCount} code
            <Github size={11} className="ml-1" /> {stats.githubCount} GH
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${trendColor}`}>
            <TrendIcon size={12} /> {stats.trend > 0 ? '+' : ''}{stats.trend}pt trend
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Best Score</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.bestScore}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Worst Score</p>
          <p className="text-2xl font-bold text-red-600">{stats.worstScore}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Findings</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalFindings}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Critical Issues</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score + Findings Over Time */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Score & Findings Over Time</h3>
          {scoreOverTime.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <SVGLineChart
              data={scoreOverTime}
              lines={[
                { key: 'score', label: 'Quality Score', color: 'blue' },
                { key: 'findings', label: 'Findings', color: 'orange' },
              ]}
              height={240}
            />
          )}
        </div>

        {/* Severity Distribution Pie */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Finding Severity Distribution</h3>
          {severityPieData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No findings yet</p>
          ) : (
            <SVGPieChart
              data={severityPieData}
              dataKey="value"
              nameKey="name"
              colorKey="color"
              size={200}
              innerRadius={45}
            />
          )}
        </div>
      </div>

      {/* Module Frequency Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Findings by Module</h3>
        {moduleFrequency.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No module data yet</p>
        ) : (
          <SVGBarChart
            data={moduleFrequency}
            dataKey="count"
            nameKey="name"
            layout="vertical"
            height={260}
          />
        )}
      </div>

      {/* Quality Trend Line Chart */}
      <TrendChart submissions={submissions} />

      {/* Submission History Table */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Submission History</h3>
        <SubmissionHistory 
          submissions={submissions}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
