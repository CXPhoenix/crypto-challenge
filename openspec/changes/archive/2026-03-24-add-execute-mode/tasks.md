## 1. Worker Execute 協議

- [x] [P] 1.1 在 `pyodide.worker.ts` 新增 `ExecuteRequest` / `ExecuteResult` 型別定義，實作 Execute Request Worker Protocol handler（ensurePyodide → globals.clear → buildWrappedCode → runPythonAsync → postMessage execute_result）
- [x] [P] 1.2 在 `worker-utils.ts` 補充 `ExecuteResult` export type（若需要）

## 2. Execute Composable Method（useExecutor 擴展）

- [x] 2.1 在 `useExecutor.ts` 新增 Execute Composable Method：`execute(code, stdin): Promise<ExecuteResult>`，建立 fresh Worker、傳送 ExecuteRequest、監聽 execute_result、wall-clock kill timer 6 秒（useExecutor 擴展）

## 3. Run Modal UI（RunModal 元件架構）

- [x] 3.1 建立 Run Modal UI 元件 `RunModal.vue`（RunModal 元件架構）：modal 外框、stdin textarea（可編輯）、output 顯示區（唯讀）、Execute 按鈕、Close 按鈕
- [x] 3.2 RunModal 整合 `useExecutor.execute()`：點擊 Execute 時送出請求、顯示 loading 狀態、回傳後顯示 stdout 或 error
- [x] 3.3 RunModal 處理關閉時 terminate Worker（onUnmounted / close handler）
- [x] 3.4 RunModal 預設 stdin 邏輯：testcase 就緒時帶入 testcase[0].input，未就緒時為空字串

## 4. Button Layout Split

- [x] 4.1 實作 Button Layout Split：將現有 `RunButton.vue` 修改為 Submit 按鈕（文字改為「提交」，保留原有 disabled/loading/running 狀態邏輯）
- [x] 4.2 在 `ChallengeView.vue` 按鈕列新增「執行」按鈕（觸發 RunModal），按鈕順序：[▶ 執行] [📤 提交]
- [x] 4.3 「執行」按鈕不需等 testcase 就緒即可啟用，「提交」按鈕維持原有 isTestcaseReady 限制

## 5. 測試

- [x] [P] 5.1 Worker execute handler 單元測試：成功執行、runtime error、TLE 三個 scenario
- [x] [P] 5.2 RunModal 元件測試：開啟/關閉、execute 觸發、stdin 預設值、re-execute
- [x] [P] 5.3 按鈕拆分整合測試：兩顆按鈕可見、Run 按鈕 testcase 未就緒時仍可點擊、Submit 走原有 judge 流程
