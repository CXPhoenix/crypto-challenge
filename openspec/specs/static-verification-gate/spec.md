# static-verification-gate Specification

## Purpose

TBD - created by archiving change 'restore-build-and-static-verification'. Update Purpose after archive.

## Requirements

### Requirement: Build pipeline completes from clean checkout

The `pnpm build` command SHALL complete successfully when executed from a clean checkout of the repository, provided all declared prerequisites (Node.js, pnpm, Rust, wasm-pack) are installed. The build pipeline executes `build:pools`, `build:wasm`, `build:pyodide`, and `docs:build` in sequence. A failure in any stage SHALL abort the pipeline with a non-zero exit code.

All scripts invoked by the build pipeline SHALL be free of syntax errors. Template literals in code generation scripts SHALL correctly escape special characters (backticks, dollar signs) to prevent parse failures.

#### Scenario: Clean checkout build succeeds

- **WHEN** `pnpm build` is executed on a clean checkout with all prerequisites installed
- **THEN** the command SHALL exit with code 0 and produce a complete `.vitepress/dist` output directory

#### Scenario: Build script syntax error causes immediate failure

- **WHEN** a build script contains a syntax error (e.g., unescaped backtick in a template literal)
- **THEN** the build SHALL fail immediately at that script with a clear error message, rather than producing corrupt output


<!-- @trace
source: restore-build-and-static-verification
updated: 2026-04-04
code:
  - .vitepress/theme/views/ChallengeView.vue
  - requirements.txt
  - .vitepress/theme/composables/useChallengeRunner.ts
  - .vitepress/theme/components/editor/CodeEditor.vue
  - scripts/generate-key-material.ts
  - .vitepress/theme/composables/useRemoteChallenge.ts
  - testcase-generator/src/judge.rs
  - testcase-generator/src/lib.rs
  - tsconfig.node.json
  - package.json
  - testcase-generator/src/pool.rs
  - tsconfig.app.json
  - README.md
  - .vitepress/theme/workers/pyodide.worker.ts
  - scripts/generate-pools.ts
  - .github/workflows/release.yml
  - .vitepress/plugins/strip-generator.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-dev.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-run-only.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-prod.spec.ts
-->

---
### Requirement: TypeScript type checking passes for all project scopes

The project SHALL maintain two TypeScript project configurations: `tsconfig.app.json` (DOM-targeted, covering `.vitepress/theme/**` application code) and `tsconfig.node.json` (Node-targeted, covering build tooling, VitePress config, and test config). Both configurations SHALL pass type checking with zero errors when invoked via `vue-tsc --noEmit -p tsconfig.app.json` and `tsc --noEmit -p tsconfig.node.json` respectively.

A `typecheck` npm script SHALL be available in `package.json` that runs both checks sequentially. This script SHALL exit with code 0 only when both checks pass.

#### Scenario: App-scope type checking passes

- **WHEN** `vue-tsc --noEmit -p tsconfig.app.json` is executed
- **THEN** the command SHALL report zero errors

#### Scenario: Node-scope type checking passes

- **WHEN** `tsc --noEmit -p tsconfig.node.json` is executed
- **THEN** the command SHALL report zero errors

#### Scenario: Unified typecheck script

- **WHEN** `pnpm typecheck` is executed
- **THEN** both app-scope and node-scope type checking SHALL run and the command SHALL exit with code 0


<!-- @trace
source: restore-build-and-static-verification
updated: 2026-04-04
code:
  - .vitepress/theme/views/ChallengeView.vue
  - requirements.txt
  - .vitepress/theme/composables/useChallengeRunner.ts
  - .vitepress/theme/components/editor/CodeEditor.vue
  - scripts/generate-key-material.ts
  - .vitepress/theme/composables/useRemoteChallenge.ts
  - testcase-generator/src/judge.rs
  - testcase-generator/src/lib.rs
  - tsconfig.node.json
  - package.json
  - testcase-generator/src/pool.rs
  - tsconfig.app.json
  - README.md
  - .vitepress/theme/workers/pyodide.worker.ts
  - scripts/generate-pools.ts
  - .github/workflows/release.yml
  - .vitepress/plugins/strip-generator.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-dev.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-run-only.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-prod.spec.ts
