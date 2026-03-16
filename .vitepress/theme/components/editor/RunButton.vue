<script setup lang="ts">
const props = defineProps<{
  isRunning: boolean
  isReady: boolean
  progress: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'run'): void
  (e: 'stop'): void
}>()
</script>

<template>
  <!-- Testcases not ready: disabled loading state -->
  <button
    v-if="!props.isReady && !props.isRunning"
    disabled
    class="px-4 py-1.5 bg-slate-100 text-slate-400 dark:bg-gray-700 dark:text-gray-400 rounded font-medium text-sm flex items-center gap-1.5 cursor-not-allowed"
  >
    <!-- Spinner -->
    <svg
      class="w-4 h-4 shrink-0 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    生成中...
  </button>

  <!-- Ready, not running: play button -->
  <button
    v-else-if="!props.isRunning"
    class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-sm transition-colors cursor-pointer flex items-center gap-1.5"
    @click="emit('run')"
  >
    <!-- Heroicons: play -->
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
    </svg>
    執行
  </button>

  <!-- Running: stop button -->
  <button
    v-else
    class="px-4 py-1.5 bg-red-600 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded font-medium text-sm transition-colors cursor-pointer flex items-center gap-2"
    @click="emit('stop')"
  >
    <!-- Heroicons: stop -->
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clip-rule="evenodd" />
    </svg>
    停止
    <span class="text-xs opacity-75">({{ props.progress }} / {{ props.total }})</span>
  </button>
</template>
