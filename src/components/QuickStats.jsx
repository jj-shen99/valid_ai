import React from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

export default function QuickStats({ findings }) {
  const critical = findings.filter(f => f.severity === 'Critical').length
  const high = findings.filter(f => f.severity === 'High').length
  const medium = findings.filter(f => f.severity === 'Medium').length
  const info = findings.filter(f => f.severity === 'Info').length

  const calculateScore = () => {
    const total = findings.length
    if (total === 0) return 100
    const weighted = (critical * 10) + (high * 5) + (medium * 2) + (info * 0.5)
    return Math.max(0, Math.round(100 - (weighted / total)))
  }

  const score = calculateScore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600 mb-1">Quality Score</p>
        <p className="text-3xl font-bold text-gray-900">{score}%</p>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-red-600" />
          <p className="text-xs text-red-700 font-medium">Critical</p>
        </div>
        <p className="text-2xl font-bold text-red-600">{critical}</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={16} className="text-orange-600" />
          <p className="text-xs text-orange-700 font-medium">High</p>
        </div>
        <p className="text-2xl font-bold text-orange-600">{high}</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={16} className="text-yellow-600" />
          <p className="text-xs text-yellow-700 font-medium">Medium</p>
        </div>
        <p className="text-2xl font-bold text-yellow-600">{medium}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Info size={16} className="text-blue-600" />
          <p className="text-xs text-blue-700 font-medium">Info</p>
        </div>
        <p className="text-2xl font-bold text-blue-600">{info}</p>
      </div>
    </div>
  )
}
