## MODIFIED Requirements

### Requirement: RunRequest does not carry expected_output in production mode

In production mode, the Pyodide Worker SHALL support a `RunOnlyRequest` message type with the following interface:

```typescript
interface RunOnlyRequest {
  type: 'run_only'
  code: string
  inputs: string[]
  opLimit?: number
}
```

When the Worker receives a `RunOnlyRequest`, it SHALL execute the student code against each input and return results in the following format:

- For each input: a `testcase_result` message with `{type: 'testcase_result', index: number, stdout: string, error?: string, elapsed_ms: number}`
- After all inputs: a `run_complete` message with `{type: 'run_complete'}`

The Worker SHALL NOT perform verdict computation, output comparison, or data stripping when handling `RunOnlyRequest`. It SHALL NOT accept or process a `verdictDetail` field. The `opLimit` field SHALL default to `10_000_000` bytecode operations per testcase if omitted.

In development mode, the existing `RunRequest` message type SHALL be preserved with `testcases: Array<{ input: string; expected_output: string }>` and `verdictDetail` for backward compatibility.

The Worker SHALL distinguish between the two message types by the `type` field: `'run'` for `RunRequest` (dev mode) and `'run_only'` for `RunOnlyRequest` (prod mode).

#### Scenario: Production sends RunOnlyRequest to Worker

- **WHEN** a submission occurs in production mode
- **THEN** the `postMessage` to the Worker SHALL contain `{type: 'run_only', code: string, inputs: string[]}` with no `expected_output`, no `testcases` array, and no `verdictDetail`

#### Scenario: Worker returns raw stdout for RunOnlyRequest

- **WHEN** the Worker processes a `RunOnlyRequest` with 3 inputs
- **THEN** it SHALL emit 3 `testcase_result` messages each containing `stdout`, `elapsed_ms`, and optionally `error`
- **AND** it SHALL emit a final `run_complete` message
- **AND** no `testcase_result` message SHALL contain `verdict`, `expected`, or `actual` fields

#### Scenario: RunOnlyRequest respects opLimit

- **WHEN** a `RunOnlyRequest` includes `opLimit: 5_000_000`
- **THEN** the Worker SHALL terminate execution of any testcase that exceeds 5,000,000 bytecode operations

#### Scenario: Dev RunRequest retains current format

- **WHEN** a submission occurs in development mode
- **THEN** the `postMessage` to the Worker SHALL contain `{type: 'run', code: string, testcases: [{input, expected_output}], verdictDetail}` matching current behavior
