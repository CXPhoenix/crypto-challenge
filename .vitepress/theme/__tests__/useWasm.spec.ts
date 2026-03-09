import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWasm } from '../composables/useWasm'

vi.mock('../composables/useWasm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../composables/useWasm')>()
  return actual
})

describe('useWasm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes loadWasm, generateChallenge, and parseChallengeMeta', () => {
    const { loadWasm, generateChallenge, parseChallengeMeta } = useWasm()
    expect(typeof loadWasm).toBe('function')
    expect(typeof generateChallenge).toBe('function')
    expect(typeof parseChallengeMeta).toBe('function')
  })
})
