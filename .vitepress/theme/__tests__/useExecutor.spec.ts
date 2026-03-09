import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExecutor } from '../composables/useExecutor'

// We cannot instantiate a real Worker in jsdom, so spy on the constructor
vi.stubGlobal('Worker', vi.fn(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null,
})))

describe('useExecutor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('exposes isRunning, run, and stop', () => {
    const { isRunning, run, stop } = useExecutor()
    expect(typeof isRunning.value).toBe('boolean')
    expect(typeof run).toBe('function')
    expect(typeof stop).toBe('function')
  })

  it('isRunning starts as false', () => {
    const { isRunning } = useExecutor()
    expect(isRunning.value).toBe(false)
  })

  it('stop does not throw when not running', () => {
    const { stop } = useExecutor()
    expect(() => stop()).not.toThrow()
  })
})
