import React from 'react'
import { useStore } from '../store'

const MODULES = [
  { id: 'failureMode', name: 'Failure Mode Scanner', icon: '🔍', desc: 'Off-by-one, null checks, silent exceptions' },
  { id: 'security', name: 'Security Probe', icon: '�', desc: 'OWASP Top 10, injection, XSS, credentials' },
  { id: 'hallucination', name: 'Hallucination Detector', icon: '�', desc: 'Non-existent API calls, phantom methods' },
  { id: 'complexity', name: 'Complexity Profiler', icon: '📊', desc: 'Nested loops, sync blocking, memory leaks' },
  { id: 'oracle', name: 'Oracle Checker', icon: '📋', desc: 'Input validation, return types, contracts' },
  { id: 'mutation', name: 'Mutation Scorer', icon: '🧬', desc: 'Boundary operators, boolean negation targets' },
  { id: 'property', name: 'Property Generator', icon: '🎯', desc: 'Function signatures, testability analysis' },
  { id: 'differential', name: 'Differential Runner', icon: '⚖️', desc: 'Versioned functions, algorithm comparison' },

  { id: 'aiReview', name: 'AI Review Assistant', icon: '🤖', desc: 'Claude-powered anti-pattern detection' },
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
            <div className="text-xs text-gray-500">{module.desc}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
