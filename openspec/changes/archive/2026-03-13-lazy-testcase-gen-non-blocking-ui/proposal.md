## Why

目前進入題目頁面時，WASM 生成隨機輸入與 Pyodide Worker 執行 generator 的兩階段流程會阻擋整個 UI，使用者必須等待所有 testcase 生成完畢才能看到題目與程式碼編輯器，造成感知上的長時間等待。此外，測試結果區塊高度固定，無法調整，影響大量測試案例時的可讀性。

## What Changes

- `ChallengeView` 移除載入時的阻塞等待：題目說明（`ProblemPanel`）與程式碼編輯器（`CodeEditor`）在頁面掛載時立即顯示，不再等待 testcase 生成
- Testcase 生成改為背景非同步執行，僅在使用者進入該題頁面時才觸發（不再預先批次生成）
- `RunButton` 新增 `disabled` 狀態：生成期間按鈕呈現 loading 指示並無法點擊，生成完成後才可使用
- `TestResultPanel` 改為可拖曳調整高度，最大高度上限為右側 panel 的 50%

## Capabilities

### New Capabilities

- `non-blocking-challenge-load`: 題目頁面立即渲染，testcase 在背景生成；Run 按鈕在生成期間 disabled 並顯示 loading 狀態
- `resizable-result-panel`: TestResultPanel 支援垂直拖曳調整高度，上限為所在容器（右側 panel）的 50%

### Modified Capabilities

- `python-generator`: ChallengeView 的 generator 執行時機改為使用者進入題目時才觸發，且不再阻塞 UI 渲染

## Impact

- 受影響的 spec：`python-generator`（execution timing 改變）
- 受影響的程式碼：
  - `.vitepress/theme/views/ChallengeView.vue`（核心載入邏輯）
  - `.vitepress/theme/components/editor/RunButton.vue`（新增 disabled / loading prop）
  - `.vitepress/theme/components/editor/TestResultPanel.vue`（拖曳調整高度）
  - `.vitepress/theme/stores/executor.ts`（可能需要新增 testcase-ready 狀態）
