## MODIFIED Requirements

### Requirement: ChallengeView orchestrates two-phase testcase generation

`ChallengeView` SHALL execute testcase generation in two sequential phases, initiated as a non-blocking background task immediately after mount:
1. Call WASM `generate_challenge(params_json, count)` to obtain `{ inputs }`
2. Post a `generate` message to the Pyodide Worker with `generatorCode` (from frontmatter) and `inputs`, then await `generate_complete`

The challenge store SHALL be updated only after both phases complete. The `GeneratedChallenge` type in the store SHALL NOT include a `description` field. The generation SHALL NOT block the rendering of `ProblemPanel` or `CodeEditor`. A reactive `isTestcaseReady` flag SHALL be set to `true` only after both phases succeed and the challenge store has been updated.

#### Scenario: Challenge loads with complete testcases

- **WHEN** a user opens a challenge page
- **THEN** the left panel shows the markdown description immediately from `<Content />`, the editor loads `starter_code` from frontmatter, and testcases become available for running after both generation phases complete in the background

#### Scenario: UI does not show skeleton during generation

- **WHEN** either WASM generation or Pyodide generator execution is in progress
- **THEN** the left panel shows `ProblemPanel` content (NOT a skeleton loader), and the Run button shows a loading/disabled state instead of the play button
