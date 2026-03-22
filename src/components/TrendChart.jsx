import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function TrendChart({ submissions }) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No submission history yet</p>
      </div>
    )
  }

  const data = submissions.slice().reverse().map((submission, idx) => ({
    name: `#${submissions.length - idx}`,
    score: submission.score,
    critical: submission.findings?.filter(f => f.severity === 'Critical').length || 0,
    high: submission.findings?.filter(f => f.severity === 'High').length || 0,
  }))

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Quality Score" />
          <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical Issues" />
          <Line type="monotone" dataKey="high" stroke="#f97316" name="High Issues" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
