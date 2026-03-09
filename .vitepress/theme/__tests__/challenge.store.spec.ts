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
        toml: '[meta]\nid = "caesar-encrypt"',
      },
    ])
    expect(store.challenges).toHaveLength(1)
    expect(store.challenges[0]?.id).toBe('caesar-encrypt')
  })

  it('setCurrentChallenge stores the full generated challenge', () => {
    const store = useChallengeStore()
    const generated = {
      id: 'caesar-encrypt',
      title: 'Caesar Encrypt',
      difficulty: 'easy',
      tags: ['classical'],
      description: 'Encrypt HELLO with shift 3',
      starter_code: 'def solve():\n    pass',
      testcases: [{ input: 'HELLO\n3', expected_output: 'KHOOR' }],
    }
    store.setCurrentChallenge(generated)
    expect(store.currentChallenge).toEqual(generated)
  })

  it('challengeById returns the matching challenge entry', () => {
    const store = useChallengeStore()
    store.setChallenges([
      { id: 'caesar-encrypt', title: 'Caesar', difficulty: 'easy', tags: [], toml: '' },
      { id: 'vigenere-encrypt', title: 'Vigenere', difficulty: 'medium', tags: [], toml: '' },
    ])
    expect(store.challengeById('vigenere-encrypt')?.id).toBe('vigenere-encrypt')
    expect(store.challengeById('nonexistent')).toBeUndefined()
  })
})
