# Changelog

All notable changes to ValidAI are documented here.

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
