import React, { useState } from 'react'
import { useStore } from '../store'
import { Eye, EyeOff, Save } from 'lucide-react'

export default function Settings() {
  const apiKey = useStore((state) => state.apiKey)
  const setApiKey = useStore((state) => state.setApiKey)
  const [showKey, setShowKey] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setApiKey(tempKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Configure ValidAI for your environment</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Claude API Key</h3>
          <p className="text-sm text-gray-600 mb-4">
            Required for the AI Review Assistant module. Your key is stored locally in your browser and never sent to our servers.
          </p>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={tempKey === apiKey}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Save API Key
            </button>

            {saved && (
              <p className="text-sm text-green-600 font-medium">✓ API key saved successfully</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About ValidAI</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Version:</strong> 0.1.0 (Phase 1)</p>
            <p><strong>Framework:</strong> React + Vite</p>
            <p><strong>License:</strong> MIT</p>
            <p><strong>Book:</strong> Testing the Machine</p>
            <p className="pt-2">
              ValidAI is a web-based testing framework for AI-generated code, designed as a companion to "Testing the Machine". 
              Each test module maps directly to a chapter in the book.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy & Security</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ All analysis runs locally in your browser</li>
            <li>✓ Code is never sent to external servers (except Claude API if enabled)</li>
            <li>✓ API keys are stored only in your browser's local storage</li>
            <li>✓ No tracking or analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
