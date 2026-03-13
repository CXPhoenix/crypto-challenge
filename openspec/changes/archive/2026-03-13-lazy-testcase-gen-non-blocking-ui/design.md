## Context

目前 `ChallengeView.vue` 在 `onMounted` 中以序列阻塞方式執行 testcase 生成：

1. **Phase 1**：呼叫 `generateChallenge(paramsJson, testcaseCount)`（WASM 同步生成隨機輸入）
2. **Phase 2**：spawn Pyodide Worker，傳送 `generate` 訊息，等待 `generate_complete` 回應（Python 執行 generator 產生 expected outputs）

在 `isGenerating = true` 期間，左側 panel 顯示 skeleton placeholder，`ProblemPanel`、`CodeEditor` 及 `RunButton` 均不可用。Pyodide 首次冷啟動（下載 runtime + wasm）加上 Python 執行耗時可達數秒至數十秒。

`TestResultPanel` 目前高度固定為 `max-h-56`（14rem），無法讓使用者調整，測試案例較多時閱讀不方便。

## Goals / Non-Goals

**Goals:**

- 題目頁面掛載後立即渲染 `ProblemPanel` 與 `CodeEditor`，使用者可立即閱讀題目與撰寫程式
- Testcase 生成在背景執行，不阻塞主執行緒 UI 更新
- `RunButton` 在生成期間 disabled 並顯示進度提示（非空白狀態），生成完成後自動啟用
- `TestResultPanel` 支援垂直拖曳調整高度，最大不超過右側 panel 高度的 50%

**Non-Goals:**

- 跨題目預先快取 testcase（不在本 change 範圍）
- 將 WASM 生成移至 Service Worker 或 SharedWorker
- 改變 Pyodide Worker 內部執行邏輯

## Decisions

### 移除 isGenerating 對 ProblemPanel 的阻塞

**決策**：拆分「UI 顯示」與「testcase 生成」的時序，`onMounted` 不再 `await` 生成流程，改為啟動後立即讓 Vue 渲染 `ProblemPanel`。

生成函式改為 fire-and-forget（內部 async IIFE），透過 `isTestcaseReady` 的 reactive state 通知 UI 生成完成。

**替代方案**：將生成移至 Pinia store action，由 store 管理狀態。考量到生成邏輯目前仍與 `ChallengeView` 的 frontmatter 耦合，暫不移動，避免增加複雜度。

### RunButton 新增 isReady prop

**決策**：`RunButton` 新增 `isReady: boolean` prop。當 `isReady = false` 時，按鈕改為 disabled 樣式並顯示「生成中...」文字與 spinner，取代原本的 play icon 與「執行」文字。

不使用全域 store 的 `testcaseReady` flag，維持 props-down 的資料流。`ChallengeView` 持有 `isTestcaseReady` ref，傳入 `RunButton`。

### TestResultPanel 高度改為可拖曳

**決策**：`TestResultPanel` 移除 `max-h-56` 固定高度，改為由外部 `height` style 控制，並在內部加入拖曳 handle（頂部邊框）。拖曳 handle 向上拖曳時增加高度，向下拖曳時減少高度，最小高度 `80px`，最大高度為容器（右側 panel）的 `50%`。

容器高度透過 `ResizeObserver` 取得，避免依賴視窗尺寸（使用者可調整左右 split）。

**替代方案**：在 `SplitPane` 內新增水平 splitter。這會增加 `SplitPane` 的複雜度，且語意上 result panel 屬於 editor 區塊，在 `TestResultPanel` 自身管理更自然。

## Risks / Trade-offs

- **[Risk] 使用者在 testcase 生成完成前切換至其他題目** → `ChallengeView` unmount 時（onUnmounted）terminate Worker，並清除 `isTestcaseReady` 狀態，避免舊 Worker 回呼污染新題目
- **[Risk] 拖曳 handle 在觸控裝置上體驗差** → 本 change 僅支援 mouse drag，不處理 touch events（非目標平台）
- **[Risk] ResizeObserver 在 SSR/VitePress build 時報錯** → 以 `typeof window !== 'undefined'` guard，或在 `onMounted` 內初始化

## Migration Plan

純前端修改，無 API 或資料格式變動，不需要遷移計畫。部署為直接替換靜態資源。
