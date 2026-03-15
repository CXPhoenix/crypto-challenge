# CodeMirror Autocomplete & Bracket Auto-Handling Design

**Date:** 2026-03-16
**Status:** Approved

## Overview

Add Python autocompletion (type hints) and bracket auto-closing to the existing CodeMirror 6 editor in `CodeEditor.vue`. The feature uses `@codemirror/autocomplete` as the sole new dependency.

## Requirements

- **Autocomplete trigger:** Automatic on every keystroke (no manual Ctrl+Space required).
- **Bracket auto-closing:** Only `()`, `[]`, `{}` — quotes are excluded to avoid interference with Python string patterns.
- **Completion sources (in priority order):**
  1. Python keywords and built-in functions (provided by `@codemirror/lang-python` natively).
  2. Local identifiers scanned from the current document (`localCompletionSource`).
  3. Common Python stdlib symbols from a curated static list (`pythonCompletions.ts`).

## Architecture

### New dependency

```
@codemirror/autocomplete
```

Provides `autocompletion()`, `closeBrackets()`, `closeBracketsKeymap`, and `localCompletionSource`.

### Files changed / added

| File | Change |
|------|--------|
| `package.json` | Add `@codemirror/autocomplete` |
| `.vitepress/theme/composables/pythonCompletions.ts` | **New** — curated stdlib completion source |
| `.vitepress/theme/components/editor/CodeEditor.vue` | Add imports + 3 new extensions |

### `pythonCompletions.ts`

A single exported function `pythonStdlibCompletions(): CompletionSource` that returns completions for common stdlib symbols. Curated modules for the crypto-challenge context:

- `math` — `floor`, `ceil`, `gcd`, `pow`, `sqrt`, `log`, `pi`, `e`
- `string` — `ascii_lowercase`, `ascii_uppercase`, `digits`, `printable`, `punctuation`
- `hashlib` — `md5`, `sha1`, `sha256`, `sha512`, `new`, `algorithms_available`
- `binascii` — `hexlify`, `unhexlify`, `b2a_hex`, `a2b_hex`, `b2a_base64`, `a2b_base64`
- `os` — `path`, `getcwd`, `listdir`, `environ`
- `sys` — `argv`, `stdin`, `stdout`, `stderr`, `exit`
- `collections` — `Counter`, `defaultdict`, `OrderedDict`, `deque`, `namedtuple`
- `itertools` — `chain`, `product`, `combinations`, `permutations`, `cycle`, `repeat`
- `functools` — `reduce`, `partial`, `lru_cache`, `wraps`
- `re` — `match`, `search`, `findall`, `sub`, `compile`, `IGNORECASE`

Each entry has `{ label, type, detail }` where `detail` is the module name (e.g., `"math"`). Function entries use `apply: label + '('` so bracket auto-close triggers immediately.

Module names themselves are also included as `type: 'namespace'` entries.

### `CodeEditor.vue` changes

In the existing `Promise.all` lazy import block, add:

```ts
import('@codemirror/autocomplete')
```

In the `extensions` array, add:

```ts
closeBrackets({ brackets: ['(', '[', '{'] }),
autocompletion({ override: [localCompletionSource, pythonStdlibCompletions()] }),
keymap.of([closeBracketsKeymap, indentWithTab, ...defaultKeymap, ...historyKeymap]),
```

Notes:
- `python()` from `@codemirror/lang-python` already registers its own completion source on the language; `autocompletion()` picks it up automatically — no override needed for that source.
- `localCompletionSource` and `pythonStdlibCompletions()` are added via `override` to merge with the language source.
- `closeBracketsKeymap` must come before `defaultKeymap` in the keymap list so that `Backspace` correctly deletes a matching pair.

## Data Flow

```
User types → CodeMirror triggers completion → autocompletion() aggregates:
  ├── python() language source (keywords, builtins)
  ├── localCompletionSource (document scan)
  └── pythonStdlibCompletions() (static stdlib list)
           ↓
     Ranked dropdown shown
```

```
User types '(' → closeBrackets() inserts ')' and places cursor between
User types Backspace on empty pair → closeBrackets() removes both
```

## Testing

### `pythonCompletions.spec.ts` (new)

- Returns at least one completion for an empty context.
- Completion list includes module names as `type: 'namespace'`.
- Completion list includes known symbols (e.g., `sha256` with `detail: 'hashlib'`).
- Function entries have `apply` field ending in `(`.
- Does not throw for edge-case inputs.

### `CodeEditor.spec.ts` (existing, extend)

- Smoke test: mock `@codemirror/autocomplete`; confirm `closeBrackets` and `autocompletion` are called during editor initialisation.
- Existing v-model and skeleton tests remain unchanged.

## Out of Scope

- Quote auto-closing (`""`, `''`).
- LSP-based type inference.
- Snippet expansion.
- Signature help (function argument hints on hover).
