## 1. Worker Testcase Result Data Stripping（Worker 回傳剝離邏輯）

- [x] [P] 1.1 在 `pyodide.worker.ts` 的 `RunRequest` 介面新增 `verdictDetail` 欄位（`'hidden' | 'actual' | 'full'`，預設 `'hidden'`），並更新 `TestcaseResult` 的 `expected` 和 `actual` 為 optional
- [x] [P] 1.2 實作 Worker Testcase Result Data Stripping：修改 Worker run handler，根據 `verdictDetail` 設定決定 `TestcaseResult` 是否帶回 `expected` / `actual` 欄位

## 2. Challenge Store Data Stripping（challengeStore 資料剝離）

- [x] 2.1 實作 Challenge Store Data Stripping：修改 `ChallengeView.vue`，根據 Verdict Detail Frontmatter Field 決定是否將 `expected_output` 存入 challengeStore（challengeStore 資料剝離）：`hidden` / `actual` 時只存 `{ input }[]`，完整 testcases 保留在 component local 變數；`full` 時維持現行行為
- [x] 2.2 修改 `handleSubmit()` 從 component local 變數（而非 challengeStore）取出完整 testcases 傳給 Worker，並帶入 `verdictDetail` 設定

## 3. Test Result Panel Verdict Detail Display（TestResultPanel 三種顯示模式）

- [x] 3.1 實作 Test Result Panel Verdict Detail Display：在 `TestResultPanel.vue` 新增 `verdictDetail` prop（預設 `'hidden'`），根據值切換 WA 詳細欄：`hidden` 不顯示、`actual` 只顯示實際輸出、`full` 顯示預期 + 實際（現行行為）
- [x] 3.2 在 `ChallengeView.vue` 中將 frontmatter `verdict_detail`（verdictDetail 欄位傳遞路徑）傳遞至 TestResultPanel prop

## 4. 測試

- [x] [P] 4.1 Worker data stripping 測試：驗證三種 verdictDetail 模式下 TestcaseResult 回傳的欄位內容
- [x] [P] 4.2 TestResultPanel 測試：驗證三種 verdictDetail 模式下 WA 詳細欄的顯示內容
- [x] [P] 4.3 ChallengeView 整合測試：驗證 challengeStore 在 hidden 模式下不含 expected_output
