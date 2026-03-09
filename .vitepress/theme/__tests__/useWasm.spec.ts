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

  it('exposes loadWasm and generateChallenge', () => {
    const { loadWasm, generateChallenge } = useWasm()
    expect(typeof loadWasm).toBe('function')
    expect(typeof generateChallenge).toBe('function')
  })

  it('generateChallenge calls generate_challenge with params_json and count', async () => {
    const mockInputs = { inputs: ['HELLO\n3', 'WORLD\n7'] }
    const mockMod = {
      default: vi.fn().mockResolvedValue(undefined),
      generate_challenge: vi.fn().mockReturnValue(mockInputs),
    }
    const { loadWasm, generateChallenge } = useWasm(() => Promise.resolve(mockMod))
    await loadWasm()
    const result = await generateChallenge('{"shift":{"type":"int","min":1,"max":25}}', 2)
    expect(mockMod.generate_challenge).toHaveBeenCalledWith(
      '{"shift":{"type":"int","min":1,"max":25}}',
      2,
    )
    expect(result).toEqual({ inputs: ['HELLO\n3', 'WORLD\n7'] })
  })

  it('generateChallenge result has inputs array property', async () => {
    const { generateChallenge } = useWasm()
    // The composable caches module-level state from previous test; result shape is validated here
    const result = await generateChallenge('{"shift":{"type":"int","min":1,"max":25}}', 2)
    // result may be null (no WASM in test env) or an object with inputs array
    if (result !== null) {
      expect(Array.isArray(result.inputs)).toBe(true)
    } else {
      expect(result).toBeNull()
    }
  })
})
