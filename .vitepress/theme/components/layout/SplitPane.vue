<script setup lang="ts">
/**
 * SplitPane — left/right split layout.
 * - Drag the divider to resize panels.
 * - Click the chevron handle on the divider to collapse/expand the left panel.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const leftVisible = ref(true)
const leftWidthPct = ref(40)

const dragging = ref(false)
const containerRef = ref<HTMLElement | null>(null)

function startDrag(e: MouseEvent) {
  dragging.value = true
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value || !containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  leftWidthPct.value = Math.min(75, Math.max(15, pct))
}

function stopDrag() {
  dragging.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', stopDrag)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<template>
  <div ref="containerRef" class="flex h-full" :class="dragging ? 'select-none' : ''">
    <!-- Left panel -->
    <div
      v-show="leftVisible"
      class="overflow-auto shrink-0"
      :style="{ width: `${leftWidthPct}%` }"
    >
      <slot name="left" />
    </div>

    <!-- Divider: drag to resize + click chevron to collapse/expand -->
    <div
      class="relative flex items-center shrink-0 group"
      :class="leftVisible ? 'w-3 cursor-col-resize' : 'w-6 cursor-default'"
      @mousedown="leftVisible ? startDrag($event) : undefined"
    >
      <!-- Divider line -->
      <div
        class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors"
        :class="dragging ? 'bg-emerald-500' : 'bg-gray-700 group-hover:bg-gray-500'"
      />

      <!-- Collapse/expand chevron — sits on the divider, never overlaps panels -->
      <button
        class="relative z-10 flex items-center justify-center w-5 h-10 mx-auto rounded bg-gray-800 border border-gray-700 text-gray-400 hover:text-emerald-400 hover:border-emerald-600 hover:bg-gray-750 transition-all shadow-sm"
        :aria-label="leftVisible ? '收合左側面板' : '展開左側面板'"
        @click.stop="leftVisible = !leftVisible"
        @mousedown.stop
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3 h-3 transition-transform"
          :class="leftVisible ? '' : 'rotate-180'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Right panel -->
    <div class="flex-1 overflow-hidden min-w-0">
      <slot name="right" />
    </div>
  </div>
</template>
