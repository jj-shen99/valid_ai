# ValidAI — Testing Framework for AI-Generated Code

A comprehensive web-based testing framework for validating AI-generated code across multiple failure modes, security vulnerabilities, and code quality metrics.

## 🎯 Overview

ValidAI is an open-source framework designed to systematically test AI-generated code for common failure patterns, security issues, and quality problems. It provides 10 specialized analysis modules that work together to catch bugs, hallucinations, and anti-patterns that AI models frequently introduce.

**Live Demo:** http://localhost:3600

## ✨ Key Features

### 10 Analysis Modules
- **Failure Mode Scanner** — Detects off-by-one errors, semantic drift, and exception swallowing
- **Security Probe** — Scans for SQL injection, weak cryptography, JWT validation gaps, hardcoded credentials
- **Hallucination Detector** — Catches calls to non-existent APIs and functions
- **Property Generator** — Generates property-based tests from function signatures
- **Complexity Profiler** — Identifies algorithmic complexity issues and performance bottlenecks
- **Differential Runner** — Compares two implementations for correctness
- **Oracle Checker** — Validates code behavior against specifications
- **Mutation Scorer** — Evaluates test suite quality through mutation testing
- **Prompt Testability Score** — Rates prompt quality for testable code generation
- **AI Review Assistant** — Claude-powered code review for AI-generated code

