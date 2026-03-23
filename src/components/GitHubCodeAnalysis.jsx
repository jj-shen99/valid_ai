import React, { useState } from 'react'
import { Github, Calendar, Loader, AlertCircle } from 'lucide-react'

const TIME_PERIODS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
]

export default function GitHubCodeAnalysis({ onAnalyze }) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!owner || !repo) {
      setError('Please enter owner and repository name')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${getDateString(days)}&sha=${branch}`
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const commits = await response.json()

      if (commits.length === 0) {
        setError(`No commits found in the last ${days} days`)
        return
      }

      const analysisData = {
        owner,
        repo,
        branch,
        days,
        commits: commits.slice(0, 50),
        period: `${days} days`,
      }

      onAnalyze(analysisData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Github size={20} className="text-gray-900" />
        <h3 className="text-lg font-semibold text-gray-900">Analyze GitHub Changes</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="username or organization"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Repository</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repository-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Time Period</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !owner || !repo}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={16} />
              Fetching commits...
            </>
          ) : (
            <>
              <Calendar size={16} />
              Analyze Changes
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getDateString(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}
