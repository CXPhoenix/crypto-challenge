## Context

目前專案使用 Tailwind CSS 4 + VitePress 2.x。所有 Challenge 相關元件（`ChallengeCard`、`ChallengeListView`、`ChallengeView`、`AppHeader` 等）均以硬編碼的深色 class（`bg-gray-900`、`bg-gray-950`、`text-gray-100` 等）撰寫，沒有任何 light mode 支援。

VitePress 預設主題透過在 `<html>` 元素加上 `.dark` class 來切換暗色模式，並將使用者偏好儲存在 `localStorage`（key：`vitepress-theme-appearance`）。

`ChallengeView`（做題頁）使用 `layout: false`，完全不渲染 VitePress 預設 nav（含其內建的深色切換按鈕），因此需要在 `AppHeader` 自行實作切換機制。

## Goals / Non-Goals

**Goals:**

- 啟用 Tailwind CSS 4 的 class-based dark mode variant（對應 VitePress 的 `.dark` class）
- 為所有 Challenge 相關 Vue 元件加入 light mode 基礎樣式
- Dark mode 維持現有 emerald 強調色，新增 hover 霓虹光暈效果
- Light mode 呈現 SOC/SIEM 風格：淡冰藍背景、深海軍藍 header、藍色邊框與強調
- `AppHeader` 加入 dark/light 切換按鈕，與 VitePress 機制同步

**Non-Goals:**

- 不修改 VitePress 預設主題本身（nav、footer 等）
- 不為 CodeMirror editor 做主題切換（維持現有深色 editor 樣式）
- 不新增 `system` / `auto` 第三種模式（只做 dark / light 二選一）

## Decisions

### 使用 `@variant dark` 設定 Tailwind dark mode variant

在 `tailwind.css` 加入：
```css
@variant dark (&:where(.dark, .dark *));
```

這讓所有 Tailwind `dark:` prefix 對應到 VitePress 加在 `<html>` 上的 `.dark` class，而非預設的 `prefers-color-scheme` media query。

**Alternative considered**: 使用 CSS custom properties 作為 design token，在 `:root` / `.dark` 切換值。此方式集中管理顏色，但會讓元件的 Tailwind class 變得不直觀（`bg-[var(--surface)]`），且打破 IDE 自動補全，因此捨棄。

### AppHeader 使用 VitePress `useData().isDark` 切換

VitePress 的 `useData()` 回傳的 `isDark` 是可寫的 ref，直接設定 `isDark.value` 即可同步切換 `.dark` class 並寫入 `localStorage`，無需自行操作 DOM。

```ts
import { useData } from 'vitepress'
const { isDark } = useData()
// Toggle: isDark.value = !isDark.value
```

**Alternative considered**: 直接操作 `document.documentElement.classList` 和 `localStorage`，但這樣會繞過 VitePress 的狀態管理，造成列表頁切換狀態無法同步，因此捨棄。

### ProblemPanel 的 prose 模式條件化

`ProblemPanel` 目前固定使用 `prose-invert`（深色 prose）。改為：dark mode 用 `prose-invert`，light mode 用預設 `prose`（深色文字）。

### 難度 badge 的雙主題色

- Dark mode：維持現有暗色半透明版本（`bg-green-900/60`、`bg-yellow-900/60` 等）
- Light mode：改用明亮飽和版本（`bg-green-100 text-green-700 border-green-200` 等）

## Risks / Trade-offs

- **[Risk] CodeMirror editor 不跟隨主題切換** → 接受：editor 保持深色是合理的 UX（減少眼睛疲勞），列為 Non-Goal
- **[Risk] `isDark` 在 VitePress alpha 版本可能 API 不穩定** → Mitigation：若 `isDark` 不可寫，改用 `document.documentElement.classList.toggle('dark')` + `localStorage.setItem('vitepress-theme-appearance', ...)` 作為備案
- **[Trade-off] 元件 class 字串變長** → 接受：直接 `dark:` prefix 是 Tailwind 標準做法，可讀性優先於簡潔
