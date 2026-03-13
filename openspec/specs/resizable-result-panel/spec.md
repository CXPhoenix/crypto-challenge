# resizable-result-panel Specification

## Purpose

TBD - created by archiving change 'lazy-testcase-gen-non-blocking-ui'. Update Purpose after archive.

## Requirements

### Requirement: TestResultPanel height is user-adjustable via drag

`ChallengeView` SHALL provide a drag handle between the `CodeEditor` area and the bottom panel (which contains the run button bar and `TestResultPanel`). The drag handle SHALL be positioned at the top edge of the bottom panel, above the run button bar. Dragging the handle upward SHALL increase the bottom panel height (shrinking the editor area); dragging downward SHALL decrease it. The minimum bottom panel height SHALL be `80px`. The maximum bottom panel height SHALL be 50% of the height of the right-side container. The container height SHALL be measured using `ResizeObserver` so that the constraint remains accurate when the left/right split is adjusted. The drag handle and height management logic SHALL reside in `ChallengeView`, not inside `TestResultPanel`.

#### Scenario: User drags handle upward to expand bottom panel

- **WHEN** the user drags the handle (above the run button bar) upward
- **THEN** the bottom panel height increases, the editor area shrinks, stopping when bottom panel reaches 50% of the right panel height

#### Scenario: User drags handle downward to collapse bottom panel

- **WHEN** the user drags the handle downward
- **THEN** the bottom panel height decreases, stopping at a minimum of `80px`

#### Scenario: Container resize adjusts maximum height

- **WHEN** the user resizes the left/right split pane and the right panel height changes
- **THEN** the maximum bottom panel height constraint is recalculated to 50% of the new right panel height; if the current height exceeds the new maximum, it is clamped


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
### Requirement: TestResultPanel removes fixed max-height

The fixed `max-h-56` Tailwind class SHALL be removed from `TestResultPanel`. `TestResultPanel` SHALL NOT manage its own height or contain a drag handle. Its height SHALL be determined by the bottom panel container in `ChallengeView`, and its content SHALL scroll within that container using `overflow-auto`.

#### Scenario: Many testcase results are scrollable within adjusted height

- **WHEN** the number of testcase results exceeds the visible area at current bottom panel height
- **THEN** the panel content is scrollable within the panel without overflowing the right-side layout

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