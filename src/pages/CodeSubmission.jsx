import React, { useState } from 'react'
import { useStore } from '../store'
import CodeEditor from '../components/CodeEditor'
import ModuleSelector from '../components/ModuleSelector'
import QuickStats from '../components/QuickStats'
import FindingCard from '../components/FindingCard'
import ExportPanel from '../components/ExportPanel'
import { runAnalysis } from '../modules/analysisEngine'
import { Play, Upload, Loader, ChevronDown, ChevronUp } from 'lucide-react'

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
    modules: ['failureMode', 'security', 'hallucination', 'oracle', 'complexity', 'mutation', 'property', 'differential', 'prompt', 'aiReview'],
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
      const findings = await runAnalysis(code, language, selectedModules, prompt, apiKey)
      
      findings.forEach(finding => {
        useStore.getState().addFinding(finding)
      })

      const critical = findings.filter(f => f.severity === 'Critical').length
      const high = findings.filter(f => f.severity === 'High').length
      const medium = findings.filter(f => f.severity === 'Medium').length
      const infoCount = findings.filter(f => f.severity === 'Info').length
      const weighted = (critical * 10) + (high * 5) + (medium * 2) + (infoCount * 0.5)
      const avgPenalty = findings.length > 0 ? weighted / findings.length : 0
      const score = findings.length === 0 ? 100 : Math.max(0, Math.round(100 - avgPenalty * 10))

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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 -mx-6 px-6 py-3 text-white flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Submit Code for Analysis</h2>
          <p className="text-blue-100 text-xs">Paste or upload code to test against AI failure modes</p>
        </div>
        <span className="text-xs text-blue-200 whitespace-nowrap ml-4">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Profiles</h3>
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
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Modules</h3>
            <ModuleSelector />
          </div>

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
                <p className="text-sm font-medium text-gray-700">{sortedFindings.length} findings</p>
                {sortedFindings.map((finding, idx) => (
                  <FindingCard key={finding.id || idx} finding={finding} />
                ))}
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
