import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react'
import { ChapterLink } from '../utils/chapterLinks'

const severityColors = {
  Critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-100 text-red-800' },
  High: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' },
  Medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
  Info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
}

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false)
  const colors = severityColors[finding.severity]

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.suggestion)
  }

  return (
    <div className={`border rounded-lg p-4 ${colors.bg} ${colors.border}`}>
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.badge}`}>
              {finding.severity}
            </span>
            <span className="text-xs text-gray-600">{finding.moduleName}</span>
          </div>
          <h4 className={`font-semibold ${colors.text} mb-1`}>{finding.category}</h4>
          <p className={`text-sm ${colors.text}`}>{finding.description}</p>
        </div>
        <button className={`flex-shrink-0 ml-4 ${colors.text}`}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className={`mt-4 pt-4 border-t ${colors.border} space-y-3`}>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Line Number</p>
            <p className={`text-sm font-mono ${colors.text}`}>{finding.lineNumber}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Suggestion</p>
            <div className="flex items-start gap-2">
              <p className={`text-sm flex-1 ${colors.text}`}>{finding.suggestion}</p>
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors`}
                title="Copy suggestion"
              >
                <Copy size={16} className={colors.text} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <ChapterLink chapter={finding.chapterLink}>
              <span className="flex items-center gap-1">
                {finding.chapterLink}
                <ExternalLink size={12} />
              </span>
            </ChapterLink>
            <span className="text-xs text-gray-500">
              {new Date(finding.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
