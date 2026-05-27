import React from 'react'
import SVGLineChart from './charts/SVGLineChart'

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
      <SVGLineChart
        data={data}
        lines={[
          { key: 'score', label: 'Quality Score', color: 'blue' },
          { key: 'critical', label: 'Critical Issues', color: 'red' },
          { key: 'high', label: 'High Issues', color: 'orange' },
        ]}
        height={300}
      />
    </div>
  )
}
