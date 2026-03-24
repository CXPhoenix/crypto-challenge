## Problem

部署至 Cloudflare Pages 後，首頁 console 出現 `EvalError`：

```
Uncaught (in promise) EvalError: Evaluating a string as JavaScript violates the following Content
Security Policy directive: script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'.
```

WASM 模組完全無法載入，challenge 頁面功能失效。

## Root Cause

`useWasm.ts` 第 22 行使用 `new Function('p', 'return import(p)')` 來繞過 Vite 的靜態分析。`new Function()` 等同 `eval()`，需要 CSP 允許 `'unsafe-eval'`。目前的 CSP `script-src` 只有 `'self' 'unsafe-inline' 'wasm-unsafe-eval'`，不包含 `'unsafe-eval'`。

## Proposed Solution

將 `new Function()` 替換為直接的 `import(/* @vite-ignore */ path)` 呼叫。`/* @vite-ignore */` 是 Vite 官方提供的註解，告訴打包器不要靜態分析這個 dynamic import。Pyodide Worker 中已使用同樣的技巧。

## Success Criteria

- `useWasm.ts` 不再使用 `new Function()`
- CSP 不需要加入 `'unsafe-eval'`
- WASM 模組在 Cloudflare Pages 上正常載入
- 既有的 `useWasm.spec.ts` 測試通過

## Impact

- 受影響的檔案：`.vitepress/theme/composables/useWasm.ts`
