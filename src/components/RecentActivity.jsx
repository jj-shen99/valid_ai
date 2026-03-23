import React from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function RecentActivity({ isDark }) {
  const bgClass = isDark ? 'bg-slate-800' : 'bg-white'
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
  const textClass = isDark ? 'text-slate-100' : 'text-gray-900'
  const secondaryClass = isDark ? 'text-slate-400' : 'text-gray-600'

  const activities = [
    { type: 'success', title: 'Code analysis completed', time: '2 minutes ago', module: 'Security Probe' },
    { type: 'warning', title: 'High severity issue found', time: '15 minutes ago', module: 'Hallucination Detector' },
    { type: 'info', title: 'GitHub sync completed', time: '1 hour ago', module: 'GitHub Integration' },
    { type: 'success', title: 'Report exported', time: '3 hours ago', module: 'Export' },
  ]

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-500" />
      default:
        return <Clock size={18} className="text-blue-500" />
    }
  }

  return (
    <div className={`${bgClass} border ${borderClass} rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-slate-700 last:border-0">
            <div className="mt-1">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${textClass}`}>{activity.title}</p>
              <p className={`text-sm ${secondaryClass}`}>{activity.module}</p>
            </div>
            <p className={`text-xs ${secondaryClass} whitespace-nowrap`}>{activity.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
