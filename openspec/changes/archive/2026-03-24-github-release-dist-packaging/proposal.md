## Why

使用者目前無法直接從 GitHub Release 頁面下載預先建置好的網站靜態檔。每次想部署或離線瀏覽都必須自行 clone repo 並在本機安裝 Rust toolchain + wasm-pack + Node.js + pnpm 才能建置。提供打包好的 dist 可以大幅降低使用門檻。

## What Changes

- 新增 GitHub Actions workflow，在 Release 發佈或 push `v*` tag 時自動觸發
- 在 CI 環境中完成完整建置（Rust/wasm-pack → WASM、Node.js/pnpm → VitePress）
- 將 `.vitepress/dist/` 打包為 `.tar.gz` 與 `.zip` 兩種格式
- 透過 `softprops/action-gh-release` 將打包檔上傳至對應的 GitHub Release assets

## Capabilities

### New Capabilities

- `release-dist-packaging`: 在 GitHub Release 時自動建置並打包 dist 靜態檔，同時提供 `.tar.gz` 與 `.zip` 下載

### Modified Capabilities

（無）

## Impact

- 新增檔案：`.github/workflows/release.yml`
- 依賴外部 Actions：`actions/checkout`、`dtolnay/rust-toolchain`、`pnpm/action-setup`、`actions/setup-node`、`softprops/action-gh-release`
- 需要 repository 的 `contents: write` 權限以上傳 release assets
- 不影響現有程式碼或建置流程
