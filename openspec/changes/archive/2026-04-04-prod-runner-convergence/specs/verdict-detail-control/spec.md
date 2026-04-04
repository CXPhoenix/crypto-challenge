## MODIFIED Requirements

### Requirement: Verdict Detail Frontmatter Field

Each challenge Markdown file SHALL support an optional `verdict_detail` frontmatter field with values `hidden`, `actual`, or `full`. When omitted, the default value SHALL be `hidden`.

In production mode, the `verdict_detail` value SHALL be read from the encrypted pool payload (where it is integrity-protected by AES-GCM) rather than from client-side frontmatter. The `useProdRunner` composable SHALL obtain this value from the `select_testcases` WASM export return value and expose it as a reactive `verdictDetail` property. `ChallengeView` SHALL pass this pool-derived `verdictDetail` to `TestResultPanel`, NOT the frontmatter-resolved value.

In development mode, the `verdict_detail` value SHALL continue to be resolved from frontmatter via `resolveVerdictDetail()`.

#### Scenario: Field omitted defaults to hidden

- **WHEN** a challenge page has no `verdict_detail` in frontmatter
- **THEN** the system SHALL behave as `verdict_detail: hidden`

#### Scenario: Field set to full

- **WHEN** a challenge page has `verdict_detail: full`
- **THEN** the system SHALL display both expected and actual output on WA verdicts

#### Scenario: Production reads verdict_detail from encrypted pool

- **WHEN** the application runs in production mode
- **THEN** the `verdict_detail` value used for stripping SHALL come from the decrypted pool payload, not from client-side frontmatter

#### Scenario: Production verdictDetail propagates from pool to UI

- **WHEN** the application runs in production mode
- **AND** the pool was generated with `verdict_detail: "actual"`
- **THEN** `useProdRunner` SHALL expose `verdictDetail` as `"actual"` (from `select_testcases` return)
- **AND** `ChallengeView` SHALL pass `"actual"` to `TestResultPanel`'s `verdict-detail` prop
- **AND** the frontmatter value SHALL NOT influence the `TestResultPanel` display

#### Scenario: Frontmatter and pool disagree in production

- **WHEN** the application runs in production mode
- **AND** frontmatter specifies `verdict_detail: full` but the pool was generated with `verdict_detail: hidden`
- **THEN** the system SHALL use the pool's `hidden` value for both WASM judge stripping and UI display
- **AND** the frontmatter value SHALL be ignored
