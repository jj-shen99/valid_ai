import React from 'react'
import { Download, FileJson, FileText, Code, Globe } from 'lucide-react'
import { exportAsJSON, exportAsMarkdown, exportAsSARIF, exportAsHTML } from '../utils/exporters'

export default function ExportPanel({ findings, metadata }) {
  const handleExport = (format) => {
    if (format === 'json') {
      exportAsJSON(findings, metadata)
    } else if (format === 'markdown') {
      exportAsMarkdown(findings, metadata)
    } else if (format === 'sarif') {
      exportAsSARIF(findings, metadata)
    } else if (format === 'html') {
      exportAsHTML(findings, metadata)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Report</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => handleExport('html')}
          className="px-4 py-3 border-2 border-indigo-300 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 font-medium text-indigo-700"
        >
          <Globe size={18} />
          HTML Report
        </button>
        <button
          onClick={() => handleExport('json')}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-900"
        >
          <FileJson size={18} />
          JSON
        </button>
        <button
          onClick={() => handleExport('markdown')}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-900"
        >
          <FileText size={18} />
          Markdown
        </button>
        <button
          onClick={() => handleExport('sarif')}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-900"
        >
          <Code size={18} />
          SARIF
        </button>
      </div>
    </div>
  )
}
