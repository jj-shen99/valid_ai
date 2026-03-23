import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import FindingCard from '../components/FindingCard'
import QuickStats from '../components/QuickStats'
import ExportPanel from '../components/ExportPanel'
import { getAllSubmissions, getFindingsBySubmission } from '../utils/db'
import { Loader, AlertCircle, ChevronDown, Clock, Github, FileText, Database } from 'lucide-react'

const MODULES = {
  failureMode: { name: 'Failure Mode Scanner', icon: '🔍', desc: 'Detects off-by-one errors, missing null/undefined checks, silent exception swallowing, unbounded loops, and type coercion issues common in AI-generated code.' },
  security: { name: 'Security Probe', icon: '🔒', desc: 'Scans for OWASP Top 10 vulnerabilities including SQL injection, XSS, weak cryptography, hardcoded credentials, command injection, and insecure deserialization.' },
  hallucination: { name: 'Hallucination Detector', icon: '👻', desc: 'Identifies calls to non-existent or hallucinated API methods by comparing against known JavaScript and Python standard library APIs.' },
  oracle: { name: 'Oracle Checker', icon: '📋', desc: 'Verifies input validation patterns, return type consistency, and contract adherence to ensure code meets expected behavioral specifications.' },
  complexity: { name: 'Complexity Profiler', icon: '📊', desc: 'Flags nested loops, unbounded recursion, inefficient sort patterns, full table scans, and memory accumulation issues that impact performance.' },
  mutation: { name: 'Mutation Scorer', icon: '🧬', desc: 'Identifies boundary operators, boolean negation targets, and arithmetic mutation points to assess how well test suites can catch semantic changes.' },
  property: { name: 'Property Generator', icon: '🎯', desc: 'Analyzes function signatures and structure to suggest property-based tests, invariants, and testability improvements.' },
  differential: { name: 'Differential Runner', icon: '⚖️', desc: 'Detects versioned functions and algorithm alternatives to enable comparison testing between different implementations.' },
  prompt: { name: 'Prompt Testability', icon: '📝', desc: 'Evaluates prompt structure for edge cases, constraint coverage, error semantics, and ambiguity that could affect AI code generation quality.' },
  aiReview: { name: 'AI Review Assistant', icon: '🤖', desc: 'Uses Claude API for deep anti-pattern detection, architectural review, and context-aware suggestions beyond regex-based analysis.' },
}

