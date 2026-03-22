import React, { useState } from 'react'
import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import CodeSubmission from './pages/CodeSubmission'
import AnalysisView from './pages/AnalysisView'
import Settings from './pages/Settings'
import TrendHistory from './pages/TrendHistory'
import Tutorials from './pages/Tutorials'
import { BarChart3, Settings as SettingsIcon, Home, FileText, TrendingUp, BookOpen } from 'lucide-react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VA</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">ValidAI</h1>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home size={18} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('submit')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 'submit'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText size={18} />
                Submit Code
              </button>
              <button
                onClick={() => setCurrentPage('trends')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 'trends'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={18} />
                Trends
              </button>
              <button
                onClick={() => setCurrentPage('tutorials')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 'tutorials'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={18} />
                Learn
              </button>
              <button
                onClick={() => setCurrentPage('settings')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  currentPage === 'settings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SettingsIcon size={18} />
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'submit' && <CodeSubmission />}
        {currentPage === 'trends' && <TrendHistory />}
        {currentPage === 'tutorials' && <Tutorials />}
        {currentPage === 'settings' && <Settings />}
      </main>
    </div>
  )
}
