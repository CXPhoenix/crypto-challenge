## MODIFIED Requirements

### Requirement: WASM module selects random testcases with session tracking

The WASM module SHALL export a `select_testcases(challenge_id: &str, count: usize)` function that randomly selects `count` testcases from the loaded pool. It SHALL return a JSON object `{inputs: string[], session_id: string, verdict_detail: string}` where `inputs` contains only the input strings (NOT expected outputs), `session_id` is a unique identifier for this selection, and `verdict_detail` is the pool's verdict detail setting (`"hidden"`, `"actual"`, or `"full"`). The session data (selected indices and expected outputs) SHALL be retained in WASM memory for subsequent judging.

The `verdict_detail` field in the return value SHALL reflect the value embedded in the encrypted pool payload at generation time. This value is integrity-protected by AES-GCM and SHALL be the authoritative source of truth for production mode display behavior.

#### Scenario: Correct number of inputs returned

- **WHEN** `select_testcases("caesar_encrypt", 10)` is called on a pool with 200 entries
- **THEN** the result SHALL contain exactly 10 input strings and a non-empty session_id

#### Scenario: Expected outputs not exposed in return value

- **WHEN** `select_testcases` returns its result
- **THEN** the returned JSON SHALL NOT contain any `expected_output` field

#### Scenario: Pool not loaded returns error

- **WHEN** `select_testcases` is called for a challenge_id that has not been loaded
- **THEN** the function SHALL return an error

#### Scenario: Return value includes verdict_detail from pool

- **WHEN** `select_testcases` is called on a pool that was generated with `verdict_detail: "actual"`
- **THEN** the returned JSON SHALL include `verdict_detail: "actual"`
- **AND** this value SHALL match the `verdict_detail` embedded in the encrypted pool payload

#### Scenario: Default verdict_detail is hidden

- **WHEN** `select_testcases` is called on a pool that was generated without an explicit `verdict_detail`
- **THEN** the returned JSON SHALL include `verdict_detail: "hidden"`
