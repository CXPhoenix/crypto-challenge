## Context

`testcase-generator` 是一個 Rust/WASM 模組，負責從 `ParamSpec` 定義中隨機產生測試資料。目前每個 `ParamSpec` variant 含有一個基本型別 `count: usize`（預設 1），產生時以空格串接多個值，但分隔符號硬編碼於 `rng.rs`，不可自訂且難以維護。

## Goals / Non-Goals

**Goals:**

- 引入 `CountSpec` struct，將 `min`、`max`、`separator` 封裝為單一可維護單元
- 各 `ParamSpec` variant 的 `count` 欄位型別改為 `CountSpec`
- 保持向後相容：省略 `count` 或其內部欄位時行為與現在相同
- 更新所有受影響的單元測試

**Non-Goals:**

- 不修改 WASM API 簽章（`generate_challenge` 參數不變）
- 不支援跨 param 的共用 separator
- 不修改前端程式碼

## Decisions

### 以 CountSpec struct 封裝 min / max / separator

引入新型別 `CountSpec { min: usize, max: usize, separator: String }`，預設值均為 `min = 1`、`max = 1`、`separator = " "`。每個 `ParamSpec` variant 的 `count` 欄位從 `usize` 改為 `CountSpec`。

好處：
- 未來若需增加更多 count 相關屬性（如 `distribution` 等），只需修改 `CountSpec` 而非所有 variant
- 語意明確，呼叫端可清楚知道 `count.min`、`count.max`、`count.separator` 的用途

替代方案：直接在每個 variant 展開 `min_count`、`max_count`、`separator` 三個欄位——欄位較分散，未來維護成本較高，故不採用。

### separator 以 String 儲存於 CountSpec，預設空白

`separator` 宣告為 `String`，使用自訂 serde default function `default_separator()` 回傳 `" ".to_string()`。設計上允許任意 UTF-8 字串（含換行符 `\n`、逗號等），但不做格式驗證。

`CountSpec` 本身使用 `#[serde(default)]` 整體套用預設，使 JSON 中省略 `count` 物件時整個 `CountSpec` 取預設值。

## Risks / Trade-offs

- **[Risk]** `CountSpec` 的 `min > max` 會在 runtime panic → **Mitigation**: 在 `generate_one` 加入 `debug_assert!(count_spec.min <= count_spec.max)` 以快速暴露錯誤。
- **[Risk]** 既有 JSON params 中若有純數字 `"count": 3` 將無法反序列化為 `CountSpec` → **Mitigation**: 目前 challenge `.md` 的 frontmatter 尚未在正式題目中使用 `count > 1`，遷移成本低；文件需說明新格式為物件而非純數字。
