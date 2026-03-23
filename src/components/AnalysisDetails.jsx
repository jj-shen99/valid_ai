import React, { useState } from 'react'
import { ChevronDown, ChevronUp, GitCommit, User, Calendar, Code } from 'lucide-react'

export default function AnalysisDetails({ analysisData, findings }) {
  const [expandedCommit, setExpandedCommit] = useState(null)

  if (!analysisData) {
    return null
  }

  const { owner, repo, branch, days, commits, period } = analysisData

  const stats = {
    totalCommits: commits.length,
    uniqueAuthors: new Set(commits.map(c => c.commit.author.name)).size,
    dateRange: `Last ${period}`,
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Repository</p>
            <p className="font-semibold text-gray-900">{owner}/{repo}</p>
            <p className="text-xs text-gray-500 mt-1">Branch: {branch}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Time Period</p>
            <p className="font-semibold text-gray-900">{period}</p>
            <p className="text-xs text-gray-500 mt-1">Last {days} days</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Total Commits</p>
            <p className="font-semibold text-gray-900">{stats.totalCommits}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Unique Authors</p>
            <p className="font-semibold text-gray-900">{stats.uniqueAuthors}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commit Details</h3>
        
        <div className="space-y-2">
          {commits.map((commit, idx) => (
            <div key={commit.sha} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCommit(expandedCommit === idx ? null : idx)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 text-left">
                  <GitCommit className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {commit.commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {commit.commit.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(commit.commit.author.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedCommit === idx ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                )}
              </button>

              {expandedCommit === idx && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Commit SHA</p>
                    <code className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 block overflow-x-auto">
                      {commit.sha.substring(0, 12)}
                    </code>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Full Message</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {commit.commit.message}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Author</p>
                    <p className="text-sm text-gray-700">
                      {commit.commit.author.name} ({commit.commit.author.email})
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">Date</p>
                    <p className="text-sm text-gray-700">
                      {new Date(commit.commit.author.date).toLocaleString()}
                    </p>
                  </div>

                  {commit.html_url && (
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View on GitHub →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {findings && findings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Analysis Findings</h3>
          <div className="space-y-3">
            {findings.map((finding, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    finding.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    finding.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    finding.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {finding.severity}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{finding.category}</h4>
                <p className="text-sm text-gray-700">{finding.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
