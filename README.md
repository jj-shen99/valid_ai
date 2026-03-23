# ValidAI — Testing Framework for AI-Generated Code

A comprehensive web-based testing framework for validating AI-generated code across multiple failure modes, security vulnerabilities, and code quality metrics.

## Overview

ValidAI is an open-source framework designed to systematically test AI-generated code for common failure patterns, security issues, and quality problems. It provides 9 specialized analysis modules that work together to catch bugs, hallucinations, and anti-patterns that AI models frequently introduce.

## Key Features

### 9 Analysis Modules
- **Failure Mode Scanner** — Off-by-one errors, silent exceptions, unbounded loops, type coercion, magic numbers, implicit globals
- **Security Probe** — OWASP Top 10: SQL injection, XSS, hardcoded credentials, weak crypto, path traversal, disabled security controls
- **Hallucination Detector** — Cross-references method calls against known APIs to detect non-existent or hallucinated functions
- **Property Generator** — Analyzes function signatures for testability: pure functions, high parameter counts, test strategies
- **Complexity Profiler** — Nested loops, sync blocking, excessive DOM manipulation, string concatenation in loops, memory leaks
- **Differential Runner** — Versioned functions, duplicate definitions, custom algorithm re-implementations, complex regex, chained transformations
- **Oracle Checker** — Missing input validation, inconsistent return types, unvalidated API responses, missing error contracts
- **Mutation Scorer** — Boundary comparison operators, return value mutations, conditional branches without else, density scoring
- **AI Review Assistant** — Claude-powered code review targeting AI anti-patterns (requires API key)

### Core Capabilities
- **Multi-language Support** — Python, JavaScript, TypeScript, Java, Go, C#
- **Real-time Analysis** — Instant feedback with severity-weighted quality scores
- **Trend Tracking** — Charts for score history, severity distribution, findings by module
- **GitHub Integration** — Analyze commits from any repository, post findings to pull requests
- **Multiple Export Formats** — JSON, Markdown, SARIF v2.1, HTML reports
- **Encrypted Storage** — AES-256 encrypted API keys with IndexedDB persistence
- **VS Code Extension** — Analyze code directly in your editor

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
git clone https://github.com/jj-shen99/valid_ai.git
cd valid_ai
npm install
npm run dev
```

The application will be available at `http://localhost:3600`

### Build for Production

```bash
npm run build
npm run preview
```

### Run Tests

```bash
npm test
```

## Documentation

- **[User Guide](docs/USER_GUIDE.md)** — Complete guide to using ValidAI
- **[Architecture](docs/ARCHITECTURE.md)** — System design, data flow, and module internals

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 |
| Build | Vite 4 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 |
| Code Editor | CodeMirror 6 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Persistence | IndexedDB |
| Encryption | Web Crypto API (AES-256-GCM) |
| Testing | Vitest + jsdom |

## Project Structure

```
valid_ai/
├── src/
│   ├── pages/             # Dashboard, CodeSubmission, AnalysisView,
│   │                      # TrendHistory, GitHubAnalysis, Settings
│   ├── components/        # CodeEditor, ModuleSelector, FindingCard,
│   │                      # ExportPanel, QuickStats, TrendChart, etc.
│   ├── modules/           # 9 analysis modules + analysisEngine
│   ├── utils/             # exporters, db, crypto, githubIntegration
│   ├── store.js           # Zustand state management
│   └── App.jsx            # Main app with routing and navigation
├── tests/                 # Vitest unit tests (105 tests)
├── docs/                  # User Guide, Architecture
├── vscode-extension/      # VS Code extension prototype
├── vite.config.js
└── package.json
```

## VS Code Extension

```bash
cd vscode-extension
npm install
npm run compile
```

- Right-click any file: **ValidAI: Analyze Current File**
- Select code and right-click: **ValidAI: Analyze Selection**
- Default URL: `http://localhost:3600`

## Contributing

Contributions are welcome! Areas for contribution:
- Additional analysis modules and patterns
- Language support improvements
- UI/UX enhancements
- Documentation and testing

## License

MIT License — See LICENSE file for details.

## Links

- **GitHub** — https://github.com/jj-shen99/valid_ai
- **Book** — "Testing the Machine" by JJ Shen

---

**ValidAI** — Making AI-generated code safer, more reliable, and production-ready.
