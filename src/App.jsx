import React, { useState } from 'react'
import { useStore } from './store'
import Dashboard from './pages/Dashboard'
import CodeSubmission from './pages/CodeSubmission'
import AnalysisView from './pages/AnalysisView'
import Settings from './pages/Settings'
import TrendHistory from './pages/TrendHistory'
import Tutorials from './pages/Tutorials'
import GitHubAnalysis from './pages/GitHubAnalysis'
import { BarChart3, Settings as SettingsIcon, Home, FileText, TrendingUp, BookOpen, Github } from 'lucide-react'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">ValidAI</span>
                <p className="text-xs text-gray-500">Testing Framework for AI Code</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'submit', label: 'Submit Code', icon: FileText },
                { id: 'trends', label: 'Trends', icon: TrendingUp },
                { id: 'github', label: 'GitHub', icon: Github },
                { id: 'tutorials', label: 'Learn', icon: BookOpen },
                { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentPage(id)}
                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    currentPage === id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-fadeIn">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'submit' && <CodeSubmission />}
          {currentPage === 'trends' && <TrendHistory />}
          {currentPage === 'github' && <GitHubAnalysis />}
          {currentPage === 'tutorials' && <Tutorials />}
          {currentPage === 'settings' && <Settings />}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">ValidAI</h3>
              <p className="text-sm text-gray-600">Testing framework for AI-generated code</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Modules</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600">Tutorials</a></li>
                <li><a href="#" className="hover:text-blue-600">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2026 ValidAI. All rights reserved. | Made with ❤️ for AI-generated code testing</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
