## Why

目前專案的驗證鏈不可靠：`pnpm test` 雖然通過，但 `pnpm build` 會在 `build:pools` 階段失敗，`tsc` / `vue-tsc` 也無法通過。這使 staging 前的綠燈失去意義，因為實際可部署產物與靜態檢查都不成立。

## What Changes

- 修復 `build:pools` 依賴的 key material 生成路徑，使 `pnpm build` 可從乾淨 checkout 穩定完成。
- 建立明確的靜態驗證能力，要求 app 與 node-side TypeScript 設定都能以正式命令通過檢查。
- 移除仍引用已刪除 TOML / `parseChallengeMeta` 流程的前端殘留程式，讓現行 challenge 載入模型與規格一致。
- 整理驗證指令與設定，使 build / typecheck 失敗時能在 staging 前被一致攔下。

## Capabilities

### New Capabilities

- `static-verification-gate`: 定義專案在進入 staging 與 release 前必須通過的 build 與 typecheck 驗證鏈。

### Modified Capabilities

- `python-generator`: 現行前端與工具鏈不得再引用已刪除的 TOML / `parse_challenge_meta` 流程，且 Python generator 流程必須可由正式 build 路徑驅動。
- `vitepress-markdown-panel`: challenge 頁面資料來源必須完全以 Markdown frontmatter 為準，active code 不得保留 TOML-era loader 依賴。

## Impact

- Affected specs: `static-verification-gate`, `python-generator`, `vitepress-markdown-panel`
- Affected code: `scripts/generate-key-material.ts`, `.vitepress/theme/composables/useRemoteChallenge.ts`, `.vitepress/theme/composables/useWasm.ts`, `.vitepress/theme/components/editor/CodeEditor.vue`, `vitest.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `package.json`
