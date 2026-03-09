<script setup lang="ts">
import { useRouter } from 'vitepress'

const props = defineProps<{
  title: string
  difficulty: string
}>()

const router = useRouter()

const difficultyClass: Record<string, string> = {
  easy: 'bg-green-700 text-green-100',
  medium: 'bg-yellow-700 text-yellow-100',
  hard: 'bg-red-700 text-red-100',
}

const difficultyLabel: Record<string, string> = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
}
</script>

<template>
  <header class="flex items-center gap-3 border-b border-gray-800 px-4 py-3 shrink-0">
    <button
      class="text-gray-400 hover:text-gray-200 text-sm transition-colors cursor-pointer"
      aria-label="返回列表"
      @click="router.go('/')"
    >
      ← 返回
    </button>

    <span class="text-gray-600">|</span>

    <h1 class="font-semibold text-gray-100 truncate">{{ props.title }}</h1>

    <span
      v-if="props.difficulty"
      class="px-2 py-0.5 rounded text-xs font-medium shrink-0"
      :class="difficultyClass[props.difficulty] ?? 'bg-gray-700 text-gray-200'"
    >
      {{ difficultyLabel[props.difficulty] ?? props.difficulty }}
    </span>
  </header>
</template>
