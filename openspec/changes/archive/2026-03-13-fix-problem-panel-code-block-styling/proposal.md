## Why

在 `ProblemPanel` 渲染 VitePress markdown 時，程式碼區塊（code block）的複製按鈕無法顯示，且區塊上方出現異常的大空白。原因是 VitePress 內建的 code block CSS（包含複製按鈕定位）是以 `.vp-doc` 為選擇器範圍，而 `ProblemPanel` 的包裝 div 僅有 `prose prose-invert prose-sm` 類別，未加入 `.vp-doc`，導致相關樣式失效。

## What Changes

- 在 `ProblemPanel.vue` 的包裝 div 加入 `vp-doc` 類別，讓 VitePress 的 code block CSS 正確作用
- 複製按鈕將回到正確的絕對定位位置（右上角），不再佔據 normal flow 造成空白
- 複製功能（hover 顯示、點擊複製）恢復正常

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `vitepress-markdown-panel`: 修正 code block 在 ProblemPanel 內渲染時，複製按鈕消失及版面錯位的問題

## Impact

- Affected specs: `vitepress-markdown-panel`（requirement 層級的 bug fix）
- Affected code: `.vitepress/theme/components/challenge/ProblemPanel.vue`
