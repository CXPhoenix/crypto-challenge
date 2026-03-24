## Why

目前 judge 結果（TestResultPanel）在 WA 時會直接顯示預期答案（`expected`），等於洩漏正確解答。此外 `expected_output` 存在 challengeStore 與 executorStore 中，使用者可透過 DevTools 直接讀取。需要在資料層（L2）做剝離，讓 expected output 不進入 main thread 的可觀察狀態，同時讓關卡設計者可透過 frontmatter 選擇顯示層級。

## What Changes

- 新增 frontmatter 欄位 `verdict_detail`：`hidden`（預設）| `actual` | `full`，控制 WA 時的詳細資訊顯示層級
- Worker 端根據 `verdict_detail` 設定，決定 `TestcaseResult` 是否帶回 `expected` / `actual` 欄位
- `challengeStore` 在 `verdict_detail` 非 `full` 時不存 `expected_output`，只存 `input`
- `TestResultPanel` 新增 `verdictDetail` prop，根據設定切換 WA 詳細欄顯示模式
- `ChallengeView` 從 frontmatter 讀取 `verdict_detail` 並傳遞至 Worker 與 TestResultPanel

## Capabilities

### New Capabilities

- `verdict-detail-control`: 控制 judge 結果中預期輸出的顯示與資料傳遞層級，含 frontmatter 設定、Worker 資料剝離、UI 顯示切換

### Modified Capabilities

（無）

## Impact

- 受影響的程式碼：
  - `.vitepress/theme/workers/pyodide.worker.ts` — RunRequest 新增 `verdictDetail` 欄位，TestcaseResult 根據設定剝離 `expected` / `actual`
  - `.vitepress/theme/stores/challenge.ts` — `GeneratedChallenge.testcases` 根據設定只存 `input`
  - `.vitepress/theme/components/editor/TestResultPanel.vue` — 新增 `verdictDetail` prop，WA 詳細欄三種模式
  - `.vitepress/theme/views/ChallengeView.vue` — 從 frontmatter 讀取 `verdict_detail` 並串接
  - `docs/challenge/*.md` — 可選擇性加入 `verdict_detail` 欄位
