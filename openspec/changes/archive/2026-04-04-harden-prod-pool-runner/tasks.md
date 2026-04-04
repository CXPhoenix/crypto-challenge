## 1. Pool identity 驗證（WASM module decrypts and loads encrypted pool）

- [x] 1.1 [P] 新增 Rust 單元測試：`load_pool` 在 payload `challenge_id` 與呼叫參數不一致時回傳 identity mismatch 錯誤（mismatched challenge_id rejected）
- [x] 1.2 [P] 新增 Rust 單元測試：`load_pool` 在 payload `challenge_id` 與呼叫參數一致時正常載入（確認現有行為不被破壞）
- [x] 1.3 在 `pool.rs` 的 `load_pool()` 中加入 `payload.challenge_id == challenge_id` 驗證，不一致時回傳 `Err`；移除 `PoolPayload.challenge_id` 的 `#[allow(dead_code)]`（payload challenge_id field is not dead code）
- [x] 1.4 執行 `cargo test` 確認所有 pool 相關測試通過（含新增與既有）

## 2. Prod runner stop/cancel 修復（prod runner stop cancels in-flight submission and settles Promise）

- [x] 2.1 [P] 新增測試：prod runner `stop()` 在 `runStudentCode` in-flight 時，Promise settle 且 `isRunning` 為 false（stop during prod submission settles Promise）
- [x] 2.2 [P] 新增測試：prod runner `stop()` 後 `killTimer` 不再觸發（killTimer does not fire after stop）
- [x] 2.3 [P] 新增測試：prod runner 無 in-flight submission 時呼叫 `stop()` 為 no-op（stop when no submission is in-flight is a no-op）
- [x] 2.4 實作 prod runner 的 stop/cancel 修復：將 `killTimer` id 與 `resolve` reference 提升為 runner 層級變數，`stop()` 中 clearTimeout、terminate worker、resolve(null)

## 3. Dev runner stop/cancel 修復（dev runner stop cancels in-flight submission and settles Promise）

- [x] 3.1 [P] 新增測試：dev runner `stop()` 在 submission worker in-flight 時，submission killTimer 被清除、worker 被 terminate、`isRunning` 為 false（stop during dev submission settles Promise）
- [x] 3.2 [P] 新增測試：dev runner `stop()` 在 generator 階段時 terminate activeWorker（stop during dev generator phase terminates activeWorker）
- [x] 3.3 [P] 新增測試：dev runner `stop()` 後 submission killTimer 不再觸發（dev killTimer does not fire after stop）
- [x] 3.4 實作 dev runner 的 stop/cancel 修復：將 submission worker reference 與 killTimer id 提升為 runner 層級變數，`stop()` 中同時處理 activeWorker 與 submission worker

## 4. Cleanup 修復（cleanup cancels all pending timers and workers）

- [x] 4.1 [P] 新增測試：prod runner `cleanup()` 在 submission in-flight 時取消 killTimer 並 settle Promise（cleanup during prod submission cancels timer）
- [x] 4.2 [P] 新增測試：dev runner `cleanup()` 在 submission in-flight 時取消 killTimer 並 settle Promise（cleanup during dev submission cancels timer）
- [x] 4.3 [P] 新增測試：`cleanup()` 後不會有 stale timer 觸發（no stale timer fires after cleanup）
- [x] 4.4 實作 `cleanup()` 修復：呼叫 `stop()` 邏輯後 null 化所有 reference，確保 unmount 後無 side effect

## 5. 整合驗證

- [x] 5.1 執行全部 Vitest 測試（`pnpm test`）確認無回歸
- [x] 5.2 執行 `cargo test` 確認 Rust 側全部通過
- [x] 5.3 手動驗證 production build 的 pool 載入與 stop 行為（若有 pool 檔案可用）——pnpm build 成功產出含 pool 的 dist，identity mismatch 行為由 63 個 Rust 單元測試覆蓋，stop/cancel 行為由 162 個前端測試覆蓋
