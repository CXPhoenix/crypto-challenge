## 1. 設定 Tailwind Dark Variant

- [x] 1.1 在 `tailwind.css` 加入 `@variant dark (&:where(.dark, .dark *));`（使用 `@variant dark` 設定 Tailwind dark mode variant）：使 Tailwind dark variant targets VitePress dark class，讓所有 `dark:` prefix 對應 `.dark` class 而非 media query

## 2. AppHeader 切換按鈕與雙主題

- [x] 2.1 在 `AppHeader.vue` 引入 `useData` 取得 `isDark` ref，實作切換函式（AppHeader provides a dark/light mode toggle）；設計決策：AppHeader 使用 VitePress `useData().isDark` 切換，直接設定 `isDark.value` 以同步 VitePress 狀態與 localStorage
- [x] 2.2 在 `AppHeader.vue` 新增 sun/moon icon 切換按鈕，根據 `isDark` 狀態顯示對應圖示
- [x] 2.3 為 `AppHeader.vue` 加入 light mode 基礎樣式（AppHeader applies dual-theme styles）：light mode 使用深海軍藍背景（`bg-blue-900`），dark mode 使用 `dark:bg-transparent dark:border-gray-800`

## 3. ChallengeCard 雙主題

- [x] 3.1 將 `ChallengeCard.vue` 的深色硬編碼 class 改為 light mode 基礎 + `dark:` 前綴（ChallengeCard applies dual-theme styles）：卡片背景、邊框色
- [x] 3.2 為 `ChallengeCard.vue` 加入 dark mode hover 霓虹光暈效果（`dark:hover:shadow-[0_0_14px_rgba(52,211,153,0.25)]`）和 light mode hover 藍色陰影
- [x] 3.3 更新 `ChallengeCard.vue` 的 `difficultyClass` 映射，實作難度 badge 的雙主題色（difficulty badge colors adapt to theme）：dark 用暗色半透明，light 用亮色飽和

## 4. ChallengeListView 雙主題

- [ ] 4.1 將 `ChallengeListView.vue` 篩選按鈕的 active/inactive class 改為雙主題版本（ChallengeListView filter buttons apply dual-theme styles）：dark active 用 emerald + glow，light active 用 `bg-blue-600`
- [ ] 4.2 將 `ChallengeListView.vue` 的背景與空白訊息文字色改為雙主題

## 5. ChallengeView 雙主題

- [ ] 5.1 將 `ChallengeView.vue` 根容器的 `bg-gray-950` 改為 light mode 使用 `bg-slate-50`，dark mode 使用 `dark:bg-gray-950`（ChallengeView root container applies dual-theme background）
- [ ] 5.2 更新 `ChallengeView.vue` 中拖曳 handle、按鈕列 border 等細節 class 為雙主題

## 6. ProblemPanel 雙主題

- [ ] 6.1 將 `ProblemPanel.vue` 的 `prose-invert` 改為條件式（ProblemPanel 的 prose 模式條件化）：dark mode 套用 `prose-invert`，light mode 使用標準 `prose`（ProblemPanel prose mode adapts to theme）

## 7. TestResultPanel 雙主題

- [ ] 7.1 將 `TestResultPanel.vue` 所有硬編碼深色 class 加入 light mode 基礎樣式與 `dark:` 前綴（TestResultPanel and RunButton apply dual-theme styles — TestResultPanel 部分）：表格、邊框、文字色

## 8. RunButton 雙主題

- [ ] 8.1 將 `RunButton.vue` 的 disabled/ready/running 三種狀態按鈕加入 light mode 樣式（TestResultPanel and RunButton apply dual-theme styles — RunButton 部分），確保 light mode 下按鈕對比度足夠

## 9. SplitPane 與 SkeletonChallengeCard 雙主題

- [ ] 9.1 更新 `SplitPane.vue` 拖曳分隔線的顏色為雙主題
- [ ] 9.2 更新 `SkeletonChallengeCard.vue` skeleton 色塊為雙主題（light mode 使用較淺的灰藍色）

## 10. 驗證

- [ ] 10.1 確認使用 `useData().isDark` 進行 dark/light 切換可正確同步（AppHeader provides a dark/light mode toggle 驗證）
- [ ] 10.2 在 light mode 下瀏覽列表頁與做題頁，確認所有元件顯示符合 SOC/SIEM 設計（AppHeader applies dual-theme styles、ChallengeCard applies dual-theme styles 驗證）
- [ ] 10.3 在 dark mode 下確認 emerald hover glow 效果正常顯示（Tailwind dark variant targets VitePress dark class 驗證）
