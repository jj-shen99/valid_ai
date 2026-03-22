import React, { useState } from 'react'
import { Github, Copy, Check } from 'lucide-react'
import { generateGitHubComment, postPullRequestComment } from '../utils/githubIntegration'

export default function GitHubIntegration({ findings, metadata }) {
  const [ghToken, setGhToken] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [prNumber, setPrNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [copied, setCopied] = useState(false)

  const comment = generateGitHubComment(findings, metadata)

  const handlePostComment = async () => {
    if (!ghToken || !owner || !repo || !prNumber) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    try {
      await postPullRequestComment(ghToken, owner, repo, parseInt(prNumber), findings, metadata)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyComment = () => {
    navigator.clipboard.writeText(comment)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Github size={20} className="text-gray-900" />
        <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">GitHub Token</label>
            <input
              type="password"
              value={ghToken}
              onChange={(e) => setGhToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Repository</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repo-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">PR Number</label>
            <input
              type="number"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePostComment}
            disabled={loading || !ghToken || !owner || !repo || !prNumber}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Github size={16} />
            Post to PR
          </button>
          <button
            onClick={() => setShowComment(!showComment)}
            className="px-4 py-2 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Preview Comment
          </button>
        </div>

        {success && <p className="text-sm text-green-600 font-medium">✓ Comment posted successfully</p>}
        {error && <p className="text-sm text-red-600 font-medium">Error: {error}</p>}

        {showComment && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">PREVIEW</p>
              <button
                onClick={handleCopyComment}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs text-gray-700 overflow-auto max-h-64 font-mono whitespace-pre-wrap break-words">
              {comment}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
