import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../components/editor/CodeEditor.vue'

// ── Hoist spies so they are available inside vi.mock factories ────────────────
const { closeBracketsSpy, autocompletionSpy } = vi.hoisted(() => ({
  closeBracketsSpy: vi.fn(() => ({ extension: 'closeBrackets' })),
  autocompletionSpy: vi.fn(() => ({ extension: 'autocompletion' })),
}))

// ── Stubs for CodeMirror modules (dynamically imported in onMounted) ─────────

vi.mock('@codemirror/autocomplete', () => ({
  closeBrackets: closeBracketsSpy,
  closeBracketsKeymap: [],
  autocompletion: autocompletionSpy,
  localCompletionSource: vi.fn(),
}))

vi.mock('@codemirror/view', () => {
  class EditorView {
    static updateListener = { of: vi.fn(() => ({})) }
    static theme = vi.fn(() => ({}))
    requestMeasure = vi.fn()
    destroy = vi.fn()
    state = { doc: { toString: () => '' } }
    dispatch = vi.fn()
    constructor() {}
  }
  return {
    EditorView,
    keymap: { of: vi.fn(() => ({})) },
    lineNumbers: vi.fn(() => ({})),
    drawSelection: vi.fn(() => ({})),
    dropCursor: vi.fn(() => ({})),
    rectangularSelection: vi.fn(() => ({})),
  }
})

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: vi.fn(() => ({})),
  historyKeymap: [],
  indentWithTab: {},
}))

vi.mock('@codemirror/lang-python', () => ({
  python: vi.fn(() => ({})),
  pythonLanguage: {
    data: {
      of: vi.fn(() => ({})),
    },
  },
}))

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}))

vi.mock('@codemirror/state', () => ({
  EditorState: {
    create: vi.fn(() => ({})),
    tabSize: { of: vi.fn(() => ({})) },
  },
}))

vi.mock('../../composables/pythonCompletions', () => ({
  pythonStdlibCompletions: vi.fn(() => () => null),
}))

vi.stubGlobal('ResizeObserver', class {
  observe = vi.fn()
  disconnect = vi.fn()
})

// ─────────────────────────────────────────────────────────────────────────────

describe('CodeEditor', () => {
  beforeEach(() => {
    closeBracketsSpy.mockClear()
    autocompletionSpy.mockClear()
  })

  it('shows skeleton while loading', () => {
    const wrapper = mount(CodeEditor, { props: { modelValue: '' } })
    expect(wrapper.find('[class*="animate-pulse"]').exists()).toBe(true)
  })

  it('calls closeBrackets during editor initialisation (Requirement: Bracket auto-closing)', async () => {
    const wrapper = mount(CodeEditor, { props: { modelValue: '' } })
    // Wait until the skeleton disappears — signals that lazy imports resolved and editor was built
    await vi.waitFor(() => {
      expect(wrapper.find('[class*="animate-pulse"]').exists()).toBe(false)
    }, { timeout: 2000 })
    expect(closeBracketsSpy).toHaveBeenCalled()
  })

  it('calls autocompletion during editor initialisation (Requirement: Automatic completion trigger)', async () => {
    const wrapper = mount(CodeEditor, { props: { modelValue: '' } })
    await vi.waitFor(() => {
      expect(wrapper.find('[class*="animate-pulse"]').exists()).toBe(false)
    }, { timeout: 2000 })
    expect(autocompletionSpy).toHaveBeenCalled()
  })
})
