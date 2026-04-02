/**
 * useChallengeRunner — unified orchestration layer for challenge lifecycle.
 *
 * Abstracts over two strategies:
 * - Dev: WASM inputs → Pyodide generator → JS comparison (existing flow)
 * - Prod: fetch encrypted pool → WASM decrypt/select → student code → WASM judge
 *
 * ChallengeView uses this composable instead of directly touching WASM, Workers, or generators.
 */
import { ref, type Ref } from 'vue'
import { useChallengeStore } from '../stores/challenge'
import { useExecutorStore } from '../stores/executor'
import { useWasm, type GeneratedInputs } from '../composables/useWasm'
import type {
  GenerateRequest,
  GenerateComplete,
  TestcaseResult,
  RunRequest,
  RunComplete,
  VerdictDetail,
} from '../workers/pyodide.worker'

export type { VerdictDetail }

export interface ChallengeConfig {
  algorithm: string
  params: Record<string, unknown>
  generator: string
  testcaseCount: number
  starterCode: string
  verdictDetail: VerdictDetail
}

/** Return type exposed to ChallengeView */
export interface ChallengeRunner {
  loadTestcases(): Promise<void>
  submit(code: string): Promise<void>
  stop(): void
  inputs: Ref<string[]>
  isReady: Ref<boolean>
  isRunning: Ref<boolean>
  errorMessage: Ref<string>
  verdictDetail: VerdictDetail
  cleanup(): void
}

const VALID_VERDICT_DETAILS = new Set<VerdictDetail>(['hidden', 'actual', 'full'])
const WALL_CLOCK_KILL_MS = 6_000

export function resolveVerdictDetail(raw: string | undefined): VerdictDetail {
  const v = raw ?? 'hidden'
  return VALID_VERDICT_DETAILS.has(v as VerdictDetail) ? (v as VerdictDetail) : 'hidden'
}

// ── WASM module types for pool/judge (loaded dynamically in prod) ──────────

type WasmPoolMod = {
  default: () => Promise<void>
  load_pool: (challenge_id: string, data: Uint8Array) => void
  select_testcases: (challenge_id: string, count: number) => { inputs: string[]; session_id: string }
  judge: (challenge_id: string, session_id: string, results: unknown[]) => unknown[]
  get_expected: (challenge_id: string, session_id: string, index: number) => string | null
}

const WASM_MOD_PATH = '/wasm/testcase_generator.js'

let wasmPoolMod: WasmPoolMod | null = null
let wasmInitPromise: Promise<void> | null = null

async function ensureWasmPool(): Promise<WasmPoolMod> {
  if (wasmPoolMod) return wasmPoolMod
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      const mod = await import(/* @vite-ignore */ `${WASM_MOD_PATH}`) as WasmPoolMod
      await mod.default()
      wasmPoolMod = mod
    })()
  }
  await wasmInitPromise
  return wasmPoolMod!
}

// ── Factory ────────────────────────────────────────────────────────────────

export function useChallengeRunner(config: ChallengeConfig): ChallengeRunner {
  const isProd = import.meta.env.PROD

  if (isProd) {
    return useProdRunner(config)
  } else {
    return useDevRunner(config)
  }
}

// ── Dev Strategy ───────────────────────────────────────────────────────────
// Preserves existing flow: WASM inputs → Pyodide generator → JS comparison

