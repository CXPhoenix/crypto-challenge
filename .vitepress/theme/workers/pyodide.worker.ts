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
 *  - Handle GenerateRequest: run generator code per input to produce expected_output
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

/** Request to run the generator script against a list of inputs. */
export interface GenerateRequest {
  type: 'generate'
  generatorCode: string
  inputs: string[]
}

export interface GenerateTestcase {
  input: string
  expected_output: string
  /** Set if the generator threw an error for this input */
  error?: string
}

export interface GenerateComplete {
  type: 'generate_complete'
  testcases: GenerateTestcase[]
}

type WorkerOutMessage = TestcaseResult | RunComplete | GenerateComplete

const PYODIDE_CDN = '/pyodide/'
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

self.onmessage = async (
  event: MessageEvent<RunRequest | GenerateRequest | { type: 'preload' }>,
) => {
  const { type } = event.data

  // Preload message: warm up Pyodide in the background and stay idle.
  if (type === 'preload') {
    await ensurePyodide()
    return
  }

  if (type === 'generate') {
    await handleGenerate(event.data as GenerateRequest)
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

// ── Generator handler ──────────────────────────────────────────────────────

async function handleGenerate(req: GenerateRequest): Promise<void> {
  await ensurePyodide()

  const { generatorCode, inputs } = req
  const testcases: GenerateTestcase[] = []

  for (const input of inputs) {
    // Clear namespace before each generator run
    try {
      pyodide.globals.clear()
    } catch {
      // ignore
    }

    try {
      const wrapped = buildWrappedCode(generatorCode, input, DEFAULT_OP_LIMIT)
      await pyodide.runPythonAsync(wrapped)
      const rawOutput: string = (pyodide.globals.get('_output') ?? '').trimEnd()

      // Support factory format: generator outputs JSON {"input": "...", "expected_output": "..."}
      // This allows generators to transform WASM params into a different student input format
      // (e.g., decrypt challenges where student receives ciphertext instead of plaintext)
      let tcInput = input
      let tcOutput = rawOutput
      if (rawOutput.startsWith('{')) {
        try {
          const parsed = JSON.parse(rawOutput) as { input: string; expected_output: string }
          if (typeof parsed.input === 'string' && typeof parsed.expected_output === 'string') {
            tcInput = parsed.input
            tcOutput = parsed.expected_output
          }
        } catch {
          // Not valid JSON — treat as plain expected output
        }
      }

      testcases.push({ input: tcInput, expected_output: tcOutput })
    } catch (err: unknown) {
      testcases.push({ input, expected_output: '', error: String(err) })
    }
  }

  self.postMessage({
    type: 'generate_complete',
    testcases,
  } satisfies GenerateComplete)
}
