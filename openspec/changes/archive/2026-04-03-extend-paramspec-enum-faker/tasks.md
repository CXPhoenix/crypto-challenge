## 1. Enum variant 實作

- [x] 1.1 使用 serde tagged enum 實作 Enum variant：在 `parser.rs` 新增 `Enum` variant（`values: Vec<String>`, `count: CountSpec`），實作「Enum variant selects from a fixed list of values」
- [x] 1.2 Enum variant 的 values 不可為空：在 `parser.rs` 加入反序列化後驗證，empty values list fails at deserialization
- [x] 1.3 在 `rng.rs` 的 `generate_one` 和 `generate_single` 加入 `Enum` 的隨機選取邏輯
- [x] 1.4 在 `rng.rs` 新增測試：Enum variant 選值、count 多值、空 values 錯誤、deterministic with same seed

## 2. Faker variant 實作（feature-gated）

- [x] 2.1 在 `Cargo.toml` 新增 `fake` optional dependency 與 `faker` feature flag，實作「使用 Cargo feature flag 隔離 Faker 依賴」
- [x] 2.2 Faker category 使用 enum 限定可選類別：在 `parser.rs` 新增 `FakerCategory` enum 與 `#[cfg(feature = "faker")] Faker` variant，實作「Faker variant generates realistic fake data behind a feature flag」
- [x] 2.3 在 `rng.rs` 新增 `#[cfg(feature = "faker")]` 的 `generate_single` 分支
- [x] 2.4 新增測試：Faker generates a realistic name、Faker with count、Faker variant unavailable without feature flag、Faker feature flag does not affect other variants

## 3. 修正題目 frontmatter

- [x] 3.1 修正 frontmatter 使用既有 + 新的 variant：修正 `docs/challenge/enigma-simplified.md`（`type: string` → `type: alpha_upper`，`len: 26` → `min_len: 26, max_len: 26`）
- [x] 3.2 修正 frontmatter 使用既有 + 新的 variant：修正 `docs/challenge/des-ecb-cbc.md`（`type: hex` → `type: hex_string`，`len` → `min_len`/`max_len`，`type: string` + `values` → `type: enum` + `values`），確保符合「Rust WASM generates random inputs only」的 valid type names

## 4. 編譯驗證

- [x] 4.1 執行 `cargo test` 確認所有 Rust 單元測試通過（含 Enum variant 與 invalid type name causes deserialization error）
- [x] 4.2 執行 `wasm-pack build` 重新編譯 WASM binary
- [x] 4.3 執行既有前端測試（`useWasm.spec.ts`）確認 WASM 整合正常
