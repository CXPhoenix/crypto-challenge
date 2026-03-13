/** Result returned by generate_challenge WASM function (new format). */
export interface GeneratedInputs {
  inputs: string[]
}

type WasmMod = {
  default: () => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate_challenge: (params_json: string, count: number) => any
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
const _loadWasmMod: () => Promise<WasmMod> = () => _runtimeImport('/wasm/testcase_generator.js')

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

  /**
   * Generate random input strings from a JSON params specification.
   * @param params_json - JSON-serialised params object from frontmatter
   * @param count - number of testcase inputs to generate
   */
  async function generateChallenge(
    params_json: string,
    count: number,
  ): Promise<GeneratedInputs | null> {
    await loadWasm()
    if (!wasmModule) return null
    try {
      const result = wasmModule.generate_challenge(params_json, count)
      return typeof result === 'object' ? result : JSON.parse(result)
    } catch (e) {
      console.error('[useWasm] generate_challenge error:', e)
      return null
    }
  }

  return { loadWasm, generateChallenge }
}
