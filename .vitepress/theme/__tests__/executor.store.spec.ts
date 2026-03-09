import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExecutorStore } from '../stores/executor'

describe('useExecutorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts in idle state', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    expect(store.status).toBe('idle')
  })

  it('starts with empty results', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    expect(store.results).toEqual([])
  })

  it('setRunning transitions to running', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    store.setRunning(3)
    expect(store.status).toBe('running')
    expect(store.totalTestcases).toBe(3)
  })

  it('addResult appends a testcase result', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    store.setRunning(2)
    store.addResult({ type: 'testcase_result', index: 0, verdict: 'AC', expected: 'KHOOR', elapsed_ms: 12 })
    expect(store.results).toHaveLength(1)
    expect(store.results[0]?.verdict).toBe('AC')
  })

  it('setDone transitions to done', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    store.setRunning(1)
    store.setDone(1, 1)
    expect(store.status).toBe('done')
    expect(store.passed).toBe(1)
    expect(store.total).toBe(1)
  })

  it('reset clears all state back to idle', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    store.setRunning(2)
    store.addResult({ type: 'testcase_result', index: 0, verdict: 'WA', expected: 'X', elapsed_ms: 5 })
    store.reset()
    expect(store.status).toBe('idle')
    expect(store.results).toEqual([])
    expect(store.passed).toBe(0)
    expect(store.total).toBe(0)
  })

  it('passedCount is computed from results', () => {
    const store = useExecutorStore()
    store.setActiveChallenge('test')
    store.setRunning(3)
    store.addResult({ type: 'testcase_result', index: 0, verdict: 'AC', expected: 'A', elapsed_ms: 1 })
    store.addResult({ type: 'testcase_result', index: 1, verdict: 'WA', expected: 'B', elapsed_ms: 2 })
    store.addResult({ type: 'testcase_result', index: 2, verdict: 'AC', expected: 'C', elapsed_ms: 3 })
    expect(store.passedCount).toBe(2)
  })

  describe('per-challenge execution state isolation', () => {
    it('shows idle state for a challenge that has not been run', () => {
      const store = useExecutorStore()
      store.setActiveChallenge('challenge-a')
      expect(store.status).toBe('idle')
      expect(store.results).toEqual([])
    })

    it('switching to a new challenge shows empty state', () => {
      const store = useExecutorStore()
      store.setActiveChallenge('challenge-a')
      store.setRunning(2)
      store.addResult({ type: 'testcase_result', index: 0, verdict: 'AC', expected: 'X', elapsed_ms: 5 })
      store.setDone(2, 1)

      store.setActiveChallenge('challenge-b')
      expect(store.status).toBe('idle')
      expect(store.results).toEqual([])
    })

    it('switching back to a challenge preserves its results', () => {
      const store = useExecutorStore()
      store.setActiveChallenge('challenge-a')
      store.setRunning(1)
      store.addResult({ type: 'testcase_result', index: 0, verdict: 'AC', expected: 'X', elapsed_ms: 5 })
      store.setDone(1, 1)

      store.setActiveChallenge('challenge-b')
      store.setActiveChallenge('challenge-a')

      expect(store.status).toBe('done')
      expect(store.results).toHaveLength(1)
      expect(store.results[0]?.verdict).toBe('AC')
    })

    it('different challenges do not share results', () => {
      const store = useExecutorStore()
      store.setActiveChallenge('challenge-a')
      store.setRunning(1)
      store.addResult({ type: 'testcase_result', index: 0, verdict: 'WA', expected: 'X', elapsed_ms: 5 })

      store.setActiveChallenge('challenge-b')
      expect(store.results).toHaveLength(0)
    })
  })
})
