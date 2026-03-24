## Context

本專案是 VitePress 靜態網站，建置流程需要兩階段：

1. **WASM 建置**：`wasm-pack build testcase-generator --target web` — 需要 Rust toolchain + wasm-pack
2. **VitePress 建置**：`vitepress build` — 需要 Node.js + pnpm

產出物在 `.vitepress/dist/`，已被 `.gitignore` 排除。目前沒有任何 CI/CD workflow（`.github/workflows/` 不存在）。

使用者希望在 GitHub Release 時自動打包 dist，提供 `.tar.gz` 和 `.zip` 兩種格式下載。

## Goals / Non-Goals

**Goals:**

- 建立 GitHub Actions workflow，在 release 發佈或 push `v*` tag 時自動建置
- 將 `.vitepress/dist/` 打包為 `.tar.gz` 和 `.zip`
- 自動上傳打包檔至對應的 GitHub Release assets

**Non-Goals:**

- 不負責自動部署到任何 hosting 平台（如 GitHub Pages、Vercel）
- 不處理 CHANGELOG 或 release notes 自動生成
- 不新增版本號管理機制

## Decisions

### Workflow 觸發策略：同時監聽 release 與 push tags

使用兩個獨立 trigger：

```yaml
on:
  release:
    types: [published]
  push:
    tags: ['v*']
```

根據 GitHub 官方文件，從 UI 建立 Release 只觸發 `release` 事件，不會觸發 `push` 事件；反之 `git push --tags` 只觸發 `push` 事件。兩者互不干擾，不會重複觸發。

**替代方案**：只用 `push: tags` — 但這樣從 UI 建立 Release 時不會觸發 workflow，不符合需求。

### 使用 softprops/action-gh-release 上傳 assets

選用 `softprops/action-gh-release`，因為：
- Release 已存在（UI 建立）→ 自動更新，上傳 assets
- Release 不存在（push tag）→ 自動建立 release + 上傳 assets
- `overwrite_files` 預設 `true`，重跑 workflow 不會出錯

**替代方案**：用 `gh release upload` CLI — 可行但需要額外判斷 release 是否存在，邏輯較繁瑣。

### Rust toolchain 安裝策略

使用 `dtolnay/rust-toolchain@stable` — 社群標準，快取友善，只需指定 stable 即可。wasm-pack 透過 `cargo install wasm-pack` 或 `jetli/wasm-pack-action` 安裝。

選用 `jetli/wasm-pack-action` 因為它會自動快取 wasm-pack binary，比每次 `cargo install` 快得多。

### 打包命名規則

格式：`crypto-challenge-{tag}.tar.gz` / `crypto-challenge-{tag}.zip`

tag 直接從 `github.ref_name` 取得（例如 `v1.0.0`）。

### pnpm 版本管理

`package.json` 中已定義 `packageManager: "pnpm@10.32.1+sha512..."`，使用 `pnpm/action-setup` 時不指定版本，讓它自動讀取 `packageManager` 欄位。

## Risks / Trade-offs

- **[Risk] WASM 建置時間較長（Rust 編譯）** → 首次建置約 3-5 分鐘。可考慮未來加入 Rust 快取（`Swatinem/rust-cache`）加速，但首版先不加，保持簡單。
- **[Risk] wasm-pack 版本與本機不一致** → `jetli/wasm-pack-action` 預設安裝最新版。若需固定版本可在 action 參數指定，但目前 `package.json` 中 wasm-pack 為 `^0.14.0`，相容性風險低。
- **[Trade-off] 不快取 Rust 編譯產物** → 每次 release 都完整建置，建置時間較長但保證乾淨。Release 頻率不高，可接受。