### Core Capabilities
- 🔍 **Multi-language Support** — Python, JavaScript, TypeScript, Java, Go, C#
- 📊 **Real-time Analysis** — Instant feedback on code quality and issues
- 📈 **Trend Tracking** — Monitor code quality improvements over time
- 🔗 **GitHub Integration** — Post findings to pull requests and create issues
- 📤 **Multiple Export Formats** — JSON, Markdown, SARIF v2.1
- 📚 **Chapter Deep-Links** — Every finding links to relevant chapters in "Testing the Machine"
- 🎓 **Interactive Tutorials** — Learn best practices for prompt engineering and testing
- 🧩 **VS Code Extension** — Analyze code directly in your editor

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/jj-shen99/valid_ai.git
cd valid_ai

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3600`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

### Submit Code for Analysis

1. Navigate to **Submit Code** tab
2. Paste your AI-generated code or upload a file
3. Select your programming language
4. Choose analysis modules or use a preset profile:
   - **Quick Scan** — Fast overview (Failure Mode + Hallucination)
   - **Security Focus** — Security & compliance checks
   - **Full Audit** — All modules
5. Click **Run Analysis** to start testing

### Analyze GitHub Changes

1. Go to **GitHub** tab
2. Enter repository owner and name
3. Select time period (7, 14, 30, or 60 days)
4. View detailed commit analysis with findings

### Review Findings

- Findings are sorted by severity (Critical → High → Medium → Info)
- Click to expand each finding for full details
- Each finding includes:
  - Description of the issue
  - Suggested fix
  - Line number reference
  - Link to relevant chapter in "Testing the Machine"

### Export Results

- **JSON** — Machine-readable format for CI/CD integration
- **Markdown** — Human-readable report for documentation
- **SARIF** — Standard format for GitHub Actions and other tools

### GitHub Integration

1. Generate a GitHub personal access token (Settings → Developer settings → Personal access tokens)
2. Go to **GitHub** tab in ValidAI
3. Enter your token, repository, and PR number
4. Click **Post to PR** to add findings as a comment

## 🏗️ Project Structure

```
valid_ai/
├── config/                 # Configuration files
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
├── public/                 # Static assets
├── src/
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── CodeSubmission.jsx
│   │   ├── AnalysisView.jsx
│   │   ├── TrendHistory.jsx
│   │   ├── GitHubAnalysis.jsx
│   │   ├── Tutorials.jsx
│   │   └── Settings.jsx
│   ├── components/        # Reusable UI components
│   │   ├── CodeEditor.jsx
│   │   ├── ModuleSelector.jsx
│   │   ├── FindingCard.jsx
│   │   ├── ExportPanel.jsx
│   │   ├── QuickStats.jsx
│   │   ├── TrendChart.jsx
│   │   ├── SubmissionHistory.jsx
│   │   ├── GitHubCodeAnalysis.jsx
│   │   ├── AnalysisDetails.jsx
│   │   └── GitHubIntegration.jsx
│   ├── modules/           # Analysis modules
│   │   ├── failureMode.js
│   │   ├── securityProbe.js
│   │   ├── hallucinationDetector.js
│   │   ├── propertyGenerator.js
│   │   ├── complexityProfiler.js
│   │   ├── differentialRunner.js
│   │   ├── oracleChecker.js
│   │   ├── mutationScorer.js
│   │   ├── promptTestability.js
│   │   ├── aiReviewAssistant.js
│   │   └── analysisEngine.js
│   ├── utils/             # Utility functions
│   │   ├── exporters.js
│   │   ├── languageDetector.js
│   │   ├── githubIntegration.js
│   │   └── chapterLinks.jsx
│   ├── store.js           # Zustand state management
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── vscode-extension/      # VS Code extension prototype
├── build/                 # Build output
├── vite.config.js         # Vite configuration
├── package.json
└── index.html             # HTML entry point
```

## 🛠️ Technology Stack

- **Frontend Framework** — React 18
- **Build Tool** — Vite 4
- **Styling** — Tailwind CSS 3
- **State Management** — Zustand 4
- **Code Editor** — CodeMirror 6
- **Charts** — Recharts 2
- **Icons** — Lucide React
- **Language Support** — @codemirror language packages

## 📊 Analysis Modules

### Failure Mode Scanner
Detects AI-characteristic bugs:
- Off-by-one errors in loops and array indexing
- Semantic drift in variable usage
- Silent exception swallowing
- Incorrect type conversions

### Security Probe
Identifies security vulnerabilities:
- SQL injection patterns
- Weak cryptography usage
- JWT validation gaps
- Hardcoded credentials
- OWASP Top 10 issues

### Hallucination Detector
Catches non-existent API calls:
- Undefined function references
- Non-existent library methods
- Incorrect module imports
- Fabricated API endpoints

### Property Generator
Generates property-based tests:
- Pure function detection
- Parameter dependency analysis
- Test invariant suggestions
- Property-based test templates

### Complexity Profiler
Detects performance issues:
- Nested loop detection
- Unbounded recursion
- Inefficient sorting patterns
- Full table scan patterns
- Memory accumulation in loops

### Differential Runner
Compares implementations:
- Requires reference implementation
- Validates correctness across versions
- Detects behavioral differences

### Oracle Checker
Validates against specifications:
- Requires formal specification
- Checks behavior compliance
- Validates constraint satisfaction

### Mutation Scorer
Evaluates test quality:
- Requires existing test suite
- Applies semantic mutations
- Reports test effectiveness

### Prompt Testability Score
Rates prompt quality:
- Checks for dependency injection mentions
- Validates error semantics specification
- Assesses pure function requests
- Evaluates edge case coverage
- Scores constraint clarity

### AI Review Assistant
Claude-powered code review:
- Detects omniscient functions
- Identifies cargo-cult patterns
- Finds leaky abstractions
- Flags inconsistent naming
- Requires Claude API key

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

### Settings Page

Configure ValidAI through the Settings page:
- **API Key** — Add your Claude API key for AI Review Assistant
- **Module Preferences** — Enable/disable specific modules
- **Export Options** — Choose default export format

## 📚 Learning Resources

### Built-in Tutorials

ValidAI includes comprehensive tutorials covering:
1. **Getting Started** — Basic workflow and first analysis
2. **Understanding Modules** — Deep dive into each analysis module
3. **Prompt Engineering** — Writing better prompts for testable code
4. **GitHub Integration** — Integrating ValidAI into your workflow

### Book References

All findings link to chapters in "Testing the Machine" by JJ Shen:
- Ch 2: The Hallucination Problem
- Ch 3: The Bug Zoo
- Ch 4: The Oracle Problem
- Ch 5: Risk-Based Testing Strategy
- Ch 6: Prompt Engineering for Testability
- Ch 7: Property-Based Testing
- Ch 8: Differential Testing
- Ch 9: Performance and Complexity
- Ch 10: Mutation Testing
- Ch 11: The Robot Code Reviewer
- Ch 13: Security Testing

## 🔌 VS Code Extension

The ValidAI VS Code extension allows you to analyze code directly in your editor.

### Installation

1. Build the extension:
```bash
cd vscode-extension
npm install
npm run compile
```

2. Install in VS Code:
   - Open VS Code
   - Go to Extensions
   - Install from VSIX file

### Usage

- Right-click on any file: **ValidAI: Analyze Current File**
- Select code and right-click: **ValidAI: Analyze Selection**
- View findings in the Problems panel

## 🤝 Contributing

Contributions are welcome! Areas for contribution:
- Additional analysis modules
- Language support improvements
- UI/UX enhancements
- Documentation improvements
- Bug fixes and performance optimizations

## 📄 License

MIT License — See LICENSE file for details

## 📞 Support

- **Issues** — Report bugs on GitHub
- **Discussions** — Ask questions and share ideas
- **Documentation** — Check the built-in tutorials

## 🔗 Links

- **GitHub** — https://github.com/jj-shen99/valid_ai
- **Book** — "Testing the Machine" by JJ Shen

---

**ValidAI** — Making AI-generated code safer, more reliable, and production-ready.
