import { computed, ref } from 'vue'
import { useExecutorStore } from '../stores/executor'
import type { RunRequest, TestcaseResult, RunComplete, ExecuteRequest, ExecuteResult, VerdictDetail } from '../workers/pyodide.worker'

const WALL_CLOCK_KILL_MS = 6_000

/**
 * Manages the Pyodide Worker lifecycle.
 *
 * Creates a fresh Worker on each `run()` call and terminates it on `stop()`.
 * Wall-clock hard kill: if the Worker does not complete within 6 s the main
 * thread terminates it (secondary guard beyond the Worker's own setTimeout).
 */
export function useExecutor() {
  const store = useExecutorStore()
  const workerRef = ref<Worker | null>(null)
  const killTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  const isRunning = computed(() => store.status === 'running')

  function _clearKillTimer() {
    if (killTimer.value !== null) {
      clearTimeout(killTimer.value)
      killTimer.value = null
    }
  }

  function _terminateWorker() {
    workerRef.value?.terminate()
    workerRef.value = null
  }

  function stop() {
    _clearKillTimer()
    _terminateWorker()
    if (store.status === 'running') {
      store.setDone(store.totalTestcases, store.passedCount)
    }
  }

  async function run(
    code: string,
    testcases: Array<{ input: string; expected_output: string }>,
    verdictDetail: VerdictDetail = 'hidden',
  ): Promise<void> {
    if (store.status === 'running') stop()

    store.setRunning(testcases.length)

    const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.value = worker

    // Wall-clock hard kill (main-thread side)
    const totalBudget = testcases.length * WALL_CLOCK_KILL_MS
    killTimer.value = setTimeout(() => {
      stop()
    }, totalBudget)

    worker.onmessage = (event: MessageEvent<TestcaseResult | RunComplete>) => {
      const msg = event.data
      if (msg.type === 'testcase_result') {
        store.addResult(msg)
      } else if (msg.type === 'run_complete') {
        _clearKillTimer()
        store.setDone(msg.total, msg.passed)
        _terminateWorker()
      }
    }

    worker.onerror = () => {
      _clearKillTimer()
      store.setDone(store.totalTestcases, store.passedCount)
      _terminateWorker()
    }

    // Convert reactive Proxy objects to plain structures before postMessage.
    // Structured-clone (used internally by postMessage) cannot handle Vue Proxies.
    const request: RunRequest = {
      type: 'run',
      code,
      testcases: testcases.map((tc) => ({ input: tc.input, expected_output: tc.expected_output })),
      verdictDetail,
    }
    worker.postMessage(request)
  }

  /**
   * Execute code with stdin, returning raw stdout (no verdict comparison).
   * Creates a fresh Worker, sends an ExecuteRequest, and resolves on completion.
   * Wall-clock kill timer terminates the Worker after 6 s.
   */
  function execute(code: string, stdin: string): Promise<ExecuteResult> {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('../workers/pyodide.worker.ts', import.meta.url), {
        type: 'module',
      })

      const timer = setTimeout(() => {
        worker.terminate()
        resolve({
          type: 'execute_result',
          stdout: '',
          elapsed_ms: WALL_CLOCK_KILL_MS,
          error: 'Execution timed out',
        })
      }, WALL_CLOCK_KILL_MS)

      worker.onmessage = (event: MessageEvent<ExecuteResult>) => {
        if (event.data.type === 'execute_result') {
          clearTimeout(timer)
          worker.terminate()
          resolve(event.data)
        }
      }

      worker.onerror = () => {
        clearTimeout(timer)
        worker.terminate()
        resolve({
          type: 'execute_result',
          stdout: '',
          elapsed_ms: 0,
          error: 'Worker error',
        })
      }

      const request: ExecuteRequest = { type: 'execute', code, stdin }
      worker.postMessage(request)
    })
  }

  return { isRunning, run, stop, execute }
}
