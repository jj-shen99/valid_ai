import React, { useState } from 'react'
import { useStore } from '../store'
import GitHubCodeAnalysis from '../components/GitHubCodeAnalysis'
import ModuleSelector from '../components/ModuleSelector'
import AnalysisDetails from '../components/AnalysisDetails'
import { runAnalysis } from '../modules/analysisEngine'
import { Loader, Play, Zap, Shield, Search, ChevronDown, ChevronUp } from 'lucide-react'

const TEST_PROFILES = [
  { id: 'quick', name: 'Quick Scan', desc: 'Fast analysis (~2 min)', modules: ['failureMode', 'hallucination'], icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'security', name: 'Security Focus', desc: 'Security & compliance', modules: ['security', 'hallucination'], icon: Shield, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'full', name: 'Full Audit', desc: 'All modules', modules: ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'prompt', 'aiReview'], icon: Search, color: 'text-blue-600 bg-blue-50 border-blue-200' },
]

export default function GitHubAnalysis() {
  const [analysisData, setAnalysisData] = useState(null)
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState('')
  const [showModules, setShowModules] = useState(false)
  const selectedModules = useStore((s) => s.selectedModules)
  const setSelectedModules = useStore((s) => s.setSelectedModules)
  const apiKey = useStore((s) => s.apiKey)
  const addNotification = useStore((s) => s.addNotification)
  const addSubmission = useStore((s) => s.addSubmission)
  const persistFindings = useStore((s) => s.persistFindings)

  const handleAnalyze = async (data) => {
    setLoading(true)
    setError('')
    setFindings([])
    setProgress({ current: 0, total: data.commits.length })

    try {
      const commits = data.commits
      let allFindings = []

      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i]
        const message = commit.commit.message
        const author = commit.commit.author.name
        setProgress({ current: i + 1, total: commits.length })

        const commitFindings = await runAnalysis(
          `Commit: ${message}\nAuthor: ${author}`,
          'text',
          selectedModules,
          message,
          apiKey
        )

        allFindings = [...allFindings, ...commitFindings]
      }

      setAnalysisData(data)
      setFindings(allFindings)

      const crit = allFindings.filter(f => f.severity === 'Critical').length
      const hi = allFindings.filter(f => f.severity === 'High').length
      const med = allFindings.filter(f => f.severity === 'Medium').length
      const inf = allFindings.filter(f => f.severity === 'Info').length
      const weighted = (crit * 10) + (hi * 5) + (med * 2) + (inf * 0.5)
      const score = allFindings.length === 0 ? 100 : Math.max(0, Math.round(100 - weighted))
      const submission = {
        code: `GitHub: ${data.owner}/${data.repo} (${data.branch})`,
        language: 'github',
        modules: selectedModules,
        timestamp: new Date().toISOString(),
        score: Math.min(100, score),
        findings: allFindings,
        source: 'github',
        repo: `${data.owner}/${data.repo}`,
        branch: data.branch,
        commitCount: commits.length,
      }
      const saved = await addSubmission(submission)
      if (saved?.id) await persistFindings(allFindings, saved.id)

      addNotification(`Analysis complete: ${allFindings.length} findings from ${commits.length} commits`, allFindings.length === 0 ? 'success' : 'info')
    } catch (err) {
      setError(`Analysis error: ${err.message}`)
      addNotification(`Analysis failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyProfile = (profile) => {
    setSelectedModules(profile.modules)
    addNotification(`Applied "${profile.name}" profile`, 'info')
  }

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-5 text-white flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">GitHub Repo Analysis</h2>
          <p className="text-gray-300 text-sm">Analyze commits from any GitHub repository for AI-generated code vulnerabilities</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-4 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: GitHub input + progress */}
        <div className="lg:col-span-2 space-y-4">
          <GitHubCodeAnalysis onAnalyze={handleAnalyze} />

          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader className="animate-spin text-blue-600" size={20} />
                <span className="font-semibold text-sm">Analyzing commits...</span>
                <span className="text-sm text-gray-500">{progress.current}/{progress.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Right: Profiles + Module selector */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-3">Test Profiles</h3>
            <div className="space-y-2">
              {TEST_PROFILES.map((p) => {
                const Icon = p.icon
                return (
                  <button key={p.id} onClick={() => handleApplyProfile(p)}
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${p.color} hover:opacity-80`}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-75">{p.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <button onClick={() => setShowModules(!showModules)} className="w-full flex items-center justify-between text-sm font-semibold">
              <span>Analysis Modules ({selectedModules.length})</span>
              {showModules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showModules && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <ModuleSelector />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisData && !loading && (
        <AnalysisDetails analysisData={analysisData} findings={findings} />
      )}
    </div>
  )
}