function useDevRunner(config: ChallengeConfig): ChallengeRunner {
  const challengeStore = useChallengeStore()
  const executorStore = useExecutorStore()
  const { generateChallenge } = useWasm()

  const inputs = ref<string[]>([])
  const isReady = ref(false)
  const isRunning = ref(false)
  const errorMessage = ref('')

  let localTestcases: Array<{ input: string; expected_output: string }> = []
  let activeWorker: Worker | null = null

  async function loadTestcases() {
    if (!config.generator) {
      errorMessage.value = 'generator 程式碼未設定，請在 frontmatter 中加入 generator 欄位'
      return
    }

    const paramsJson = JSON.stringify(config.params)
    const generated = await generateChallenge(paramsJson, config.testcaseCount)

    if (!generated) {
      errorMessage.value = 'WASM 生成失敗，請確認 params 格式正確'
      return
    }

    const testcases = await runGenerator(config.generator, generated.inputs)

    if (testcases === null) {
      errorMessage.value = 'Generator 執行失敗，請確認 generator 程式碼正確'
      return
    }

    localTestcases = testcases
    inputs.value = testcases.map((tc) => tc.input)

    const storeTestcases =
      config.verdictDetail === 'full'
        ? testcases
        : testcases.map((tc) => ({ input: tc.input }))
    challengeStore.setCurrentChallenge({ starter_code: config.starterCode, testcases: storeTestcases })
    isReady.value = true
  }

  function runGenerator(
    generatorCode: string,
    genInputs: string[],
  ): Promise<Array<{ input: string; expected_output: string }> | null> {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
        type: 'module',
      })
      activeWorker = worker

      worker.onmessage = (event: MessageEvent<GenerateComplete>) => {
        if (event.data.type === 'generate_complete') {
          activeWorker = null
          worker.terminate()
          const testcases = event.data.testcases.map((tc) => {
            if (tc.error) {
              console.error('[generator] error for input:', tc.input, tc.error)
            }
            return { input: tc.input, expected_output: tc.expected_output }
          })
          resolve(testcases)
        }
      }

      worker.onerror = () => {
        activeWorker = null
        worker.terminate()
        resolve(null)
      }

      const req: GenerateRequest = { type: 'generate', generatorCode, inputs: genInputs }
      worker.postMessage(req)
    })
  }

  async function submit(code: string) {
    if (!localTestcases.length) return
    isRunning.value = true
    executorStore.setRunning(localTestcases.length)

    const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
      type: 'module',
    })

    const totalBudget = localTestcases.length * WALL_CLOCK_KILL_MS
    const killTimer = setTimeout(() => {
      worker.terminate()
      executorStore.setDone(executorStore.totalTestcases, executorStore.passedCount)
      isRunning.value = false
    }, totalBudget)

    worker.onmessage = (event: MessageEvent<TestcaseResult | RunComplete>) => {
      const msg = event.data
      if (msg.type === 'testcase_result') {
        executorStore.addResult(msg)
      } else if (msg.type === 'run_complete') {
        clearTimeout(killTimer)
        executorStore.setDone(msg.total, msg.passed)
        worker.terminate()
        isRunning.value = false
      }
    }

    worker.onerror = () => {
      clearTimeout(killTimer)
      executorStore.setDone(executorStore.totalTestcases, executorStore.passedCount)
      worker.terminate()
      isRunning.value = false
    }

    const request: RunRequest = {
      type: 'run',
      code,
      testcases: localTestcases.map((tc) => ({
        input: tc.input,
        expected_output: tc.expected_output,
      })),
      verdictDetail: config.verdictDetail,
    }
    worker.postMessage(request)
  }

  function stop() {
    activeWorker?.terminate()
    activeWorker = null
    isRunning.value = false
  }

  function cleanup() {
    activeWorker?.terminate()
    activeWorker = null
  }

  return { loadTestcases, submit, stop, inputs, isReady, isRunning, errorMessage, verdictDetail: config.verdictDetail, cleanup }
}

// ── Prod Strategy ──────────────────────────────────────────────────────────
// Encrypted pool → WASM decrypt/select → student code → WASM judge

