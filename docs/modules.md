# Module Documentation

Detailed reference for each ValidAI Phase 1 module.

---

## Failure Mode Scanner

**Book chapter:** Chapter 3 — The AI Bug Zoo  
**Purpose:** Detects logical and structural bugs characteristic of AI code generation

### Patterns

#### Silent exception swallowing
- **Severity:** High
- **Languages:** Python, JavaScript
- **Detection:** `except` block containing only `pass`, `return None`, or a bare log call; `catch` block containing only `console.log`
- **Why AI generates this:** The model adds error handling scaffolding to satisfy the pattern of "good code has error handling," without reasoning about what calling code should do when the operation fails.

#### Missing input validation
- **Severity:** Medium
- **Languages:** All
- **Detection:** Function definitions with parameters but no guard clauses, type checks, or early returns
- **Why AI generates this:** Specifications typically describe the happy path. The model implements what was asked without adding validation for conditions that were assumed but not stated.

#### Off-by-one boundary
- **Severity:** Medium
- **Languages:** Python, JavaScript
- **Detection:** `range(1, ...)` loops, `len(x) - 1` slice upper bounds, `.slice(0, arr.length - 1)`
- **Why AI generates this:** The model pattern-matches to common loop structures in training data, which are not always correct for the specific context.

#### Inconsistent return type
- **Severity:** Medium
- **Languages:** Python, JavaScript
- **Detection:** Functions that return both `None`/`null` and a concrete value in different code paths
- **Why AI generates this:** The model generates error paths and success paths independently, often defaulting to `None`/`null` for error paths without considering the calling code's contract.

#### Global state mutation
- **Severity:** Medium
- **Languages:** Python
- **Detection:** `global` keyword inside function bodies
- **Why AI generates this:** The generation context often lacks dependency injection patterns; the model falls back to global state when it needs to share data across calls.

---

## Security Probe

**Book chapter:** Chapter 13 — The Security Horror Show  
**Purpose:** Detects OWASP Top 10 vulnerabilities and AI-specific security patterns

### Patterns

#### SQL injection
- **Severity:** Critical
- **CWE:** CWE-89
- **Languages:** Python, JavaScript, TypeScript
- **Detection:** f-strings, `.format()`, template literals, or string concatenation containing SQL keywords
- **Why AI generates this:** String-interpolated queries dominate training data — tutorials and older codebases rarely used parameterized queries. The model reproduces the most statistically common pattern.

#### Hardcoded secrets
- **Severity:** Critical
- **CWE:** CWE-798
- **Languages:** All
- **Detection:** Assignments to variables named `password`, `api_key`, `secret`, `token` with string literal values; PEM-encoded private key blocks
- **Why AI generates this:** Training data contains large numbers of example files with placeholder values that look like real credentials. The model reproduces the structure.

#### Weak cryptography
- **Severity:** High
- **CWE:** CWE-327 / CWE-338
- **Languages:** Python, JavaScript
- **Detection:** `hashlib.md5`, `hashlib.sha1`, `CryptoJS.MD5/SHA1`, `AES.encrypt` without explicit mode, `Math.random()` / `random.random()` in security-adjacent contexts
- **Why AI generates this:** Broken algorithms are more common in training data than correct ones. MD5 and SHA-1 appear in millions of tutorials.

#### Shell command injection
- **Severity:** Critical
- **CWE:** CWE-78
- **Languages:** Python, JavaScript
- **Detection:** `os.system`, `subprocess` with `shell=True` and string interpolation, `exec()` with template literals, `child_process.exec()`
- **Why AI generates this:** The specification says "run a command" without requiring input sanitisation. The model generates the simplest working implementation.

#### Missing authentication check
- **Severity:** High
- **CWE:** CWE-306
- **Languages:** Python, JavaScript
- **Detection:** Route handler definitions without authentication decorator or middleware
- **Why AI generates this:** Classic specification gap — the prompt describes business logic without specifying "only for authenticated users." The model implements what was stated, not what was implied.

---

## Hallucination Detector

**Book chapter:** Chapter 2 — How AI Generates Code (and Why It Confidently Lies)  
**Purpose:** Detects calls to non-existent APIs and deprecated method signatures

### Hallucinated Python APIs

| Hallucinated call | Reality | Correct alternative |
|---|---|---|
| `requests.get_with_retry()` | Does not exist | `requests.Session` + `HTTPAdapter(max_retries=Retry(...))` |
| `pd.DataFrame.fillna_smart()` | Does not exist | `.fillna()`, `.interpolate()`, `.ffill()` |
| `os.path.join_all()` | Does not exist | `os.path.join(*parts)` |
| `json.loads_safe()` | Does not exist | `json.loads()` in try/except |
| `datetime.now_utc()` | Does not exist | `datetime.now(timezone.utc)` |
| `.filter_by_none()` | Does not exist (SQLAlchemy) | `.filter(Model.col == None)` |
| `hashlib.sha256_hex()` | Does not exist | `hashlib.sha256(data).hexdigest()` |

### Hallucinated JavaScript/TypeScript APIs

| Hallucinated call | Reality | Correct alternative |
|---|---|---|
| `Array.prototype.flatten()` | Named `.flat()` | `.flat()` / `.flat(Infinity)` |
| `Object.filterKeys()` | Does not exist | `Object.fromEntries(Object.entries(obj).filter(...))` |
| `Promise.allWithTimeout()` | Does not exist | `Promise.all()` + `Promise.race()` timeout |
| `fetch.postJSON()` | Does not exist | `fetch(url, { method: 'POST', ... })` |
| `localStorage.setWithExpiry()` | Does not exist | Manual expiry implementation |

### Deprecated Python APIs

| Deprecated | Since | Use instead |
|---|---|---|
| `datetime.utcnow()` | 3.12 | `datetime.now(timezone.utc)` |
| `collections.Callable` | 3.10 | `collections.abc.Callable` |
| `@asyncio.coroutine` | 3.11 (removed) | `async def` |
