## 1. 新增 CountSpec struct（parser.rs）

- [x] 1.1 以 CountSpec struct 封裝 min / max / separator：在 `parser.rs` 新增 `CountSpec { min: usize, max: usize, separator: String }` struct；separator 以 String 儲存於 CountSpec，預設空白（`" "`）；加入 `default_count_min()`、`default_count_max()`（均回傳 1）及 `default_separator()` 預設值函式，並為 `CountSpec` 實作 `Default` 及 `serde::Deserialize`
- [x] 1.2 將所有 `ParamSpec` variant 中的 `count: usize` 替換為 `count: CountSpec`，移除舊的 `default_repeat_count` 函式

## 2. 更新產生邏輯（rng.rs）

- [x] 2.1 更新 `generate_one`：從 `count.min`/`count.max` 隨機取得實際數量（separator 以 String 儲存於 CountSpec），使用 `count.separator` 串接值，實現「Rust WASM generates random inputs only」中的新行為
- [x] 2.2 加入 `debug_assert!(spec.count.min <= spec.count.max)` 防禦性斷言

## 3. 更新測試

- [x] 3.1 更新 `parser.rs` 中所有既有單元測試，使 `ParamSpec` 建構式符合 `count: CountSpec` 新格式
- [x] 3.2 新增 parser 測試：驗證 `count: { min: 2, max: 5 }` 正確反序列化為 `CountSpec`
- [x] 3.3 更新 `rng.rs` 中所有既有單元測試，使 `ParamSpec` 建構式符合新格式
- [x] 3.4 新增 rng 測試：驗證 `count.min < count.max` 時輸出值數量在範圍內（CountSpec with min and max generates variable number of values）
- [x] 3.5 新增 rng 測試：驗證自訂 separator 正確串接值（CountSpec with custom separator joins values correctly）

## 4. 建置與驗收

- [x] 4.1 執行 `cargo test` 確認所有測試通過
- [x] 4.2 執行 WASM 建置確認編譯無誤
