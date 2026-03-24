## Why

目前使用者點擊「Run」按鈕後，程式會對所有 testcase 執行並自動比對 verdict（AC/WA/TLE/RE）。使用者無法單純執行程式查看 stdout 輸出結果，每次都必須走完整個 judge 流程。新增「Execute」模式讓使用者能快速驗證程式邏輯、觀察輸出，降低開發與除錯的摩擦。

## What Changes

- 新增 **RunModal** 元件：點擊「Run」按鈕後彈出 modal，預設帶入 testcase[0] 的 input，使用者可自行修改
- 在 modal 內執行程式後直接顯示 stdout / error，不關閉 modal，可改 input 重跑
- Worker 新增 `execute` message type：只執行 code + stdin，回傳 raw stdout，不做 verdict 比對
- 原本的「Run」按鈕重新命名為「Submit」，保留現有 judge 流程不變
- `useExecutor` composable 新增 `execute(code, stdin)` 方法，管理 execute 的 worker 生命週期

## Capabilities

### New Capabilities

- `execute-mode`: 提供純執行（不比對 verdict）的程式碼執行模式，包含 modal UI、worker execute 協議、與 composable 整合

### Modified Capabilities

（無）

## Impact

- 受影響的程式碼：
  - `.vitepress/theme/workers/pyodide.worker.ts` — 新增 `execute` handler
  - `.vitepress/theme/workers/worker-utils.ts` — 可能新增 execute 相關工具函式
  - `.vitepress/theme/composables/useExecutor.ts` — 新增 `execute()` 方法
  - `.vitepress/theme/components/editor/RunButton.vue` — 改名或拆分為 Run + Submit
  - `.vitepress/theme/views/ChallengeView.vue` — 整合 RunModal 與新的 Run/Submit 按鈕邏輯
  - 新增 `.vitepress/theme/components/editor/RunModal.vue`
