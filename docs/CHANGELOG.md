# Changelog

All notable changes to ValidAI are documented here.

---

## [1.1.0] — Phase 11

### Fixes
- **README** — Consolidated duplicate book sections into single Links entry with Amazon URL. Updated module list from 9 to 14 with full descriptions.

### New Features
- **Dead Code Detector** — 14th analysis module detecting unused variables, unreachable code after return, empty function bodies, commented-out code, and unused imports. Registered in engine, module selector, all Full Audit profiles.
- **Code Duplication Finder** — Sliding-window duplicate block detection using normalized line hashing. Reports duplicate blocks with line numbers, duplication percentage, and duplication score. Markdown report formatter.
- **Finding Timeline** — Tracks per-finding occurrence history across analysis runs. Records first seen, last seen, occurrence count. Identifies recurring findings (≥3 occurrences), resolved findings, and new findings. Stats summary with most frequent and oldest unresolved.
- **Analysis Comparison Diff Export** — Compares two analysis runs identifying new, resolved, and persistent findings. Exports full markdown diff report with score delta table, resolved/new/persistent sections.
- **Quality Gate** — Configurable severity thresholds (minScore, maxCritical, maxHigh, maxMedium, maxTotal) with pass/fail/warn evaluation. Persistent threshold storage. Default thresholds: 70% score, 0 critical, 3 high, 10 medium, 20 total.

### New Files
- `src/modules/deadCodeDetector.js` — Dead code detection module (5 patterns + empty function scan).
- `src/utils/duplicationFinder.js` — Duplicate block detection, scoring, and report formatting.
- `src/utils/findingTimeline.js` — Finding occurrence tracking and analysis.
- `src/utils/diffExporter.js` — Analysis comparison and markdown diff export.
- `src/utils/qualityGate.js` — Configurable quality gate with threshold management.

### Tests — 679 total (up from 601)
- **Dead Code Detector** (13 tests) — Pattern detection, ignore list, metadata, clean code.
- **Duplication Finder** (11 tests) — Block detection, scoring, report, caps, empty/short code.
- **Finding Timeline** (15 tests) — CRUD, recurring, resolved, new, stats, persistence, caps.
- **Diff Exporter** (12 tests) — Comparison, markdown export, empty sets, metadata.
- **Quality Gate** (15 tests) — Threshold CRUD, gate evaluation, formatting, custom thresholds.
- **Integration** (5 tests) — Cross-feature pipelines, engine registration, Full Audit 14-module completeness.
- **Structured** (9 tests) — API contract validation for all new modules.

---

## [1.0.0] — Phase 10 (Stable Release)

### Fixes
- **Full Audit profile** — Now includes all 13 modules (was missing typescript, accessibility, dependency, customRules in some views).
- **Module counts** — Dashboard, AnalysisView, ModuleSelector, GitHubAnalysis all show correct 13-module list.

### New Features
- **Finding search & filter bar** — Full-text search across category, description, suggestion, module, and code snippets. Severity toggle buttons for instant filtering. Shows filtered count vs total.
- **Dark mode utilities** — `getDarkModePref`/`setDarkModePref` with system preference fallback. Dark-aware severity color palette (`severityColorsDark`). `dc()` helper for dual-class generation.
- **Dependency Vulnerability Scanner** — New analysis module detecting 10 known vulnerable/deprecated packages (event-stream, ua-parser-js, colors, faker, node-ipc, lodash, moment, request, left-pad, serialize-javascript) plus deprecated API patterns (Buffer(), sync fs). Registered as 13th module.
- **Analysis summary report** — Auto-generates markdown report with severity table, module breakdown, top 5 issues, and recommendations based on score. One-click download via Report button.
- **Module quality trend sparklines** — Tracks per-module finding counts across runs (capped at 30). SVG sparkline path generator. `recordAllModuleTrends` auto-records after each analysis.

### New Files
- `src/utils/findingSearch.js` — Search, filter by severity/module/line range, apply combined filters.
- `src/utils/darkMode.js` — Dark mode preference, class helpers, severity color palette.
- `src/modules/dependencyScanner.js` — Dependency vulnerability detection module.
- `src/utils/summaryReport.js` — Markdown report generator with download.
- `src/utils/moduleTrend.js` — Module trend tracker with sparkline path generation.

