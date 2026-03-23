import React, { useState } from 'react'
import { useStore } from '../store'
import { Eye, EyeOff, Save, Trash2, Database, Github } from 'lucide-react'

export default function Settings() {
  const apiKey = useStore((s) => s.apiKey)
  const setApiKey = useStore((s) => s.setApiKey)
  const githubToken = useStore((s) => s.githubToken)
  const setGithubToken = useStore((s) => s.setGithubToken)
  const clearAllData = useStore((s) => s.clearAllData)
  const addNotification = useStore((s) => s.addNotification)
  const submissions = useStore((s) => s.submissions)
  const findings = useStore((s) => s.findings)

  const [showKey, setShowKey] = useState(false)
  const [showGHToken, setShowGHToken] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey)
  const [tempGH, setTempGH] = useState(githubToken)

  const handleSaveApiKey = () => {
    setApiKey(tempKey)
    addNotification('Claude API key saved', 'success')
  }

  const handleSaveGH = () => {
    setGithubToken(tempGH)
    addNotification('GitHub token saved', 'success')
  }

  const handleClearData = () => {
    if (window.confirm('Clear all analysis data from the database? This cannot be undone.')) {
      clearAllData()
      addNotification('All data cleared', 'info')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Claude API Key */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold mb-1">Claude API Key</h3>
        <p className="text-sm text-gray-500 mb-4">Required for the AI Review Assistant module.</p>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={handleSaveApiKey}
            disabled={tempKey === apiKey}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* GitHub Token */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Github size={18} />
          <h3 className="font-semibold">GitHub Personal Access Token</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Increases API rate limits from 60 to 5,000 requests/hour. Also needed for private repos.</p>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showGHToken ? 'text' : 'password'}
              value={tempGH}
              onChange={(e) => setTempGH(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button onClick={() => setShowGHToken(!showGHToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showGHToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={handleSaveGH}
            disabled={tempGH === githubToken}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Database */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <Database size={18} />
          <h3 className="font-semibold">Database</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Analysis data is stored locally in your browser using IndexedDB.</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-gray-500">Submissions</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{findings.length}</p>
            <p className="text-xs text-gray-500">Findings</p>
          </div>
        </div>
        <button
          onClick={handleClearData}
          className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} /> Clear All Data
        </button>
      </div>

      {/* About */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold mb-3">About ValidAI</h3>
        <div className="space-y-1.5 text-sm text-gray-600">
          <p><strong>Version:</strong> 0.2.0</p>
          <p><strong>Stack:</strong> React + Vite + Tailwind CSS + IndexedDB</p>
          <p><strong>License:</strong> MIT</p>
          <p><strong>Modules:</strong> 10 analysis modules</p>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Privacy</h3>
        <ul className="text-sm text-blue-800 space-y-1.5">
          <li>All analysis runs locally in your browser</li>
          <li>Code is never sent externally (except Claude API if enabled)</li>
          <li>Keys and data stored only in browser storage</li>
          <li>No tracking or analytics</li>
        </ul>
      </div>
    </div>
  )
}
