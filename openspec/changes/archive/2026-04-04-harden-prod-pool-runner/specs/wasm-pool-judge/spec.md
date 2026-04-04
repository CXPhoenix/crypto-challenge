## MODIFIED Requirements

### Requirement: WASM module decrypts and loads encrypted pool

The WASM module SHALL export a `load_pool(challenge_id: &str, encrypted_data: &[u8])` function that validates the pool binary format (magic bytes, version), extracts the nonce, reconstructs the AES-256-GCM key from obfuscated key material, and decrypts the payload. On successful decryption, the function SHALL verify that the `challenge_id` field embedded in the decrypted payload matches the `challenge_id` argument provided by the caller. If the identities do not match, `load_pool` SHALL return an error indicating the mismatch and SHALL NOT store the pool. On failure (format, decryption, or identity mismatch), the function SHALL return a descriptive error. On success, the pool data SHALL be stored in WASM linear memory indexed by `challenge_id`.

#### Scenario: Valid pool loads successfully

- **WHEN** `load_pool` is called with a correctly encrypted pool file whose embedded `challenge_id` matches the caller-provided `challenge_id`
- **THEN** the function SHALL return success and the pool SHALL be available for subsequent operations

#### Scenario: Invalid magic bytes rejected

- **WHEN** `load_pool` is called with data that does not start with `CXPOOL`
- **THEN** the function SHALL return an error indicating invalid format

#### Scenario: Tampered data rejected by GCM authentication

- **WHEN** `load_pool` is called with modified ciphertext
- **THEN** AES-GCM decryption SHALL fail and the function SHALL return an authentication error

#### Scenario: Mismatched challenge_id rejected

- **WHEN** `load_pool` is called with `challenge_id` argument `"caesar_encrypt"` but the decrypted payload contains `challenge_id: "vigenere_encrypt"`
- **THEN** the function SHALL return an error indicating the identity mismatch between the expected and embedded challenge_id
- **AND** the pool SHALL NOT be stored or available for subsequent operations

#### Scenario: Payload challenge_id field is not dead code

- **WHEN** the `PoolPayload` struct is compiled
- **THEN** the `challenge_id` field SHALL NOT carry an `#[allow(dead_code)]` attribute
- **AND** it SHALL be actively read and compared during `load_pool`
