import { useChallengeStore } from '../stores/challenge'
import { useWasm } from './useWasm'

export function useRemoteChallenge() {
  const challenge = useChallengeStore()
  const { parseChallengeMeta } = useWasm()

  async function store() {
    // Load raw TOML strings via Vite's import.meta.glob (eager, sync)
    const tomlFiles = import.meta.glob('@/challenges/*.toml', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>

    // Parse meta via WASM for correctness; run all parses concurrently
    const entries = await Promise.all(
      Object.entries(tomlFiles).map(async ([path, toml]) => {
        const meta = await parseChallengeMeta(toml)
        if (!meta) {
          // Fallback: use the file path as id if WASM parse fails
          return { id: path, title: path, difficulty: 'easy', tags: [], toml }
        }
        return {
          id: meta.id,
          title: meta.title,
          difficulty: meta.difficulty,
          tags: meta.tags,
          toml,
        }
      }),
    )

    challenge.setChallenges(entries)
  }

  return { store }
}
