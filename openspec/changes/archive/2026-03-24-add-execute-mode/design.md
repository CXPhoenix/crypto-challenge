## Context

目前 ChallengeView 只有一個「執行」按鈕（RunButton），點擊後走完整 judge 流程：對所有 testcase 執行使用者程式碼、比對 expected output、產生 verdict（AC/WA/TLE/RE）。使用者無法單純執行程式觀察 stdout 輸出。

現有 Worker 協議支援三種 message type：`run`（judge）、`generate`（產生 testcase）、`preload`（預熱 Pyodide）。`useExecutor` composable 管理 worker 生命週期，`executorStore` 追蹤 judge 結果。

## Goals / Non-Goals

**Goals:**

- 使用者能透過 modal 輸入自訂 stdin，執行程式碼並查看 raw stdout
- modal 內可反覆修改 input 重跑，不需關閉重開
- execute 模式複用現有 sandbox guard、op-limit、namespace cleanup
- 原有 judge 流程完全不受影響

**Non-Goals:**

- 不做多筆 input 批次執行
- 不在 modal 內顯示 verdict 比對
- 不修改 executor store 的 judge 狀態（execute 結果為 modal local state）
- 不做執行歷史紀錄

## Decisions

### Worker execute 協議

新增 `ExecuteRequest` / `ExecuteResult` message type，與現有 `run` 平行：

```typescript
// Request
{ type: 'execute', code: string, stdin: string, opLimit?: number }

// Response
{ type: 'execute_result', stdout: string, error?: string, elapsed_ms: number }
```

Worker 內部流程：`ensurePyodide()` → `globals.clear()` → `buildWrappedCode(code, stdin, opLimit)` → `runPythonAsync()` → 取 `_output` → postMessage。

不做 `computeVerdict()`，不回傳 verdict。TLE/RE 統一透過 `error` 欄位回報。

**替代方案：** 複用現有 `run` type 傳一筆 testcase，前端忽略 verdict。被否決，因為語意不清且會汙染 executor store 狀態。

### RunModal 元件架構

`RunModal.vue` 為獨立元件，自行管理 local state（不進 Pinia store）：

```
State:
  - isOpen: boolean
  - stdin: string（預設 testcase[0].input）
  - stdout: string
  - error: string | null
  - elapsed_ms: number
  - isExecuting: boolean
```

Modal 內建立 fresh Worker、postMessage `ExecuteRequest`、監聽 `execute_result`。執行完畢後 terminate Worker。使用者可修改 stdin 後重新執行，每次建立新 Worker。

wall-clock kill timer（6 秒）由 modal 內部管理，與 `useExecutor` 的 judge kill timer 互不干擾。

### 按鈕拆分

原 `RunButton.vue` 改為 `SubmitButton.vue`（或在內部將文字改為「提交」），新增獨立的「執行」按鈕觸發 modal。

按鈕列佈局：`[▶ 執行] [📤 提交]`，「執行」在左（較常用），「提交」在右。

**替代方案：** 將兩個按鈕合為 dropdown split button。被否決，增加點擊次數，且兩個操作使用頻率相近。

### useExecutor 擴展

在 `useExecutor` composable 新增 `execute(code: string, stdin: string): Promise<ExecuteResult>` 方法。此方法建立 fresh Worker、傳送 `ExecuteRequest`、回傳 Promise resolve 為 `ExecuteResult`。不經過 executor store。

替代做法是直接在 RunModal 內管理 Worker。但透過 composable 統一 Worker 建立邏輯（import URL、type: module）較一致，且 kill timer 邏輯可複用。

## Risks / Trade-offs

- **同時開 judge + execute Worker：** 使用者可能在 execute modal 開啟時按下 Submit。兩個 Worker 並行執行沒有衝突（各自獨立），但會消耗雙倍記憶體。→ 可接受，Pyodide Worker 記憶體佔用在行動裝置上也在合理範圍。
- **modal 內 Worker 未正常 terminate：** 使用者關閉 modal 時若 Worker 仍在執行。→ 在 modal 的 `onUnmounted` / close handler 中 terminate Worker。
- **testcase 尚未生成時按執行：** stdin 預設值尚未就緒。→ 「執行」按鈕與「提交」按鈕共用 `isTestcaseReady` 狀態，未就緒時兩者皆 disabled。或者允許「執行」按鈕在 testcase 未就緒時也可使用（stdin 預設留空），因為使用者可自行輸入。後者更彈性——採用此方案：「執行」按鈕不需等 testcase 就緒，預設 stdin 為空字串，testcase 就緒後才帶入 testcase[0].input。
