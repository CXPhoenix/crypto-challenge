## 1. CSP Policy 設定

- [x] 1.1 在 `.vitepress/config.mts` 的 `head` 陣列中新增 `<meta http-equiv="Content-Security-Policy">` tag（Decision: CSP 使用 `<meta>` tag 而非 HTTP header），指令為 `default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self'; img-src 'self' data:; font-src 'self';`，確保 CSP meta tag is present in all built pages
- [x] 1.2 執行 `vitepress build` 並檢查產出 HTML，確認 CSP restricts script sources to self and necessary unsafe directives、CSP restricts worker sources、CSP restricts network connections to self、CSP sets restrictive default

## 2. Pyodide Self-Host

- [x] 2.1 將 `docs/public/pyodide/` 加入 `.gitignore`，確保 Pyodide files are excluded from Git tracking（Decision: Self-host Pyodide，不追蹤二進位檔至 Git）
- [x] 2.2 建立 `scripts/download-pyodide.sh`，實作 Download script provisions Pyodide files：下載 Pyodide v0.29.3 的 `pyodide.mjs`、`pyodide.asm.js`、`pyodide.asm.wasm`、`pyodide_py.tar`、`pyodide-lock.json` 至 `docs/public/pyodide/`，支援冪等執行（檔案已存在時跳過）
- [x] 2.3 修改 `.vitepress/theme/workers/pyodide.worker.ts` 中 `PYODIDE_CDN` 為 `'/pyodide/'`，確保 Pyodide runtime is loaded from local origin
- [x] 2.4 執行 download script 並啟動 dev server，驗證 Pyodide 從本地路徑載入且 challenge 正常運作

## 3. Pyodide Sandbox Guard

- [x] 3.1 在 `.vitepress/theme/workers/worker-utils.ts` 的 `buildWrappedCode()` 中注入 `sys.meta_path` finder（Decision: 使用 Python `sys.meta_path` finder 封鎖 js proxy），確保 Sandbox guard is injected before user code in every execution，執行順序為：op-counter → sandbox guard → stdin/stdout redirect → user code
- [x] 3.2 Sandbox guard 實作需清除 `sys.modules` 中的 `js`、`pyodide_js`、`pyodide` 相關條目，確保 Pre-existing js module references are cleared
- [x] 3.3 Sandbox guard 的 `find_module` 僅攔截 `js`、`pyodide_js`、`pyodide` 及其子模組，確保 User Python code cannot import js proxy modules 且 Sandbox guard does not affect standard library imports

## 4. 測試驗證

- [x] 4.1 新增單元測試驗證 `buildWrappedCode()` 產出包含 sandbox guard 前置碼
- [x] 4.2 執行既有測試套件 `pnpm test`，確認所有 43 個測試通過，無 regression