### Tests — 601 total (up from 518)
- **Finding Search** (20 tests) — Text search, severity/module/line filters, combined filters, helpers.
- **Dark Mode** (10 tests) — Preference storage, system fallback, dc helper, severity colors.
- **Dependency Scanner** (11 tests) — Package detection, dedup, metadata, scoped imports, clean code.
- **Summary Report** (11 tests) — Markdown generation, severity table, top issues, recommendations, edge cases.
- **Module Trends** (15 tests) — CRUD, recording, sparklines, capping, persistence, SVG path.
- **Integration** (7 tests) — Cross-feature pipelines, engine registration, Full Audit completeness.
- **Structured** (9 tests) — API contract validation for all new modules.

---

## [0.9.0] — Phase 9

### New Features
- **Finding annotations** — Attach user notes to individual findings. Notes persisted in localStorage with add/edit/remove. Note button in FindingCard expanded view.
- **Severity override** — Reclassify finding severity per module+category. Override dropdown in FindingCard, shows original severity. Applies across all findings matching the key.
- **Accessibility Analyzer module** — New analysis module detecting 10 a11y patterns: missing alt text, empty links, missing form labels, onClick without keyboard, non-semantic buttons, missing lang, autofocus, positive tabIndex, missing ARIA roles, color-only indicators.
- **Code complexity score breakdown** — Cyclomatic complexity, cognitive complexity, logical LOC, and per-function breakdown. Letter grade (A–F). Displayed after analysis in a summary panel.
- **Export to GitHub Issues** — Format findings as GitHub issues with title, body (description/suggestion/code/auto-fix), and labels. `buildIssueUrl` for manual creation, `createGitHubIssue` for API-based creation.

### New Files
- `src/utils/annotations.js` — Finding annotation CRUD with localStorage.
- `src/utils/severityOverrides.js` — Severity override CRUD with applyOverrides.
- `src/modules/accessibilityAnalyzer.js` — A11y analysis module (10 patterns).
- `src/utils/complexityMetrics.js` — Cyclomatic, cognitive, LOC, function metrics.
- `src/utils/githubIssueExporter.js` — GitHub issue formatting and creation.

### Tests — 518 total (up from 428)
- **Annotations** (11 tests) — CRUD, empty/whitespace handling, persistence, corruption.
- **Severity Overrides** (14 tests) — CRUD, validation, applyOverrides, persistence.
- **Accessibility Analyzer** (12 tests) — Pattern detection, metadata, dedup, clean code.
- **Complexity Metrics** (23 tests) — Cyclomatic, cognitive, LOC, functionMetrics, summary, grading.
- **GitHub Issue Exporter** (13 tests) — Title, body, labels, URL building.
- **Integration** (6 tests) — Cross-feature interactions.
- **Structured** (11 tests) — API contract validation.

---

## [0.8.0] — Phase 8

### New Features
- **Finding suppression** — Suppress findings by module+category. Persisted in localStorage. Per-finding suppress button in FindingCard, suppressed count shown in results.
- **Module performance metrics** — `runAnalysisTimed` variant tracks per-module execution time and finding count. Collapsible performance panel with bar chart visualization. History capped at 50 runs.
- **Batch multi-file analysis** — Upload multiple files at once via "Batch" button. Per-file results with expandable cards showing score, language, and findings.
- **Real-time analysis** — Debounced auto-analysis as you type (1.5s delay). Live badge showing issue count or clean status. Skips AI module for speed.
- **Analysis history comparison** — Compare any two past submissions side-by-side. Shows score delta, resolved findings, and new issues with expandable details.

### New Files
- `src/utils/suppressions.js` — Suppression CRUD with localStorage persistence.
- `src/utils/perfTracker.js` — Module timing, history, and averages.
- `src/utils/batchAnalyzer.js` — Multi-file analysis with language detection.
- `src/hooks/useRealtimeAnalysis.js` — Debounced auto-analysis hook.
- `src/utils/submissionDiff.js` — Submission comparison utilities.

