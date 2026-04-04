## 1. Build pipeline completes from clean checkout（修復 build blocker）

- [x] [P] 1.1 修復 `scripts/generate-key-material.ts` 第 52 行 template literal backtick escaping（Decision 1：修復 generate-key-material.ts template literal backtick escaping）：將 `\\`` ` 改為 `` \` ``（兩處），使 Rust doc-comment 中的 `` `Zeroizing` `` 不會截斷 template literal
- [x] [P] 1.2 刪除 `.vitepress/theme/composables/useRemoteChallenge.ts`（Decision 2：刪除 useRemoteChallenge.ts / No dead code referencing removed subsystems / Frontmatter defines a Python generator instead of Rust algorithm / Challenge pages use custom VitePress layout）——grep 確認零 import，檔案引用已刪除的 `parseChallengeMeta` 和 `.toml` glob。刪除後 python-generator 與 vitepress-markdown-panel spec 的「no TOML loader」要求自動滿足

## 2. TypeScript type checking passes for all project scopes（修正 tsconfig 設定）

- [x] 2.1 修正 `tsconfig.node.json`（Decision 3：修正 tsconfig.node.json include 與 import 相容性 / Build tooling files are correctly scoped in TypeScript projects）：`include` 加入 `".vitepress/plugins/**"`，`compilerOptions` 加入 `"allowImportingTsExtensions": true`
- [x] 2.2 修正 `tsconfig.app.json`（Decision 3 / Build tooling files are correctly scoped in TypeScript projects）：`exclude` 加入 `".vitepress/plugins/**"`，避免 app project 重複 pick up plugin 檔案
- [x] 2.3 修正 `.vitepress/plugins/strip-generator.ts` 的 implicit any 參數（Decision 3）：為 `transform(code, id)` 的 `code` 和 `id` 參數加上明確型別標註 `string`
- [x] 2.4 修正 `.vitepress/theme/components/editor/CodeEditor.vue` 的 `@codemirror/autocomplete` API 呼叫（Decision 4：修正 CodeEditor.vue 的 @codemirror/autocomplete API 呼叫）：移除 `localCompletionSource` import 與 `pythonLanguage.data.of({ autocomplete: localCompletionSource })`、`closeBrackets()` 呼叫移除參數

## 3. 驗證指令與最終確認

- [x] 3.1 在 `package.json` 新增 `"typecheck"` script（Decision 5：新增 typecheck npm script / TypeScript type checking passes for all project scopes）：`"typecheck": "vue-tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit"`
- [x] 3.2 執行 `pnpm build` 確認完整 build pipeline 通過（Build pipeline completes from clean checkout）
- [x] 3.3 執行 `pnpm typecheck` 確認零 type error（TypeScript type checking passes for all project scopes）
- [x] 3.4 執行 `pnpm test` 確認所有測試維持通過（無 runtime 行為變更）
- [x] 3.5 執行 `cargo test` in `testcase-generator` 確認 Rust 測試維持通過
