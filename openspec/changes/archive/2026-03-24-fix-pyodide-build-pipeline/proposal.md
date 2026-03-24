## Why

部署至 Cloudflare Pages 後，瀏覽器出現 `TypeError: Failed to fetch dynamically imported module: /pyodide/pyodide.mjs`。根因是 `docs/public/pyodide/` 已被 `.gitignore` 排除，而 `pnpm build` pipeline 從未呼叫 `scripts/download-pyodide.sh`，導致 Pyodide 執行時期檔案在部署輸出中完全缺失。

## What Changes

- 在 `package.json` 新增 `build:pyodide` script（`bash scripts/download-pyodide.sh`）
- 將 `build:pyodide` 串入 `build` 與 `dev` 指令，確保每次建置前自動下載 Pyodide 執行時期檔案
- `release.yml` 無需修改（已透過 `pnpm build` 間接包含）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `pyodide-self-host`: 新增「build pipeline 必須在 `vitepress build` 前下載 Pyodide 執行時期檔案」的要求

## Impact

- Affected specs: `pyodide-self-host`（delta spec 新增 build pipeline 保證）
- Affected code: `package.json`
