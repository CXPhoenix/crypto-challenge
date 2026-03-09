import { describe, it, expect, vi } from 'vitest'

// Mock heavy components so Vitest doesn't try to resolve CodeMirror / WASM
vi.mock('../components/editor/CodeEditor.vue', () => ({ default: { template: '<div />' } }))
vi.mock('../composables/useWasm', () => ({
  useWasm: () => ({
    loadWasm: vi.fn(),
    generateChallenge: vi.fn(),
    parseChallengeMeta: vi.fn(),
  }),
}))
vi.mock('../composables/useRemoteChallenge', () => ({
  useRemoteChallenge: () => ({ store: vi.fn() }),
}))

import router from '../router'

describe('router', () => {
  it('has a route for /', () => {
    const routes = router.getRoutes()
    const home = routes.find((r) => r.path === '/')
    expect(home).toBeDefined()
    expect(home?.name).toBe('challenge-list')
  })

  it('has a route for /challenge/:id', () => {
    const routes = router.getRoutes()
    const challenge = routes.find((r) => r.path === '/challenge/:id')
    expect(challenge).toBeDefined()
    expect(challenge?.name).toBe('challenge')
  })
})
