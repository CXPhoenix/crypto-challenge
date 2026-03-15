import { describe, it, expect } from 'vitest'
import type { CompletionContext } from '@codemirror/autocomplete'
import { pythonStdlibCompletions } from '../composables/pythonCompletions'

/** Build a minimal CompletionContext stub. word can be null to simulate no token. */
function makeContext(word: string | null): CompletionContext {
  return {
    matchBefore: (re: RegExp) =>
      word !== null ? { from: 0, to: word.length, text: word } : null,
    aborted: false,
    explicit: false,
  } as unknown as CompletionContext
}

describe('pythonStdlibCompletions', () => {
  it('returns at least one completion for any context', () => {
    const source = pythonStdlibCompletions()
    const result = source(makeContext(''))
    expect(result).not.toBeNull()
    if (result && 'options' in result) {
      expect(result.options.length).toBeGreaterThan(0)
    }
  })

  it('module names have type "namespace" and detail "module"', () => {
    const source = pythonStdlibCompletions()
    const result = source(makeContext('hash'))
    expect(result).not.toBeNull()
    if (result && 'options' in result) {
      const hashlib = result.options.find(o => o.label === 'hashlib')
      expect(hashlib).toBeDefined()
      expect(hashlib?.type).toBe('namespace')
      expect(hashlib?.detail).toBe('module')
    }
  })

  it('sha256 has detail "hashlib"', () => {
    const source = pythonStdlibCompletions()
    const result = source(makeContext('sha'))
    expect(result).not.toBeNull()
    if (result && 'options' in result) {
      const sha256 = result.options.find(o => o.label === 'sha256')
      expect(sha256).toBeDefined()
      expect(sha256?.detail).toBe('hashlib')
    }
  })

  it('function entries have apply field ending with "("', () => {
    const source = pythonStdlibCompletions()
    const result = source(makeContext(''))
    expect(result).not.toBeNull()
    if (result && 'options' in result) {
      const functions = result.options.filter(o => o.type === 'function')
      expect(functions.length).toBeGreaterThan(0)
      for (const fn of functions) {
        expect(fn.apply).toBeDefined()
        expect(String(fn.apply).endsWith('(')).toBe(true)
      }
    }
  })

  it('does not include os or sys as namespace candidates', () => {
    const source = pythonStdlibCompletions()
    const result = source(makeContext(''))
    expect(result).not.toBeNull()
    if (result && 'options' in result) {
      const modules = result.options.filter(o => o.type === 'namespace')
      const labels = modules.map(o => o.label)
      expect(labels).not.toContain('os')
      expect(labels).not.toContain('sys')
    }
  })

  it('does not throw when context has no word token', () => {
    const source = pythonStdlibCompletions()
    expect(() => source(makeContext(null))).not.toThrow()
  })
})
