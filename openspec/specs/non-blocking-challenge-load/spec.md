# non-blocking-challenge-load Specification

## Purpose

Ensures the challenge UI renders the problem panel and code editor immediately without blocking on testcase generation. The run button is disabled until testcases are ready, and in-progress Workers are terminated on component unmount to prevent stale callbacks.

## Requirements

### Requirement: Challenge UI renders immediately without waiting for testcase generation

`ChallengeView` SHALL render `ProblemPanel` and `CodeEditor` immediately upon mount, without waiting for WASM generation or Pyodide Worker execution to complete. Testcase generation SHALL run asynchronously in the background.

#### Scenario: ProblemPanel visible while generating

- **WHEN** a user navigates to a challenge page and testcase generation has not yet completed
- **THEN** `ProblemPanel` and `CodeEditor` are fully visible and usable

#### Scenario: Skeleton loader is not shown over problem content

- **WHEN** testcase generation is in progress
- **THEN** no skeleton placeholder covers the `ProblemPanel` or `CodeEditor`


<!-- @trace
source: lazy-testcase-gen-non-blocking-ui
updated: 2026-03-13
code:
  - .vitepress/theme/components/editor/TestResultPanel.vue
  - .vitepress/theme/views/ChallengeView.vue
  - pnpm-workspace.yaml
  - .vitepress/theme/components/editor/RunButton.vue
  - package.json
tests:
  - .vitepress/theme/__tests__/TestResultPanel.spec.ts
  - .vitepress/theme/__tests__/RunButton.spec.ts
  - .vitepress/theme/__tests__/ChallengeView.spec.ts
-->

---
### Requirement: Run button is disabled until testcases are ready

`RunButton` SHALL accept an `isReady: boolean` prop. When `isReady` is `false`, the button SHALL be rendered in a disabled state (non-clickable) and SHALL display a loading indicator with text indicating that testcases are being prepared. When `isReady` becomes `true`, the button SHALL return to its normal enabled state.

#### Scenario: Run button disabled during generation

- **WHEN** testcase generation is in progress (`isReady = false`)
- **THEN** the Run button is not clickable and displays a loading/generating indicator

#### Scenario: Run button enabled after generation

- **WHEN** testcase generation completes (`isReady = true`)
- **THEN** the Run button is clickable and displays the normal play icon with "執行" label


<!-- @trace
source: lazy-testcase-gen-non-blocking-ui
updated: 2026-03-13
code:
  - .vitepress/theme/components/editor/TestResultPanel.vue
  - .vitepress/theme/views/ChallengeView.vue
  - pnpm-workspace.yaml
  - .vitepress/theme/components/editor/RunButton.vue
  - package.json
tests:
  - .vitepress/theme/__tests__/TestResultPanel.spec.ts
  - .vitepress/theme/__tests__/RunButton.spec.ts
  - .vitepress/theme/__tests__/ChallengeView.spec.ts
-->

---
### Requirement: Worker is terminated on component unmount

When `ChallengeView` unmounts, any in-progress Pyodide Worker SHALL be terminated immediately to prevent stale callbacks from resolving with outdated testcase data.

#### Scenario: Navigation away during generation cleans up worker

- **WHEN** a user navigates away from a challenge page before testcase generation completes
- **THEN** the Pyodide Worker is terminated and its result is discarded

#### Scenario: New challenge load starts with clean state

- **WHEN** a user navigates to a challenge page
- **THEN** `isTestcaseReady` is `false` and no stale testcases from a previous challenge remain

<!-- @trace
source: lazy-testcase-gen-non-blocking-ui
updated: 2026-03-13
code:
  - .vitepress/theme/components/editor/TestResultPanel.vue
  - .vitepress/theme/views/ChallengeView.vue
  - pnpm-workspace.yaml
  - .vitepress/theme/components/editor/RunButton.vue
  - package.json
tests:
  - .vitepress/theme/__tests__/TestResultPanel.spec.ts
  - .vitepress/theme/__tests__/RunButton.spec.ts
  - .vitepress/theme/__tests__/ChallengeView.spec.ts
-->