<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { TestcaseResult } from '../../workers/pyodide.worker'
import type { ExecutorStatus } from '../../stores/executor'

const props = defineProps<{
  results: TestcaseResult[]
  status: ExecutorStatus
}>()

const verdictStyle: Record<string, string> = {
  AC: 'text-green-400 bg-green-900/30',
  WA: 'text-red-400 bg-red-900/30',
  TLE: 'text-yellow-400 bg-yellow-900/30',
  RE: 'text-orange-400 bg-orange-900/30',
}

const passedCount = computed(() => props.results.filter((r) => r.verdict === 'AC').length)

// ── Resizable height ──────────────────────────────────────────────────────────
const MIN_HEIGHT = 80
const DEFAULT_HEIGHT = 224 // ≈ max-h-56 (14rem at 16px)

const height = ref(DEFAULT_HEIGHT)
const containerHeight = ref(0)

const maxHeight = computed(() => Math.max(MIN_HEIGHT, containerHeight.value * 0.5))
const clampedHeight = computed(() =>
  Math.min(maxHeight.value, Math.max(MIN_HEIGHT, height.value)),
)

const panelRef = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null

onMounted(() => {
  const container = panelRef.value?.parentElement
  if (!container) return
  ro = new ResizeObserver((entries) => {
    containerHeight.value = entries[0]?.contentRect.height ?? 0
  })
  ro.observe(container)
})

onUnmounted(() => {
  ro?.disconnect()
  ro = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
})

// ── Drag handle ───────────────────────────────────────────────────────────────
const dragging = ref(false)
let dragStartY = 0
let dragStartHeight = 0

function startDrag(e: MouseEvent) {
  dragging.value = true
  dragStartY = e.clientY
  dragStartHeight = clampedHeight.value
  e.preventDefault()
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  // Dragging up (negative delta) → increase height
  const delta = dragStartY - e.clientY
  height.value = dragStartHeight + delta
}

function stopDrag() {
  dragging.value = false
  height.value = clampedHeight.value
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
}
</script>

<template>
  <div
    v-if="props.results.length > 0 || props.status === 'running'"
    ref="panelRef"
    data-testid="result-panel"
    class="border-t border-gray-800 flex flex-col overflow-hidden"
    :class="dragging ? 'select-none' : ''"
    :style="{ height: `${clampedHeight}px` }"
  >
    <!-- Drag handle -->
    <div
      data-drag-handle
      class="h-1.5 shrink-0 cursor-row-resize bg-gray-800 hover:bg-emerald-600/60 transition-colors"
      @mousedown="startDrag"
    />

    <div class="flex-1 overflow-auto">
      <!-- Score summary when done -->
      <div
        v-if="props.status === 'done'"
        class="px-4 py-2 bg-gray-900 border-b border-gray-800 text-sm"
      >
        <span class="text-gray-400">結果：</span>
        <span :class="passedCount === props.results.length ? 'text-green-400' : 'text-yellow-400'">
          {{ passedCount }} / {{ props.results.length }} 通過
        </span>
      </div>

      <!-- Per-testcase rows -->
      <table class="w-full text-xs">
        <thead>
          <tr class="text-gray-500 border-b border-gray-800">
            <th class="text-left px-4 py-1.5 font-normal w-12">#</th>
            <th class="text-left px-2 py-1.5 font-normal w-20">結果</th>
            <th class="text-left px-2 py-1.5 font-normal w-20">時間</th>
            <th class="text-left px-2 py-1.5 font-normal">詳細</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="result in props.results"
            :key="result.index"
            class="border-b border-gray-800/50"
          >
            <td class="px-4 py-1.5 text-gray-500">{{ result.index + 1 }}</td>
            <td class="px-2 py-1.5">
              <span class="flex items-center gap-1">
                <!-- AC: checkmark -->
                <svg
                  v-if="result.verdict === 'AC'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5 text-green-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <!-- WA / RE / TLE: x-mark -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5 shrink-0"
                  :class="{
                    'text-red-400': result.verdict === 'WA' || result.verdict === 'RE',
                    'text-yellow-400': result.verdict === 'TLE',
                  }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span
                  class="px-1.5 py-0.5 rounded font-bold"
                  :class="verdictStyle[result.verdict] ?? 'text-gray-400'"
                >
                  {{ result.verdict }}
                </span>
              </span>
            </td>
            <td class="px-2 py-1.5 text-gray-500">{{ result.elapsed_ms.toFixed(0) }} ms</td>
            <td class="px-2 py-1.5 text-gray-400 font-mono truncate max-w-xs">
              <template v-if="result.verdict === 'WA'">
                預期 <span class="text-green-400">{{ result.expected }}</span>，
                實際 <span class="text-red-400">{{ result.actual }}</span>
              </template>
              <template v-else-if="result.verdict === 'RE'">
                {{ result.error }}
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
