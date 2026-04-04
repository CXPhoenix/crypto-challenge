/**
 * Integration tests for useChallengeRunner production path.
 * Verifies that verdictDetail comes from the pool (WASM select_testcases),
 * not from frontmatter config. Also tests stop/cancel/cleanup semantics.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { isRef, type Ref } from 'vue'

// ── WASM module mock ──────────────────────────────────────────────────────
const mockLoadPool = vi.fn()
const mockSelectTestcases = vi.fn()
const mockJudge = vi.fn()
const mockGetExpected = vi.fn()

const mockWasmMod = {
  default: vi.fn().mockResolvedValue(undefined),
  load_pool: mockLoadPool,
  select_testcases: mockSelectTestcases,
  judge: mockJudge,
  get_expected: mockGetExpected,
}

vi.mock('/wasm/testcase_generator.js', () => mockWasmMod)

// ── fetch mock ────────────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ── Worker mock ───────────────────────────────────────────────────────────
const mockWorkerInstances: Array<{ onmessage: ((e: MessageEvent) => void) | null; onerror: ((e: Event) => void) | null; postMessage: ReturnType<typeof vi.fn>; terminate: ReturnType<typeof vi.fn> }> = []
vi.stubGlobal('Worker', class {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() {
    mockWorkerInstances.push(this as typeof mockWorkerInstances[number])
  }
})

// ── useWasm mock (only used in dev, but imported at module level) ─────────
vi.mock('../composables/useWasm', () => ({
  useWasm: () => ({
    generateChallenge: vi.fn(),
  }),
}))

describe('useChallengeRunner prod path - verdictDetail from pool', () => {
  let originalProd: boolean

  beforeEach(() => {
    setActivePinia(createPinia())
    originalProd = import.meta.env.PROD
    // @ts-expect-error - overriding read-only env for test
    import.meta.env.PROD = true

    mockSelectTestcases.mockReturnValue({
      inputs: ['1\n', '2\n'],
      session_id: 's_1',
      verdict_detail: 'actual',
    })

    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    })
  })

  afterEach(() => {
    // @ts-expect-error - restoring read-only env
    import.meta.env.PROD = originalProd
    mockWorkerInstances.length = 0
    vi.clearAllMocks()
  })

  it('verdictDetail is a reactive ref sourced from pool, not frontmatter', async () => {
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden', // frontmatter says hidden
    })

    await runner.loadTestcases()

    // verdictDetail should be a reactive ref (not a static string)
    expect(isRef(runner.verdictDetail)).toBe(true)
    // Its value should come from the pool ('actual'), not frontmatter ('hidden')
    expect((runner.verdictDetail as Ref<string>).value).toBe('actual')
  })

  it('submit sends RunOnlyRequest to worker, not RunRequest', async () => {
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    // Mock judge to return verdicts
    mockJudge.mockReturnValue([
      { verdict: 'AC', elapsed_ms: 10 },
      { verdict: 'AC', elapsed_ms: 12 },
    ])

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    await runner.loadTestcases()

    // Start submit — this creates a worker and posts a message
    const submitPromise = runner.submit('print(42)')

    // Wait a tick for the worker to be created
    await new Promise((r) => setTimeout(r, 0))

    // Find the worker that was created for submit (not for loadTestcases)
    const submitWorker = mockWorkerInstances[mockWorkerInstances.length - 1]!

    // Verify the message sent to the worker is RunOnlyRequest, not RunRequest
    const postedMessage = submitWorker.postMessage.mock.calls[0]?.[0]
    expect(postedMessage).toBeDefined()
    expect(postedMessage.type).toBe('run_only')
    expect(postedMessage.code).toBe('print(42)')
    expect(postedMessage.inputs).toEqual(['1\n', '2\n'])
    // RunOnlyRequest must NOT contain these RunRequest fields
    expect(postedMessage).not.toHaveProperty('testcases')
    expect(postedMessage).not.toHaveProperty('verdictDetail')
    expect(postedMessage).not.toHaveProperty('expected_output')

    // Simulate worker completing to let submit finish
    if (submitWorker.onmessage) {
      submitWorker.onmessage(new MessageEvent('message', {
        data: { type: 'testcase_result', index: 0, stdout: '42\n', elapsed_ms: 10 },
      }))
      submitWorker.onmessage(new MessageEvent('message', {
        data: { type: 'testcase_result', index: 1, stdout: '42\n', elapsed_ms: 12 },
      }))
      submitWorker.onmessage(new MessageEvent('message', {
        data: { type: 'run_complete' },
      }))
    }

    await submitPromise
  })
})

// ── Prod runner stop/cancel tests ──────────────────────────────────────────

describe('useChallengeRunner prod path - stop/cancel semantics', () => {
  let originalProd: boolean

  beforeEach(() => {
    setActivePinia(createPinia())
    originalProd = import.meta.env.PROD
    // @ts-expect-error - overriding read-only env for test
    import.meta.env.PROD = true

    mockSelectTestcases.mockReturnValue({
      inputs: ['1\n', '2\n'],
      session_id: 's_1',
      verdict_detail: 'actual',
    })

    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(10)),
    })
  })

  afterEach(() => {
    // @ts-expect-error - restoring read-only env
    import.meta.env.PROD = originalProd
    mockWorkerInstances.length = 0
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  // Task 2.1: stop() during in-flight submission settles Promise and sets isRunning false
  it('stop() during in-flight runStudentCode settles Promise and sets isRunning false', async () => {
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    mockJudge.mockReturnValue([
      { verdict: 'AC', elapsed_ms: 10 },
      { verdict: 'AC', elapsed_ms: 12 },
    ])

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    await runner.loadTestcases()

    // Start submit — worker is created but never completes
    const submitPromise = runner.submit('print(42)')
    await new Promise((r) => setTimeout(r, 0))

    expect(runner.isRunning.value).toBe(true)

    // Call stop while submission is in-flight
    runner.stop()

    // The Promise should settle (not hang)
    const result = await Promise.race([
      submitPromise.then(() => 'settled'),
      new Promise((r) => setTimeout(() => r('timeout'), 500)),
    ])
    expect(result).toBe('settled')
    expect(runner.isRunning.value).toBe(false)
  })

  // Task 2.2: killTimer does not fire after stop
  it('killTimer does not fire after stop()', async () => {
    vi.useFakeTimers()
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    mockJudge.mockReturnValue([
      { verdict: 'AC', elapsed_ms: 10 },
    ])

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    await runner.loadTestcases()

    const submitPromise = runner.submit('print(42)')
    await vi.advanceTimersByTimeAsync(0)

    const submitWorker = mockWorkerInstances[mockWorkerInstances.length - 1]!

    // Stop while in-flight
    runner.stop()

    // Advance time past the kill timeout — the killTimer callback should NOT fire
    // (worker.terminate should have been called only once by stop, not again by killTimer)
    const terminateCountAfterStop = submitWorker.terminate.mock.calls.length
    await vi.advanceTimersByTimeAsync(60_000)

    // killTimer would have called terminate again if not cleared
    expect(submitWorker.terminate.mock.calls.length).toBe(terminateCountAfterStop)

    await submitPromise
  })

  // Task 2.3: stop when no submission is in-flight is a no-op
  it('stop() when no submission is in-flight is a no-op', async () => {
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    // Should not throw
    expect(() => runner.stop()).not.toThrow()
    expect(runner.isRunning.value).toBe(false)
  })

  // Task 4.1: cleanup during prod submission cancels killTimer and settles Promise
  it('cleanup() during in-flight submission cancels killTimer and settles Promise', async () => {
    vi.useFakeTimers()
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    mockJudge.mockReturnValue([
      { verdict: 'AC', elapsed_ms: 10 },
    ])

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    await runner.loadTestcases()

    const submitPromise = runner.submit('print(42)')
    await vi.advanceTimersByTimeAsync(0)

    const submitWorker = mockWorkerInstances[mockWorkerInstances.length - 1]!

    // Cleanup while in-flight
    runner.cleanup()

    // The Promise should settle
    const result = await Promise.race([
      submitPromise.then(() => 'settled'),
      vi.advanceTimersByTimeAsync(500).then(() => 'timeout'),
    ])
    expect(result).toBe('settled')

    // No stale timer should fire
    const terminateCountAfterCleanup = submitWorker.terminate.mock.calls.length
    await vi.advanceTimersByTimeAsync(60_000)
    expect(submitWorker.terminate.mock.calls.length).toBe(terminateCountAfterCleanup)

    await submitPromise
  })

  // Task 4.3: no stale timer fires after cleanup (prod)
  it('no stale timer fires after cleanup()', async () => {
    vi.useFakeTimers()
    const { useChallengeRunner } = await import('../composables/useChallengeRunner')

    mockJudge.mockReturnValue([
      { verdict: 'AC', elapsed_ms: 10 },
    ])

    const runner = useChallengeRunner({
      algorithm: 'caesar_encrypt',
      params: {},
      generator: '',
      testcaseCount: 2,
      starterCode: '',
      verdictDetail: 'hidden',
    })

    await runner.loadTestcases()

    runner.submit('print(42)')
    await vi.advanceTimersByTimeAsync(0)

    const submitWorker = mockWorkerInstances[mockWorkerInstances.length - 1]!

    runner.cleanup()

    const terminateCount = submitWorker.terminate.mock.calls.length

    // Advance well past any possible timer
    await vi.advanceTimersByTimeAsync(120_000)

    // terminate should not have been called again by stale timer
    expect(submitWorker.terminate.mock.calls.length).toBe(terminateCount)
  })
})
