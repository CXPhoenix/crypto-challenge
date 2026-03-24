## Context

目前 judge 流程中，`expected_output` 在以下位置暴露：
1. `challengeStore.currentChallenge.testcases[].expected_output` — DevTools 可讀
2. `RunRequest.testcases[].expected_output` — postMessage 可攔截
3. `TestcaseResult.expected` — Worker 回傳後進入 executorStore
4. `TestResultPanel` WA 欄直接顯示 expected 值

本次變更的目標是做到 L2（資料剝離）防護：expected_output 不進入 main thread 的可觀察狀態（store / UI）。

## Goals / Non-Goals

**Goals:**

- 關卡設計者可透過 frontmatter `verdict_detail` 欄位選擇 WA 時顯示的資訊層級
- 預設為 `hidden`（不顯示任何 expected / actual）
- expected_output 在 `hidden` 與 `actual` 模式下不存入 challengeStore、不回傳至 main thread
- 已有的 `full` 行為（顯示 expected + actual）作為 opt-in 選項保留

**Non-Goals:**

- 不做 L3（Worker 內閉環）防護——expected_output 仍會在 RunRequest 中傳送給 Worker
- 不隱藏 frontmatter 中的 generator 程式碼（需 server-side 方案）
- 不修改 execute mode（RunModal），execute mode 本來就不做比對

## Decisions

### verdictDetail 欄位傳遞路徑

frontmatter `verdict_detail` 由 `ChallengeView` 讀取後，需傳遞到兩個消費端：

1. **Worker**：透過 `RunRequest` 新增 `verdictDetail` 欄位。Worker 在建構 `TestcaseResult` 時根據此欄位決定是否帶回 `expected` / `actual`。
2. **TestResultPanel**：透過 prop 傳入，決定 WA 詳細欄的渲染模式。

替代方案：在 main thread 的 `useExecutor` 回傳後再剝離。被否決——資料已經通過 postMessage 進入 main thread，DevTools 的 Performance / Network 面板仍可攔截。

### challengeStore 資料剝離

`verdict_detail` 為 `hidden` 或 `actual` 時，`challengeStore` 只存 `{ input }[]`，不存 `expected_output`。

但 `RunRequest` 仍需要 `expected_output` 讓 Worker 做比對。因此 `ChallengeView` 需要在 generate 完成後：
- 將完整 testcases（含 expected_output）暫存在 component local 變數中（不進 store）
- 只將 `{ input }[]` 存入 challengeStore
- Submit 時從 local 變數取出完整 testcases 傳給 Worker

`verdict_detail` 為 `full` 時，維持現行行為——完整 testcases 存入 store。

### Worker 回傳剝離邏輯

Worker 根據 `RunRequest.verdictDetail` 決定 `TestcaseResult` 的內容：

| verdictDetail | `expected` 欄位 | `actual` 欄位 |
|---------------|----------------|---------------|
| `hidden`      | 不回傳          | 不回傳         |
| `actual`      | 不回傳          | 回傳           |
| `full`        | 回傳            | 回傳           |

`verdict`（AC/WA/TLE/RE）永遠回傳——使用者知道對錯，但不知道答案。

### TestResultPanel 三種顯示模式

| verdictDetail | WA 詳細欄顯示內容 |
|---------------|-------------------|
| `hidden`      | （空白，只顯示 WA badge） |
| `actual`      | `實際 HELLO` |
| `full`        | `預期 KHOOR，實際 HELLO`（現行行為） |

## Risks / Trade-offs

- **RunRequest 仍含 expected_output**：使用者可攔截 postMessage 讀取。這是 L2 的已知限制，L3 可解決但架構改動大。→ 接受此風險，文件註明防護層級。
- **Generator 程式碼可見**：frontmatter 中的 generator Python 程式碼在 build 後仍在 JS bundle 中。→ 不在本次範圍，需 server-side 方案。
- **向後相容**：既有挑戰頁面未設定 `verdict_detail`，預設為 `hidden`。如果關卡設計者希望保留現有行為，需手動加 `verdict_detail: full`。→ 這是預期的安全優先策略。
