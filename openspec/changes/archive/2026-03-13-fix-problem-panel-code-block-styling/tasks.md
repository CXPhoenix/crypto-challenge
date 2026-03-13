## 1. 修正 ProblemPanel code block 樣式

- [x] 1.1 在 `ProblemPanel.vue` 包裝 div 加入 `vp-doc` 類別（Requirement: ProblemPanel code blocks render with VitePress styles；Decision: 在 ProblemPanel 包裝 div 加入 `vp-doc` 類別）
- [x] 1.2 目視驗證：啟動 dev server，確認 code block 複製按鈕可見、版面無大空白（Scenario: Copy button is visible and correctly positioned；Scenario: No layout gap above code block content）
- [x] 1.3 執行全套測試確認無迴歸：`pnpm test`