export default function AnalysisView({ onNavigate }) {
  const selectedModules = useStore((state) => state.selectedModules)
  const liveFindings = useStore((state) => state.findings)
  const isRunning = useStore((state) => state.isRunning)
  const moduleProgress = useStore((state) => state.moduleProgress)
  const updateModuleProgress = useStore((state) => state.updateModuleProgress)
  const addNotification = useStore((state) => state.addNotification)

  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [selectedSubId, setSelectedSubId] = useState('live')
  const [loadedFindings, setLoadedFindings] = useState(null)
  const [loadedSubmission, setLoadedSubmission] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Load recent submissions from DB
  useEffect(() => {
    getAllSubmissions().then(subs => {
      setRecentSubmissions(subs.slice(0, 50))
    }).catch(() => {})
  }, [liveFindings])

  // Progress animation for live analysis
  useEffect(() => {
    if (!isRunning) return
    selectedModules.forEach((moduleName) => {
      updateModuleProgress(moduleName, 'running')
    })
    const completeModules = () => {
      selectedModules.forEach((moduleName) => {
        updateModuleProgress(moduleName, 'complete')
      })
    }
    const timer = setTimeout(completeModules, 1500)
    return () => clearTimeout(timer)
  }, [isRunning, selectedModules, updateModuleProgress])

  // Load a saved analysis from DB
  const handleLoadSubmission = async (sub) => {
    setLoadingHistory(true)
    setDropdownOpen(false)
    try {
      const findings = sub.findings && sub.findings.length > 0
        ? sub.findings
        : await getFindingsBySubmission(sub.id)
      setLoadedFindings(findings)
      setLoadedSubmission(sub)
      setSelectedSubId(sub.id)
      addNotification(`Loaded analysis from ${new Date(sub.timestamp).toLocaleString()}`, 'info')
    } catch (err) {
      addNotification('Failed to load analysis: ' + err.message, 'error')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSwitchToLive = () => {
    setSelectedSubId('live')
    setLoadedFindings(null)
    setLoadedSubmission(null)
    setDropdownOpen(false)
  }

  const handleGoToSubmit = () => {
    if (onNavigate) onNavigate('submit')
  }

  // Determine which findings and modules to display
  const isLive = selectedSubId === 'live'
  const displayFindings = isLive ? liveFindings : (loadedFindings || [])
  const displayModules = isLive ? selectedModules : (loadedSubmission?.modules || [])

  const sortedFindings = [...displayFindings].sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  })

  const code = useStore((state) => state.code)
  const language = isLive ? useStore.getState().language : (loadedSubmission?.language || 'unknown')

  const formatLabel = (sub) => {
    const date = new Date(sub.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    const source = sub.source === 'github' ? `GitHub: ${sub.repo}` : `Code (${sub.language || 'unknown'})`
    const findingCount = sub.findings?.length ?? 0
    return { date, source, findingCount, score: sub.score ?? 0 }
  }

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 -mx-6 px-6 py-2 text-white flex items-center justify-between">
        <h2 className="text-sm font-bold">Analysis Results <span className="font-normal text-indigo-200 ml-2 text-xs">Review findings from past and current analyses</span></h2>
        <span className="text-xs text-indigo-200 whitespace-nowrap ml-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      <div className="flex items-end justify-end">
        {/* ─── Analysis Selector Dropdown ─── */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors min-w-[260px] justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Database size={15} className="text-gray-400" />
              {isLive ? (
                <span>Latest Analysis {isRunning && <span className="text-blue-600">(running)</span>}</span>
              ) : (
                <span className="truncate max-w-[180px]">{formatLabel(loadedSubmission).source} — {formatLabel(loadedSubmission).date}</span>
              )}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-[380px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-[420px] overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Analysis</p>
                </div>

                {/* Live option */}
                <button
                  onClick={handleSwitchToLive}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100 ${isLive ? 'bg-blue-50' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isLive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Loader size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Latest Analysis</p>
                    <p className="text-xs text-gray-500">{liveFindings.length} findings{isRunning ? ' — running' : ''}</p>
                  </div>
                </button>

                {/* Saved submissions */}
                <div className="overflow-y-auto max-h-[320px]">
                  {recentSubmissions.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No saved analyses yet</p>
                  ) : (
                    recentSubmissions.map((sub) => {
                      const info = formatLabel(sub)
                      const isGitHub = sub.source === 'github'
                      const isSelected = selectedSubId === sub.id
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleLoadSubmission(sub)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isGitHub ? 'bg-gray-900 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                            {isGitHub ? <Github size={14} /> : <FileText size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{info.source}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1"><Clock size={10} />{info.date}</span>
                              <span>{info.findingCount} findings</span>
                              <span className={`font-semibold ${info.score >= 80 ? 'text-emerald-600' : info.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{info.score}%</span>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loaded submission banner */}
      {!isLive && loadedSubmission && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">Viewing saved analysis</p>
              <p className="text-xs text-indigo-700">
                {formatLabel(loadedSubmission).source} — {formatLabel(loadedSubmission).date}
                {loadedSubmission.branch && ` — ${loadedSubmission.branch}`}
                {loadedSubmission.commitCount && ` — ${loadedSubmission.commitCount} commits`}
              </p>
            </div>
          </div>
          
        </div>
      )}

      {loadingHistory && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-3" size={28} />
          <p className="text-gray-600 text-sm">Loading saved analysis...</p>
        </div>
      )}

      {!loadingHistory && (
        <>
          <QuickStats findings={sortedFindings} storedScore={!isLive && loadedSubmission ? loadedSubmission.score : undefined} />

          {displayModules.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayModules.map((moduleName) => {
                const module = MODULES[moduleName]
                if (!module) return null
                const status = isLive ? (moduleProgress[moduleName] || 'pending') : 'complete'
                return (
                  <div key={moduleName} className="bg-white border border-gray-200 rounded-lg p-3 group relative">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xl">{module.icon}</span>
                      {status === 'running' && <Loader className="animate-spin text-blue-600" size={14} />}
                      {status === 'complete' && <span className="text-green-600 text-xs font-medium">✓</span>}
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">{module.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight line-clamp-2">{module.desc}</p>
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-30 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                      <p className="font-semibold mb-1">{module.name}</p>
                      <p className="text-gray-300 leading-relaxed">{module.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Findings ({sortedFindings.length})</h3>
              {isLive && isRunning && <span className="text-sm text-gray-500 flex items-center gap-1"><Loader size={14} className="animate-spin" /> Running...</span>}
            </div>

            {sortedFindings.length === 0 && !isRunning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-blue-900">No findings yet</p>
                  <p className="text-sm text-blue-700">{isLive ? 'Run an analysis from Submit Code or GitHub to see results.' : 'This saved analysis has no findings.'}</p>
                  {isLive && (
                    <button onClick={handleGoToSubmit} className="mt-2 text-sm font-medium text-blue-700 underline hover:text-blue-900">Go to Submit Code</button>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {sortedFindings.map((finding, idx) => (
                <FindingCard key={finding.id || idx} finding={finding} />
              ))}
            </div>
          </div>

          {sortedFindings.length > 0 && (
            <ExportPanel 
              findings={sortedFindings} 
              metadata={{
                language,
                modules: displayModules,
                timestamp: loadedSubmission?.timestamp || new Date().toISOString(),
                source: loadedSubmission?.source || 'live',
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
