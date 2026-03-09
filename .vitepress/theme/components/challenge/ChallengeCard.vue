<script setup lang="ts">
import { useRouter } from 'vitepress'
import type { Challenge } from '../../types.d/challenge.type.ts'

const props = defineProps<{ challenge: Challenge }>()
const router = useRouter()

const difficultyClass: Record<string, string> = {
  easy: 'bg-green-900/60 text-green-300 border-green-800',
  medium: 'bg-yellow-900/60 text-yellow-300 border-yellow-800',
  hard: 'bg-red-900/60 text-red-300 border-red-800',
}

const difficultyLabel: Record<string, string> = {
  easy: '簡單',
  medium: '中等',
  hard: '困難',
}
</script>

<template>
  <button
    class="text-left bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-500 hover:bg-gray-800/80 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-200 cursor-pointer"
    @click="router.go(props.challenge.url)"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <h2 class="font-semibold text-gray-100 leading-tight">{{ props.challenge.title }}</h2>
      <span
        class="px-2 py-0.5 rounded border text-xs font-medium shrink-0"
        :class="difficultyClass[props.challenge.difficulty] ?? 'bg-gray-800 text-gray-300 border-gray-700'"
      >
        {{ difficultyLabel[props.challenge.difficulty] ?? props.challenge.difficulty }}
      </span>
    </div>
    <div class="flex flex-wrap gap-1 mt-2">
      <span
        v-for="tag in props.challenge.tags"
        :key="tag"
        class="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs"
      >
        {{ tag }}
      </span>
    </div>
  </button>
</template>
