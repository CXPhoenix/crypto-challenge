<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Challenge } from '../types.d/challenge.type.ts'
import ChallengeCard from '../components/challenge/ChallengeCard.vue'

const props = defineProps<{
  challenges: Challenge[]
}>()

type Difficulty = 'all' | 'easy' | 'medium' | 'hard'
const selectedDifficulty = ref<Difficulty>('all')

const filtered = computed(() => {
  if (selectedDifficulty.value === 'all') return props.challenges
  return props.challenges.filter((c) => c.difficulty === selectedDifficulty.value)
})

const difficulties: Difficulty[] = ['all', 'easy', 'medium', 'hard']
const difficultyLabel: Record<Difficulty, string> = {
  all: '全部',
  easy: '簡單',
  medium: '中等',
  hard: '困難',
}

const SKELETON_COUNT = 6
</script>

<template>
  <div class="my-10 vp-raw">
    <main class="px-6 py-6 max-w-7xl mx-auto">
      <!-- Difficulty filter -->
      <div class="flex gap-2 mb-6" role="toolbar" aria-label="難度篩選">
        <button
          v-for="d in difficulties"
          :key="d"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="
            selectedDifficulty === d
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          "
          @click="selectedDifficulty = d"
        >
          {{ difficultyLabel[d] }}
        </button>
      </div>

      <!-- Challenge grid -->
      <div
        v-if="filtered.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <ChallengeCard v-for="challenge in filtered" :key="challenge.id" :challenge="challenge" />
      </div>

      <p v-else class="text-gray-500 text-center py-16">沒有符合條件的挑戰。</p>
    </main>
  </div>
</template>
