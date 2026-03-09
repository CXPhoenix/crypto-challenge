<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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

const { frontmatter } = useData()
const router = useRouter()
const challengeStore = useChallengeStore()
const executorStore = useExecutorStore()
const { generateChallenge } = useWasm()
const { isRunning, run, stop } = useExecutor()

const code = ref('')
const notFound = ref(false)
const isGenerating = ref(false)
// const challengeId = computed(() => route.data.params as string)

// onMounted(async () => {
//   executorStore.setActiveChallenge(challengeId.value)

//   const entry = challengeStore.challengeById(challengeId.value)
//   if (!entry) {
//     notFound.value = true
//     return
//   }

//   isGenerating.value = true
//   const generated = await generateChallenge(entry.toml)
//   isGenerating.value = false

//   if (generated) {
//     challengeStore.setCurrentChallenge(generated)
//     code.value = generated.starter_code
//   }
// })

async function handleRun() {
  const challenge = challengeStore.currentChallenge
  if (!challenge) return
  await run(code.value, challenge.testcases)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
    <div v-if="notFound" class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-xl text-red-400 mb-4">找不到此挑戰</p>
        <button class="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700" @click="router.go('/')">
          返回列表
        </button>
      </div>
    </div>

    <template v-else>
      <AppHeader
        :title="challengeStore.currentChallenge?.title ?? '載入中...'"
        :difficulty="challengeStore.currentChallenge?.difficulty ?? ''"
      />

      <div class="flex-1 overflow-hidden">
        <SplitPane>
          <template #left>
            <!-- Skeleton for ProblemPanel during generate_challenge (task 6.3) -->
            <div v-if="isGenerating" class="p-6 space-y-3">
              <div class="h-5 bg-gray-800 animate-pulse rounded w-2/3" />
              <div class="h-4 bg-gray-800 animate-pulse rounded w-full" />
              <div class="h-4 bg-gray-800 animate-pulse rounded w-4/5" />
            </div>
            <ProblemPanel v-else :markdown="challengeStore.currentChallenge?.description ?? ''" />
          </template>

          <template #right>
            <div class="flex flex-col h-full">
              <div class="flex-1 overflow-hidden">
                <CodeEditor v-model="code" />
              </div>
              <div class="shrink-0 border-t border-gray-800 p-3 flex items-center gap-3">
                <RunButton
                  :is-running="isRunning"
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
