import type { GeneratedChallenge } from '../stores/challenge'

export interface ChallengeMeta {
  id: string
  title: string
  difficulty: string
  tags: string[]
  algorithm: string
  testcase_count: number
}

type WasmMod = {
  default: () => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate_challenge: (toml: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse_challenge_meta: (toml: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list_algorithms: () => any
}

// Module-level cache — shared across all composable instances
let wasmModule: WasmMod | null = null
let wasmInitPromise: Promise<void> | null = null

/**
 * Dynamic import helper that is invisible to Vite's static analyser.
 * Using `new Function` prevents Vite from resolving the path to /public at
 * build/transform time, while still executing a real dynamic import at runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const _runtimeImport = new Function('p', 'return import(p)') as (path: string) => Promise<WasmMod>
const _loadWasmMod: () => Promise<WasmMod> = () => _runtimeImport('/wasm/challenge_generator.js')

/**
 * Lazily loads the WASM module once and caches it.
 * Concurrent callers await the same init promise to avoid double-init.
 */
export function useWasm(loaderOverride?: () => Promise<WasmMod>) {
  const loader = loaderOverride ?? _loadWasmMod

  async function loadWasm(): Promise<void> {
    if (wasmModule) return
    if (!wasmInitPromise) {
      wasmInitPromise = (async () => {
        const mod = await loader()
        await mod.default()
        wasmModule = mod
      })()
    }
    await wasmInitPromise
  }

  async function generateChallenge(toml: string): Promise<GeneratedChallenge | null> {
    await loadWasm()
    if (!wasmModule) return null
    try {
      const result = wasmModule.generate_challenge(toml)
      return typeof result === 'object' ? result : JSON.parse(result)
    } catch (e) {
      console.error('[useWasm] generate_challenge error:', e)
      return null
    }
  }

  async function parseChallengeMeta(toml: string): Promise<ChallengeMeta | null> {
    await loadWasm()
    if (!wasmModule) return null
    try {
      const result = wasmModule.parse_challenge_meta(toml)
      return typeof result === 'object' ? result : JSON.parse(result)
    } catch (e) {
      console.error('[useWasm] parse_challenge_meta error:', e)
      return null
    }
  }

  return { loadWasm, generateChallenge, parseChallengeMeta }
}
