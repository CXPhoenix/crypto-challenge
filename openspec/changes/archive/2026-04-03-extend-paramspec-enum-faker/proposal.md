## Why

`enigma-simplified.html` 和 `des-ecb-cbc.html` 頁面無法產生測資，WASM 報錯：`unknown variant 'string'` / `unknown variant 'hex'`。根因是這些題目的 frontmatter params 使用了 `ParamSpec` enum 不支援的 type（`string`、`hex`），以及不存在的欄位（`len`、`values`）。

目前 `ParamSpec` 缺少兩種常見的隨機產生需求：
1. **從固定值列表中隨機選一個**（如加密模式 ECB/CBC）
2. **產生擬真假資料**（如人名、email），讓題目 input 更多元

## What Changes

- 新增 `Enum` variant 到 `ParamSpec`：從 `values: Vec<String>` 中隨機選取，支援既有的 `CountSpec`
- 新增 `Faker` variant 到 `ParamSpec`（feature-gated）：透過 Cargo feature flag `faker` 可選啟用，使用 `fake` crate 產生擬真資料
- 修正 `enigma-simplified.md` frontmatter：`type: string` → `type: alpha_upper`，`len` → `min_len`/`max_len`
- 修正 `des-ecb-cbc.md` frontmatter：`type: hex` → `type: hex_string`，`type: string` + `values` → `type: enum`，`len` → `min_len`/`max_len`

## Non-Goals (optional)

- 不修改 WASM 的整體架構（WASM 產生 input、Python generator 產生 output 的職責分工不變）
- Faker 不會預設啟用，避免 WASM 體積膨脹
- 不新增其他 ParamSpec variant（如 regex pattern 等），僅限 `Enum` 和 `Faker`

## Capabilities

### New Capabilities

- `paramspec-enum-faker`: 擴充 testcase-generator 的 `ParamSpec` enum，新增 `Enum`（從固定值選取）與 feature-gated `Faker`（擬真假資料）兩種 variant

### Modified Capabilities

- `python-generator`: 修正既有題目 frontmatter 中不合法的 param type（`string` → `alpha_upper`、`hex` → `hex_string`、`string` + `values` → `enum`）

## Impact

- 受影響的 Rust 程式碼：`testcase-generator/src/parser.rs`、`testcase-generator/src/rng.rs`、`testcase-generator/src/lib.rs`
- 受影響的設定：`testcase-generator/Cargo.toml`（新增 optional `fake` dependency + feature flag）
- 受影響的題目定義：`docs/challenge/enigma-simplified.md`、`docs/challenge/des-ecb-cbc.md`
- WASM binary 需重新編譯
