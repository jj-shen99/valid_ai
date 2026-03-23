# ValidAI User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Submit Code for Analysis](#submit-code-for-analysis)
4. [GitHub Analysis](#github-analysis)
5. [Analysis Results](#analysis-results)
6. [Trends & History](#trends--history)
7. [Settings](#settings)
8. [Analysis Modules](#analysis-modules)
9. [Understanding Scores](#understanding-scores)
10. [Export Formats](#export-formats)
11. [VS Code Extension](#vs-code-extension)
12. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Installation

```bash
git clone https://github.com/jj-shen99/valid_ai.git
cd valid_ai
npm install
npm run dev
```

Open your browser to `http://localhost:3600`. The application loads with the **Dashboard** page.

### First Analysis

1. Click **Submit Code** in the left sidebar
2. Paste any code snippet into the editor
3. Select the language from the dropdown
4. Click **Run Analysis**
5. View your findings on the **Analysis Results** page

---

## Dashboard

The Dashboard provides an at-a-glance overview of your testing activity.

### KPI Cards
- **Total Analyses** — Number of analyses you've run (code + GitHub combined)
- **Total Findings** — Aggregate count of all findings across all submissions
- **Critical Issues** — Number of Critical-severity findings found
- **Avg Quality Score** — Average quality score across all submissions

### Severity Breakdown
A bar chart showing distribution of findings by severity level (Critical, High, Medium, Info).

### Module Status
Shows which analysis modules are active and available.

### Recent Submissions
A quick list of your most recent analyses with scores and timestamps.

---

## Submit Code for Analysis

### Code Input
- **Paste code** directly into the CodeMirror editor (with syntax highlighting)
- **Upload a file** using the upload button — language is auto-detected from file extension
- Supported languages: Python, JavaScript, TypeScript, Java, Go, C#

### AI Prompt (Optional)
Enter the prompt you used to generate the code. This enables the **Prompt Testability** module to evaluate your prompt for testability characteristics.

### Test Profiles

Pre-configured module selections for common use cases:

| Profile | Modules | Use Case |
|---------|---------|----------|
| **Quick Scan** | Failure Mode, Hallucination | Fast sanity check (~5s) |
| **Security Focus** | Security Probe, Hallucination | Security & compliance review |
| **Full Audit** | All 10 modules | Comprehensive analysis |

### Module Selection

You can also manually select individual modules from the sidebar checklist. Each module shows a brief description of what it detects.

### Running the Analysis

Click **Run Analysis** to start. The analysis runs all selected modules in sequence. Progress is shown per-module. When complete, findings appear on the Analysis Results page.

---

## GitHub Analysis

Analyze commits from any public (or private with token) GitHub repository.

### Setup
1. Enter the repository as `owner/repo` or paste a full GitHub URL
2. Select a branch (default: `main`)
3. Choose a time period: 7, 14, 30, or 60 days
4. If the repo is private, add a GitHub token in **Settings**

### Test Profiles
Same profiles as Submit Code — Quick Scan, Security Focus, or Full Audit.

### How It Works
1. ValidAI fetches recent commits via the GitHub API
2. For each commit, it extracts the patch/diff content
3. Each commit's code changes are analyzed through the selected modules
4. Findings are aggregated across all commits
5. Results are saved as a submission for trend tracking

### Authentication
- Public repos: no token needed
- Private repos: add a GitHub Personal Access Token in **Settings**
- Token is encrypted with AES-256-GCM before storage

---

## Analysis Results

### Viewing Results
The Analysis Results page shows findings from your most recent analysis or any saved past analysis.

### Analysis Selector Dropdown
Click the dropdown at the top to switch between:
- **Current / Live Analysis** — Results from your most recent run
- **Saved analyses** — Any past submission, showing source, date, finding count, and score

### Finding Cards
Each finding displays:
- **Severity badge** — Critical (red), High (orange), Medium (yellow), Info (blue)
- **Module name** — Which module detected the issue
- **Category** — Specific pattern or vulnerability type
- **Description** — What the issue is and why it matters
- **Line number** — Where in the code the issue was found
- **Suggestion** — Actionable fix recommendation

Click a finding card to expand it and see the full suggestion.

### Quick Stats
At the top of findings, a summary bar shows:
- Quality Score (severity-weighted)
- Count of Critical, High, Medium, and Info findings

### Export
Use the Export panel to download results as JSON, Markdown, or SARIF.

---

## Trends & History

### KPI Overview
Six metric cards showing:
- Total Analyses (with code vs GitHub breakdown)
- Average Score (with trend direction indicator)
- Best Score / Worst Score
- Total Findings / Critical Issues

### Charts

#### Score & Findings Over Time
An area chart showing your quality score and finding count across submissions. Helps visualize whether code quality is improving.

#### Finding Severity Distribution
A donut/pie chart breaking down all findings by severity level with percentage labels.

#### Findings by Module
A horizontal bar chart showing which modules produce the most findings. Helps identify your most common code quality issues.

#### Quality Trend Line
A line chart showing score progression and critical/high issue counts over time.

### Submission History Table
A detailed table of all past submissions showing:
- Date and time
- Language / source
- Quality score (color-coded)
- Modules used
- Actions: view details, delete

---

## Settings

### Claude API Key
Required for the **AI Review Assistant** module. Your key is encrypted with AES-256-GCM using the Web Crypto API before being stored in localStorage. The encryption status indicator shows a lock icon when active.

### GitHub Token
Required for accessing private GitHub repositories. Same AES-256 encryption as the API key.

### Clear Data
The "Clear All Data" button removes all submissions, findings, and settings from IndexedDB. This action cannot be undone.

---

## Analysis Modules

### Failure Mode Scanner
Detects bugs that AI models commonly introduce:
- **Off-by-one boundary errors** — `<=` with `.length`
- **Missing null/undefined checks** — Property access without guards
- **Silent exception swallowing** — Empty catch blocks
- **Unbounded loops** — `while(true)` without break guards
- **Type coercion issues** — Loose equality (`==`)
- **Floating point comparison** — Direct float equality checks
- **Unreachable code** — Code after return statements
- **Magic numbers** — Unexplained numeric literals
- **Implicit global variables** — Assignment without declaration

### Security Probe
Scans for OWASP Top 10 vulnerabilities:
- **SQL injection** — String interpolation in queries (A03:2021)
- **Weak cryptography** — MD5, SHA1, DES usage (A02:2021)
- **JWT validation gaps** — Decode without verify, "none" algorithm (A01:2021)
- **Hardcoded credentials** — Passwords/keys in source code (A05:2021)
- **Command injection** — eval(), exec(), system() (A03:2021)
- **Insecure deserialization** — pickle.loads, yaml.load (A08:2021)
- **Cross-site scripting (XSS)** — innerHTML, dangerouslySetInnerHTML (A03:2021)
- **Open redirect** — User-controlled redirect URLs (A01:2021)
- **Missing HTTPS** — HTTP URLs to external services (A02:2021)
- **Path traversal** — Unsanitized file paths (A01:2021)
- **Disabled security controls** — verify=false, CORS wildcard (A05:2021)

### Hallucination Detector
Cross-references function and method calls against known JavaScript and Python standard library APIs. Any method call that doesn't match a known API is flagged as a potential hallucination — a fabricated function that doesn't actually exist.

### Property Generator
Analyzes function signatures to assess testability:
- Detects pure functions (no side effects)
- Flags high parameter counts (>4 params)
- Suggests property-based testing strategies
- Identifies functions suitable for QuickCheck/Hypothesis-style testing

### Complexity Profiler
Identifies performance risks:
- **Nested loops** — O(n^2) or worse
- **Unbounded recursion** — Missing base cases
- **Inefficient sort** — Unnecessary sorting
- **Full table scans** — SELECT * or unindexed queries
- **Memory accumulation** — Growing arrays in loops
- **String concatenation in loops** — O(n^2) string building
- **Synchronous blocking** — readFileSync, execSync
- **Excessive DOM manipulation** — Layout thrashing

### Differential Runner
Identifies code suitable for differential testing:
- Versioned function names (V2, New, Alt)
- Standard algorithm re-implementations
- Data transformation functions
- Regex patterns (cross-engine differences)
- Mathematical computations (floating-point variance)

### Oracle Checker
Validates code contracts and specifications:
- Functions without input validation
- Inconsistent return types (null in some paths)
- Assertion-free functions
- Unvalidated API responses
- Error handlers that only log (missing error contracts)

### Mutation Scorer
Analyzes code for mutation testing susceptibility:
- Boundary comparison operators (< vs <=)
- Arithmetic operators (+/- swap targets)
- Boolean logic (negation targets)
- Simple return values (true/false/0/1)
- Conditional branches without else
- Produces a **Mutation Density Score** — percentage of lines that are mutation targets

### Prompt Testability
Evaluates AI prompt quality:
- Edge case specification
- Constraint clarity
- Error semantics
- Dependency injection patterns
- Pure function requests

### AI Review Assistant
Claude-powered code review (requires API key):
- Omniscient functions (do too many things)
- Cargo-cult patterns (unnecessary code)
- Leaky abstractions
- Naming inconsistencies
- AI-specific anti-patterns

---

## Understanding Scores

### Quality Score Formula

The quality score is severity-weighted:

```
score = 100 - (critical × 10) - (high × 5) - (medium × 2) - (info × 0.5)
```

The score is clamped between 0 and 100.

| Score Range | Meaning |
|-------------|---------|
| 90–100 | Excellent — minimal issues |
| 70–89 | Good — minor issues to address |
| 50–69 | Fair — several issues need attention |
| 30–49 | Poor — significant problems found |
| 0–29 | Critical — major rework needed |

### Why Scores Vary
- More modules selected = more patterns checked = potentially more findings
- Info-level findings have minimal impact (0.5 points each)
- A single Critical finding costs 10 points
- The Full Audit profile checks all modules and will typically produce more findings

---

## Export Formats

### JSON
Machine-readable format with metadata, summary counts, and full finding details. Ideal for CI/CD pipeline integration.

### Markdown
Human-readable report with formatted headings, severity badges, and suggestions. Good for documentation, pull request comments, or sharing with team members.

### SARIF v2.1
Static Analysis Results Interchange Format. Compatible with:
- GitHub Code Scanning
- Azure DevOps
- VS Code SARIF Viewer extension
- Other SARIF-compatible tools

---

## VS Code Extension

### Setup
```bash
cd vscode-extension
npm install
npm run compile
```

Install the compiled VSIX in VS Code via Extensions > Install from VSIX.

### Configuration
In VS Code Settings, search for "ValidAI":
- `validai.webUIUrl` — URL of the web interface (default: `http://localhost:3600`)
- `validai.enableDiagnostics` — Show findings as VS Code Problems (default: true)

### Usage
- **Analyze Current File** — Right-click any file
- **Analyze Selection** — Select code, right-click
- Results appear in the VS Code Problems panel

---

## Tips & Best Practices

1. **Start with Quick Scan** — Get a fast overview before running Full Audit
2. **Include your prompt** — The Prompt Testability module gives better results when it can analyze your original prompt
3. **Use severity as a priority guide** — Fix Critical and High first; Info findings are informational
4. **Track trends** — Run analyses regularly and use the Trends page to monitor improvement
5. **Add your Claude API key** — The AI Review Assistant catches patterns that regex-based modules miss
6. **Export as SARIF** — Integrate findings into your CI/CD pipeline via GitHub Code Scanning
7. **Analyze GitHub repos periodically** — Catch regressions in team repositories
8. **Review module descriptions** — Each module's description in the selector helps you pick the right checks for your code type
