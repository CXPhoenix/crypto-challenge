## 1. ChallengeView 非阻塞載入重構

- [x] 1.1 移除 isGenerating 對 ProblemPanel 的阻塞：刪除 `ChallengeView.vue` 中 `isGenerating` 控制左側 skeleton 的 `v-if`，改為讓 `ProblemPanel` 在頁面掛載時立即渲染（Requirement: Challenge UI renders immediately without waiting for testcase generation）
- [x] 1.2 將 testcase 生成改為非阻塞背景任務：將 `onMounted` 中的 `await` 生成流程改為 fire-and-forget async IIFE，新增 `isTestcaseReady` ref，在兩階段生成完成且 store 更新後設為 `true`（Requirement: ChallengeView orchestrates two-phase testcase generation）
- [x] 1.3 實作 Worker 在 unmount 時終止：在 `onUnmounted` 中 terminate 任何尚在執行的 Pyodide Worker，並清除 `isTestcaseReady` 狀態（Requirement: Worker is terminated on component unmount）
- [x] 1.4 寫單元測試驗證非阻塞行為：確認 `onMounted` 後 `ProblemPanel` 立即可見，且 `isTestcaseReady` 初始值為 `false`，生成完成後為 `true`

## 2. RunButton 新增 isReady 狀態

- [x] 2.1 RunButton 新增 `isReady` prop 與 disabled 樣式：加入 `isReady: boolean` prop，當 `isReady = false` 時顯示 loading spinner 與「生成中...」文字，禁止點擊（RunButton 新增 isReady prop；Requirement: Run button is disabled until testcases are ready）
- [x] 2.2 更新 `ChallengeView` 傳遞 `isTestcaseReady` 給 `RunButton`
- [x] 2.3 寫單元測試驗證 `RunButton` disabled/enabled 狀態切換

## 3. TestResultPanel 可拖曳調整高度

- [ ] 3.1 移除 TestResultPanel 固定 max-h-56：移除 `max-h-56` Tailwind class，改由動態 `height` style 控制（Requirement: TestResultPanel removes fixed max-height）
- [ ] 3.2 實作拖曳 handle 與高度調整邏輯：在 `TestResultPanel` 頂部加入拖曳 handle（drag bar），使用 mousedown/mousemove/mouseup 事件計算 height 變化，最小 `80px`，最大為容器的 50%（TestResultPanel 高度改為可拖曳；Requirement: TestResultPanel height is user-adjustable via drag）
- [ ] 3.3 使用 ResizeObserver 取得容器高度：在 `onMounted` 中用 `ResizeObserver` 觀察右側 panel 容器高度，動態計算 50% 上限，在 `onUnmounted` 中 disconnect（Requirement: TestResultPanel height is user-adjustable via drag）
- [ ] 3.4 寫單元測試驗證 min/max 高度約束與拖曳行為

## 4. 整合驗證

- [ ] 4.1 手動測試完整流程：載入題目頁面確認 ProblemPanel 立即出現、Run 按鈕顯示 loading、生成完成後按鈕啟用、拖曳 result panel 高度正確
- [ ] 4.2 執行所有既有測試確認無迴歸：`pnpm test`
