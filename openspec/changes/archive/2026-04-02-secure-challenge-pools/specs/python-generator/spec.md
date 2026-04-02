## MODIFIED Requirements

### Requirement: Pyodide Worker executes generator to produce expected outputs

The Pyodide Worker SHALL handle a `generate` message containing `generatorCode: string` and `inputs: string[]` ONLY when the application is running in development mode. In production mode, the Worker SHALL NOT support the `generate` message type (the handler SHALL be excluded or return an error). For each input in dev mode, it SHALL execute `generatorCode` with that input as stdin and capture stdout as `expected_output`. It SHALL respond with a `generate_complete` message containing `testcases: Array<{ input: string; expected_output: string }>`. If any generator execution throws an error, the worker SHALL include an `error` field in the response for that entry.

#### Scenario: Worker produces correct testcases from generator in dev mode

- **WHEN** the Worker receives a `generate` message in development mode with a valid generator script and inputs
- **THEN** it responds with `generate_complete` containing testcases where each `expected_output` is the stdout of running the generator with the corresponding input as stdin

#### Scenario: Worker reports generator errors without crashing

- **WHEN** the generator script throws a Python exception on a given input in dev mode
- **THEN** the Worker includes an `error` field for that testcase and continues processing remaining inputs

#### Scenario: Generate message not handled in production mode

- **WHEN** the Worker receives a `generate` message in production mode
- **THEN** the Worker SHALL NOT execute generator code

### Requirement: ChallengeView orchestrates two-phase testcase generation

In development mode, `ChallengeView` SHALL delegate testcase generation to `useChallengeRunner`, which internally executes two sequential phases:
1. Call WASM `generate_challenge(params_json, count)` to obtain `{ inputs }`
2. Post a `generate` message to the Pyodide Worker with `generatorCode` (from frontmatter) and `inputs`, then await `generate_complete`

In production mode, `ChallengeView` SHALL delegate to `useChallengeRunner`, which internally fetches an encrypted pool file, decrypts it via WASM, and selects testcases without executing any generator code.

In both modes, the challenge store SHALL be updated only after testcase preparation completes. The generation SHALL NOT block the rendering of `ProblemPanel` or `CodeEditor`. A reactive `isTestcaseReady` flag SHALL be set to `true` only after preparation succeeds.

`ChallengeView` SHALL NOT directly call `useWasm()`, spawn Workers, or hold `expected_output` in any component-local variable.

#### Scenario: Challenge loads with complete testcases in dev mode

- **WHEN** a user opens a challenge page in development mode
- **THEN** the left panel shows the markdown description immediately, the editor loads `starter_code`, and testcases become available after both WASM generation and Pyodide generator execution complete

#### Scenario: Challenge loads with pool-based testcases in production mode

- **WHEN** a user opens a challenge page in production mode
- **THEN** testcases are loaded from the encrypted pool via WASM without executing any Python generator code

#### Scenario: UI does not show skeleton during generation

- **WHEN** testcase preparation is in progress (either mode)
- **THEN** the left panel shows `ProblemPanel` content (NOT a skeleton loader), and the submit button shows a loading/disabled state

## ADDED Requirements

### Requirement: RunRequest does not carry expected_output in production mode

In production mode, the `RunRequest` message sent to the Pyodide Worker SHALL contain `code: string` and `inputs: string[]` only. It SHALL NOT contain an `expected_output` field, a `testcases` array with expected outputs, or a `verdictDetail` field. The Worker SHALL return raw execution results `{stdout: string, error?: string, elapsed_ms: number}[]` without computing verdicts.

In development mode, the `RunRequest` message SHALL retain the current format with `testcases: Array<{ input: string; expected_output: string }>` and `verdictDetail` for backward compatibility.

#### Scenario: Production RunRequest contains only code and inputs

- **WHEN** a submission occurs in production mode
- **THEN** the `postMessage` to the Worker SHALL contain `{type: 'run', code: string, inputs: string[]}` with no `expected_output` or `verdictDetail`

#### Scenario: Dev RunRequest retains current format

- **WHEN** a submission occurs in development mode
- **THEN** the `postMessage` to the Worker SHALL contain `{type: 'run', code: string, testcases: [{input, expected_output}], verdictDetail}` matching current behavior
