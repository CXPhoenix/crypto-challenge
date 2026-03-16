## Why

目前所有 Challenge 相關元件（列表頁卡片、做題頁）的配色均硬編碼為純 dark mode，完全不回應系統或使用者的明暗偏好設定。為提供差異化的主題體驗——dark mode 呈現駭客終端機風格、light mode 呈現藍隊科技感——需要引入雙主題支援。

## What Changes

- 在 `tailwind.css` 設定 `@variant dark` 以對應 VitePress 的 `.dark` class，啟用 Tailwind `dark:` prefix
- 為所有 Challenge 相關 Vue 元件加入 light mode 基礎樣式與 `dark:` 前綴的 dark mode 樣式
- `AppHeader` 新增 dark/light mode 切換按鈕（因為 ChallengeView 使用 `layout: false` 而不顯示 VitePress 預設 nav）
- Dark mode 風格：emerald 強調色保留，卡片 hover 加上霓虹光暈效果，背景為純黑系
- Light mode 風格：深海軍藍 header、冰藍強調色、白色卡片搭配藍色邊框

## Capabilities

### New Capabilities

- `challenge-dual-theme`: Challenge 列表頁與做題頁的 dark/light mode 雙主題樣式系統，包含 Tailwind dark variant 設定、所有相關元件的雙主題樣式，以及 AppHeader 的主題切換按鈕

### Modified Capabilities

（無）

## Impact

- Affected code:
  - `.vitepress/theme/tailwind.css` — 新增 `@variant dark` 設定
  - `.vitepress/theme/components/layout/AppHeader.vue` — 新增 dark mode 切換按鈕、light mode 樣式
  - `.vitepress/theme/components/challenge/ChallengeCard.vue` — 雙主題樣式
  - `.vitepress/theme/views/ChallengeListView.vue` — 雙主題樣式
  - `.vitepress/theme/views/ChallengeView.vue` — light mode 背景色
  - `.vitepress/theme/components/challenge/ProblemPanel.vue` — `prose-invert` 改為條件式
  - `.vitepress/theme/components/editor/TestResultPanel.vue` — 雙主題樣式
  - `.vitepress/theme/components/editor/RunButton.vue` — 雙主題樣式
  - `.vitepress/theme/components/layout/SplitPane.vue` — 雙主題樣式（拖曳分隔線）
  - `.vitepress/theme/components/challenge/SkeletonChallengeCard.vue` — 雙主題樣式
