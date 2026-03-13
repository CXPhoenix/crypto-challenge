# vitepress-markdown-panel Specification

## Purpose

TBD - created by archiving change 'markdown-panel-and-python-generator'. Update Purpose after archive.

## Requirements

### Requirement: Challenge pages use custom VitePress layout

Challenge markdown pages SHALL set `layout: challenge` in frontmatter instead of `layout: false`. The VitePress `Layout.vue` SHALL render `ChallengeView` when `frontmatter.layout === 'challenge'`, bypassing the DefaultTheme layout. The `ChallengeView` component SHALL be registered as the layout entry point, not as inline page content.

#### Scenario: Challenge page renders with custom layout

- **WHEN** a user navigates to a challenge page with `layout: challenge` in frontmatter
- **THEN** `Layout.vue` renders `ChallengeView` directly without DefaultTheme wrapping

#### Scenario: Non-challenge pages are unaffected

- **WHEN** a user navigates to any page without `layout: challenge`
- **THEN** `Layout.vue` renders the DefaultTheme layout as before


<!-- @trace
source: markdown-panel-and-python-generator
updated: 2026-03-13
code:
  - docs/index.md
  - .vitepress/theme/challenges/13-aes-ecb-decrypt.toml
  - .vitepress/theme/components/challenge/ProblemPanel.vue
  - docs/challenge/rsa-decrypt.md
  - challenge-generator/src/algorithms/vigenere.rs
  - .vitepress/theme/challenges/08-railfence-decrypt.toml
  - .vitepress/theme/challenges/09-xor.toml
  - docs/challenge/playfair-encrypt.md
  - .vitepress/theme/challenges/01-caesar-encrypt.toml
  - docs/challenge/xor-encrypt.md
  - .vitepress/theme/Layout.vue
  - challenge-generator/src/algorithms/playfair.rs
  - .vitepress/theme/challenges/02-caesar-decrypt.toml
  - challenge-generator/src/lib.rs
  - .vitepress/theme/challenges/12-aes-ecb-encrypt.toml
  - .vitepress/theme/challenges/06-playfair-decrypt.toml
  - .vitepress/theme/challenges/14-simple-ecb-encrypt.toml
  - challenge-generator/src/algorithms/railfence.rs
  - challenge-generator/src/parser.rs
  - .vitepress/theme/challenges/11-rsa-decrypt.toml
  - docs/challenge/vigenere-decrypt.md
  - challenge-generator/src/template.rs
  - .vitepress/theme/challenges/15-simple-ecb-decrypt.toml
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/challenges/07-railfence-encrypt.toml
  - docs/challenge/simple-ecb-decrypt.md
  - .vitepress/theme/challenges/10-rsa-encrypt.toml
  - docs/challenge/playfair-decrypt.md
  - .vitepress/theme/composables/useWasm.ts
  - .vitepress/theme/challenges/05-playfair-encrypt.toml
  - docs/challenge/aes-ecb-decrypt.md
  - docs/challenge/vigenere-encrypt.md
  - challenge-generator/Cargo.toml
  - docs/challenge/rsa-encrypt.md
  - challenge-generator/src/algorithms/caesar.rs
  - docs/challenge/railfence-encrypt.md
  - docs/challenge/caesar-encrypt.md
  - docs/challenge/railfence-decrypt.md
  - challenge-generator/src/algorithms/aes.rs
  - docs/challenge/caesar-decrypt.md
  - challenge-generator/src/algorithms/rsa.rs
  - challenge-generator/src/algorithms/xor.rs
  - challenge-generator/src/rng.rs
  - docs/challenge/aes-ecb-encrypt.md
  - .vitepress/theme/stores/challenge.ts
  - .vitepress/theme/workers/pyodide.worker.ts
  - docs/challenge/simple-ecb-encrypt.md
  - package.json
  - challenge-generator/src/algorithms/mod.rs
  - .vitepress/theme/challenges/03-vigenere-encrypt.toml
  - docs/shared/challenge.data.ts
  - .vitepress/theme/challenges/04-vigenere-decrypt.toml
tests:
  - .vitepress/theme/__tests__/useWasm.spec.ts
  - .vitepress/theme/__tests__/challenge.store.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-generate.spec.ts
