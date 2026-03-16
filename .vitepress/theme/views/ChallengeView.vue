<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData, useRouter } from 'vitepress'
import { useChallengeStore } from '../stores/challenge'
import { useWasm } from '../composables/useWasm'
import { useExecutor } from '../composables/useExecutor'
import SplitPane from '../components/layout/SplitPane.vue'
import AppHeader from '../components/layout/AppHeader.vue'
import ProblemPanel from '../components/challenge/ProblemPanel.vue'
import CodeEditor from '../components/editor/CodeEditor.vue'
import RunButton from '../components/editor/RunButton.vue'
import TestResultPanel from '../components/editor/TestResultPanel.vue'
import { useExecutorStore } from '../stores/executor'
import type { GenerateRequest, GenerateComplete } from '../workers/pyodide.worker'

const { frontmatter } = useData()
const router = useRouter()
const challengeStore = useChallengeStore()
const executorStore = useExecutorStore()
const { generateChallenge } = useWasm()
const { isRunning, run, stop } = useExecutor()

const code = ref('')
const errorMessage = ref('')
const isTestcaseReady = ref(false)

// Track the in-progress generator worker so we can terminate on unmount
let activeWorker: Worker | null = null

// ── Bottom panel resizable height ──────────────────────────────────────────
const MIN_BOTTOM_HEIGHT = 80
const DEFAULT_BOTTOM_HEIGHT = 224 // ≈ 14rem

const bottomHeight = ref(DEFAULT_BOTTOM_HEIGHT)
const rightContainerHeight = ref(0)
const rightContainerRef = ref<HTMLElement | null>(null)

const maxBottomHeight = computed(() =>
  Math.max(MIN_BOTTOM_HEIGHT, rightContainerHeight.value * 0.5),
)
const clampedBottomHeight = computed(() =>
  Math.min(maxBottomHeight.value, Math.max(MIN_BOTTOM_HEIGHT, bottomHeight.value)),
)

let ro: ResizeObserver | null = null
const dragging = ref(false)
let dragStartY = 0
let dragStartHeight = 0

function startDrag(e: MouseEvent) {
  dragging.value = true
  dragStartY = e.clientY
  dragStartHeight = clampedBottomHeight.value
  e.preventDefault()
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  // Dragging up (negative delta) → increase bottom panel height
  const delta = dragStartY - e.clientY
  bottomHeight.value = dragStartHeight + delta
}

function stopDrag() {
  dragging.value = false
  bottomHeight.value = clampedBottomHeight.value
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
}

onMounted(() => {
  if (rightContainerRef.value) {
    ro = new ResizeObserver((entries) => {
      rightContainerHeight.value = entries[0]?.contentRect.height ?? 0
    })
    ro.observe(rightContainerRef.value)
  }

  const algorithm: string = frontmatter.value.algorithm ?? ''
  const testcaseCount: number = frontmatter.value.testcase_count ?? 5
  const generatorCode: string = frontmatter.value.generator ?? ''
  const starterCode: string = frontmatter.value.starter_code ?? ''
  const params = frontmatter.value.params ?? {}

  executorStore.setActiveChallenge(algorithm)
  code.value = starterCode

  if (!generatorCode) {
    errorMessage.value = 'generator 程式碼未設定，請在 frontmatter 中加入 generator 欄位'
    return
  }

  // Fire-and-forget: generate testcases in background without blocking UI
  ;(async () => {
    // Phase 1: WASM generates random inputs
    const paramsJson = JSON.stringify(params)
    const generated = await generateChallenge(paramsJson, testcaseCount)

    if (!generated) {
      errorMessage.value = 'WASM 生成失敗，請確認 params 格式正確'
      return
    }

    // Phase 2: Pyodide Worker runs generator code to produce expected outputs
    const testcases = await runGenerator(generatorCode, generated.inputs)

    if (testcases === null) {
      errorMessage.value = 'Generator 執行失敗，請確認 generator 程式碼正確'
      return
    }

    challengeStore.setCurrentChallenge({ starter_code: starterCode, testcases })
    isTestcaseReady.value = true
  })()
})

onUnmounted(() => {
  if (activeWorker) {
    activeWorker.terminate()
    activeWorker = null
  }
  isTestcaseReady.value = false
  ro?.disconnect()
  ro = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
})

/**
 * Spawn a fresh Worker, send a generate message, and await generate_complete.
 * Returns null if the Worker failed to respond or was terminated.
 */
function runGenerator(
  generatorCode: string,
  inputs: string[],
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
        // Filter out entries with errors; log them for debugging
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

    const req: GenerateRequest = { type: 'generate', generatorCode, inputs }
    worker.postMessage(req)
  })
}

async function handleRun() {
  const challenge = challengeStore.currentChallenge
  if (!challenge) return
  await run(code.value, challenge.testcases)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-slate-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 overflow-hidden">
    <div v-if="errorMessage" class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-xl text-red-500 dark:text-red-400 mb-4">{{ errorMessage }}</p>
        <button class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded" @click="router.go('/')">
          返回列表
        </button>
      </div>
    </div>

    <template v-else>
      <AppHeader
        :title="frontmatter.title ?? '載入中...'"
        :difficulty="frontmatter.difficulty ?? ''"
      />

      <div class="flex-1 overflow-hidden">
        <SplitPane>
          <template #left>
            <ProblemPanel />
          </template>

          <template #right>
            <div ref="rightContainerRef" class="flex flex-col h-full" :class="dragging ? 'select-none' : ''">
              <div class="flex-1 overflow-hidden">
                <CodeEditor v-model="code" />
              </div>
              <!-- Drag handle: between editor and bottom panel -->
              <div
                data-drag-handle
                class="h-1.5 shrink-0 cursor-row-resize bg-slate-200 hover:bg-blue-400/60 dark:bg-gray-800 dark:hover:bg-emerald-600/60 transition-colors"
                @mousedown="startDrag"
              />
              <!-- Bottom panel: button bar + results, height controlled by drag -->
              <div
                class="shrink-0 flex flex-col overflow-hidden"
                :style="{ height: `${clampedBottomHeight}px` }"
              >
                <div class="shrink-0 border-t border-slate-200 dark:border-gray-800 p-3 flex items-center gap-3">
                  <RunButton
                    :is-running="isRunning"
                    :is-ready="isTestcaseReady"
                    :progress="executorStore.results.length"
                    :total="executorStore.totalTestcases"
                    @run="handleRun"
                    @stop="stop"
                  />
                  <span v-if="executorStore.status === 'done'" class="text-sm text-slate-500 dark:text-gray-400">
                    得分：{{ executorStore.passed }} / {{ executorStore.total }}
                  </span>
                </div>
                <TestResultPanel :results="executorStore.results" :status="executorStore.status" />
              </div>
            </div>
          </template>
        </SplitPane>
      </div>
    </template>
  </div>
</template>
