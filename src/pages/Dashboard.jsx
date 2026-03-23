import React, { useState } from 'react'
import { useStore } from '../store'
import { TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react'
import StatsOverview from '../components/StatsOverview'
import QuickActions from '../components/QuickActions'
import RecentActivity from '../components/RecentActivity'

export default function Dashboard() {
  const [isDark] = useState(false)
  const submissions = useStore((state) => state.submissions)
  const findings = useStore((state) => state.findings)

  const criticalCount = findings.filter(f => f.severity === 'Critical').length
  const highCount = findings.filter(f => f.severity === 'High').length
  const mediumCount = findings.filter(f => f.severity === 'Medium').length
  const infoCount = findings.filter(f => f.severity === 'Info').length

  const qualityScore = submissions.length > 0 
    ? Math.round((submissions.filter(s => s.score >= 80).length / submissions.length) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Track your code quality over time</p>
      </div>

      <StatsOverview isDark={isDark} />

      <QuickActions isDark={isDark} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Finding Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-medium">Critical</span>
                <span className="text-2xl font-bold text-red-600">{criticalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 font-medium">High</span>
                <span className="text-2xl font-bold text-orange-600">{highCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-600 font-medium">Medium</span>
                <span className="text-2xl font-bold text-yellow-600">{mediumCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Info</span>
                <span className="text-2xl font-bold text-blue-600">{infoCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <RecentActivity isDark={isDark} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
        {submissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No submissions yet. Start by submitting code to analyze.</p>
        ) : (
          <div className="space-y-2">
            {submissions.slice(0, 5).map((submission, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-700">{submission.language}</span>
                <span className="font-semibold text-gray-900">{submission.score}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
