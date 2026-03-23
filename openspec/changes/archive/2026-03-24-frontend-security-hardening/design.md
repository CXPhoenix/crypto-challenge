## Context

安全審計發現三個待修復漏洞：

1. **CRITICAL** — Pyodide 從 `cdn.jsdelivr.net` 動態載入，無 SRI 驗證。CDN 被入侵時攻擊者可替換整個 Python runtime。
2. **CRITICAL** — 全站無 Content Security Policy，缺少 XSS 縱深防禦。
3. **MEDIUM** — 使用者 Python 程式碼可透過 `import js` 存取 Worker 全域物件（`postMessage`、`fetch` 等）。

目前安全防線：Web Worker 隔離 + `sys.settrace` op-counter + wall-clock kill（5s/6s）+ Vue `{{ }}` auto-escaping + 零 `v-html`。本次加固在此基礎上補強供應鏈、CSP、sandbox 三個面向。

## Goals / Non-Goals

**Goals：**

- 消除 Pyodide CDN 供應鏈攻擊風險（self-host）
- 部署 CSP，限制腳本與資源來源
- 封鎖使用者 Python 程式碼對 `js` / `pyodide_js` 模組的存取

**Non-Goals：**

- 不做 HTTP header 層的 CSP（靜態站台由部署平台控制 header，本次僅處理 `<meta>` tag）
- 不做 Pyodide 版本自動更新機制
- 不防禦「使用者攻擊自己」的場景（如在自己瀏覽器中繞過 sandbox）
- 不限制 Python 標準庫（如 `os`、`subprocess` 在 Pyodide 中本就不可用）

## Decisions

### Decision: CSP 使用 `<meta>` tag 而非 HTTP header

VitePress 產出靜態 HTML，部署至 Vercel/Netlify/GitHub Pages 等平台。HTTP header 需在各平台分別設定（`vercel.json`、`_headers` 等），不具可攜性。使用 `<meta http-equiv="Content-Security-Policy">` 嵌入 HTML `<head>`，隨 VitePress build 產出，適用於任何靜態 hosting。

替代方案：
- HTTP header — 保護更全面（含 `frame-ancestors`），但需每個部署平台各別設定
- 兩者並用 — 過度工程，目前 `<meta>` 已滿足需求

CSP 指令設計：
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
worker-src 'self' blob:;
connect-src 'self';
img-src 'self' data:;
font-src 'self';
```

- `'unsafe-inline'` 為必要：VitePress 在 `<head>` 注入 inline script 處理 dark mode 偵測，無法預先計算 hash（內容隨 VitePress 版本變動）
- `'wasm-unsafe-eval'` 為必要：WASM 模組（testcase generator）需要此權限
- `frame-ancestors` 無法在 `<meta>` 中使用，此為已知限制

### Decision: Self-host Pyodide，不追蹤二進位檔至 Git

Pyodide core 約 30 MB（`.wasm` + `.tar` + `.mjs`），不適合追蹤至 Git。方案：

1. 新增 `scripts/download-pyodide.sh`，下載指定版本的 Pyodide 至 `docs/public/pyodide/`
2. 將 `docs/public/pyodide/` 加入 `.gitignore`
3. 在 CI/CD 的 build 步驟中先執行下載 script，再執行 `vitepress build`
4. 更新 `pyodide.worker.ts` 中 `PYODIDE_CDN` 為 `'/pyodide/'`

需下載的檔案（Pyodide v0.29.3 minimal set）：
- `pyodide.mjs` — JavaScript entry point
- `pyodide.asm.js` — WebAssembly glue code
- `pyodide.asm.wasm` — WebAssembly binary
- `pyodide_py.tar` — Python 標準庫
- `pyodide-lock.json` — 套件鎖定檔
- `python_stdlib.zip` — 標準庫壓縮包（部分版本需要）

替代方案：
- 使用 npm 安裝 `pyodide` — Worker 中 dynamic import 的路徑解析複雜，且 Vite 會嘗試 bundle
- 使用 CDN + SRI — dynamic `import()` 不支援 integrity attribute

### Decision: 使用 Python `sys.meta_path` finder 封鎖 js proxy

在 `buildWrappedCode()` 產生的 Python 前置碼中注入 meta path finder，攔截所有 `import js`、`import pyodide_js` 等嘗試：

```python
import sys as _sys
import types as _types

class _SandboxFinder:
    def find_module(self, fullname, path=None):
        if fullname in ('js', 'pyodide_js', 'pyodide') or \
           fullname.startswith(('js.', 'pyodide_js.', 'pyodide.')):
            return self
        return None
    def load_module(self, fullname):
        raise ImportError(f"Module '{fullname}' is not available")

_sys.meta_path.insert(0, _SandboxFinder())
for _n in list(_sys.modules):
    if _n in ('js', 'pyodide_js', 'pyodide') or \
       _n.startswith(('js.', 'pyodide_js.', 'pyodide.')):
        del _sys.modules[_n]
```

此方法：
1. 在 import 機制最上層攔截（`meta_path` 優先於其他 finder）
2. 清除已載入的模組引用
3. 不影響 Python 標準庫模組的正常使用

替代方案：
- `__builtins__.__import__` monkey-patch — 不夠可靠，Pyodide 可能繞過
- Pyodide 的 `pyodide.setInterruptBuffer()` — 用途不同，不能限制模組存取
- 在 Worker 啟動時清除全域物件 — `self.fetch = undefined` 等，但無法阻止 Python 層重新取得

## Risks / Trade-offs

- **[Risk] VitePress inline script 變動導致 CSP 破壞** → 使用 `'unsafe-inline'` 而非 hash-based 方案，犧牲部分 CSP 強度換取維護穩定性。未來可透過 VitePress 的 `transformHead` hook 計算 hash 並移除 `'unsafe-inline'`。
- **[Risk] Pyodide 下載 script 在 CI 中失敗** → 加入錯誤檢查與重試。README 記錄手動下載步驟。
- **[Risk] Sandbox guard 被繞過** → 教學情境下為「使用者攻擊自己」，風險可接受。Guard 的目的是防止誤用而非對抗惡意行為者。
- **[Trade-off] 靜態資源增加 ~30 MB** → 部署成本增加，但消除了對外部 CDN 的依賴，且 Pyodide WASM 可被 CDN edge cache 壓縮。
- **[Trade-off] `frame-ancestors` 不可用** → `<meta>` CSP 的已知限制。如需防 clickjacking，需在部署平台設定 HTTP header 或使用 `X-Frame-Options`。
