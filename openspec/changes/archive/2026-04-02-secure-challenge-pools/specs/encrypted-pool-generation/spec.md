## ADDED Requirements

### Requirement: Build script generates encrypted testcase pools

A build script (`scripts/generate-pools.ts`) SHALL read all `docs/challenge/*.md` files, parse frontmatter to extract `params`, `generator`, `testcase_count`, `algorithm`, and `verdict_detail` fields. For each challenge, it SHALL generate a configurable number of random inputs (default: 200) using the existing WASM `generate_challenge()` function or equivalent param-based generation, execute the `generator` Python code via subprocess for each input to produce `expected_output`, and package all `{input, expected_output}` pairs into an encrypted binary pool file.

#### Scenario: Pool file created for each challenge

- **WHEN** the build script runs
- **THEN** one `.bin` file SHALL be created in `docs/public/pools/` for each challenge, named `<algorithm>.bin`

#### Scenario: Generator with external Python dependencies executes correctly

- **WHEN** a challenge generator imports `pycryptodome` (e.g., `from Crypto.Cipher import DES`)
- **THEN** the build script SHALL execute it via Python subprocess with the dependency available, producing correct expected outputs

#### Scenario: JSON factory format is supported

- **WHEN** a generator outputs a JSON string `{"input": "...", "expected_output": "..."}`
- **THEN** the build script SHALL parse the JSON and use the transformed `input` and `expected_output` values in the pool

#### Scenario: Build script fails on generator error

- **WHEN** a generator script raises a Python exception for any input
- **THEN** the build script SHALL report the error with challenge name and input details, and exit with a non-zero code

### Requirement: Pool binary format uses AES-256-GCM encryption

Each pool file SHALL use the following binary format:
- Bytes 0-5: magic `CXPOOL` (ASCII)
- Byte 6: version number (initially `1`)
- Bytes 7-18: 12-byte random nonce
- Bytes 19+: AES-256-GCM ciphertext with appended 16-byte authentication tag

The plaintext payload SHALL be a JSON object containing `challenge_id` (string), `verdict_detail` (string: `hidden` | `actual` | `full`), and `testcases` (array of `{input: string, expected_output: string}`).

#### Scenario: Pool file starts with correct magic and version

- **WHEN** a pool file is read
- **THEN** the first 6 bytes SHALL equal ASCII `CXPOOL` and byte 7 SHALL equal `0x01`

#### Scenario: Tampered pool file is rejected

- **WHEN** any byte of the ciphertext or nonce is modified
- **THEN** AES-GCM decryption SHALL fail with an authentication error

#### Scenario: verdict_detail is integrity-protected

- **WHEN** an attacker attempts to change the verdict_detail value
- **THEN** the modification SHALL be inside the encrypted payload and any tampering SHALL cause decryption to fail

### Requirement: Encryption key is managed as a project secret

The AES-256-GCM encryption key SHALL be stored in a `.env.pool` file (gitignored) as a 64-character hex string. The build script SHALL read the key from this file. If the file does not exist, the build script SHALL generate a random 256-bit key, write it to `.env.pool`, and proceed.

#### Scenario: First build generates key automatically

- **WHEN** `build:pools` runs and `.env.pool` does not exist
- **THEN** a new random 256-bit key SHALL be generated and saved to `.env.pool`

#### Scenario: Subsequent builds reuse existing key

- **WHEN** `build:pools` runs and `.env.pool` exists with a valid key
- **THEN** the existing key SHALL be used for encryption

### Requirement: Build script generates obfuscated key material for WASM

After encrypting all pools, the build script SHALL generate `testcase-generator/src/key_material.rs` containing the encryption key split into 4 segments of 8 bytes each, each XORed with a randomly generated compile-time mask. The file SHALL be gitignored. The generated Rust code SHALL provide a function to reconstruct the original key at runtime.

#### Scenario: key_material.rs is generated with obfuscated constants

- **WHEN** the build script completes pool generation
- **THEN** `testcase-generator/src/key_material.rs` SHALL exist containing 4 pairs of `const` arrays (segment + mask) and a reconstruction function

#### Scenario: key_material.rs is not committed to version control

- **WHEN** checking `.gitignore`
- **THEN** the pattern `key_material.rs` SHALL be listed
