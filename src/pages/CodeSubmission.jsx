import React, { useState } from 'react'
import { useStore } from '../store'
import CodeEditor from '../components/CodeEditor'
import ModuleSelector from '../components/ModuleSelector'
import QuickStats from '../components/QuickStats'
import FindingCard from '../components/FindingCard'
import ExportPanel from '../components/ExportPanel'
import { runAnalysis } from '../modules/analysisEngine'
import { attachAutoFixes } from '../utils/autoFixer'
import { Play, Upload, Loader, ChevronDown, ChevronUp, Layers, List } from 'lucide-react'
import { groupFindings, deduplicateFindings } from '../utils/findingGrouper'
import { getProfiles, addProfile, removeProfile } from '../utils/profileManager'

const LANGUAGE_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'csharp', label: 'C#' },
]

const TEST_PROFILES = [
  {
    id: 'quick',
    name: 'Quick Scan',
    description: '~2 minutes',
    modules: ['failureMode', 'hallucination'],
  },
  {
    id: 'security',
    name: 'Security Focus',
    description: 'Security & compliance',
    modules: ['security', 'hallucination'],
  },
  {
    id: 'full',
    name: 'Full Audit',
    description: 'All modules',
    modules: ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'aiReview'],
  },
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
  const addNotification = useStore((s) => s.addNotification)

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
      const rawFindings = await runAnalysis(code, language, selectedModules, prompt, apiKey, { incremental })
      const findings = attachAutoFixes(rawFindings, code)
      
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

  const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
  const sortedFindings = [...analysisFindings].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

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
            <label className="block text-sm font-medium text-gray-900 mb-2">Code</label>
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
                accept=".py,.js,.ts,.java,.go,.cs"
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
              {TEST_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleApplyProfile(profile)}
                  className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{profile.name}</div>
                  <div className="text-xs text-gray-600">{profile.description}</div>
                </button>
              ))}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">{sortedFindings.length} findings</p>
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
                    <FindingCard key={finding.id || idx} finding={finding} sourceCode={code} />
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
                          <FindingCard key={finding.id || idx} finding={finding} sourceCode={code} />
                        ))}
                      </div>
                    </details>
                  ))
                )}
              </div>

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
    </div>
  )
}
