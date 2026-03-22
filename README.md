# ValidAI — Testing Framework for AI-Generated Code

> Companion tool to **Testing the Machine: Validating AI-Generated Software in the Age of Autonomous Development**

ValidAI is a browser-native static analysis tool that scans AI-generated code for the failure modes catalogued in the book. No installation, no backend, no build step — open `index.html` and start testing.

![Phase 2](https://img.shields.io/badge/Phase-2-4af0b0?style=flat-square) ![No dependencies](https://img.shields.io/badge/dependencies-none-4af0b0?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-4af0b0?style=flat-square)

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/validai.git
cd validai
open index.html          # macOS
# or: xdg-open index.html  (Linux)
# or: start index.html     (Windows)
```

That's it. No `npm install`. No server. Works entirely in the browser.

**Or try it live:** deploy the repo to GitHub Pages and share the URL with your team.

---

## Modules

| Module | What it detects | Book chapter |
|--------|----------------|--------------|
| **Failure Mode Scanner** | Silent exception swallowing, missing input validation, off-by-one boundaries, inconsistent return types, global state mutation | Chapter 3 |
| **Security Probe** | SQL injection, hardcoded secrets, weak cryptography (MD5/SHA-1/AES-ECB), shell injection, missing auth checks | Chapter 13 |
| **Hallucination Detector** | Non-existent API calls, deprecated method signatures, wrong parameter counts | Chapter 2 |
| **Property Generator** | Infers testable properties from function signatures; generates Hypothesis / fast-check stubs | Chapter 7 |
| **Complexity Profiler** | Nested O(n²) loops, N+1 query patterns, unbounded recursion, memory accumulation | Chapter 9 |
| **Differential Runner** | Interactive two-implementation comparison across 20 auto-generated inputs | Chapter 8 |
| **AI Review Assistant** | Claude-powered semantic review for AI-specific anti-patterns (requires API key) | Chapter 11 |

### Supported Languages
Python · JavaScript · TypeScript · Java · Go

---

## How It Works

1. Paste AI-generated code into the editor
2. Optionally paste the prompt that generated it
3. Select which modules to run
4. Click **Run Analysis**

Each finding includes:
- **Severity** — Critical / High / Medium / Info
- **Explanation** — why it's a problem in plain English
- **Vulnerable pattern** — the exact code shape that triggered the finding
- **Fix pattern** — the correct implementation
- **Book chapter** — where to read more

---

## Try It With This Snippet

Paste this Python code to trigger findings across all three modules:

```python
import requests

password = "supersecret123"

def get_user(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)

def process_data(items):
    for i in range(1, len(items)):
        try:
            result = requests.get_with_retry(items[i])
        except Exception:
            pass
```

Expected findings: SQL injection (Critical), hardcoded password (Critical), hallucinated API (Critical), silent exception swallowing (High), off-by-one loop (Medium).

---

## Project Structure

```
validai/
├── index.html          # Complete Phase 1 app (single file)
├── README.md           # This file
├── LICENSE             # MIT
├── CHANGELOG.md        # Version history
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── pattern_request.md
└── docs/
    ├── modules.md      # Detailed module documentation
    ├── patterns.md     # Full detection pattern library
    └── roadmap.md      # Phase 2 and beyond
```

---

## Roadmap

### Phase 1 ✓ — Core shell + 3 modules
Failure Mode Scanner, Security Probe, Hallucination Detector.

### Phase 2 ✓ — Execution sandbox + 4 more modules
Property Generator, Complexity Profiler, Differential Runner, AI Review Assistant. GitHub Gist import. JSON + Markdown export.

### Phase 3 (planned)
- [ ] GitHub App — post findings as PR comments (SARIF format)
- [ ] Trend history — quality score over time per function/file
- [ ] Mutation Scorer — import a test suite, measure what mutations it catches
- [ ] Oracle Checker — compare code behaviour against a plain-English spec
- [ ] VS Code extension

---

## Adding Detection Patterns

Detection patterns live in the three `run*` functions inside `index.html`. Each pattern is a regex with an associated finding object. To add a new pattern:

```javascript
// Inside runSecurityProbe(), runFailureModeScanner(), or runHallucinationDetector()

const myPattern = /your_regex_here/;
if (myPattern.test(code)) {
  const lineNo = findLine(lines, myPattern);
  findings.push({
    severity: 'High',          // Critical | High | Medium | Info
    title: 'Short finding title',
    snippet: lineNo !== -1 ? lines[lineNo].trim() : null,
    line: lineNo !== -1 ? lineNo + 1 : null,
    cweId: 'CWE-XXX',          // optional
    explanation: 'Why this is a problem...',
    badCode: 'the bad pattern',
    fixCode: 'the correct version',
    chapter: 'Chapter N — Title',
  });
}
```

Pattern contributions are welcome — see [Contributing](#contributing).

---

## Contributing

Contributions are especially welcome in two areas:

**New detection patterns** — if you've found a recurring AI-generated bug pattern that ValidAI doesn't yet catch, open a Pattern Request issue with the code example and the correct fix.

**Language coverage** — the hallucination and failure mode pattern libraries currently have strongest coverage for Python and JavaScript. Java, Go, TypeScript, and C# patterns are underrepresented.

Please open an issue before submitting a PR for significant new modules — it's worth discussing the design first.

---

## About the Book

*Testing the Machine* covers the principles, strategies, and tools for validating AI-generated software — from property-based testing and differential testing to security validation and autonomous QA pipelines.

ValidAI is the practical companion: each module implements a concept from the book as a runnable tool.

---

## License

MIT — see [LICENSE](LICENSE).
