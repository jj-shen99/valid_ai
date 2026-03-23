import React, { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react'

export default function QuickStats({ findings, storedScore }) {
  const [showFormula, setShowFormula] = useState(false)
  const critical = findings.filter(f => f.severity === 'Critical').length
  const high = findings.filter(f => f.severity === 'High').length
  const medium = findings.filter(f => f.severity === 'Medium').length
  const info = findings.filter(f => f.severity === 'Info').length

  const weighted = (critical * 10) + (high * 5) + (medium * 2) + (info * 0.5)
  const calculatedScore = findings.length === 0 ? 100 : Math.max(0, Math.round(100 - weighted))
  const score = storedScore != null ? storedScore : calculatedScore

  return (
    <div className="space-y-2">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <div className="bg-white border border-gray-200 rounded-lg p-4 relative">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-xs text-gray-600">Quality Score</p>
          <button onClick={() => setShowFormula(!showFormula)} className="text-gray-400 hover:text-gray-600" title="Show formula">
            <HelpCircle size={12} />
          </button>
        </div>
        <p className={`text-3xl font-bold ${score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{score}%</p>
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

    {showFormula && (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700">
        <p className="font-semibold mb-1">Quality Score Formula</p>
        <p className="font-mono text-gray-600 mb-2">Score = max(0, 100 − (Critical×10 + High×5 + Medium×2 + Info×0.5))</p>
        <p className="text-gray-500 mb-1">
          Your calculation: 100 − ({critical}×10 + {high}×5 + {medium}×2 + {info}×0.5) = 100 − {weighted} = <span className="font-semibold">{score}%</span>
        </p>
        <div className="flex gap-4 mt-1.5 text-gray-500">
          <span>90–100 Excellent</span>
          <span>70–89 Good</span>
          <span>50–69 Fair</span>
          <span>30–49 Poor</span>
          <span>0–29 Critical</span>
        </div>
      </div>
    )}
    </div>
  )
}
