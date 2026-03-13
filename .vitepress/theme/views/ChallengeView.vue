<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

onMounted(() => {
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
  <div class="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
    <div v-if="errorMessage" class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-xl text-red-400 mb-4">{{ errorMessage }}</p>
        <button class="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700" @click="router.go('/')">
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
            <div class="flex flex-col h-full">
              <div class="flex-1 overflow-hidden">
                <CodeEditor v-model="code" />
              </div>
              <div class="shrink-0 border-t border-gray-800 p-3 flex items-center gap-3">
                <RunButton
                  :is-running="isRunning"
                  :is-ready="isTestcaseReady"
                  :progress="executorStore.results.length"
                  :total="executorStore.totalTestcases"
                  @run="handleRun"
                  @stop="stop"
                />
                <span v-if="executorStore.status === 'done'" class="text-sm text-gray-400">
                  得分：{{ executorStore.passed }} / {{ executorStore.total }}
                </span>
              </div>
              <TestResultPanel :results="executorStore.results" :status="executorStore.status" />
            </div>
          </template>
        </SplitPane>
      </div>
    </template>
  </div>
</template>