-->

---
### Requirement: Left panel renders VitePress native markdown

The `ProblemPanel` component SHALL render the current page's markdown content using VitePress's `<Content />` component. The challenge `.md` file's body (after frontmatter) SHALL contain the full problem description in standard Markdown. No description text SHALL be stored in the TOML file.

#### Scenario: Problem description is rendered from page content

- **WHEN** a challenge page is loaded
- **THEN** the left panel displays the formatted markdown from the `.md` file body using VitePress's rendering pipeline (including syntax highlighting, prose styles, etc.)

#### Scenario: Description updates without WASM changes

- **WHEN** a challenge author edits the `.md` file body
- **THEN** the updated description is rendered on the next page load without any TOML or WASM changes


<!-- @trace
source: markdown-panel-and-python-generator
updated: 2026-03-13
code:
  - docs/index.md
  - .vitepress/theme/challenges/13-aes-ecb-decrypt.toml
  - .vitepress/theme/components/challenge/ProblemPanel.vue
  - docs/challenge/rsa-decrypt.md
  - challenge-generator/src/algorithms/vigenere.rs
  - .vitepress/theme/challenges/08-railfence-decrypt.toml
  - .vitepress/theme/challenges/09-xor.toml
  - docs/challenge/playfair-encrypt.md
  - .vitepress/theme/challenges/01-caesar-encrypt.toml
  - docs/challenge/xor-encrypt.md
  - .vitepress/theme/Layout.vue
  - challenge-generator/src/algorithms/playfair.rs
  - .vitepress/theme/challenges/02-caesar-decrypt.toml
  - challenge-generator/src/lib.rs
  - .vitepress/theme/challenges/12-aes-ecb-encrypt.toml
  - .vitepress/theme/challenges/06-playfair-decrypt.toml
  - .vitepress/theme/challenges/14-simple-ecb-encrypt.toml
  - challenge-generator/src/algorithms/railfence.rs
  - challenge-generator/src/parser.rs
  - .vitepress/theme/challenges/11-rsa-decrypt.toml
  - docs/challenge/vigenere-decrypt.md
  - challenge-generator/src/template.rs
  - .vitepress/theme/challenges/15-simple-ecb-decrypt.toml
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/challenges/07-railfence-encrypt.toml
  - docs/challenge/simple-ecb-decrypt.md
  - .vitepress/theme/challenges/10-rsa-encrypt.toml
  - docs/challenge/playfair-decrypt.md
  - .vitepress/theme/composables/useWasm.ts
  - .vitepress/theme/challenges/05-playfair-encrypt.toml
  - docs/challenge/aes-ecb-decrypt.md
  - docs/challenge/vigenere-encrypt.md
  - challenge-generator/Cargo.toml
  - docs/challenge/rsa-encrypt.md
  - challenge-generator/src/algorithms/caesar.rs
  - docs/challenge/railfence-encrypt.md
  - docs/challenge/caesar-encrypt.md
  - docs/challenge/railfence-decrypt.md
  - challenge-generator/src/algorithms/aes.rs
  - docs/challenge/caesar-decrypt.md
  - challenge-generator/src/algorithms/rsa.rs
  - challenge-generator/src/algorithms/xor.rs
  - challenge-generator/src/rng.rs
  - docs/challenge/aes-ecb-encrypt.md
  - .vitepress/theme/stores/challenge.ts
  - .vitepress/theme/workers/pyodide.worker.ts
  - docs/challenge/simple-ecb-encrypt.md
  - package.json
  - challenge-generator/src/algorithms/mod.rs
  - .vitepress/theme/challenges/03-vigenere-encrypt.toml
  - docs/shared/challenge.data.ts
  - .vitepress/theme/challenges/04-vigenere-decrypt.toml
tests:
  - .vitepress/theme/__tests__/useWasm.spec.ts
  - .vitepress/theme/__tests__/challenge.store.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-generate.spec.ts
-->

---
### Requirement: Challenge metadata lives entirely in frontmatter

