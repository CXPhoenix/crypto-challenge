import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Lightweight challenge entry used in the catalogue list */
export interface ChallengeEntry {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | string
  tags: string[]
}

/** Full output produced after both WASM + generator phases complete */
export interface GeneratedChallenge {
  starter_code: string
  testcases: Array<{ input: string; expected_output: string }>
}

export const useChallengeStore = defineStore('challenge', () => {
  const challenges = ref<ChallengeEntry[]>([])
  const currentChallenge = ref<GeneratedChallenge | null>(null)
  /** True once the initial store() call has completed */
  const isInitialised = ref(false)

  function setChallenges(entries: ChallengeEntry[]) {
    challenges.value = entries
    isInitialised.value = true
  }

  function setCurrentChallenge(generated: GeneratedChallenge) {
    currentChallenge.value = generated
  }

  const challengeById = computed(
    () => (id: string) => challenges.value.find((c) => c.id === id),
  )

  return {
    challenges,
    currentChallenge,
    isInitialised,
    setChallenges,
    setCurrentChallenge,
    challengeById,
  }
})
