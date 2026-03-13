## Context

`ProblemPanel.vue` 使用 VitePress 的 `<Content />` 元件渲染挑戰題目的 markdown。VitePress markdown pipeline 會透過 shiki 對 code block 進行語法上色，並自動注入 `<button class="copy">` 複製按鈕。

這個複製按鈕的 CSS 定位規則（`position: absolute; top: 8px; right: 8px`）僅在 `.vp-doc` 選擇器範圍內生效。目前 `ProblemPanel` 的包裝 div 使用 `prose prose-invert prose-sm max-w-none`（Tailwind Typography），但沒有 `.vp-doc`，因此：

1. 複製按鈕以 normal flow 方式渲染，佔據高度 → 造成 code block 上方大空白
2. 複製按鈕的外觀樣式（背景、hover 效果、icon）缺失 → 視覺上不可見

## Goals / Non-Goals

**Goals:**
- 讓 VitePress 的 code block CSS（含複製按鈕）在 `ProblemPanel` 內正常作用
- 不破壞現有的 `prose-invert` 深色文字排版樣式

**Non-Goals:**
- 不重新設計 ProblemPanel 的排版系統
- 不自訂複製按鈕的外觀

## Decisions

### 在 ProblemPanel 包裝 div 加入 `vp-doc` 類別

在 `ProblemPanel.vue` 的 `<div class="prose prose-invert prose-sm max-w-none">` 加入 `vp-doc` 類別，變為 `<div class="vp-doc prose prose-invert prose-sm max-w-none">`。

**理由**：`.vp-doc` 是 VitePress 官方的 CSS scope class，用於所有 markdown 渲染的容器。加入此 class 能直接激活 VitePress 內建的 code block 樣式，包含複製按鈕的絕對定位、hover 效果，以及 shiki 語法上色容器的間距設定。這是最小侵入性的修正方式，無需自行重新實作 CSS。

**Alternative 考慮**：自行在 `tailwind.css` 寫 `.language-` 容器與 `.copy` 按鈕的 CSS。雖然控制性更高，但需要複製和維護 VitePress 的 code block 樣式，增加未來升級的維護成本。

## Risks / Trade-offs

- **`.vp-doc` 與 `prose` 排版衝突**：`.vp-doc` 自帶 heading、paragraph 的 margin/font-size 設定，可能與 `prose-sm` 衝突。若出現視覺差異，需在 `tailwind.css` 以 CSS specificity 或 `@layer` 覆蓋特定屬性 → 但實際上 Tailwind Typography 的 `prose` class 優先級通常足夠，預期衝突很小。
- **VitePress 升級後樣式變動**：若 VitePress 未來修改 `.vp-doc` 的 CSS 範圍，本修正方式仍能跟隨更新，無需額外維護。
