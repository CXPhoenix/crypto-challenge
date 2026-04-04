## Why

Production runner 的主幹流程（fetch pool → load_pool → select_testcases → worker 執行 → WASM judge）已經落地，但實作與 spec 之間存在三個未收束的落差：

1. **`verdict_detail` source-of-truth 錯置**：`useProdRunner` 回傳的 `verdictDetail` 來自 frontmatter（`config.verdictDetail`），而非 encrypted pool。WASM judge 內部正確使用 pool 的值做 field stripping，但 UI 側（`TestResultPanel`）拿到的是 frontmatter 值。一旦任何 challenge 設定 `verdict_detail` 且 frontmatter 與 pool 不一致，UI 會顯示 undefined 欄位或錯誤隱藏已回傳資料。目前 8 個 challenge 都未設定此欄位，所以衝突被預設值 `hidden` 遮蔽。
2. **Worker 協議未分離**：Production mode 仍使用 `RunRequest { testcases: [{input, expected_output: ''}], verdictDetail: 'actual' }` 送進 worker，worker 執行無意義的比較後丟棄結果。Spec 要求 production 只傳 `{ code, inputs }`。
3. **Spec 未反映過渡狀態**：三份 spec（challenge-runner-orchestration、python-generator、verdict-detail-control）描述的是目標架構，但沒有記錄目前的過渡實作，也沒有定義明確的遷移路徑。

這三個問題在當前 challenge 組合下不會爆炸，但會在 staging 部署後新增 `verdict_detail: actual/full` 的 challenge 時立即觸發。現在修比事後除錯便宜。

## What Changes

- **P0**：`select_testcases` WASM export 增加回傳 `verdict_detail` 欄位；`useProdRunner` 改讀 pool 回傳值作為 `verdictDetail` source-of-truth，取代 frontmatter 值
- **P1**：Worker 新增 `RunOnlyRequest` 訊息類型（`{ type: 'run_only', code, inputs, opLimit? }`），production runner 改用此類型，worker 只執行、不比較、不接收 `verdictDetail`
- **P1**：更新三份 spec 加入「Current State」段落，記錄過渡實作並標注遷移方向
- **P1**：為 production path 補寫前端整合測試（pool fetch → load → select → judge → UI verdict_detail 一致性）

## Non-Goals

- **不改動 dev mode**：開發模式的 `RunRequest` 協議與 `verdictDetail` 直傳行為維持不變
- **不改動 WASM judge 內部邏輯**：judge.rs 的 constant-time comparison、field stripping 已正確，不需修改
- **不處理 build pipeline 環境相依**：`pnpm build` 對 Python3/pyyaml 的依賴是 ops 層級問題，屬於獨立 change 的範疇
- **不新增 E2E 測試**：完整的 generate → encrypt → fetch → decrypt → judge 端到端測試列為 P2 debt，不在此 change 範圍

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `wasm-pool-judge`：`select_testcases` WASM export 的回傳值新增 `verdict_detail` 字串欄位
- `challenge-runner-orchestration`：production runner 改讀 pool 回傳的 `verdict_detail` 作為 source-of-truth；verdictDetail 不再從 frontmatter 直傳
- `python-generator`：新增 `RunOnlyRequest` worker 訊息類型供 production mode 使用，取代現行帶空 `expected_output` 的 `RunRequest`
- `verdict-detail-control`：spec 加入「Current State」段落記錄過渡實作，並明確標注 production mode 以 pool 為 source-of-truth 的要求

## Impact

- 受影響 spec：`wasm-pool-judge`、`challenge-runner-orchestration`、`python-generator`、`verdict-detail-control`
- 受影響程式碼：
  - `testcase-generator/src/pool.rs`（select_testcases 回傳值）
  - `testcase-generator/src/lib.rs`（WASM export SelectResult struct）
  - `.vitepress/theme/composables/useChallengeRunner.ts`（prod runner verdictDetail source + RunOnlyRequest）
  - `.vitepress/theme/workers/pyodide.worker.ts`（處理 RunOnlyRequest 訊息）
  - `.vitepress/theme/views/ChallengeView.vue`（prod mode verdictDetail 改從 runner 取得）
  - `.vitepress/theme/__tests__/`（新增 prod path 整合測試）
