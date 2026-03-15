## Why

目前 `ParamSpec` 的 `count` 欄位為固定值，無法動態決定每次產生幾個值；分隔符號也硬編碼為空格，無法因應不同題目格式（如逗號、換行等）的需求。

## What Changes

- 新增 `CountSpec` struct，包含 `min: usize`、`max: usize`、`separator: String` 三個欄位
- 將所有 `ParamSpec` variant 中的 `count: usize` 替換為 `count: CountSpec`
- `CountSpec` 預設值：`min = 1`、`max = 1`、`separator = " "`（單一空白），使行為向後相容
- 更新 `rng.rs` 的 `generate_one` 從 `CountSpec` 中取得隨機數量並使用自訂 separator

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `python-generator`: `ParamSpec` 中的 `count` 欄位改為 `CountSpec` struct，封裝 `min`、`max`、`separator`

## Impact

- Affected specs: `python-generator`
- Affected code:
  - `testcase-generator/src/parser.rs` — 更新 `ParamSpec` struct 欄位定義及預設值函式
  - `testcase-generator/src/rng.rs` — 更新 `generate_one` 使用隨機 count 與 separator
