import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useChallengeStore } from '../stores/challenge'

describe('useChallengeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with an empty challenges list', () => {
    const store = useChallengeStore()
    expect(store.challenges).toEqual([])
  })

  it('starts with no current challenge', () => {
    const store = useChallengeStore()
    expect(store.currentChallenge).toBeNull()
  })

  it('setChallenges populates the challenges list', () => {
    const store = useChallengeStore()
    store.setChallenges([
      {
        id: 'caesar-encrypt',
        title: 'Caesar Encrypt',
        difficulty: 'easy',
        tags: ['classical'],
      },
    ])
    expect(store.challenges).toHaveLength(1)
    expect(store.challenges[0]?.id).toBe('caesar-encrypt')
  })

  it('setCurrentChallenge stores starter_code and testcases', () => {
    const store = useChallengeStore()
    const generated = {
      starter_code: 'plaintext = input()\nshift = int(input())\nprint(plaintext)',
      testcases: [{ input: 'HELLO\n3', expected_output: 'KHOOR' }],
    }
    store.setCurrentChallenge(generated)
    expect(store.currentChallenge).toEqual(generated)
  })

  it('challengeById returns the matching challenge entry', () => {
    const store = useChallengeStore()
    store.setChallenges([
      { id: 'caesar-encrypt', title: 'Caesar', difficulty: 'easy', tags: [] },
      { id: 'vigenere-encrypt', title: 'Vigenere', difficulty: 'medium', tags: [] },
    ])
    expect(store.challengeById('vigenere-encrypt')?.id).toBe('vigenere-encrypt')
    expect(store.challengeById('nonexistent')).toBeUndefined()
  })
})
