import React from 'react'
import { useStore } from '../store'
import { TrendingUp, AlertTriangle, Shield, Bug, Zap, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function Dashboard({ dark }) {
  const submissions = useStore((s) => s.submissions)
  const addNotification = useStore((s) => s.addNotification)

  const handleDeleteSubmission = (index) => {
    if (window.confirm('Delete this submission?')) {
      const updated = submissions.filter((_, i) => i !== index)
      useStore.setState({ submissions: updated })
      addNotification('Submission deleted', 'info')
    }
  }

  const d = dark
  const card = d ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
  const muted = d ? 'text-gray-400' : 'text-gray-500'

  // Aggregate findings from all submissions
  const allFindings = submissions.flatMap(s => s.findings || [])
  const critical = allFindings.filter(f => f.severity === 'Critical').length
  const high = allFindings.filter(f => f.severity === 'High').length
  const medium = allFindings.filter(f => f.severity === 'Medium').length
  const info = allFindings.filter(f => f.severity === 'Info').length
  const total = allFindings.length
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length)
    : 0

  const kpis = [
    { label: 'Total Analyses', value: submissions.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Findings', value: total, icon: Bug, color: 'bg-amber-500' },
    { label: 'Critical Issues', value: critical, icon: XCircle, color: 'bg-red-500' },
    { label: 'Avg Quality Score', value: `${avgScore}%`, icon: TrendingUp, color: 'bg-emerald-500' },
  ]

  const severityBars = [
    { label: 'Critical', count: critical, color: 'bg-red-500', max: Math.max(total, 1) },
    { label: 'High', count: high, color: 'bg-orange-500', max: Math.max(total, 1) },
    { label: 'Medium', count: medium, color: 'bg-yellow-500', max: Math.max(total, 1) },
    { label: 'Info', count: info, color: 'bg-blue-400', max: Math.max(total, 1) },
  ]

  const modules = [
    { name: 'Failure Mode Scanner', status: true },
    { name: 'Security Probe', status: true },
    { name: 'Hallucination Detector', status: true },
    { name: 'Property Generator', status: true },
    { name: 'Complexity Profiler', status: true },
    { name: 'Differential Runner', status: true },
    { name: 'Oracle Checker', status: true },
    { name: 'Mutation Scorer', status: true },
    { name: 'Prompt Testability', status: true },
    { name: 'AI Review Assistant', status: false },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 -mx-6 px-6 py-2 text-white flex items-center justify-between">
        <h2 className="text-sm font-bold">Dashboard <span className="font-normal text-emerald-200 ml-2 text-xs">Code quality metrics, findings & module status</span></h2>
        <span className="text-xs text-emerald-200 whitespace-nowrap ml-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} className={`border rounded-xl p-5 ${card}`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg ${kpi.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className={`text-xs font-medium uppercase tracking-wide ${muted}`}>{kpi.label}</p>
              <p className="text-3xl font-bold mt-1">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Severity Breakdown */}
        <div className={`border rounded-xl p-5 lg:col-span-2 ${card}`}>
          <h3 className="font-semibold mb-4">Finding Severity Breakdown</h3>
          {total === 0 ? (
            <p className={`text-sm ${muted}`}>No findings yet. Submit code to begin analysis.</p>
          ) : (
            <div className="space-y-4">
              {severityBars.map((bar, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{bar.label}</span>
                    <span className={`font-semibold ${muted}`}>{bar.count}</span>
                  </div>
                  <div className={`h-2.5 rounded-full ${d ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all`}
                      style={{ width: `${(bar.count / bar.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Module Health */}
        <div className={`border rounded-xl p-5 ${card}`}>
          <h3 className="font-semibold mb-4">Module Status</h3>
          <div className="space-y-2.5">
            {modules.map((mod, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate mr-2">{mod.name}</span>
                {mod.status ? (
                  <span className="flex items-center gap-1 text-emerald-500 flex-shrink-0">
                    <CheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 ${muted} flex-shrink-0`}>
                    <Zap size={14} /> Key needed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className={`border rounded-xl p-5 ${card}`}>
        <h3 className="font-semibold mb-4">Recent Submissions</h3>
        {submissions.length === 0 ? (
          <p className={`text-sm ${muted}`}>No submissions yet. Go to Submit Code to run your first analysis.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${muted} text-left`}>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Modules</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 10).map((sub, i) => (
                  <tr key={i} className={`border-t ${d ? 'border-gray-800' : 'border-gray-100'}`}>
                    <td className="py-2.5 font-medium">{sub.source === 'github' ? `GitHub: ${sub.repo || 'repo'}` : sub.language}</td>
                    <td className="py-2.5">{sub.modules?.length || '-'}</td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        sub.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        sub.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sub.score}%
                      </span>
                    </td>
                    <td className={`py-2.5 ${muted}`}>{sub.timestamp ? new Date(sub.timestamp).toLocaleString() : '-'}</td>
                    <td className="py-2.5">
                      <button
                        onClick={() => handleDeleteSubmission(i)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete submission"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
