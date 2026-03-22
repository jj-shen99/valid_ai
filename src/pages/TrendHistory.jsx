import React from 'react'
import { useStore } from '../store'
import TrendChart from '../components/TrendChart'
import SubmissionHistory from '../components/SubmissionHistory'

export default function TrendHistory() {
  const submissions = useStore((state) => state.submissions)

  const handleDelete = (index) => {
    const newSubmissions = submissions.filter((_, i) => i !== index)
    useStore.setState({ submissions: newSubmissions })
  }

  const handleSelect = (submission) => {
    console.log('Selected submission:', submission)
  }

  const stats = {
    totalSubmissions: submissions.length,
    avgScore: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
      : 0,
    bestScore: submissions.length > 0
      ? Math.max(...submissions.map(s => s.score))
      : 0,
    worstScore: submissions.length > 0
      ? Math.min(...submissions.map(s => s.score))
      : 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Trend History</h2>
        <p className="text-gray-600">Track code quality improvements over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Average Score</p>
          <p className="text-3xl font-bold text-gray-900">{stats.avgScore}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Best Score</p>
          <p className="text-3xl font-bold text-green-600">{stats.bestScore}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Worst Score</p>
          <p className="text-3xl font-bold text-red-600">{stats.worstScore}%</p>
        </div>
      </div>

      <TrendChart submissions={submissions} />

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission History</h3>
        <SubmissionHistory 
          submissions={submissions}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
