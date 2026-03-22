import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import FindingCard from '../components/FindingCard'
import QuickStats from '../components/QuickStats'
import ExportPanel from '../components/ExportPanel'
import { Loader, AlertCircle } from 'lucide-react'

const MODULES = {
  failureMode: { name: 'Failure Mode Scanner', icon: '🔍' },
  security: { name: 'Security Probe', icon: '🔒' },
  hallucination: { name: 'Hallucination Detector', icon: '👻' },
  oracle: { name: 'Oracle Checker', icon: '📋' },
  complexity: { name: 'Complexity Profiler', icon: '📊' },
  mutation: { name: 'Mutation Scorer', icon: '🧬' },
  property: { name: 'Property Generator', icon: '🎯' },
  differential: { name: 'Differential Runner', icon: '⚖️' },
  prompt: { name: 'Prompt Testability Score', icon: '📝' },
  aiReview: { name: 'AI Review Assistant', icon: '🤖' },
}

export default function AnalysisView() {
  const selectedModules = useStore((state) => state.selectedModules)
  const findings = useStore((state) => state.findings)
  const isRunning = useStore((state) => state.isRunning)
  const moduleProgress = useStore((state) => state.moduleProgress)
  const updateModuleProgress = useStore((state) => state.updateModuleProgress)
  const addFinding = useStore((state) => state.addFinding)

  useEffect(() => {
    if (!isRunning) return

    selectedModules.forEach((moduleName) => {
      updateModuleProgress(moduleName, 'running')
    })

    const completeModules = () => {
      selectedModules.forEach((moduleName) => {
        updateModuleProgress(moduleName, 'complete')
      })
    }

    const timer = setTimeout(completeModules, 1500)
    return () => clearTimeout(timer)
  }, [isRunning, selectedModules, updateModuleProgress])

  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Medium: 2, Info: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const code = useStore((state) => state.code)
  const language = useStore((state) => state.language)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Analysis Results</h2>
        <p className="text-gray-600">Review findings from selected test modules</p>
      </div>

      <QuickStats findings={sortedFindings} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {selectedModules.map((moduleName) => {
          const module = MODULES[moduleName]
          const status = moduleProgress[moduleName] || 'pending'
          return (
            <div key={moduleName} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{module.icon}</span>
                {status === 'running' && <Loader className="animate-spin text-blue-600" size={16} />}
                {status === 'complete' && <span className="text-green-600 text-sm font-medium">✓</span>}
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">{module.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{status}</p>
            </div>
          )
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Findings ({sortedFindings.length})</h3>
          {isRunning && <span className="text-sm text-gray-500 flex items-center gap-1"><Loader size={14} className="animate-spin" /> Running...</span>}
        </div>

        {sortedFindings.length === 0 && !isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-blue-900">No findings yet</p>
              <p className="text-sm text-blue-700">Run an analysis to see results</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sortedFindings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </div>

      {sortedFindings.length > 0 && (
        <ExportPanel 
          findings={sortedFindings} 
          metadata={{
            language,
            modules: selectedModules,
            timestamp: new Date().toISOString(),
          }}
        />
      )}
    </div>
  )
}