### Tests — 428 total (up from 350)
- **Suppressions** (17 tests) — CRUD, dedup, filtering, persistence, corrupted data.
- **Perf Tracker** (14 tests) — Timing, history CRUD, averages, capping, error handling.
- **Batch Analyzer** (11 tests) — Language detection for all extensions.
- **Submission Diff** (17 tests) — Diffing, deltas, edge cases, format utilities.
- **Integration** (7 tests) — Cross-feature interactions.
- **Structured** (12 tests) — API contract validation.

---

## [0.7.0] — Phase 7

### New Features
- **Keyboard shortcuts** — Global shortcut system with `⌘/Ctrl+K` command palette, `⌘/Ctrl+1–5` page navigation, and `Shift+?` help modal. All shortcuts discoverable via the ShortcutsModal.
- **Command Palette** — VS Code–style fuzzy command palette for quick navigation and actions. Searchable, grouped by Navigation/Actions/Help.
- **Code context viewer** — FindingCard now shows ±3 lines of surrounding source code with line numbers and highlighted offending line when expanded.
- **Finding grouping & deduplication** — Toggle between list/grouped view in analysis results. Group by module, severity, or category. Deduplicates near-identical findings across modules.
- **Saveable analysis profiles** — Save current module selection as a named preset. User profiles stored in localStorage alongside built-in Quick Scan/Security/Full Audit presets. Delete profiles individually.

### New Files
- `src/hooks/useKeyboardShortcuts.js` — Global keyboard shortcut hook with SHORTCUT_MAP registry.
- `src/components/CommandPalette.jsx` — Fuzzy-search command palette overlay.
- `src/components/ShortcutsModal.jsx` — Keyboard shortcuts reference modal.
- `src/utils/findingGrouper.js` — Group, deduplicate, priority-score, and summarize findings.
- `src/utils/profileManager.js` — CRUD for user-defined analysis profile presets.

### Tests — 350 total (up from 304)
- **Keyboard Shortcuts** (7 tests) — SHORTCUT_MAP structure, unique combos, all shortcuts present.
- **Finding Grouper** (17 tests) — groupBy module/severity/category, dedup, priorityScore, sortByPriority, groupSummary.
- **Profile Manager** (12 tests) — CRUD, unique IDs, persistence, corrupted JSON handling.
- **Code Context** (10 tests) — Context window, edge cases, highlight index, out-of-range lines.

---

## [0.6.0] — Phase 6

### New Features
- **CLI mode** — `node cli/index.js <file>` analyzes files from the command line with `--modules`, `--format` (text/json/sarif), and `--min-severity` options. Supports `bin` entry for `npx valid-ai`. Exit code 1 on critical findings for CI/CD integration.
- **TypeScript Analyzer module** — Detects TS-specific anti-patterns: explicit `any` type abuse, unsafe `as any` assertions, double assertions, non-null assertion (`!.`) overuse, `@ts-ignore`/`@ts-nocheck` suppression, untyped function parameters, and missing return types on exports.
- **Auto-fix suggestions** — Concrete code patches attached to findings for common patterns: loose equality → strict, silent catch → console.error, off-by-one `<=` → `<`, `innerHTML` → `textContent`, `eval` → `JSON.parse`, and TS `any` → `unknown`. FindingCard UI shows diff-style patch with copy button.
- **Custom rule authoring** — Define regex-based rules in Settings with name, pattern, severity, message, and suggestion. Rules stored in `localStorage`, toggled on/off individually, and run alongside built-in modules via the "Custom Rules" module selector option.

### New Files
- `cli/index.js` — CLI entry point with colorized text, JSON, and SARIF output formats.
- `src/modules/typescriptAnalyzer.js` — TypeScript-specific analysis module (8 patterns).
- `src/modules/customRules.js` — Custom rule CRUD and runner engine.
- `src/utils/autoFixer.js` — Auto-fix pattern matching and patch generation.

### Tests — 304 total (up from 227)
- **Hash Router** (7 tests) — Page parsing, invalid hashes, XSS prevention.
- **Diff Analyzer** (20 tests) — Changed lines, context, filtering, code cache, hashing.
- **TypeScript Analyzer** (13 tests) — All 8 patterns, dedup, autoFix generation, language gating.
- **Auto-Fixer** (12 tests) — Attach fixes, apply patches, generate patch text, edge cases.
- **Custom Rules** (15 tests) — CRUD, toggle, runner, dedup, invalid regex, comment skipping.
- **CLI & Engine** (10 tests) — Module registry, incremental mode, TS module integration, sorting.

