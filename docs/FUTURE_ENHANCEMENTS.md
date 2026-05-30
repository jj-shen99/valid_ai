# ValidAI — Future Enhancement Roadmap

Potential features for v1.2.0 and beyond, organized by category.

---

## Analysis Modules (New)

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 33 | **Race Condition Detector** | Detect shared mutable state in async/concurrent code, missing locks, non-atomic operations, and promise race hazards. | High |
| 34 | **API Contract Validator** | Parse JSDoc/TypeDoc annotations and verify implementations match declared contracts (param types, return types, throws). | Medium |
| 35 | **Error Handling Auditor** | Detect uncaught promise rejections, missing `.catch()`, generic error types, swallowed errors, and error-first callbacks without checks. | High |
| 36 | **Regex Complexity Analyzer** | Flag ReDoS-vulnerable patterns, catastrophic backtracking, overly complex regex without comments, and unnecessary captures. | Medium |
| 37 | **Logging & Observability Checker** | Detect missing error logging, `console.log` in production, PII in logs, and missing structured logging metadata. | Low |

## Code Intelligence

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 38 | **Call Graph Visualization** | Build function call graph from analysis results; render as interactive SVG to show module dependencies and hot paths. | Medium |
| 39 | **Finding Heatmap** | Overlay finding density on a minimap of the code, color-coded by severity. Click-to-jump to specific lines. | Medium |
| 40 | **AI Auto-Fix (Claude)** | Use Claude API to generate targeted code fixes for findings, presented as editable diffs with accept/reject. | High |
| 41 | **Multi-File Dependency Graph** | In batch mode, show cross-file import graph with findings projected onto edges. | Low |

## CI/CD & DevOps

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 42 | **GitHub Actions Integration** | `validai-action` that runs analysis on PRs, posts findings as review comments, enforces quality gate. | High |
| 43 | **SARIF 2.1 Enhanced Export** | Full SARIF v2.1 with tool/driver metadata, rule definitions, and GitHub Code Scanning upload compatibility. | Medium |
| 44 | **Webhook Notifications** | Post analysis results to Slack, Teams, or Discord via configurable webhooks with severity filters. | Low |
| 45 | **Scheduled Analysis** | Cron-style periodic analysis of GitHub repos with trend emails/notifications. | Low |

## UI & UX

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 46 | **Full Dark Mode Theme** | Complete dark mode across all pages (currently utilities only). Toggle in navbar, persist preference. | High |
| 47 | **Drag-and-Drop File Upload** | Drop zone overlay on code editor for file upload, supporting multi-file drop for batch analysis. | Medium |
| 48 | **Keyboard-Driven Finding Navigation** | `j`/`k` to navigate findings, `e` to expand, `s` to suppress, `n` to annotate. Visual focus ring. | Medium |
| 49 | **Customizable Dashboard Widgets** | Drag-and-drop dashboard with configurable cards: recent analyses, module status, trends, quality gate history. | Low |
| 50 | **Mobile Responsive Layout** | Responsive breakpoints for tablet/phone. Collapsible sidebar, stacked cards, touch-friendly controls. | Medium |

## Testing & Quality

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 51 | **End-to-End Browser Tests** | Playwright tests for critical user flows: submit code → view findings → export report. | High |
| 52 | **Snapshot Tests for UI Components** | Vitest snapshot tests for FindingCard, QuickStats, ModuleSelector, ExportPanel. | Medium |
| 53 | **Performance Benchmarks** | Automated benchmark suite measuring analysis speed per module, rendering time, bundle size tracking. | Medium |
| 54 | **Fuzzing Harness** | Fuzz analysis modules with random code inputs to catch crashes, infinite loops, and regex catastrophic backtracking. | Low |

## Data & Reporting

| # | Enhancement | Description | Priority |
|---|-------------|-------------|----------|
| 55 | **PDF Report Export** | Generate branded PDF reports with charts, finding tables, and executive summary. | Medium |
| 56 | **Team Dashboard** | Multi-user view aggregating quality scores, trends, and findings across projects (requires backend). | Low |
| 57 | **Finding Attribution** | Track which findings were introduced by which code changes (requires git blame integration). | Medium |
| 58 | **Compliance Report Templates** | Pre-built report templates for SOC2, HIPAA, PCI-DSS mapping findings to compliance requirements. | Low |

---

*Last updated: v1.1.0 — 679 tests, 14 modules, 32 enhancements shipped.*
