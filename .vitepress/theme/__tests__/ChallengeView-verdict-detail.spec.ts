/**
 * ChallengeView integration tests for verdict_detail data stripping.
 * Verifies that challengeStore does not contain expected_output in hidden mode.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import ChallengeView from '../views/ChallengeView.vue'
import { useChallengeStore } from '../stores/challenge'

// --- mutable frontmatter for per-test control ---
const mockFrontmatter: Record<string, unknown> = {
  algorithm: 'caesar_encrypt',
  testcase_count: 2,
  generator: 'print(42)',
  starter_code: '# code',
  params: { n: { type: 'int', min: 1, max: 10 } },
}

vi.mock('vitepress', () => ({
  useData: () => ({
    frontmatter: { get value() { return mockFrontmatter } },
  }),
  useRouter: () => ({ go: vi.fn() }),
  Content: { template: '<div class="vp-content" />' },
}))

// --- useWasm mock: resolves immediately with inputs ---
let resolveWasm: ((v: unknown) => void) | null = null
vi.mock('../composables/useWasm', () => ({
  useWasm: () => ({
    generateChallenge: vi.fn(
      () =>
        new Promise((resolve) => {
          resolveWasm = resolve
        }),
    ),
  }),
}))

// --- useExecutor mock ---
const mockRun = vi.fn()
vi.mock('../composables/useExecutor', () => ({
  useExecutor: () => ({
    isRunning: ref(false),
    run: mockRun,
    stop: vi.fn(),
    execute: vi.fn().mockResolvedValue({ type: 'execute_result', stdout: '', elapsed_ms: 0 }),
  }),
}))

// --- Worker mock ---
const mockWorkerInstances: MockWorker[] = []
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  constructor() {
    mockWorkerInstances.push(this)
  }
}
vi.stubGlobal('Worker', MockWorker)

vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn()
  disconnect = vi.fn()
  unobserve = vi.fn()
})

const CodeEditorStub = { name: 'CodeEditor', template: '<div class="code-editor-stub" />' }

/** Complete the full generation pipeline: WASM → Worker → store */
async function completeGeneration(wrapper: ReturnType<typeof mount>) {
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()

  // Phase 1: resolve WASM
  resolveWasm!({ inputs: ['HELLO\n3', 'WORLD\n7'] })
  await flushPromises()

  // Phase 2: Worker sends generate_complete
  const worker = mockWorkerInstances[mockWorkerInstances.length - 1]!
  worker.onmessage!(new MessageEvent('message', {
    data: {
      type: 'generate_complete',
      testcases: [
        { input: 'HELLO\n3', expected_output: 'KHOOR' },
        { input: 'WORLD\n7', expected_output: 'DVYSK' },
      ],
    },
  }))
  await flushPromises()
}

describe('ChallengeView verdict_detail data stripping', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resolveWasm = null
    mockWorkerInstances.length = 0
    mockRun.mockClear()
    // Reset frontmatter to default (no verdict_detail = hidden)
    delete mockFrontmatter.verdict_detail
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('hidden mode: challengeStore testcases contain only input (no expected_output)', async () => {
    // verdict_detail omitted → defaults to hidden
    const wrapper = mount(ChallengeView, {
      global: { stubs: { CodeEditor: CodeEditorStub } },
    })
    await completeGeneration(wrapper)

    const store = useChallengeStore()
    expect(store.currentChallenge).not.toBeNull()
    for (const tc of store.currentChallenge!.testcases) {
      expect(tc.input).toBeDefined()
      expect('expected_output' in tc).toBe(false)
    }

    wrapper.unmount()
  })

  it('actual mode: challengeStore testcases contain only input (no expected_output)', async () => {
    mockFrontmatter.verdict_detail = 'actual'

    const wrapper = mount(ChallengeView, {
      global: { stubs: { CodeEditor: CodeEditorStub } },
    })
    await completeGeneration(wrapper)

    const store = useChallengeStore()
    for (const tc of store.currentChallenge!.testcases) {
      expect(tc.input).toBeDefined()
      expect('expected_output' in tc).toBe(false)
    }

    wrapper.unmount()
  })

  it('full mode: challengeStore testcases contain both input and expected_output', async () => {
    mockFrontmatter.verdict_detail = 'full'

    const wrapper = mount(ChallengeView, {
      global: { stubs: { CodeEditor: CodeEditorStub } },
    })
    await completeGeneration(wrapper)

    const store = useChallengeStore()
    for (const tc of store.currentChallenge!.testcases) {
      expect(tc.input).toBeDefined()
      expect(tc.expected_output).toBeDefined()
    }

    wrapper.unmount()
  })

  it('hidden mode: handleSubmit passes verdictDetail to run()', async () => {
    // verdict_detail omitted → hidden
    const wrapper = mount(ChallengeView, {
      global: { stubs: { CodeEditor: CodeEditorStub } },
    })
    await completeGeneration(wrapper)

    // Trigger submit
    const runButton = wrapper.findComponent({ name: 'RunButton' })
    await runButton.vm.$emit('run')
    await flushPromises()

    expect(mockRun).toHaveBeenCalledTimes(1)
    // run() should receive full testcases (with expected_output) from local variable
    const [, testcases, verdictDetail] = mockRun.mock.calls[0]!
    expect(testcases).toHaveLength(2)
    expect(testcases[0].expected_output).toBe('KHOOR')
    expect(verdictDetail).toBe('hidden')

    wrapper.unmount()
  })
})