---

## [0.5.0] — Phase 5

### Architecture Enhancements
- **URL-based hash routing** — Replaced `useState` page switching with `useHashRouter` hook. Enables deep-linking (`#/submit`, `#/analysis`, etc.), browser back/forward navigation, and bookmarkable pages.
- **Web Worker analysis** — All 8 regex-based analysis modules now run off the main thread in a dedicated Web Worker. Falls back gracefully to main-thread execution if Worker is unavailable. AI Review stays on main thread (network-bound).
- **Incremental / diff-only analysis** — New `diffAnalyzer` utility tracks previous code per-language. When "Incremental mode" is enabled in CodeSubmission, only findings on changed lines (±2 context lines) are reported. Identical resubmissions return instantly.
- **Removed recharts dependency** — Migrated all remaining Recharts usage in `AnalysisDetails.jsx` (6 charts + predictive trend) to custom SVG chart components. New `SVGAreaChart` component created. Recharts (~450KB) fully removed from `package.json`.
- **Persisted dark mode** — Dark/light preference now stored in `localStorage` and restored on reload.

### New Files
- `src/hooks/useHashRouter.js` — Lightweight hash-based router hook.
- `src/workers/analysisWorker.js` — Web Worker for off-main-thread analysis.
- `src/utils/diffAnalyzer.js` — Incremental diff computation and line-change tracking.
- `src/components/charts/SVGAreaChart.jsx` — Reusable SVG area chart component.

### Bundle Impact
- Removed `recharts` (~450KB) from dependencies.
- Analysis engine split into its own chunk for Worker loading.
- Total production bundle significantly lighter.

---

## [0.4.0] — Phase 4

### Performance Optimizations
- **Lazy-loaded CodeMirror languages** — Language packs (C++, Go, Java, JS, Python) now loaded via `dynamic import()` only when the user selects that language, reducing initial bundle by ~150KB.
- **React.lazy code-splitting** — CodeSubmission, AnalysisView, TrendHistory, GitHubAnalysis, and Settings pages are loaded on-demand with Suspense fallback. Dashboard loads instantly.
- **Lightweight SVG chart components** — New `SVGLineChart`, `SVGBarChart`, `SVGPieChart` replace Recharts in TrendChart and TrendHistory. TrendHistory chunk dropped from heavy Recharts bundle to 14KB.
- **Build output** — Moved from single 1.4MB bundle to chunked output with code-splitting.

### Bug Fixes
- **propertyGenerator crash** — Fixed `undefined.split()` error when analyzing zero-parameter functions like `function f()`.

### Module Enhancements (0.3.1)
- **All 8 modules** enhanced with `codeSnippet` in findings, per-pattern deduplication, and comment-line skipping.
- **Failure Mode Scanner** — Tightened "Type coercion issue" regex; removed "Magic number" (Info severity).
- **Oracle Checker** — Tightened "Missing input validation" and "Unvalidated API response" regexes; removed "Assertion-free function" (Info) and placeholder finding.
- **Property Generator** — Removed "Pure function detected" (Info severity).
- **Hallucination Detector** — Fixed regex `lastIndex` bug causing missed matches.
- **HTML reports** — Removed Info severity from HTML export (both code and GitHub reports).

### Project Structure
- Config files (`postcss.config.js`, `tailwind.config.js`) moved to `/config/` directory.
- Build output changed from `build/dist/` to `dist/`.
- Removed stale build artifacts and `.DS_Store` from repo.

### Tests — 227 total (up from 91)
- **Equivalence Partitioning** (36 tests) — 6 input classes × 8 modules.
- **Decision Table** (16 tests) — Comment, duplicate, match condition combos.
- **Primary Path** (13 tests) — End-to-end analysis pipeline, module orchestration, score calculation.
- **Boundary Value** (18 tests) — Truncation, param thresholds, line numbers, Unicode, CRLF, large files.
- **Finding Structure** (39 tests) — Schema validation, cross-module ID uniqueness, codeSnippet.
- Module-specific tests for oracleChecker (7) and propertyGenerator (7).

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
