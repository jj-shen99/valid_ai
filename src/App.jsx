import React, { useState } from 'react'
import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import CodeSubmission from './pages/CodeSubmission'
import AnalysisView from './pages/AnalysisView'
import Settings from './pages/Settings'
import TrendHistory from './pages/TrendHistory'
import Tutorials from './pages/Tutorials'
import GitHubAnalysis from './pages/GitHubAnalysis'
import { BarChart3, Settings as SettingsIcon, Home, FileText, TrendingUp, BookOpen, Github, Moon, Sun, Menu, X } from 'lucide-react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isDark, setIsDark] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'submit', label: 'Submit Code', icon: FileText },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'tutorials', label: 'Learn', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  const bgClass = isDark ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
  const sidebarBgClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const textClass = isDark ? 'text-slate-100' : 'text-gray-900'
  const secondaryTextClass = isDark ? 'text-slate-400' : 'text-gray-600'
  const hoverClass = isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
  const activeBgClass = isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'

  return (
    <div className={`min-h-screen flex ${bgClass} transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} ${sidebarBgClass} border-r transition-all duration-300 flex flex-col sticky top-0 h-screen`}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <BarChart3 size={20} className="text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className={`font-bold text-lg ${textClass}`}>ValidAI</h1>
                  <p className={`text-xs ${secondaryTextClass}`}>AI Code Testing</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1 rounded ${hoverClass} transition-colors`}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === id
                  ? activeBgClass
                  : `${secondaryTextClass} ${hoverClass}`
              }`}
              title={!sidebarOpen ? label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${hoverClass} transition-colors`}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="font-medium text-sm">{isDark ? 'Light' : 'Dark'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${textClass}`}>
              {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
            <div className={`text-sm ${secondaryTextClass}`}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'submit' && <CodeSubmission />}
            {currentPage === 'trends' && <TrendHistory />}
            {currentPage === 'github' && <GitHubAnalysis />}
            {currentPage === 'tutorials' && <Tutorials />}
            {currentPage === 'settings' && <Settings />}
          </div>
        </main>

        {/* Footer */}
        <footer className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-t ${secondaryTextClass} text-sm py-4 px-6 text-center`}>
          <p>© 2026 ValidAI. Testing framework for AI-generated code.</p>
        </footer>
      </div>
    </div>
  )
}
