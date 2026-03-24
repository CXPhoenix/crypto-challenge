## 1. 建立 Workflow 檔案與觸發設定

- [x] [P] 1.1 建立 `.github/workflows/release.yml`，設定 Workflow triggers on release publish and tag push（`on: release: types: [published]` + `on: push: tags: ['v*']`），實作 Workflow 觸發策略：同時監聽 release 與 push tags，並設定 Minimal permissions（`permissions: contents: write`）

## 2. CI 環境建置

- [x] 2.1 設定 Rust toolchain 安裝策略：加入 `dtolnay/rust-toolchain@stable` step
- [x] 2.2 加入 `jetli/wasm-pack-action` 安裝 wasm-pack
- [x] [P] 2.3 設定 pnpm 版本管理：加入 `pnpm/action-setup` 並讓它自動讀取 `packageManager` 欄位
- [x] [P] 2.4 加入 `actions/setup-node` 設定 Node.js 並啟用 pnpm cache

## 3. Full project build in CI

- [x] 3.1 實作 Full project build in CI：加入 `pnpm install` step
- [x] 3.2 加入 `pnpm build` step 執行完整建置（WASM + VitePress），確保 build failure 時 workflow 失敗且不上傳 assets

## 4. Dist packaging in dual formats

- [x] 4.1 實作 Dist packaging in dual formats：加入打包步驟，將 `.vitepress/dist/` 內容打包為 `crypto-challenge-{tag}.tar.gz` 和 `crypto-challenge-{tag}.zip`，遵循打包命名規則，確保 archive contents 位於根層級

## 5. Asset upload to GitHub Release

- [x] 5.1 實作 Asset upload to GitHub Release：使用 softprops/action-gh-release 上傳 assets，設定 `overwrite_files: true`，確保 assets visible on release page、支援 workflow re-run 覆寫
