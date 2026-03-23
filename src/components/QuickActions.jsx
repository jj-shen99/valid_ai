import React from 'react'
import { Upload, Zap, FileJson, Share2 } from 'lucide-react'

export default function QuickActions({ isDark }) {
  const bgClass = isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-blue-50 hover:bg-blue-100'
  const textClass = isDark ? 'text-slate-100' : 'text-gray-900'
  const secondaryClass = isDark ? 'text-slate-400' : 'text-gray-600'

  const actions = [
    {
      icon: Upload,
      title: 'Upload Code',
      description: 'Analyze code from file',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Quick Scan',
      description: 'Fast analysis',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: FileJson,
      title: 'Export Report',
      description: 'Download findings',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Share2,
      title: 'Share Results',
      description: 'Post to GitHub',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon
        return (
          <button
            key={idx}
            className={`p-4 rounded-lg ${bgClass} transition-all duration-200 text-left group`}
          >
            <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={20} className="text-white" />
            </div>
            <h3 className={`font-semibold ${textClass} mb-1`}>{action.title}</h3>
            <p className={`text-sm ${secondaryClass}`}>{action.description}</p>
          </button>
        )
      })}
    </div>
  )
}
