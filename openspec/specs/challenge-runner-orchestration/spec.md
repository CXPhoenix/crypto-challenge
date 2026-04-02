# challenge-runner-orchestration Specification

## Purpose

TBD - created by archiving change 'secure-challenge-pools'. Update Purpose after archive.

## Requirements

### Requirement: useChallengeRunner composable provides unified challenge lifecycle API

A `useChallengeRunner` composable SHALL provide a unified API for challenge testcase loading, student code submission, and verdict retrieval. It SHALL abstract over two internal strategies (dev and production) while exposing the same interface. The composable SHALL accept challenge configuration (algorithm, params, generator, testcase_count, starter_code, verdict_detail) and return:

- `loadTestcases(): Promise<void>` — initiates testcase preparation
- `inputs: Ref<string[]>` — reactive list of testcase input strings
- `submit(code: string): Promise<void>` — runs student code and produces verdicts
- `isReady: Ref<boolean>` — true when testcases are loaded and ready for submission
- `verdictDetail: VerdictDetail` — the resolved verdict detail mode
- `errorMessage: Ref<string>` — error state for display

#### Scenario: Composable returns all required reactive properties

- **WHEN** `useChallengeRunner` is called with valid challenge configuration
- **THEN** it SHALL return `loadTestcases`, `inputs`, `submit`, `isReady`, `verdictDetail`, and `errorMessage`


<!-- @trace
source: secure-challenge-pools
updated: 2026-04-02
code:
  - testcase-generator/src/lib.rs
  - testcase-generator/src/pool.rs
  - testcase-generator/Cargo.toml
  - .vitepress/plugins/strip-generator.ts
  - testcase-generator/src/judge.rs
  - scripts/generate-key-material.ts
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/composables/useChallengeRunner.ts
  - package.json
  - .vitepress/config.mts
  - testcase-generator/src/crypto.rs
  - scripts/generate-pools.ts
  - scripts/pool-key.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
-->

---
### Requirement: Dev strategy uses existing WASM + Pyodide generator flow

When `import.meta.env.MODE === 'development'`, the composable SHALL use the dev strategy:

1. Call WASM `generate_challenge(params_json, count)` to obtain random inputs
2. Spawn a Pyodide Worker with `GenerateRequest` to run generator code and produce `{input, expected_output}[]`
3. On `submit()`, spawn a Pyodide Worker with `RunRequest` containing student code and testcases (with expected_output)
4. Produce verdicts from Worker `TestcaseResult` messages

This preserves the current development experience where generator changes take effect immediately without rebuilding pools.

#### Scenario: Dev mode uses generator from frontmatter

- **WHEN** the app runs in development mode
- **THEN** the composable SHALL read `generator` from frontmatter and execute it via Pyodide Worker to produce expected outputs

#### Scenario: Dev mode submit sends expected_output to Worker

- **WHEN** `submit()` is called in dev mode
- **THEN** the Worker SHALL receive a `RunRequest` containing testcases with `expected_output` for comparison


<!-- @trace
source: secure-challenge-pools
updated: 2026-04-02
code:
  - testcase-generator/src/lib.rs
  - testcase-generator/src/pool.rs
  - testcase-generator/Cargo.toml
  - .vitepress/plugins/strip-generator.ts
  - testcase-generator/src/judge.rs
  - scripts/generate-key-material.ts
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/composables/useChallengeRunner.ts
  - package.json
  - .vitepress/config.mts
  - testcase-generator/src/crypto.rs
  - scripts/generate-pools.ts
  - scripts/pool-key.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
-->

---
### Requirement: Prod strategy uses encrypted pool + WASM judge flow

When `import.meta.env.MODE === 'production'`, the composable SHALL use the production strategy:

1. Fetch the encrypted pool file from `/pools/<algorithm>.bin`
2. Call WASM `load_pool(challenge_id, data)` to decrypt
3. Call WASM `select_testcases(challenge_id, count)` to get `{inputs, session_id}`
4. On `submit()`, spawn a Pyodide Worker with a simplified `RunRequest` containing only `{code, inputs}` — no `expected_output`
5. Collect Worker stdout outputs
6. Call WASM `judge(challenge_id, session_id, outputs)` to obtain verdicts

Expected output SHALL NOT pass through any JS-accessible variable, `postMessage`, or Pinia store when `verdict_detail` is `hidden` or `actual`.

#### Scenario: Prod mode fetches encrypted pool

- **WHEN** the app runs in production mode and a challenge page loads
- **THEN** the composable SHALL fetch `/pools/<algorithm>.bin` and pass it to WASM `load_pool`

#### Scenario: Prod mode does not expose expected_output in JS when hidden

- **WHEN** `verdict_detail` is `hidden` and the production strategy is active
- **THEN** no JS variable, `postMessage` payload, or Pinia store SHALL contain `expected_output` at any point

#### Scenario: Prod mode submit only sends inputs to Worker

- **WHEN** `submit()` is called in production mode
- **THEN** the Worker SHALL receive a `RunRequest` containing only `code` and `inputs[]`, with no `expected_output`


<!-- @trace
source: secure-challenge-pools
updated: 2026-04-02
code:
  - testcase-generator/src/lib.rs
  - testcase-generator/src/pool.rs
  - testcase-generator/Cargo.toml
  - .vitepress/plugins/strip-generator.ts
  - testcase-generator/src/judge.rs
  - scripts/generate-key-material.ts
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/composables/useChallengeRunner.ts
  - package.json
  - .vitepress/config.mts
  - testcase-generator/src/crypto.rs
  - scripts/generate-pools.ts
  - scripts/pool-key.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
-->

---
### Requirement: ChallengeView delegates to useChallengeRunner

`ChallengeView.vue` SHALL NOT directly call `useWasm()`, spawn generator Workers, store `localTestcases`, or manage verdict logic. It SHALL use `useChallengeRunner` as the sole interface for testcase lifecycle. The view SHALL only be responsible for UI layout, user interaction, and passing data between `useChallengeRunner` and UI components.

#### Scenario: ChallengeView does not import useWasm directly

- **WHEN** inspecting `ChallengeView.vue` imports
- **THEN** it SHALL NOT import `useWasm` or `GenerateRequest`

#### Scenario: ChallengeView does not hold expected_output

- **WHEN** inspecting `ChallengeView.vue` variables
- **THEN** no variable SHALL contain `expected_output` data

<!-- @trace
source: secure-challenge-pools
updated: 2026-04-02
code:
  - testcase-generator/src/lib.rs
  - testcase-generator/src/pool.rs
  - testcase-generator/Cargo.toml
  - .vitepress/plugins/strip-generator.ts
  - testcase-generator/src/judge.rs
  - scripts/generate-key-material.ts
  - .vitepress/theme/views/ChallengeView.vue
  - .vitepress/theme/composables/useChallengeRunner.ts
  - package.json
  - .vitepress/config.mts
  - testcase-generator/src/crypto.rs
  - scripts/generate-pools.ts
  - scripts/pool-key.ts
tests:
  - .vitepress/theme/__tests__/ChallengeView-verdict-detail.spec.ts
-->