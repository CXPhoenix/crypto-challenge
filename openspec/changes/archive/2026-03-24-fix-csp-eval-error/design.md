## Context

`useWasm.ts` 使用 `new Function('p', 'return import(p)')` 繞過 Vite 靜態分析，讓 `/wasm/testcase_generator.js` 不被 Vite 在 build time 解析。但 `new Function()` 等同 `eval()`，被 CSP 的 `script-src` 規則阻擋（缺少 `'unsafe-eval'`）。

同專案的 Pyodide Worker 已有相同需求的解法：使用 `import(/* @vite-ignore */ url)` 註解。

## Goals / Non-Goals

**Goals:**

- 移除 `new Function()` 呼叫，改用 `import(/* @vite-ignore */ path)`
- 維持 CSP 安全性（不加 `'unsafe-eval'`）
- 確保 WASM 模組正常載入

**Non-Goals:**

- 不修改 CSP 設定
- 不變更 WASM 模組路徑或載入邏輯

## Decisions

### 使用 @vite-ignore 取代 new Function

將 `new Function('p', 'return import(p)')` 替換為直接呼叫 `import(/* @vite-ignore */ '/wasm/testcase_generator.js')`。`@vite-ignore` 是 Vite/Rollup 官方 magic comment，告訴打包器跳過此 dynamic import 的靜態分析。不再需要中間的 `_runtimeImport` helper function。

## Risks / Trade-offs

- **Vite 警告**：`@vite-ignore` 會在 build 時產生一條 warning，這是預期行為，不影響功能。
