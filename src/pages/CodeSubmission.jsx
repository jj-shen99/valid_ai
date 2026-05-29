import React, { useState, useMemo } from 'react'
import { useStore } from '../store'
import CodeEditor from '../components/CodeEditor'
import ModuleSelector from '../components/ModuleSelector'
import QuickStats from '../components/QuickStats'
import FindingCard from '../components/FindingCard'
import ExportPanel from '../components/ExportPanel'
import { runAnalysis, runAnalysisTimed } from '../modules/analysisEngine'
import { attachAutoFixes } from '../utils/autoFixer'
import { Play, Upload, Loader, ChevronDown, ChevronUp, Layers, List, FolderUp, Search, FileDown, Zap, Shield, Scan } from 'lucide-react'
import { analyzeBatch, readFilesFromInput } from '../utils/batchAnalyzer'
import { groupFindings, deduplicateFindings } from '../utils/findingGrouper'
import { getProfiles, addProfile, removeProfile } from '../utils/profileManager'
import { applySuppressions, addSuppression, getSuppressions } from '../utils/suppressions'
import { useRealtimeAnalysis } from '../hooks/useRealtimeAnalysis'
import { getAnnotations, setAnnotation } from '../utils/annotations'
import { applyOverrides, setOverride } from '../utils/severityOverrides'
import { complexitySummary } from '../utils/complexityMetrics'
import { buildIssueUrl } from '../utils/githubIssueExporter'
import { applyFilters } from '../utils/findingSearch'
import { generateSummaryReport, downloadReport } from '../utils/summaryReport'
import { recordAllModuleTrends } from '../utils/moduleTrend'

const LANGUAGE_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'csharp', label: 'C#' },
]

const TEST_PROFILES = [
  { id: 'quick', name: 'Quick Scan', desc: 'Fast analysis (~2 min)', modules: ['failureMode', 'hallucination'], icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'security', name: 'Security Focus', desc: 'Security & compliance', modules: ['security', 'hallucination'], icon: Shield, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'full', name: 'Full Audit', desc: 'All 14 modules', modules: ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'typescript', 'accessibility', 'dependency', 'deadCode', 'customRules', 'aiReview'], icon: Scan, color: 'text-blue-600 bg-blue-50 border-blue-200' },
]

