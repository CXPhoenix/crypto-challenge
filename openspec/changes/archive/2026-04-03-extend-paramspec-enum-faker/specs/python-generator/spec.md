## MODIFIED Requirements

### Requirement: Rust WASM generates random inputs only

The `generate_challenge(params_json, count)` WASM function SHALL accept `params_json: &str` (JSON-serialized params object from frontmatter) and `count: usize` (number of testcases). It SHALL deserialize the params, generate `count` random input strings (one per testcase), and return an object containing only `inputs: Vec<String>`. It SHALL NOT compute `expected_output`. Param values SHALL be joined in the key order of the JSON object with newline separators to form each input string. `indexmap::IndexMap` SHALL be used to preserve key order.

Each `ParamSpec` variant SHALL support an optional `count` field of type `CountSpec`. `CountSpec` SHALL be a struct with three fields:
- `min: usize` — minimum number of values to generate (default: 1)
- `max: usize` — maximum number of values to generate (default: 1)
- `separator: String` — delimiter used to join multiple values on the same line (default: `" "`)

The entire `count` field SHALL default to `CountSpec { min: 1, max: 1, separator: " " }` when omitted, preserving backward compatibility. For each param, the generator SHALL pick an actual count uniformly at random in `[count.min, count.max]`, generate that many values, and join them with `count.separator`.

The supported `ParamSpec` variants SHALL be: `Int`, `AlphaUpper`, `AlphaLower`, `AlphaMixed`, `HexString`, `PrintableAscii`, `Enum`, and optionally `Faker` (when the `faker` Cargo feature is enabled). Challenge frontmatter params MUST use only these valid type names: `int`, `alpha_upper`, `alpha_lower`, `alpha_mixed`, `hex_string`, `printable_ascii`, `enum`, and `faker`. Using any other type name (e.g., `string`, `hex`) SHALL result in a deserialization error.

#### Scenario: generate_challenge returns inputs in param order

- **WHEN** `generate_challenge` is called with params JSON `{"plaintext": {...}, "shift": {...}}`
- **THEN** each input string is `"{plaintext_value}\n{shift_value}"` in that key order

#### Scenario: generate_challenge respects count parameter

- **WHEN** `generate_challenge` is called with `count = 5`
- **THEN** the returned `inputs` array contains exactly 5 strings

#### Scenario: CountSpec with min and max generates variable number of values

- **WHEN** a param is declared with `count: { min: 2, max: 5 }`
- **THEN** the generated line for that param contains between 2 and 5 values joined by separator (inclusive)

#### Scenario: CountSpec with custom separator joins values correctly

- **WHEN** a param is declared with `count: { min: 3, max: 3, separator: "," }`
- **THEN** the generated line contains exactly 3 values joined by commas with no trailing separator

#### Scenario: Omitting count preserves existing behavior

- **WHEN** a param is declared without a `count` field
- **THEN** the param generates exactly 1 value with no separator (identical to previous behavior)

#### Scenario: Invalid type name causes deserialization error

- **WHEN** frontmatter params contain `type: string` or `type: hex`
- **THEN** `generate_challenge` returns an error indicating unknown variant with the list of valid variants
