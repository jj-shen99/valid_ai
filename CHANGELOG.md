# Changelog

All notable changes to ValidAI are documented here.

---

## [0.2.0] — Phase 2

### New Modules
- **Property Generator** (Ch 7) — parses function signatures, infers testable properties (invariants, round-trips, range checks, robustness), and generates Hypothesis (Python) or fast-check (JavaScript) test stubs ready to run
- **Complexity Profiler** (Ch 9) — detects nested O(n²/n³) loops, N+1 ORM query patterns, unbounded recursion without base cases, and memory accumulation; produces a scored complexity report
- **Differential Runner** (Ch 8) — interactive split panel to compare two implementations against 20 auto-generated test inputs; highlights any output disagreements
- **AI Review Assistant** (Ch 11) — calls `claude-sonnet-4-6` directly from the browser to detect AI-specific anti-patterns: omniscient functions, cargo-cult patterns, leaky abstractions, inconsistent conventions, implicit assumptions, and semantic mismatches. Bring-your-own API key.

### New Features
- **GitHub Gist import** — paste any Gist URL to load code directly; auto-detects language from file extension
- **Export findings** — download results as structured JSON or a formatted Markdown report
- **API key field** — stored in sessionStorage for the session; never sent anywhere except `api.anthropic.com`
- **Phase badge** updated to Phase 2 in topbar

### Changes
- Empty state grid expanded from 3 to 8 cells (7 modules + Phase 3 placeholder)
- Module list now shows API KEY badge on AI Review to signal key requirement
- Filter bar redesigned with export buttons on the right
- Progress strip wraps on narrow viewports

---

## [0.1.0] — Phase 1

Initial release. Single-file browser application, no dependencies.

### Modules
- **Failure Mode Scanner** — 5 detection patterns (silent exception swallowing, missing input validation, off-by-one boundaries, inconsistent return types, global state mutation)
- **Security Probe** — 5 detection patterns (SQL injection, hardcoded secrets, weak cryptography, shell injection, missing authentication checks)
- **Hallucination Detector** — 12 hallucinated API patterns + 3 deprecated API patterns across Python and JavaScript

### Features
- Language detection and switching (Python, JavaScript, TypeScript, Java, Go)
- Optional generation prompt field
- Per-module toggle selection
- Live streaming progress during analysis
- Severity score bar (Critical / High / Medium summary)
- Severity and module filtering on findings
- Expandable finding detail panel with vulnerable pattern, fix code, and chapter link
- Zero install — open index.html directly in any modern browser