export default function CodeSubmission() {
  const code = useStore((state) => state.code)
  const setCode = useStore((state) => state.setCode)
  const prompt = useStore((state) => state.prompt)
  const setPrompt = useStore((state) => state.setPrompt)
  const language = useStore((state) => state.language)
  const setLanguage = useStore((state) => state.setLanguage)
  const selectedModules = useStore((state) => state.selectedModules)
  const setSelectedModules = useStore((state) => state.setSelectedModules)
  const isRunning = useStore((state) => state.isRunning)
  const setIsRunning = useStore((state) => state.setIsRunning)
  const clearFindings = useStore((state) => state.clearFindings)
  const addSubmission = useStore((state) => state.addSubmission)

  const [analysisFindings, setAnalysisFindings] = useState([])
  const [analysisScore, setAnalysisScore] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [incremental, setIncremental] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grouped'
  const [groupBy, setGroupBy] = useState('module')
  const [userProfiles, setUserProfiles] = useState(getProfiles)
  const [showSaveProfile, setShowSaveProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [suppressionCount, setSuppressionCount] = useState(0)
  const [perfTimings, setPerfTimings] = useState(null)
  const [showPerf, setShowPerf] = useState(false)
  const [batchResults, setBatchResults] = useState(null)
  const [batchProgress, setBatchProgress] = useState(null)
  const [realtime, setRealtime] = useState(false)
  const [annotations, setAnnotations] = useState(getAnnotations)
  const [complexityData, setComplexityData] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState([])
  const addNotification = useStore((s) => s.addNotification)

  const handleAnnotate = (findingId, text) => {
    setAnnotation(findingId, text)
    setAnnotations(getAnnotations())
    addNotification('Note saved', 'success')
  }

  const handleOverrideSeverity = (finding, newSeverity) => {
    setOverride(finding.module, finding.category, newSeverity)
    setAnalysisFindings(prev => applyOverrides(prev))
    addNotification(`Severity changed to ${newSeverity}`, 'info')
  }

  const handleSuppress = (finding) => {
    addSuppression(finding.module, finding.category)
    const updated = applySuppressions(analysisFindings)
    setAnalysisFindings(updated)
    setSuppressionCount(c => c + 1)
    addNotification(`Suppressed: ${finding.category}`, 'info')
  }

  const handleRunAnalysis = async () => {
    if (!code.trim()) {
      alert('Please enter some code to analyze')
      return
    }

    setIsRunning(true)
    clearFindings()
    setAnalysisFindings([])
    setAnalysisScore(null)
    setShowResults(true)

    try {
      const apiKey = useStore.getState().apiKey
      const timedResult = await runAnalysisTimed(code, language, selectedModules, prompt, apiKey)
      setPerfTimings(timedResult.timings)
      const rawFindings = incremental
        ? await runAnalysis(code, language, selectedModules, prompt, apiKey, { incremental })
        : timedResult.findings
      const findings = applyOverrides(attachAutoFixes(rawFindings, code))
      setComplexityData(complexitySummary(code))
      recordAllModuleTrends(findings)
      
      findings.forEach(finding => {
        useStore.getState().addFinding(finding)
      })

      const actionable = findings.filter(f => f.severity !== 'Info')
      const critical = actionable.filter(f => f.severity === 'Critical').length
      const high = actionable.filter(f => f.severity === 'High').length
      const medium = actionable.filter(f => f.severity === 'Medium').length
      const weighted = (critical * 10) + (high * 5) + (medium * 2)
      const avgPenalty = actionable.length > 0 ? weighted / actionable.length : 0
      const score = actionable.length === 0 ? 100 : Math.max(0, Math.round(100 - avgPenalty * 10))

      setAnalysisFindings(findings)
      setAnalysisScore(Math.min(100, score))

      const submission = {
        code,
        prompt,
        language,
        modules: selectedModules,
        timestamp: new Date().toISOString(),
        score: Math.min(100, score),
        findings,
        source: 'code',
      }
      const saved = await addSubmission(submission)
      if (saved?.id) {
        await useStore.getState().persistFindings(findings, saved.id)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Error running analysis: ' + error.message)
    } finally {
      setIsRunning(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCode(event.target.result)
        const ext = file.name.split('.').pop().toLowerCase()
        const langMap = {
          py: 'python',
          js: 'javascript',
          ts: 'typescript',
          java: 'java',
          go: 'go',
          cs: 'csharp',
        }
        if (langMap[ext]) setLanguage(langMap[ext])
      }
      reader.readAsText(file)
    }
  }

  const handleApplyProfile = (profile) => {
    setSelectedModules(profile.modules)
  }

  const realtimeResult = useRealtimeAnalysis(code, language, selectedModules, { enabled: realtime })

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
  const filteredFindings = applyFilters(analysisFindings, { query: searchQuery, severities: severityFilter.length > 0 ? severityFilter : undefined })
  const sortedFindings = [...filteredFindings].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

  const handleDownloadReport = () => {
    const report = generateSummaryReport(analysisFindings, { language, modules: selectedModules, score: analysisScore, timestamp: new Date().toISOString() })
    downloadReport(report)
    addNotification('Report downloaded', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 -mx-6 px-6 py-2 text-white flex items-center justify-between">
        <h2 className="text-sm font-bold">Submit Code <span className="font-normal text-blue-200 ml-2 text-xs">Paste or upload code to test against AI failure modes</span></h2>
        <span className="text-xs text-blue-200 whitespace-nowrap ml-4">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-900">Code</label>
              {realtime && realtimeResult.isAnalyzing && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium animate-pulse">analyzing...</span>}
              {realtime && !realtimeResult.isAnalyzing && realtimeResult.findings.length > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{realtimeResult.findings.length} live issues</span>
              )}
              {realtime && !realtimeResult.isAnalyzing && realtimeResult.findings.length === 0 && code.trim() && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">clean</span>
              )}
            </div>
            <CodeEditor value={code} onChange={setCode} language={language} />
          </div>

          <div className="flex gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <Upload size={16} />
              Upload File
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".py,.js,.ts,.java,.go,.cs,.jsx,.tsx"
              />
            </label>
            <label className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2">
              <FolderUp size={16} />
              Batch
              <input
                type="file"
                multiple
                onChange={async (e) => {
                  const fileList = e.target.files
                  if (!fileList?.length) return
                  setIsRunning(true)
                  setBatchResults(null)
                  setShowResults(false)
                  try {
                    const files = await readFilesFromInput(fileList)
                    const result = await analyzeBatch(files, selectedModules, (p) => setBatchProgress(p))
                    setBatchResults(result)
                    setBatchProgress(null)
                    addNotification(`Batch: ${result.summary.fileCount} files, ${result.summary.totalFindings} findings`, 'success')
                  } catch (err) {
                    addNotification('Batch analysis failed: ' + err.message, 'error')
                  } finally {
                    setIsRunning(false)
                    e.target.value = ''
                  }
                }}
                className="hidden"
                accept=".py,.js,.ts,.java,.go,.cs,.jsx,.tsx"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Generation Prompt (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste the prompt used to generate this code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Test Profiles</h3>
              <button onClick={() => setShowSaveProfile(s => !s)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Save Current</button>
            </div>

            {showSaveProfile && (
              <div className="flex gap-2 mb-3">
                <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Profile name" className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                <button
                  onClick={() => {
                    if (!profileName.trim()) return
                    setUserProfiles(addProfile(profileName.trim(), selectedModules))
                    setProfileName(''); setShowSaveProfile(false)
                    addNotification('Profile saved', 'success')
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                >Save</button>
              </div>
            )}

            <div className="space-y-2">
              {TEST_PROFILES.map((profile) => {
                const Icon = profile.icon
                return (
                  <button
                    key={profile.id}
                    onClick={() => handleApplyProfile(profile)}
                    className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${profile.color} hover:opacity-80`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span className="font-medium text-sm">{profile.name}</span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-75">{profile.desc}</p>
                  </button>
                )
              })}
              {userProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedModules(profile.modules)}
                    className="flex-1 text-left px-4 py-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors bg-blue-50/30"
                  >
                    <div className="font-medium text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-500">{profile.modules.length} modules</div>
                  </button>
                  <button onClick={() => { setUserProfiles(removeProfile(profile.id)); addNotification('Profile deleted', 'info') }} className="text-gray-400 hover:text-red-600 p-1">✕</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Modules</h3>
            <ModuleSelector />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={incremental} onChange={e => setIncremental(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="font-medium">Incremental mode</span>
            <span className="text-xs text-gray-400">Only report findings on changed lines</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={realtime} onChange={e => setRealtime(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="font-medium">Real-time mode</span>
            <span className="text-xs text-gray-400">Auto-analyze as you type (1.5s delay)</span>
          </label>

          <button
            onClick={handleRunAnalysis}
            disabled={isRunning || !code.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isRunning ? <Loader size={18} className="animate-spin" /> : <Play size={18} />}
            {isRunning ? 'Running Analysis...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* ─── Inline Analysis Results ─── */}
      {showResults && (
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Analysis Results
              {analysisScore !== null && (
                <span className={`ml-3 text-sm font-medium px-2.5 py-1 rounded-full ${
                  analysisScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  analysisScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Score: {analysisScore}%
                </span>
              )}
            </h3>
            {!isRunning && analysisFindings.length > 0 && (
              <button
                onClick={() => setShowResults(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide Results
              </button>
            )}
          </div>

          {isRunning && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <Loader className="animate-spin text-blue-600 mx-auto mb-3" size={28} />
              <p className="text-gray-600 text-sm">Running analysis modules...</p>
            </div>
          )}

          {!isRunning && analysisFindings.length > 0 && (
            <>
              <QuickStats findings={analysisFindings} />

              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                <div className="flex items-center gap-1 flex-1 min-w-[200px] bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search findings..."
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                </div>
                {['Critical', 'High', 'Medium', 'Info'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(prev => prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev])}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      severityFilter.includes(sev)
                        ? sev === 'Critical' ? 'bg-red-100 border-red-300 text-red-700'
                          : sev === 'High' ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : sev === 'Medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                          : 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                  >{sev}</button>
                ))}
                <button onClick={handleDownloadReport} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 ml-auto" title="Download markdown report">
                  <FileDown size={14} /> Report
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {sortedFindings.length} findings
                    {sortedFindings.length !== analysisFindings.length && <span className="text-xs text-gray-400 ml-1">(of {analysisFindings.length})</span>}
                    {suppressionCount > 0 && <span className="text-xs text-gray-400 ml-2">({suppressionCount} suppressed)</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`} title="List view"><List size={16} /></button>
                    <button onClick={() => setViewMode('grouped')} className={`p-1.5 rounded ${viewMode === 'grouped' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`} title="Grouped view"><Layers size={16} /></button>
                    {viewMode === 'grouped' && (
                      <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1">
                        <option value="module">By Module</option>
                        <option value="severity">By Severity</option>
                        <option value="category">By Category</option>
                      </select>
                    )}
                  </div>
                </div>

                {viewMode === 'list' ? (
                  sortedFindings.map((finding, idx) => (
                    <FindingCard key={finding.id || idx} finding={finding} sourceCode={code} onSuppress={handleSuppress} onAnnotate={handleAnnotate} onOverrideSeverity={handleOverrideSeverity} annotation={annotations[finding.id]} />
                  ))
                ) : (
                  groupFindings(deduplicateFindings(sortedFindings), groupBy).map(group => (
                    <details key={group.label} className="border border-gray-200 rounded-lg" open>
                      <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-gray-50 rounded-t-lg hover:bg-gray-100">
                        <span className="text-sm font-semibold text-gray-800">{group.label}</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{group.count}</span>
                      </summary>
                      <div className="p-3 space-y-2">
                        {group.findings.map((finding, idx) => (
                          <FindingCard key={finding.id || idx} finding={finding} sourceCode={code} onSuppress={handleSuppress} onAnnotate={handleAnnotate} onOverrideSeverity={handleOverrideSeverity} annotation={annotations[finding.id]} />
                        ))}
                      </div>
                    </details>
                  ))
                )}
              </div>

              {complexityData && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Complexity Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">{complexityData.grade}</p>
                      <p className="text-[10px] text-gray-500">Grade</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">{complexityData.cyclomaticComplexity}</p>
                      <p className="text-[10px] text-gray-500">Cyclomatic</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">{complexityData.cognitiveComplexity}</p>
                      <p className="text-[10px] text-gray-500">Cognitive</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xl font-bold text-gray-900">{complexityData.logicalLOC}</p>
                      <p className="text-[10px] text-gray-500">Logical LOC</p>
                    </div>
                  </div>
                  {complexityData.functions.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-xs text-gray-500 cursor-pointer">Function breakdown ({complexityData.functions.length})</summary>
                      <div className="mt-2 space-y-1">
                        {complexityData.functions.map((fn, i) => (
                          <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                            <span className="font-mono truncate">{fn.name}()</span>
                            <span className="text-gray-400">CC:{fn.cyclomaticComplexity} Cog:{fn.cognitiveComplexity} LOC:{fn.loc}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {perfTimings && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <button onClick={() => setShowPerf(s => !s)} className="flex items-center justify-between w-full text-sm font-semibold text-gray-700">
                    <span>Performance Metrics</span>
                    <span className="text-xs text-gray-400">{showPerf ? 'Hide' : 'Show'}</span>
                  </button>
                  {showPerf && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(perfTimings).map(([mod, data]) => {
                        const maxDuration = Math.max(...Object.values(perfTimings).map(d => d.duration || 0), 1)
                        return (
                          <div key={mod} className="flex items-center gap-3 text-xs">
                            <span className="w-36 truncate font-medium text-gray-600">{mod}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${((data.duration || 0) / maxDuration) * 100}%` }} />
                            </div>
                            <span className="w-16 text-right text-gray-500">{data.duration?.toFixed(1) || 0}ms</span>
                            <span className="w-10 text-right text-gray-400">{data.findingCount ?? 0}</span>
                          </div>
                        )
                      })}
                      <div className="pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                        <span>Total: {Object.values(perfTimings).reduce((s, d) => s + (d.duration || 0), 0).toFixed(1)}ms</span>
                        <span>{Object.keys(perfTimings).length} modules</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ExportPanel
                findings={sortedFindings}
                metadata={{
                  language,
                  modules: selectedModules,
                  timestamp: new Date().toISOString(),
                  source: 'code',
                }}
              />
            </>
          )}

          {!isRunning && analysisFindings.length === 0 && analysisScore !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <p className="text-emerald-800 font-medium">No issues found — your code looks clean!</p>
            </div>
          )}
        </div>
      )}

      {/* Batch progress */}
      {batchProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-2" size={20} />
          <p className="text-sm text-blue-800">Analyzing {batchProgress.filename} ({batchProgress.current}/{batchProgress.total})</p>
        </div>
      )}

      {/* Batch results */}
      {batchResults && (
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Batch Results
            <span className="ml-3 text-sm font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
              {batchResults.summary.fileCount} files &middot; Avg: {batchResults.summary.avgScore}%
            </span>
          </h3>
          <div className="space-y-2">
            {batchResults.results.map((r, i) => (
              <details key={i} className="border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-800">{r.filename}</span>
                    <span className="text-xs text-gray-500">{r.language}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      r.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{r.score}%</span>
                    <span className="text-xs text-gray-400">{r.stats.total} findings</span>
                  </div>
                </summary>
                {r.findings.length > 0 && (
                  <div className="p-3 space-y-2 border-t border-gray-100">
                    {r.findings.slice(0, 10).map((f, idx) => (
                      <FindingCard key={f.id || idx} finding={f} />
                    ))}
                    {r.findings.length > 10 && <p className="text-xs text-gray-400 text-center">+{r.findings.length - 10} more</p>}
                  </div>
                )}
                {r.error && <p className="px-4 py-2 text-xs text-red-600 border-t border-gray-100">{r.error}</p>}
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
