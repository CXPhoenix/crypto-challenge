## 1. 修正 Prod Runner postMessage 序列化

- [x] 1.1 在 `useChallengeRunner.ts` 的 `runStudentCode` 函式中，將 `postMessage` 的 `inputs` 欄位改為 `[...codeInputs]`，確保傳送的是 structured-clone 相容的純 JS 陣列，滿足「Prod strategy uses encrypted pool + WASM judge flow」中 inputs 須為 plain JavaScript Array 的需求

## 2. 驗證

- [x] 2.1 [P] 執行既有的 `useChallengeRunner-prod` 測試套件，確認「Prod mode inputs passed to Worker are structured-clone-compatible」場景通過
- [x] 2.2 [P] 執行 `pnpm build && pnpm docs:preview`，在瀏覽器中開啟任意題目並點擊提交，確認不再出現 `DataCloneError` 且判定結果正常顯示
