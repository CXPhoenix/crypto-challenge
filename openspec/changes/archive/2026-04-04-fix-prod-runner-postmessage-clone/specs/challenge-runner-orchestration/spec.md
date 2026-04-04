## MODIFIED Requirements

### Requirement: Prod strategy uses encrypted pool + WASM judge flow

When `import.meta.env.MODE === 'production'`, the composable SHALL use the production strategy:

1. Fetch the encrypted pool file from `/pools/<algorithm>.bin`
2. Call WASM `load_pool(challenge_id, data)` to decrypt
3. Call WASM `select_testcases(challenge_id, count)` to get `{inputs, session_id, verdict_detail}` and store the returned `verdict_detail` as the authoritative display setting
4. On `submit()`, spawn a Pyodide Worker with a `RunOnlyRequest` message containing `{type: 'run_only', code, inputs}` — no `expected_output`, no `verdictDetail`, no `testcases` array. The `inputs` array passed via `postMessage` SHALL be a plain JavaScript Array (e.g. created via spread operator or `Array.from`), NOT a Vue reactive Proxy or WASM-backed object, to ensure compatibility with the browser's structured clone algorithm.
5. Collect Worker raw stdout outputs
6. Call WASM `judge(challenge_id, session_id, outputs)` to obtain verdicts

Expected output SHALL NOT pass through any JS-accessible variable, `postMessage`, or Pinia store when `verdict_detail` is `hidden` or `actual`.

The composable SHALL expose `verdictDetail` as a reactive value sourced from the pool's `select_testcases` return. It SHALL NOT use the frontmatter-derived `config.verdictDetail` in production mode. This ensures the display behavior is controlled by the integrity-protected pool payload, not by client-side frontmatter that could be tampered with or become inconsistent with the pool.

#### Scenario: Prod mode fetches encrypted pool

- **WHEN** the app runs in production mode and a challenge page loads
- **THEN** the composable SHALL fetch `/pools/<algorithm>.bin` and pass it to WASM `load_pool`

#### Scenario: Prod mode does not expose expected_output in JS when hidden

- **WHEN** `verdict_detail` is `hidden` and the production strategy is active
- **THEN** no JS variable, `postMessage` payload, or Pinia store SHALL contain `expected_output` at any point

#### Scenario: Prod mode submit sends RunOnlyRequest to Worker

- **WHEN** `submit()` is called in production mode
- **THEN** the Worker SHALL receive a `RunOnlyRequest` message with `{type: 'run_only', code, inputs}` containing no `expected_output`, no `verdictDetail`, and no `testcases` array

#### Scenario: Prod mode inputs passed to Worker are structured-clone-compatible

- **WHEN** the prod runner calls `postMessage` to send a `RunOnlyRequest` to the Pyodide Worker
- **THEN** the `inputs` field SHALL be a plain JavaScript Array of strings, NOT a Vue reactive Proxy or WASM-returned object
- **AND** the `postMessage` call SHALL NOT throw a `DataCloneError`

#### Scenario: Prod mode verdictDetail comes from pool

- **WHEN** the production strategy calls `select_testcases` and receives `verdict_detail: "actual"` from the pool
- **THEN** the composable's exposed `verdictDetail` value SHALL be `"actual"`
- **AND** the frontmatter-derived `config.verdictDetail` SHALL NOT be used for UI display decisions

#### Scenario: Prod mode verdictDetail updates on re-select

- **WHEN** a session is consumed by `judge()` and `select_testcases` is called again
- **THEN** the composable's exposed `verdictDetail` SHALL reflect the latest `select_testcases` return value