All challenge data SHALL reside in the `.md` file only — no TOML files SHALL exist. The frontmatter SHALL contain: `id`, `title`, `difficulty`, `tags`, `algorithm`, `testcase_count`, `params` (object), `generator` (Python string), and `starter_code` (Python string). `ChallengeView` SHALL read all challenge data from `frontmatter` (via `useData()`) rather than from any external file. The `import.meta.glob` TOML loading logic in `ChallengeView` SHALL be removed.

#### Scenario: AppHeader reads title from frontmatter

- **WHEN** a challenge page loads
- **THEN** the AppHeader displays the title from `frontmatter.title` without waiting for WASM generation

#### Scenario: Data loader continues to work from frontmatter

- **WHEN** `challenge.data.ts` builds the challenge catalogue
- **THEN** it reads all metadata from `.md` frontmatter fields as before (no TOML parsing at build time)

#### Scenario: No TOML files exist in the repository

- **WHEN** the migration is complete
- **THEN** the `.vitepress/theme/challenges/` directory and all `.toml` files are deleted

<!-- @trace
source: markdown-panel-and-python-generator
updated: 2026-03-13
code:
  - docs/index.md
  - .vitepress/theme/challenges/13-aes-ecb-decrypt.toml
  - .vitepress/theme/components/challenge/ProblemPanel.vue
  - docs/challenge/rsa-decrypt.md
  - challenge-generator/src/algorithms/vigenere.rs
  - .vitepress/theme/challenges/08-railfence-decrypt.toml
  - .vitepress/theme/challenges/09-xor.toml
  - docs/challenge/playfair-encrypt.md
  - .vitepress/theme/challenges/01-caesar-encrypt.toml
  - docs/challenge/xor-encrypt.md
  - .vitepress/theme/Layout.vue
  - challenge-generator/src/algorithms/playfair.rs
  - .vitepress/theme/challenges/02-caesar-decrypt.toml
  - challenge-generator/src/lib.rs
  - .vitepress/theme/challenges/12-aes-ecb-encrypt.toml
  - .vitepress/theme/challenges/06-playfair-decrypt.toml
  - .vitepress/theme/challenges/14-simple-ecb-encrypt.toml
  - challenge-generator/src/algorithms/railfence.rs
  - challenge-generator/src/parser.rs
  - .vitepress/theme/challenges/11-rsa-decrypt.toml
  - docs/challenge/vigenere-decrypt.md
  - challenge-generator/src/template.rs
  - .vitepress/theme/challenges/15-simple-ecb-decrypt.toml
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/challenges/07-railfence-encrypt.toml
  - docs/challenge/simple-ecb-decrypt.md
  - .vitepress/theme/challenges/10-rsa-encrypt.toml
  - docs/challenge/playfair-decrypt.md
  - .vitepress/theme/composables/useWasm.ts
  - .vitepress/theme/challenges/05-playfair-encrypt.toml
  - docs/challenge/aes-ecb-decrypt.md
  - docs/challenge/vigenere-encrypt.md
  - challenge-generator/Cargo.toml
  - docs/challenge/rsa-encrypt.md
  - challenge-generator/src/algorithms/caesar.rs
  - docs/challenge/railfence-encrypt.md
  - docs/challenge/caesar-encrypt.md
  - docs/challenge/railfence-decrypt.md
  - challenge-generator/src/algorithms/aes.rs
  - docs/challenge/caesar-decrypt.md
  - challenge-generator/src/algorithms/rsa.rs
  - challenge-generator/src/algorithms/xor.rs
  - challenge-generator/src/rng.rs
  - docs/challenge/aes-ecb-encrypt.md
  - .vitepress/theme/stores/challenge.ts
  - .vitepress/theme/workers/pyodide.worker.ts
  - docs/challenge/simple-ecb-encrypt.md
  - package.json
  - challenge-generator/src/algorithms/mod.rs
  - .vitepress/theme/challenges/03-vigenere-encrypt.toml
  - docs/shared/challenge.data.ts
  - .vitepress/theme/challenges/04-vigenere-decrypt.toml
tests:
  - .vitepress/theme/__tests__/useWasm.spec.ts
  - .vitepress/theme/__tests__/challenge.store.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-generate.spec.ts
-->