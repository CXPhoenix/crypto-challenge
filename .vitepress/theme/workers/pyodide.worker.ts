/**
 * Pyodide Web Worker
 *
 * Responsibilities:
 *  - Load Pyodide from CDN once, reuse across runs (task 4.1)
 *  - Handle RunRequest messages from the main thread (task 4.2)
 *  - Inject op-count TLE guard via sys.settrace (task 4.3)
 *  - Simulate stdin and capture stdout (task 4.4)
 *  - Execute testcases one by one, posting TestcaseResult per case (task 4.5)
 *  - Set a wall-clock setTimeout as secondary TLE guard (task 4.6)
 *  - Clear namespace between testcases (task 4.7)
 */

import { buildWrappedCode, computeVerdict } from './worker-utils'

// ── Message protocol types (task 4.2) ──────────────────────────────────────

export interface RunRequest {
  type: 'run'
  code: string
  testcases: Array<{ input: string; expected_output: string }>
  /** Maximum Python bytecode operations per testcase. Default: 10_000_000 */
  opLimit?: number
}

export interface TestcaseResult {
  type: 'testcase_result'
  index: number
  verdict: 'AC' | 'WA' | 'TLE' | 'RE'
  actual?: string
  expected: string
  elapsed_ms: number
  /** Set for RE verdicts */
  error?: string
}

export interface RunComplete {
  type: 'run_complete'
  total: number
  passed: number
}

type WorkerOutMessage = TestcaseResult | RunComplete

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/'
const DEFAULT_OP_LIMIT = 10_000_000
/** Wall-clock budget per testcase in milliseconds (task 4.6) */
const WALL_CLOCK_MS = 5_000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null

/** Load Pyodide from CDN on first call, reuse thereafter (task 4.1) */
async function ensurePyodide(): Promise<void> {
  if (pyodide !== null) return

  // Dynamic import from CDN — @vite-ignore prevents Vite from bundling the URL
  const mod = await import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`)
  pyodide = await mod.loadPyodide({ indexURL: PYODIDE_CDN })
}

// ── Message handler ────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<RunRequest | { type: 'preload' }>) => {
  const { type } = event.data

  // Preload message: warm up Pyodide in the background and stay idle.
  if (type === 'preload') {
    await ensurePyodide()
    return
  }

  if (type !== 'run') return

  const { code, testcases, opLimit = DEFAULT_OP_LIMIT } = event.data as RunRequest

  await ensurePyodide()

  let passed = 0

  for (let i = 0; i < testcases.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { input, expected_output } = testcases[i]!
    const startTime = performance.now()

    // Wall-clock fallback (task 4.6): set a flag if JS event loop re-enters
    // after the timeout. For truly blocked Workers, the main-thread kill
    // in useExecutor provides the hard wall-clock guarantee.
    let wallClockTle = false
    const wallClock = setTimeout(() => {
      wallClockTle = true
    }, WALL_CLOCK_MS)

    // Namespace cleanup before each testcase (task 4.7)
    try {
      pyodide.globals.clear()
    } catch {
      // globals.clear() may not exist on all Pyodide versions; ignore
    }

    try {
      const wrapped = buildWrappedCode(code, input, opLimit)
      await pyodide.runPythonAsync(wrapped)

      clearTimeout(wallClock)

      if (wallClockTle) {
        self.postMessage({
          type: 'testcase_result',
          index: i,
          verdict: 'TLE',
          expected: expected_output,
          elapsed_ms: performance.now() - startTime,
        } satisfies TestcaseResult)
        continue
      }

      // stdout capture result (task 4.4)
      const actual: string = pyodide.globals.get('_output') ?? ''
      const elapsed_ms = performance.now() - startTime
      const verdict = computeVerdict(actual, expected_output)

      if (verdict === 'AC') passed++

      self.postMessage({
        type: 'testcase_result',
        index: i,
        verdict,
        actual,
        expected: expected_output,
        elapsed_ms,
      } satisfies TestcaseResult)
    } catch (err: unknown) {
      clearTimeout(wallClock)
      const elapsed_ms = performance.now() - startTime
      const errMsg = String(err)
      const isTle = errMsg.includes('TimeoutError') || errMsg.includes('Operation limit')

      self.postMessage({
        type: 'testcase_result',
        index: i,
        verdict: isTle ? 'TLE' : 'RE',
        expected: expected_output,
        elapsed_ms,
        error: isTle ? undefined : errMsg,
      } satisfies TestcaseResult)
    }
  }

  self.postMessage({
    type: 'run_complete',
    total: testcases.length,
    passed,
  } satisfies WorkerOutMessage)
}
