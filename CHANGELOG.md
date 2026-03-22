# Changelog

All notable changes to ValidAI are documented here.

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
