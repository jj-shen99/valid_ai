import React from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

export default function StatsOverview({ isDark }) {
  const bgClass = isDark ? 'bg-slate-800' : 'bg-white'
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
  const textClass = isDark ? 'text-slate-100' : 'text-gray-900'
  const secondaryClass = isDark ? 'text-slate-400' : 'text-gray-600'

  const stats = [
    {
      label: 'Total Analyses',
      value: '1,247',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    {
      label: 'Issues Found',
      value: '3,891',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      change: '-8%'
    },
    {
      label: 'Code Quality',
      value: '87%',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '+5%'
    },
    {
      label: 'Avg Score',
      value: '8.2/10',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+2%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className={`${bgClass} border ${borderClass} rounded-lg p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600">{stat.change}</span>
            </div>
            <p className={`text-sm ${secondaryClass} mb-1`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${textClass}`}>{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}
