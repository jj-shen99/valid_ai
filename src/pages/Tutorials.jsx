import React, { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

const TUTORIALS = [
  {
    id: 'getting-started',
    title: 'Getting Started with ValidAI',
    description: 'Learn the basics of submitting code and running your first analysis',
    steps: [
      {
        title: 'Submit Your Code',
        content: 'Navigate to the "Submit Code" tab. Paste your AI-generated code into the editor or upload a file. ValidAI supports Python, JavaScript, TypeScript, Java, Go, and C#.',
      },
      {
        title: 'Select Test Modules',
        content: 'Choose which test modules to run. Start with "Quick Scan" for a fast overview, or select individual modules for targeted analysis.',
      },
      {
        title: 'Review Findings',
        content: 'Once analysis completes, review findings grouped by severity. Each finding links to the relevant chapter in "Testing the Machine".',
      },
      {
        title: 'Export Results',
        content: 'Export findings as JSON, Markdown, or SARIF format. Use these reports in your CI/CD pipeline or for team review.',
      },
    ],
  },
  {
    id: 'modules-guide',
    title: 'Understanding Test Modules',
    description: 'Deep dive into what each module does and when to use it',
    steps: [
      {
        title: 'Failure Mode Scanner (Ch 3)',
        content: 'Detects AI-characteristic bugs like off-by-one errors, semantic drift, and silent exception swallowing. Run this first on any new code.',
      },
      {
        title: 'Security Probe (Ch 13)',
        content: 'Scans for security vulnerabilities: SQL injection, weak cryptography, JWT validation gaps. Essential for any code handling sensitive data.',
      },
      {
        title: 'Hallucination Detector (Ch 2)',
        content: 'Checks if code calls non-existent APIs or functions. Catches a common AI failure mode where models invent APIs.',
      },
      {
        title: 'Property Generator (Ch 7)',
        content: 'Generates property-based tests from function signatures. Helps ensure code behaves correctly across input ranges.',
      },
      {
        title: 'Complexity Profiler (Ch 9)',
        content: 'Detects algorithmic complexity issues: nested loops, unbounded recursion, inefficient sorts. Prevents performance regressions.',
      },
    ],
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering for Testability',
    description: 'Write better prompts that generate more testable code',
    steps: [
      {
        title: 'Be Explicit About Constraints',
        content: 'Specify input ranges, edge cases, and error conditions. Example: "Function must handle null inputs gracefully and throw TypeError for invalid types."',
      },
      {
        title: 'Request Dependency Injection',
        content: 'Ask for functions that accept dependencies as parameters. This makes code easier to test and mock.',
      },
      {
        title: 'Specify Error Semantics',
        content: 'Clearly define what errors should be thrown and when. "Throw ValueError if x < 0, TypeError if x is not a number."',
      },
      {
        title: 'Ask for Pure Functions',
        content: 'Request functions without side effects when possible. Pure functions are easier to test and reason about.',
      },
    ],
  },
  {
    id: 'github-integration',
    title: 'GitHub Integration',
    description: 'Integrate ValidAI into your GitHub workflow',
    steps: [
      {
        title: 'Generate GitHub Token',
        content: 'Create a personal access token in GitHub Settings > Developer settings > Personal access tokens with "repo" scope.',
      },
      {
        title: 'Post to Pull Requests',
        content: 'Use the GitHub Integration panel to post ValidAI findings as comments on pull requests. Automate code review.',
      },
      {
        title: 'Create Issues',
        content: 'ValidAI can automatically create GitHub issues for critical findings, keeping your team informed.',
      },
      {
        title: 'CI/CD Integration',
        content: 'Export SARIF format reports for integration with GitHub Actions and other CI/CD systems.',
      },
    ],
  },
]

export default function Tutorials() {
  const [expandedTutorial, setExpandedTutorial] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen size={28} />
          Tutorials & Guides
        </h2>
        <p className="text-gray-600">Learn how to use ValidAI effectively</p>
      </div>

      <div className="space-y-4">
        {TUTORIALS.map((tutorial) => (
          <div key={tutorial.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">{tutorial.title}</h3>
                <p className="text-sm text-gray-600">{tutorial.description}</p>
              </div>
              {expandedTutorial === tutorial.id ? (
                <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
              ) : (
                <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
              )}
            </button>

            {expandedTutorial === tutorial.id && (
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {tutorial.steps.map((step, idx) => (
                  <div key={idx} className="px-6 py-4">
                    <button
                      onClick={() => setExpandedStep(expandedStep === `${tutorial.id}-${idx}` ? null : `${tutorial.id}-${idx}`)}
                      className="w-full flex items-center justify-between hover:bg-gray-50 py-2 -mx-2 px-2 rounded transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 text-left">{step.title}</h4>
                      {expandedStep === `${tutorial.id}-${idx}` ? (
                        <ChevronUp className="text-gray-400 flex-shrink-0" size={16} />
                      ) : (
                        <ChevronDown className="text-gray-400 flex-shrink-0" size={16} />
                      )}
                    </button>
                    {expandedStep === `${tutorial.id}-${idx}` && (
                      <p className="text-sm text-gray-600 mt-2">{step.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
