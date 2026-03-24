## ADDED Requirements

### Requirement: Verdict Detail Frontmatter Field

Each challenge Markdown file SHALL support an optional `verdict_detail` frontmatter field with values `hidden`, `actual`, or `full`. When omitted, the default value SHALL be `hidden`.

#### Scenario: Field omitted defaults to hidden

- **WHEN** a challenge page has no `verdict_detail` in frontmatter
- **THEN** the system SHALL behave as `verdict_detail: hidden`

#### Scenario: Field set to full

- **WHEN** a challenge page has `verdict_detail: full`
- **THEN** the system SHALL display both expected and actual output on WA verdicts

### Requirement: Worker Testcase Result Data Stripping

The `RunRequest` message SHALL include a `verdictDetail` field (`hidden` | `actual` | `full`).

When `verdictDetail` is `hidden`, the Worker SHALL NOT include the `expected` field or the `actual` field in `TestcaseResult` messages.

When `verdictDetail` is `actual`, the Worker SHALL include the `actual` field but SHALL NOT include the `expected` field in `TestcaseResult` messages.

When `verdictDetail` is `full`, the Worker SHALL include both `expected` and `actual` fields in `TestcaseResult` messages, preserving current behavior.

The `verdict` field (AC/WA/TLE/RE) SHALL always be included regardless of `verdictDetail` setting.

#### Scenario: Hidden mode strips both fields

- **WHEN** the Worker receives a RunRequest with `verdictDetail: 'hidden'`
- **AND** a testcase produces a WA verdict
- **THEN** the `TestcaseResult` message SHALL contain `verdict: 'WA'` and `elapsed_ms` but SHALL NOT contain `expected` or `actual`

#### Scenario: Actual mode strips expected only

- **WHEN** the Worker receives a RunRequest with `verdictDetail: 'actual'`
- **AND** a testcase produces a WA verdict
- **THEN** the `TestcaseResult` message SHALL contain `verdict: 'WA'`, `actual`, and `elapsed_ms` but SHALL NOT contain `expected`

#### Scenario: Full mode includes both fields

- **WHEN** the Worker receives a RunRequest with `verdictDetail: 'full'`
- **AND** a testcase produces a WA verdict
- **THEN** the `TestcaseResult` message SHALL contain `verdict`, `expected`, `actual`, and `elapsed_ms`

### Requirement: Challenge Store Data Stripping

When `verdict_detail` is `hidden` or `actual`, the `challengeStore` SHALL NOT store `expected_output` in the testcases array. Only `input` values SHALL be stored.

When `verdict_detail` is `full`, the `challengeStore` SHALL store both `input` and `expected_output`, preserving current behavior.

The complete testcases (including `expected_output`) SHALL be retained in a component-local variable for passing to the Worker during submit, but SHALL NOT be placed in any Pinia store.

#### Scenario: Store contains only inputs when hidden

- **WHEN** `verdict_detail` is `hidden` and testcases have been generated
- **THEN** `challengeStore.currentChallenge.testcases` SHALL contain objects with `input` only and no `expected_output` property

#### Scenario: Store contains full testcases when full

- **WHEN** `verdict_detail` is `full` and testcases have been generated
- **THEN** `challengeStore.currentChallenge.testcases` SHALL contain objects with both `input` and `expected_output`

### Requirement: Test Result Panel Verdict Detail Display

The `TestResultPanel` component SHALL accept a `verdictDetail` prop with type `'hidden' | 'actual' | 'full'` defaulting to `'hidden'`.

When `verdictDetail` is `hidden`, the WA detail column SHALL display no additional information beyond the verdict badge.

When `verdictDetail` is `actual`, the WA detail column SHALL display the user's actual output only.

When `verdictDetail` is `full`, the WA detail column SHALL display both expected and actual output, preserving current behavior.

#### Scenario: Hidden mode shows no detail for WA

- **WHEN** `verdictDetail` is `hidden` and a testcase has verdict WA
- **THEN** the detail column SHALL be empty

#### Scenario: Actual mode shows only user output for WA

- **WHEN** `verdictDetail` is `actual` and a testcase has verdict WA with actual output `HELLO`
- **THEN** the detail column SHALL display `實際 HELLO` without showing expected output

#### Scenario: Full mode shows both for WA

- **WHEN** `verdictDetail` is `full` and a testcase has verdict WA
- **THEN** the detail column SHALL display both expected and actual output
