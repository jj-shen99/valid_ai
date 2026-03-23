import React, { useState } from 'react'
import { useStore } from '../store'
import GitHubCodeAnalysis from '../components/GitHubCodeAnalysis'
import AnalysisDetails from '../components/AnalysisDetails'
import { runAnalysis } from '../modules/analysisEngine'
import { Loader } from 'lucide-react'

export default function GitHubAnalysis() {
  const [analysisData, setAnalysisData] = useState(null)
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const selectedModules = useStore((state) => state.selectedModules)
  const apiKey = useStore((state) => state.apiKey)

  const handleAnalyze = async (data) => {
    setLoading(true)
    setError('')
    setFindings([])

    try {
      const commits = data.commits
      let allFindings = []

      for (const commit of commits) {
        const message = commit.commit.message
        const author = commit.commit.author.name

        const commitFindings = await runAnalysis(
          `Commit: ${message}\nAuthor: ${author}`,
          'text',
          selectedModules,
          message,
          apiKey
        )

        allFindings = [...allFindings, ...commitFindings]
      }

      setAnalysisData(data)
      setFindings(allFindings)
    } catch (err) {
      setError(`Analysis error: ${err.message}`)
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">GitHub Code Analysis</h2>
        <p className="text-gray-600">Analyze code changes from your GitHub repository over different time periods</p>
      </div>

      <GitHubCodeAnalysis onAnalyze={handleAnalyze} />

      {loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
          <p className="text-gray-600 font-medium">Analyzing commits...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {analysisData && !loading && (
        <AnalysisDetails analysisData={analysisData} findings={findings} />
      )}
    </div>
  )
}
