<script setup lang="ts">
/**
 * CodeEditor — wraps CodeMirror 6.
 *
 * Uses a div container for CodeMirror and syncs its value with a v-model.
 * CodeMirror is loaded lazily to avoid blocking the initial render; a grey
 * skeleton rectangle is shown while the import resolves (task 5.3).
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { EditorView } from '@codemirror/view'
import { pythonStdlibCompletions } from '../../composables/pythonCompletions'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const containerRef = ref<HTMLElement | null>(null)
const isLoading = ref(true)
let editor: EditorView | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  if (!containerRef.value) return

  // Lazy-load CodeMirror to avoid bundle bloat in the initial chunk
  const [
    { EditorView, keymap, lineNumbers, drawSelection, dropCursor, rectangularSelection },
    { defaultKeymap, history, historyKeymap, indentWithTab },
    { python, pythonLanguage },
    { oneDark },
    { EditorState },
    { autocompletion, closeBrackets, closeBracketsKeymap, localCompletionSource },
  ] = await Promise.all([
    import('@codemirror/view'),
    import('@codemirror/commands'),
    import('@codemirror/lang-python'),
    import('@codemirror/theme-one-dark'),
    import('@codemirror/state'),
    import('@codemirror/autocomplete'),
  ])

  // Re-check after the async import: the component may have unmounted.
  if (!containerRef.value) return

  editor = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        EditorState.tabSize.of(4),
        python(),
        pythonLanguage.data.of({ autocomplete: localCompletionSource }),
        pythonLanguage.data.of({ autocomplete: pythonStdlibCompletions() }),
        autocompletion(),
        closeBrackets({ brackets: ['(', '[', '{'] }),
        keymap.of([...closeBracketsKeymap, indentWithTab, ...defaultKeymap, ...historyKeymap]),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'monospace' },
        }),
      ],
    }),
    parent: containerRef.value,
  })

  // ResizeObserver replaces Monaco's automaticLayout
  resizeObserver = new ResizeObserver(() => {
    editor?.requestMeasure()
  })
  resizeObserver.observe(containerRef.value)

  isLoading.value = false
})

// Sync external model changes (e.g., when starter code is loaded)
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor) return
    const current = editor.state.doc.toString()
    if (current !== newVal) {
      editor.dispatch({
        changes: { from: 0, to: current.length, insert: newVal },
      })
    }
  },
)

onUnmounted(() => {
  resizeObserver?.disconnect()
  editor?.destroy()
})
</script>

<template>
  <div class="h-full w-full relative">
    <!-- Skeleton overlay while CodeMirror lazy-imports; container must always exist in DOM -->
    <div v-if="isLoading" class="absolute inset-0 bg-gray-800 animate-pulse rounded z-10" />
    <div ref="containerRef" class="h-full w-full" />
  </div>
</template>
