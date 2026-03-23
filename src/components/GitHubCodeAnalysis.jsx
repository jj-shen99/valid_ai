import React, { useState } from 'react'
import { useStore } from '../store'
import { Github, Calendar, Loader, AlertCircle, Lock } from 'lucide-react'

const TIME_PERIODS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
]

export default function GitHubCodeAnalysis({ onAnalyze }) {
  const [repoPath, setRepoPath] = useState('')
  const [branch, setBranch] = useState('main')
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const githubToken = useStore((s) => s.githubToken)

  const parseRepo = (input) => {
    let cleaned = input.trim()
    cleaned = cleaned.replace(/^https?:\/\/github\.com\//, '')
    cleaned = cleaned.replace(/\.git$/, '')
    cleaned = cleaned.replace(/\/$/, '')
    const parts = cleaned.split('/')
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] }
    }
    return null
  }

  const handleAnalyze = async () => {
    const parsed = parseRepo(repoPath)
    if (!parsed) {
      setError('Enter a repository as owner/repo (e.g. facebook/react) or paste a GitHub URL')
      return
    }

    const { owner, repo } = parsed
    setLoading(true)
    setError('')

    try {
      const headers = {}
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${getDateString(days)}&sha=${branch}&per_page=50`,
        { headers }
      )

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const msg = body.message || response.statusText || `HTTP ${response.status}`
        if (response.status === 403) {
          throw new Error(`Rate limited. Add a GitHub token in Settings to increase your limit. (${msg})`)
        }
        if (response.status === 404) {
          throw new Error(`Repository not found: ${owner}/${repo}. Check the repository path.`)
        }
        throw new Error(`GitHub API error (${response.status}): ${msg}`)
      }

      const commits = await response.json()

      if (!Array.isArray(commits) || commits.length === 0) {
        setError(`No commits found in the last ${days} days on branch "${branch}"`)
        return
      }

      onAnalyze({
        owner,
        repo,
        branch,
        days,
        commits: commits.slice(0, 50),
        period: `${days} days`,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github size={20} />
          <h3 className="font-semibold">Analyze GitHub Changes</h3>
        </div>
        {githubToken ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <Lock size={12} /> Authenticated
          </span>
        ) : (
          <span className="text-xs text-gray-400">Unauthenticated (60 req/hr)</span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Repository</label>
          <input
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="owner/repo or https://github.com/owner/repo"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Period</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !repoPath.trim()}
          className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader className="animate-spin" size={16} /> Fetching commits...</>
          ) : (
            <><Calendar size={16} /> Analyze Changes</>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
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
