# Roadmap

## Phase 1 ✓ — Core shell + 3 modules

Single-file browser app. No install. Three analysis modules covering the most impactful AI failure modes.

**Delivered:**
- Failure Mode Scanner (Ch 3)
- Security Probe (Ch 13)
- Hallucination Detector (Ch 2)
- Language detection: Python, JS, TS, Java, Go
- Severity filtering, score bar, finding detail panel

---

## Phase 2 — Execution sandbox + 4 more modules

### New modules

**Property Generator (Ch 7)**  
Given a function signature and docstring, infers testable properties and generates Hypothesis (Python) or fast-check (JavaScript) test stubs. Covers invariant properties, round-trip properties, and algebraic relations.

**Complexity Profiler (Ch 9)**  
AST-level detection of algorithmic complexity issues: nested loops, unbounded recursion, N+1 ORM patterns. Runs synthetic benchmarks at escalating input sizes (10×, 100×, 1000×) and plots the growth curve.

**AI Review Assistant (Ch 11)**  
Sends submitted code to Claude via the Anthropic API with a structured prompt targeting AI-specific anti-patterns: omniscient functions, cargo-cult design patterns, leaky abstractions, inconsistent naming. Returns structured findings in the same format as other modules. Requires user-supplied API key (bring-your-own-key input field).

**Differential Runner (Ch 8)**  
Side-by-side editor: paste two implementations of the same function. The tool runs them against a shared corpus of automatically generated inputs and highlights any outputs that disagree.

### Infrastructure

- Pyodide integration — execute Python property tests in-browser via WASM
- GitHub Gist import — paste a Gist URL to load code directly
- Export findings as JSON (SARIF-compatible) and copyable Markdown
- localStorage persistence for recent submissions

---

## Phase 3 — Integrations + polish

- **GitHub App** — post ValidAI findings as PR comments in SARIF format; block merges on Critical findings
- **VS Code extension** — run analysis directly from the editor on the current file
- **Trend history** — track quality score across submissions for a function or file; visualise improvement from prompt iteration
- **Mutation Scorer** — import an existing test suite; apply semantic mutations and report what percentage the tests catch
- **Oracle Checker** — compare code behaviour against a plain-English specification; flag divergences

---

## Contributing a module

If you want to build a Phase 2 or 3 module, open an issue first to discuss the design. Each module should:

1. Export a `run(code, prompt, lang)` function returning an array of finding objects
2. Match the finding schema used by existing modules (see `docs/modules.md`)
3. Map to a specific chapter in *Testing the Machine*
4. Work without a backend (browser-only, or clearly documented external dependency like an API key)
