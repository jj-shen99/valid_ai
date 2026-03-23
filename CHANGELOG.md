# Changelog

All notable changes to ValidAI are documented here.

---

## [0.3.0] — Phase 3

### Breaking Changes
- **Removed Prompt Testability module** — Removed from registry, UI selectors, and all test profiles. The module produced excessive noise (one finding per commit when no prompt was provided) and its findings were not actionable for GitHub analysis.
- **Info severity excluded from scores and counts** — Quality Score formula now uses only Critical×10 + High×5 + Medium×2 divided by actionable (non-Info) finding count. Info items are hidden from finding lists by default (still accessible via severity filter dropdown).

### Rewritten Modules
- **Differential Runner** — Complete rewrite with 5 targeted detectors: versioned function names (V2/New/Alt/Legacy), custom algorithm reimplementations (sort, deepClone, debounce, flatten), complex regex patterns (15+ chars), chained data transformations (map/filter/reduce chains), and duplicate function definitions. All findings include exact line number and code snippet.
- **Mutation Scorer** — Tightened from 5 broad patterns to 3 focused ones: boundary comparisons (requiring if/while/for context), return value mutations, and conditional branches without else. Added per-pattern deduplication to prevent flooding.

### New Features
- **HTML report export for GitHub Analysis** — "Generate HTML Report" button produces a self-contained HTML file with SVG charts (severity pie, module bar, commit sparkline), KPI cards, ML insights, recommendations, and full findings table.
- **Nav banner** — Slim gradient background (blue-to-indigo) matching page banners.
- **Page banners** — All pages reduced to single-line compact banners with inline subtitle.

### UI Changes
- **"Language" → "Source"** column in submission tables — Shows "GitHub: owner/repo" for GitHub analyses.
- **Removed Actions column** from Submission History table on Trends page.
- **Removed Info card** from QuickStats (4-column layout: Score, Critical, High, Medium).
- **Info findings hidden** from Code Analysis Findings list and Analysis Results findings list by default.

### Bug Fixes
- **Score mismatch** — Quality Score now consistent between GitHub Analysis and Analysis Results pages (unified formula).
- **SQL injection false positives** — Tightened regex to require SQL keywords near string interpolation.
- **Mutation Scorer line 1** — Fixed by tightening regexes and deduplicating per pattern type.

### Tests
- 91 tests (up from 80) — added 11 tests for Differential Runner.

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
