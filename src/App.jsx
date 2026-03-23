import React, { useState } from 'react'
import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import CodeSubmission from './pages/CodeSubmission'
import AnalysisView from './pages/AnalysisView'
import Settings from './pages/Settings'
import TrendHistory from './pages/TrendHistory'
import Tutorials from './pages/Tutorials'
import GitHubAnalysis from './pages/GitHubAnalysis'
import { BarChart3, Settings as SettingsIcon, Home, FileText, TrendingUp, BookOpen, Github, Moon, Sun, PanelLeftClose, PanelLeft } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'submit', label: 'Submit Code', icon: FileText },
  { id: 'analysis', label: 'Analysis Results', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'tutorials', label: 'Learn', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [dark, setDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const d = dark
  const cls = {
    root: d ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900',
    sidebar: d ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
    header: d ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200',
    card: d ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
    muted: d ? 'text-gray-400' : 'text-gray-500',
    hover: d ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    active: d ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400' : 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',
  }

  return (
    <div className={`h-screen flex font-sans ${cls.root}`}>
      {/* ─── Sidebar ─── */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} flex-shrink-0 ${cls.sidebar} border-r flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className={`h-14 flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} border-b ${d ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <BarChart3 size={16} className="text-white" />
          </div>
          {!collapsed && <span className="ml-3 font-bold text-lg tracking-tight">ValidAI</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 rounded-md text-sm font-medium transition-colors
                ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                ${page === id ? cls.active : `${cls.muted} ${cls.hover}`}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className={`px-2 py-3 border-t ${d ? 'border-gray-800' : 'border-gray-200'} space-y-1`}>
          <button
            onClick={() => setDark(!dark)}
            className={`w-full flex items-center gap-3 rounded-md text-sm font-medium ${cls.muted} ${cls.hover} ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && (dark ? 'Light Mode' : 'Dark Mode')}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 rounded-md text-sm font-medium ${cls.muted} ${cls.hover} ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-14 flex-shrink-0 flex items-center justify-between px-6 border-b backdrop-blur-sm ${cls.header}`}>
          <h1 className="text-lg font-semibold">{NAV.find(n => n.id === page)?.label}</h1>
          <span className={`text-xs ${cls.muted}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {page === 'dashboard' && <Dashboard dark={dark} />}
          {page === 'submit' && <CodeSubmission />}
          {page === 'analysis' && <AnalysisView />}
          {page === 'trends' && <TrendHistory />}
          {page === 'github' && <GitHubAnalysis />}
          {page === 'tutorials' && <Tutorials />}
          {page === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}
