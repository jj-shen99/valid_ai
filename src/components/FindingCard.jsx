import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Copy, Wrench, Code2, EyeOff } from 'lucide-react'

const severityColors = {
  Critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-100 text-red-800' },
  High: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-100 text-orange-800' },
  Medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
  Info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-100 text-blue-800' },
}

export default function FindingCard({ finding, sourceCode, onSuppress }) {
  const [expanded, setExpanded] = useState(false)
  const colors = severityColors[finding.severity]

  const codeContext = useMemo(() => {
    if (!sourceCode || !finding.lineNumber) return null
    const lines = sourceCode.split('\n')
    const ln = finding.lineNumber - 1
    const start = Math.max(0, ln - 3)
    const end = Math.min(lines.length, ln + 4)
    return { start, end, lines: lines.slice(start, end), highlight: ln - start }
  }, [sourceCode, finding.lineNumber])

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

          {codeContext && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Code2 size={12} /> Source Context</p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto leading-5">
                {codeContext.lines.map((line, i) => {
                  const lineNum = codeContext.start + i + 1
                  const isHighlight = i === codeContext.highlight
                  return (
                    <div key={i} className={`flex ${isHighlight ? 'bg-red-900/40 -mx-3 px-3 border-l-2 border-red-400' : ''}`}>
                      <span className={`w-8 flex-shrink-0 text-right mr-3 select-none ${isHighlight ? 'text-red-400' : 'text-gray-600'}`}>{lineNum}</span>
                      <span className={isHighlight ? 'text-red-200' : 'text-gray-300'}>{line || ' '}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {finding.autoFix && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1"><Wrench size={12} /> Auto-Fix Patch</p>
              <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <div className="text-red-400">- {finding.autoFix.replace}</div>
                <div className="text-green-400">+ {finding.autoFix.with}</div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(finding.autoFix.with)}
                className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Copy size={12} /> Copy fix
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {new Date(finding.timestamp).toLocaleTimeString()}
            </span>
            {onSuppress && (
              <button
                onClick={(e) => { e.stopPropagation(); onSuppress(finding) }}
                className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                title="Suppress this finding category"
              >
                <EyeOff size={12} /> Suppress
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
