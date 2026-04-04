# paramspec-enum-faker Specification

## Purpose

Extends the `ParamSpec` system with an `Enum` variant for selecting from a fixed list of values and a `Faker` variant (behind a Cargo feature flag) for generating realistic fake data such as names, emails, and cities using the `fake` crate.

## Requirements

### Requirement: Enum variant selects from a fixed list of values

The `ParamSpec` enum SHALL include an `Enum` variant with a `values` field of type `Vec<String>` and an optional `count` field of type `CountSpec`. When generating input, the generator SHALL select one value uniformly at random from `values` for each generated value. The `values` list MUST contain at least one element; deserialization SHALL fail with a descriptive error if `values` is empty. The `Enum` variant SHALL support `CountSpec` for multi-value generation, identical to other variants.

The JSON representation SHALL be:
```json
{ "type": "enum", "values": ["ECB", "CBC"], "count": { "min": 1, "max": 1, "separator": " " } }
```

#### Scenario: Enum variant selects from provided values

- **WHEN** a param is declared with `type: enum` and `values: ["ECB", "CBC"]`
- **THEN** each generated value is either `"ECB"` or `"CBC"`

#### Scenario: Enum variant with count generates multiple selections

- **WHEN** a param is declared with `type: enum`, `values: ["A", "B", "C"]`, and `count: { min: 3, max: 3, separator: "," }`
- **THEN** the generated line contains exactly 3 comma-separated values, each being one of `"A"`, `"B"`, or `"C"`

#### Scenario: Empty values list fails at deserialization

- **WHEN** a param is declared with `type: enum` and `values: []`
- **THEN** deserialization SHALL return an error indicating that values must not be empty

#### Scenario: Enum variant is deterministic with same seed

- **WHEN** `generate_challenge` is called twice with the same seed and an `enum` param
- **THEN** both calls produce identical output

---
### Requirement: Faker variant generates realistic fake data behind a feature flag

The `ParamSpec` enum SHALL include a `Faker` variant, gated behind the Cargo feature flag `faker`. The `Faker` variant SHALL have a `category` field of type `FakerCategory` (a Rust enum) and an optional `count` field of type `CountSpec`. When the `faker` feature is not enabled, the `Faker` variant SHALL NOT exist in the compiled binary, and any frontmatter using `type: faker` SHALL fail with `unknown variant 'faker'` at deserialization.

`FakerCategory` SHALL support at least the following categories: `name`, `first_name`, `last_name`, `email`, `company`, `city`, `country`. Each category SHALL generate English-locale fake data using the `fake` crate.

The JSON representation SHALL be:
```json
{ "type": "faker", "category": "name", "count": { "min": 1, "max": 1, "separator": " " } }
```

#### Scenario: Faker generates a realistic name

- **WHEN** a param is declared with `type: faker` and `category: name`, and the `faker` feature is enabled
- **THEN** the generated value is a non-empty string resembling a human name

#### Scenario: Faker with count generates multiple values

- **WHEN** a param is declared with `type: faker`, `category: email`, and `count: { min: 2, max: 2, separator: "," }`
- **THEN** the generated line contains exactly 2 comma-separated email-like strings

#### Scenario: Faker variant unavailable without feature flag

- **WHEN** the WASM is compiled without the `faker` feature and frontmatter uses `type: faker`
- **THEN** deserialization fails with an error containing `unknown variant 'faker'`

#### Scenario: Faker feature flag does not affect other variants

- **WHEN** the WASM is compiled without the `faker` feature
- **THEN** all other `ParamSpec` variants (`Int`, `AlphaUpper`, `AlphaLower`, `AlphaMixed`, `HexString`, `PrintableAscii`, `Enum`) function identically
