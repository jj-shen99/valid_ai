import React from 'react'
import { useStore } from '../store'

const MODULES = [
  { id: 'failureMode', name: 'Failure Mode Scanner', icon: '🔍', chapter: 'Ch 3' },
  { id: 'oracle', name: 'Oracle Checker', icon: '📋', chapter: 'Ch 4' },
  { id: 'prompt', name: 'Prompt Testability Score', icon: '📝', chapter: 'Ch 6' },
  { id: 'property', name: 'Property Generator', icon: '🎯', chapter: 'Ch 7' },
  { id: 'differential', name: 'Differential Runner', icon: '⚖️', chapter: 'Ch 8' },
  { id: 'complexity', name: 'Complexity Profiler', icon: '📊', chapter: 'Ch 9' },
  { id: 'security', name: 'Security Probe', icon: '🔒', chapter: 'Ch 13' },
  { id: 'mutation', name: 'Mutation Scorer', icon: '🧬', chapter: 'Ch 7/10' },
  { id: 'hallucination', name: 'Hallucination Detector', icon: '👻', chapter: 'Ch 2' },
  { id: 'aiReview', name: 'AI Review Assistant', icon: '🤖', chapter: 'Ch 11' },
]

export default function ModuleSelector() {
  const selectedModules = useStore((state) => state.selectedModules)
  const setSelectedModules = useStore((state) => state.setSelectedModules)

  const toggleModule = (moduleId) => {
    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter((m) => m !== moduleId))
    } else {
      setSelectedModules([...selectedModules, moduleId])
    }
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {MODULES.map((module) => (
        <label
          key={module.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedModules.includes(module.id)}
            onChange={() => toggleModule(module.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
              <span>{module.icon}</span>
              {module.name}
            </div>
            <div className="text-xs text-gray-500">{module.chapter}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
