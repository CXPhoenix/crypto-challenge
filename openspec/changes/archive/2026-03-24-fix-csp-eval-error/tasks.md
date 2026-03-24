## 1. 修復 useWasm dynamic import（使用 @vite-ignore 取代 new Function）

- [x] 1.1 將 `useWasm.ts` 中的 `new Function('p', 'return import(p)')` 替換為 `import(/* @vite-ignore */ path)`，移除 `_runtimeImport` helper（script-src does not include unsafe-eval）

## 2. 驗證

- [x] 2.1 執行既有測試確認 `useWasm.spec.ts` 通過
