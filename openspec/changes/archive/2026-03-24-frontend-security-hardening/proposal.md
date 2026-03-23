## Why

前端安全審計發現兩個 CRITICAL 等級漏洞與一個 MEDIUM 等級風險：Pyodide 從 CDN 動態載入時無任何完整性驗證（供應鏈攻擊風險）、全站缺少 Content Security Policy（無 XSS 縱深防禦）、以及使用者 Python 程式碼可透過 Pyodide 的 `js` proxy 存取 Worker 全域物件（偽造判題結果、發送網路請求）。這些漏洞需要在上線前修復，以確保教學平台的安全性。

## What Changes

- 新增 CSP meta tag，限制腳本來源、樣式來源、Worker 來源等
- Self-host Pyodide 靜態資源至 `docs/public/pyodide/`，消除對外部 CDN 的依賴
- 在 Pyodide Worker 中注入 sandbox 前置碼，攔截 `import js`、`import pyodide_js` 等逃逸路徑
- 更新 `pyodide.worker.ts` 的載入路徑，從 CDN URL 改為本地路徑

## Capabilities

### New Capabilities

- `csp-policy`: VitePress `<head>` 中注入 Content Security Policy meta tag，限制 `script-src`、`style-src`、`worker-src`、`connect-src`、`frame-ancestors` 等指令
- `pyodide-self-host`: 將 Pyodide runtime 檔案下載至 `docs/public/pyodide/` 並從本地載入，消除 CDN 供應鏈風險
- `pyodide-sandbox-guard`: 在使用者 Python 程式碼執行前注入 sandbox 前置碼，禁用 `js` / `pyodide_js` 模組存取，防止 Worker 全域物件逃逸

### Modified Capabilities

（無 — 不變更現有 spec 層級行為）

## Impact

- 受影響程式碼：
  - `.vitepress/config.mts`（CSP head 設定）
  - `.vitepress/theme/workers/pyodide.worker.ts`（載入路徑、sandbox 注入）
  - `.vitepress/theme/workers/worker-utils.ts`（sandbox 前置碼）
  - `docs/public/pyodide/`（新增 Pyodide 靜態資源目錄）
- 受影響依賴：移除對 `cdn.jsdelivr.net` 的 runtime 依賴
- 部署影響：靜態資源大小增加約 30 MB（Pyodide core + packages）
