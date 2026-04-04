## 1. Rust：select_testcases 回傳 verdict_detail

- [x] [P] 1.1 TDD（WASM module selects random testcases with session tracking / Decision 1：透過 `select_testcases` 回傳 `verdict_detail`）：在 `testcase-generator/src/pool.rs` 的 `#[cfg(test)]` 區塊新增測試 `select_returns_verdict_detail`，驗證 `select_testcases` 回傳的 tuple 包含第三個元素 `VerdictDetail`，且值與 pool 載入時的 `verdict_detail` 一致。測試分別驗證 `Hidden`、`Actual`、`Full` 三種值
- [x] 1.2 實作（WASM module selects random testcases with session tracking / Decision 1：透過 `select_testcases` 回傳 `verdict_detail`）：修改 `pool.rs` 的 `select_testcases` 函式簽名，回傳 `Result<(String, Vec<String>, VerdictDetail), String>`，從 `pool.verdict_detail` 取值。同步修改 `lib.rs` 的 WASM export `SelectResult` struct 加入 `verdict_detail: String` 欄位（序列化為 `"hidden"` / `"actual"` / `"full"`）
- [x] 1.3 更新 `.vitepress/theme/composables/useChallengeRunner.ts` 中 `WasmPoolMod` type 的 `select_testcases` 回傳型別，加入 `verdict_detail: string`（限制條件：`wasm_bindgen` + `serde_wasm_bindgen` 序列化需與 TypeScript 型別一致）

## 2. Worker：新增 RunOnlyRequest 訊息類型

- [x] [P] 2.1 TDD（RunRequest does not carry expected_output in production mode / Decision 2：新增 `RunOnlyRequest` 訊息類型）：新增 `.vitepress/theme/__tests__/pyodide-worker-run-only.spec.ts`，驗證 `RunOnlyRequest` 介面的型別簽名（`type: 'run_only'`, `code: string`, `inputs: string[]`, `opLimit?: number`），以及回傳的 `testcase_result` 訊息不包含 `verdict`、`expected`、`actual` 欄位
- [x] 2.2 實作（RunRequest does not carry expected_output in production mode / Decision 2：新增 `RunOnlyRequest` 訊息類型）：在 `pyodide.worker.ts` 定義 `RunOnlyRequest` 介面（`{ type: 'run_only', code, inputs, opLimit? }`），在 worker 的 `onmessage` handler 新增 `'run_only'` case——對每個 input 執行學生程式碼，回傳 `{ type: 'testcase_result', index, stdout, error?, elapsed_ms }`，最後發送 `{ type: 'run_complete' }`。不執行比較邏輯、不接收 `verdictDetail`

## 3. Frontend：verdictDetail source-of-truth 與 RunOnlyRequest 整合

- [x] 3.1 TDD（Prod strategy uses encrypted pool + WASM judge flow / Decision 3：`useProdRunner` verdictDetail 改為 reactive ref / Verdict Detail Frontmatter Field）：新增 `useChallengeRunner` prod path 測試，mock WASM module 的 `select_testcases` 回傳 `{ inputs, session_id, verdict_detail: 'actual' }`，驗證 runner 暴露的 `verdictDetail` reactive ref 值為 `'actual'` 而非 frontmatter 的 `'hidden'`
- [x] 3.2 實作（Decision 3：`useProdRunner` verdictDetail 改為 reactive ref）：`useProdRunner` 內新增 `const poolVerdictDetail = ref<VerdictDetail>('hidden')`，在 `loadTestcases` 與 `submit` 後的 `select_testcases` 呼叫中從回傳值更新。回傳改為 `verdictDetail: poolVerdictDetail`，取代 `config.verdictDetail`
- [x] 3.3 TDD（Prod strategy uses encrypted pool + WASM judge flow）：新增 `useChallengeRunner` prod path 測試，驗證 `submit()` 時 worker 收到的訊息是 `RunOnlyRequest`（`type: 'run_only'`），不包含 `testcases`、`expected_output`、`verdictDetail`
- [x] 3.4 實作：`useProdRunner` 的 `runStudentCode` 函式改用 `RunOnlyRequest` 格式（`{ type: 'run_only', code, inputs }`），移除 `testcases` mapping 和 `verdictDetail: 'actual'`。調整 worker `onmessage` handler 以匹配新的回傳格式（直接讀取 `stdout`、`error`、`elapsed_ms`）
- [x] 3.5 TDD（Verdict Detail Frontmatter Field）：新增 `ChallengeView` prod mode 測試，驗證 `TestResultPanel` 的 `verdict-detail` prop 來自 pool（runner.verdictDetail），而非 frontmatter 的 `resolveVerdictDetail` 結果
- [x] 3.6 實作：`ChallengeView.vue` 在 prod mode 使用 `runner.verdictDetail`（來自 pool）傳給 `TestResultPanel`，不再直接使用 `resolveVerdictDetail(frontmatter.verdict_detail)` 的結果。Dev mode 行為不變

## 4. 清理與驗證

- [x] 4.1 移除 `useChallengeRunner.ts` 中 `runStudentCode` 的過渡性註解（lines 378-382），因為 `RunOnlyRequest` 已正式取代舊做法（Decision 4：Spec 更新策略 — 加入 Current State 段落——過渡期結束，不再需要 Current State 記錄）
- [x] 4.2 執行 `cargo test -p testcase-generator` 確認所有 Rust 測試通過（Decision 5：測試策略——驗證 WASM module selects random testcases with session tracking 的行為變更）
- [x] 4.3 執行 `pnpm test` 確認所有前端測試通過（Decision 5：測試策略——覆蓋 prod path 測試與 run_only worker 測試）
- [x] 4.4 執行 `pnpm build:wasm` 確認 WASM 編譯成功（SelectResult struct 變更不造成 wasm-pack 錯誤）
