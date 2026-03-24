## Context

Pyodide 執行時期檔案（`pyodide.mjs`、`pyodide.asm.js`、`pyodide.asm.wasm` 等）透過 `scripts/download-pyodide.sh` 下載至 `docs/public/pyodide/`，並被 `.gitignore` 排除（避免提交 ~12 MB 的二進位檔）。VitePress build 時會將 `docs/public/` 複製至輸出目錄，因此只要 build 前檔案存在，部署即可正常服務 `/pyodide/*`。

問題在於 `pnpm build`（`build:wasm && docs:build`）從未呼叫下載腳本，導致 CI/CD 環境（Cloudflare Pages、GitHub Actions）的部署輸出缺少 Pyodide 檔案。開發者本機因手動執行過腳本而不受影響，造成本機正常、線上 404 的假象。

相比之下，WASM 產生器同樣 gitignored，但 `pnpm build` 明確包含 `build:wasm`（從 Rust source 重建），因此可正常部署。Pyodide 缺乏對應的 build step。

## Goals / Non-Goals

**Goals:**

- 確保 `pnpm build` 與 `pnpm dev` 執行前，`docs/public/pyodide/` 必定包含全部 5 個必要檔案
- 適用於所有部署情境：Cloudflare Pages、GitHub Actions release workflow、本機建置

**Non-Goals:**

- 快取 Pyodide 下載結果至 CI cache（可日後優化，非當前阻塞項）
- 新增 COOP/COEP `_headers`（獨立 concern，非此 bug 的直接根因）
- 支援多版本 Pyodide 切換

## Decisions

### 新增 `build:pyodide` script 並串入 `build` 與 `dev`

在 `package.json` 新增獨立 script `"build:pyodide": "bash scripts/download-pyodide.sh"`，並更新：

```
"dev":   "pnpm build:wasm && pnpm build:pyodide && pnpm docs:dev"
"build": "pnpm build:wasm && pnpm build:pyodide && pnpm docs:build"
```

**理由**：與 `build:wasm` 模式一致（同樣是 gitignored 產物、同樣在 build 前重建），降低認知負擔。`release.yml` 不需修改，因為它執行 `pnpm build` 即自動包含。腳本本身已具備冪等性（`-f` 存在則跳過），本機重複執行無副作用。

**替代方案排除**：
- `prebuild` npm lifecycle hook：pnpm 預設不執行 pre/post scripts，需另外設定 `.npmrc`，增加隱性複雜度。
- 修改 Cloudflare Pages dashboard build command：不在 repo 內追蹤，易與 `package.json` 脫鉤。

## Risks / Trade-offs

- **[網路依賴]** CI build 時需從 `cdn.jsdelivr.net` 下載 ~12 MB，CDN 不可用時 build 失敗。→ 腳本已有 `--retry 3 --retry-delay 2`；CDN 高可用，接受此風險。
- **[跨平台 bash]** Windows 環境需 WSL 或 Git Bash 才能執行腳本。→ CI（Linux）與本機（macOS）均支援；Windows 開發不在此專案範疇。
- **[Cloudflare Pages build 時間]** 每次 deploy 增加約 5–10 秒下載時間。→ 可接受；若日後成為瓶頸可加入 CI cache。
