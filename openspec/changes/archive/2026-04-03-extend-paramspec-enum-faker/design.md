## Context

testcase-generator 是一個 Rust WASM 模組，負責根據 frontmatter 的 `params` 定義產生隨機 input 字串。目前 `ParamSpec` enum 支援 6 種 variant：`Int`、`AlphaUpper`、`AlphaLower`、`AlphaMixed`、`HexString`、`PrintableAscii`。

兩個題目（`enigma-simplified.md`、`des-ecb-cbc.md`）使用了不存在的 type（`string`、`hex`）和欄位（`len`、`values`），導致 WASM 解析失敗。其中 `des-ecb-cbc.md` 的 `mode` 參數需要「從固定值列表中隨機選一個」的功能，這是目前 `ParamSpec` 缺少的。

## Goals / Non-Goals

**Goals:**

- 新增 `Enum` variant，讓 params 可以從固定值列表中隨機選取
- 新增 feature-gated `Faker` variant，使用 `fake` crate 產生擬真假資料
- 修正兩個出錯題目的 frontmatter params

**Non-Goals:**

- 不修改 WASM ↔ Python generator 的架構分工
- 不預設啟用 faker feature（避免 WASM 體積膨脹）
- 不新增 regex、range 等其他 variant

## Decisions

### 使用 serde tagged enum 實作 Enum variant

在 `ParamSpec` 新增 `Enum` variant，JSON 格式為 `{ "type": "enum", "values": [...] }`。serde 的 `#[serde(tag = "type", rename_all = "snake_case")]` 會自動處理反序列化。`values` 為 `Vec<String>`，必須非空。

替代方案：在前端 JS 層隨機選值再傳給 WASM → 破壞「params 全由 WASM 生成」的一致性，且每個題目都要寫特殊邏輯。

### 使用 Cargo feature flag 隔離 Faker 依賴

在 `Cargo.toml` 加入 `faker = ["dep:fake"]` feature。`ParamSpec::Faker` variant 用 `#[cfg(feature = "faker")]` 條件編譯。未啟用時，WASM binary 完全不包含 faker 相關程式碼和資料。

替代方案：永遠包含 faker → WASM 體積可能從 ~50KB 膨脹到數百 KB，不可接受。

### Faker category 使用 enum 限定可選類別

`FakerCategory` 為一個 Rust enum（如 `Name`、`Email`、`Company` 等），而非任意字串。這樣可以在編譯期確保安全，且避免使用者傳入不支援的 category。

替代方案：使用 `String` → 執行期才會報錯，除錯體驗差。

### Enum variant 的 values 不可為空

反序列化後檢查 `values.is_empty()`，若為空則回傳解析錯誤。這比在 rng 階段 panic 更早暴露問題。

### 修正 frontmatter 使用既有 + 新的 variant

- `type: string` + `len: 26`（rotor_wiring）→ `type: alpha_upper` + `min_len: 26, max_len: 26`
- `type: hex` → `type: hex_string`
- `len: N` → `min_len: N, max_len: N`
- `type: string` + `values: [...]` → `type: enum` + `values: [...]`

## Risks / Trade-offs

- **[Faker WASM 體積]** → 透過 feature flag 隔離，預設不啟用。啟用後需測量實際體積增量。
- **[Faker locale 支援]** → `fake` crate 預設產生英文資料。如需中文名需額外 locale 支援，暫不處理。
- **[Enum values 長度爆炸]** → 若使用者在 values 放入大量字串會增加 frontmatter 大小。實務上 values 不太會超過 10 個，暫不加上限。
