import React from 'react'
export default function SubmissionHistory({ submissions }) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">No submissions yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Source</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Score</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Modules</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((submission, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">
                  {new Date(submission.timestamp).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-700">{submission.source === 'github' ? `GitHub: ${submission.repo || 'repo'}` : submission.language}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    submission.score >= 80 ? 'bg-green-100 text-green-800' :
                    submission.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.score}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {submission.modules.length} modules
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
