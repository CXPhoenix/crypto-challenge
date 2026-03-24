/**
 * Pure utility functions for the Pyodide worker.
 * Extracted for testability — no Worker globals or Pyodide dependency.
 */

export type Verdict = 'AC' | 'WA'

export type VerdictDetail = 'hidden' | 'actual' | 'full'

/**
 * Build the optional expected/actual fields for a TestcaseResult
 * based on the verdictDetail setting.
 *
 * - hidden: omit both
 * - actual: include actual only
 * - full:   include both
 */
export function buildTestcaseResultFields(
  actual: string,
  expected: string,
  verdictDetail: VerdictDetail,
): { actual?: string; expected?: string } {
  switch (verdictDetail) {
    case 'hidden':
      return {}
    case 'actual':
      return { actual }
    case 'full':
      return { actual, expected }
  }
}

/**
 * Compare actual output to expected output.
 * Strips trailing whitespace/newlines before comparison (mirrors typical judge behaviour).
 */
export function computeVerdict(actual: string, expected: string): Verdict {
  return actual.trimEnd() === expected.trimEnd() ? 'AC' : 'WA'
}

/**
 * Build the Python code that will be executed inside Pyodide.
 * Injects:
 *   1. sys.settrace op-counter (primary TLE guard)
 *   2. sys.stdin simulation via io.StringIO
 *   3. sys.stdout capture via io.StringIO
 *   4. User code
 *   5. sys.settrace removal + output extraction
 */
export function buildWrappedCode(
  userCode: string,
  input: string,
  opLimit: number,
): string {
  // Escape input for embedding in a Python string literal
  const escapedInput = input.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')

  return `
import sys
import sys as _sys
import io

# ── op-count TLE guard ────────────────────────────────────────────
_op_count = 0
_op_limit = ${opLimit}

def _tracer(frame, event, arg):
    global _op_count
    _op_count += 1
    if _op_count > _op_limit:
        raise TimeoutError("Operation limit exceeded (${opLimit} ops)")
    return _tracer

sys.settrace(_tracer)

# ── sandbox guard ─────────────────────────────────────────────────
class _SandboxFinder:
    def find_module(self, fullname, path=None):
        if fullname in ('js', 'pyodide_js', 'pyodide') or \
           fullname.startswith(('js.', 'pyodide_js.', 'pyodide.')):
            return self
        return None
    def load_module(self, fullname):
        raise ImportError(f"Module '{fullname}' is not available")

_sys.meta_path.insert(0, _SandboxFinder())
for _n in list(_sys.modules):
    if _n in ('js', 'pyodide_js', 'pyodide') or \
       _n.startswith(('js.', 'pyodide_js.', 'pyodide.')):
        del _sys.modules[_n]

# ── stdin / stdout redirect ───────────────────────────────────────
sys.stdin = io.StringIO("""${escapedInput}""")
_captured_stdout = io.StringIO()
sys.stdout = _captured_stdout

# ── user code ─────────────────────────────────────────────────────
${userCode}

# ── teardown ──────────────────────────────────────────────────────
sys.settrace(None)
_output = _captured_stdout.getvalue()
`.trimStart()
}