function useProdRunner(config: ChallengeConfig): ChallengeRunner {
  const challengeStore = useChallengeStore()
  const executorStore = useExecutorStore()

  const inputs = ref<string[]>([])
  const isReady = ref(false)
  const isRunning = ref(false)
  const errorMessage = ref('')

  let sessionId = ''
  let runWorker: Worker | null = null

  async function loadTestcases() {
    try {
      // Fetch encrypted pool
      const resp = await fetch(`/pools/${config.algorithm}.bin`)
      if (!resp.ok) {
        errorMessage.value = `無法載入測資池 (${resp.status})`
        return
      }
      const data = new Uint8Array(await resp.arrayBuffer())

      // Load & decrypt via WASM
      const wasm = await ensureWasmPool()
      wasm.load_pool(config.algorithm, data)

      // Select testcases
      const result = wasm.select_testcases(config.algorithm, config.testcaseCount)
      sessionId = result.session_id
      inputs.value = result.inputs

      // Update store (inputs only, no expected_output in prod)
      challengeStore.setCurrentChallenge({
        starter_code: config.starterCode,
        testcases: result.inputs.map((input) => ({ input })),
      })
      isReady.value = true
    } catch (err) {
      errorMessage.value = `測資池載入失敗: ${err instanceof Error ? err.message : err}`
    }
  }

  async function submit(code: string) {
    if (!inputs.value.length || !sessionId) return
    isRunning.value = true
    executorStore.setRunning(inputs.value.length)

    // Run student code in Pyodide Worker — only sends inputs, no expected_output
    const outputs = await runStudentCode(code, inputs.value)

    if (!outputs) {
      executorStore.setDone(inputs.value.length, 0)
      isRunning.value = false
      return
    }

    // Judge via WASM
    try {
      const wasm = await ensureWasmPool()
      const verdicts = wasm.judge(config.algorithm, sessionId, outputs) as Array<{
        verdict: string
        actual?: string
        expected?: string
        elapsed_ms: number
        error?: string
      }>

      let passed = 0
      verdicts.forEach((v, i) => {
        if (v.verdict === 'AC') passed++
        executorStore.addResult({
          type: 'testcase_result',
          index: i,
          verdict: v.verdict as 'AC' | 'WA' | 'TLE' | 'RE',
          actual: v.actual,
          expected: v.expected,
          elapsed_ms: v.elapsed_ms,
          error: v.error,
        })
      })
      executorStore.setDone(verdicts.length, passed)

      // Session is consumed; need fresh select for next submit
      const result = wasm.select_testcases(config.algorithm, config.testcaseCount)
      sessionId = result.session_id
      inputs.value = result.inputs
    } catch (err) {
      errorMessage.value = `判定失敗: ${err instanceof Error ? err.message : err}`
      executorStore.setDone(inputs.value.length, 0)
    }

    isRunning.value = false
  }

  function runStudentCode(
    code: string,
    codeInputs: string[],
  ): Promise<Array<{ stdout: string; error?: string; elapsed_ms: number }> | null> {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
        type: 'module',
      })
      runWorker = worker

      const results: Array<{ stdout: string; error?: string; elapsed_ms: number }> = []
      const totalBudget = codeInputs.length * WALL_CLOCK_KILL_MS

      const killTimer = setTimeout(() => {
        worker.terminate()
        runWorker = null
        resolve(null)
      }, totalBudget)

      worker.onmessage = (event: MessageEvent) => {
        const msg = event.data
        if (msg.type === 'testcase_result') {
          results.push({
            stdout: msg.actual ?? '',
            error: msg.error,
            elapsed_ms: msg.elapsed_ms,
          })
        } else if (msg.type === 'run_complete') {
          clearTimeout(killTimer)
          worker.terminate()
          runWorker = null
          resolve(results)
        }
      }

      worker.onerror = () => {
        clearTimeout(killTimer)
        worker.terminate()
        runWorker = null
        resolve(null)
      }

      // In prod mode, we still use the existing RunRequest format with
      // expected_output set to empty string — the Worker does comparison
      // but the verdicts are discarded; we use WASM judge instead.
      // A cleaner approach would be a dedicated 'run_only' message type,
      // but for now this avoids changing the Worker protocol for prod.
      const request: RunRequest = {
        type: 'run',
        code,
        testcases: codeInputs.map((input) => ({ input, expected_output: '' })),
        verdictDetail: 'actual', // get actual output back
      }
      worker.postMessage(request)
    })
  }

  function stop() {
    runWorker?.terminate()
    runWorker = null
    isRunning.value = false
  }

  function cleanup() {
    runWorker?.terminate()
    runWorker = null
  }

  return { loadTestcases, submit, stop, inputs, isReady, isRunning, errorMessage, verdictDetail: config.verdictDetail, cleanup }
}