-->

---
### Requirement: No dead code referencing removed subsystems

The active codebase SHALL NOT contain source files that import or reference subsystems that have been removed (e.g., TOML-based challenge metadata, `parseChallengeMeta`). Any composable, component, or utility that exclusively serves a removed subsystem SHALL be deleted rather than left as dead code.

Dead code that causes type errors SHALL be treated as a verification gate failure. The presence of unused imports from removed subsystems SHALL be caught by the type checking requirement above.

#### Scenario: Dead composable referencing removed API is deleted

- **WHEN** a composable imports a function that no longer exists in its source module
- **AND** the composable has zero imports elsewhere in the codebase
- **THEN** the composable file SHALL be deleted

#### Scenario: Type checking catches stale references

- **WHEN** a source file references a removed export (e.g., `parseChallengeMeta` from `useWasm`)
- **THEN** `vue-tsc` or `tsc` SHALL report the reference as a type error


<!-- @trace
source: restore-build-and-static-verification
updated: 2026-04-04
code:
  - .vitepress/theme/views/ChallengeView.vue
  - requirements.txt
  - .vitepress/theme/composables/useChallengeRunner.ts
  - .vitepress/theme/components/editor/CodeEditor.vue
  - scripts/generate-key-material.ts
  - .vitepress/theme/composables/useRemoteChallenge.ts
  - testcase-generator/src/judge.rs
  - testcase-generator/src/lib.rs
  - tsconfig.node.json
  - package.json
  - testcase-generator/src/pool.rs
  - tsconfig.app.json
  - README.md
  - .vitepress/theme/workers/pyodide.worker.ts
  - scripts/generate-pools.ts
  - .github/workflows/release.yml
  - .vitepress/plugins/strip-generator.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-dev.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-run-only.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-prod.spec.ts
-->

---
### Requirement: Build tooling files are correctly scoped in TypeScript projects

VitePress plugins and build tooling files that import Node.js or Vite types SHALL be included in `tsconfig.node.json` (not `tsconfig.app.json`). Application code targeting the browser DOM SHALL be included in `tsconfig.app.json`. Files SHALL NOT appear in both project scopes to avoid conflicting type environments.

#### Scenario: Vite plugin is type-checked in node scope

- **WHEN** a VitePress plugin file imports `type { Plugin } from 'vite'`
- **THEN** the file SHALL be included in `tsconfig.node.json` and excluded from `tsconfig.app.json`
- **AND** `tsc -p tsconfig.node.json` SHALL resolve the `vite` type without error

#### Scenario: Application code uses correct DOM types

- **WHEN** a Vue component imports browser APIs (e.g., `@codemirror/autocomplete`)
- **THEN** the component SHALL be included in `tsconfig.app.json`
- **AND** the import SHALL match the installed package's exported API surface

<!-- @trace
source: restore-build-and-static-verification
updated: 2026-04-04
code:
  - .vitepress/theme/views/ChallengeView.vue
  - requirements.txt
  - .vitepress/theme/composables/useChallengeRunner.ts
  - .vitepress/theme/components/editor/CodeEditor.vue
  - scripts/generate-key-material.ts
  - .vitepress/theme/composables/useRemoteChallenge.ts
  - testcase-generator/src/judge.rs
  - testcase-generator/src/lib.rs
  - tsconfig.node.json
  - package.json
  - testcase-generator/src/pool.rs
  - tsconfig.app.json
  - README.md
  - .vitepress/theme/workers/pyodide.worker.ts
  - scripts/generate-pools.ts
  - .github/workflows/release.yml
  - .vitepress/plugins/strip-generator.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-dev.spec.ts
  - .vitepress/theme/__tests__/pyodide-worker-run-only.spec.ts
  - .vitepress/theme/__tests__/useChallengeRunner-prod.spec.ts
-->