## Context

專案目前處於「測試綠、build / typecheck 紅」的狀態：

- `pnpm test`：21 files / 152 tests 全過
- `cargo test`：61 tests 全過
- `pnpm build`：在 `build:pools` → `generate-key-material.ts` 第 52 行因 template literal 語法錯而崩潰
- `vue-tsc -p tsconfig.app.json`：6 個錯誤
- `tsc -p tsconfig.node.json`：5 個錯誤

三類問題各自獨立但共同阻斷驗證鏈：

1. **Build 阻斷**：`generate-key-material.ts:52` 中 Rust doc-comment 的 backtick 使用 `\\`` ` 而非 `` \` ``，esbuild parse 失敗
2. **死碼殘留**：`useRemoteChallenge.ts` 引用已刪除的 `parseChallengeMeta`，0 處 import（完全未使用）
3. **TypeScript 設定偏差**：`strip-generator.ts` 未納入 `tsconfig.node.json` include、`@codemirror/autocomplete@6.20.1` 移除了 `localCompletionSource` 且 `closeBrackets()` 不再接受參數、`vitest.config.ts` 使用 `.mts` 副檔名 import 但 tsconfig.node.json 未啟用 `allowImportingTsExtensions`

**限制條件**

- 修復不得改變 runtime 行為——所有 152 個前端測試與 61 個 Rust 測試必須維持綠色
- `strip-generator.ts` 是 active Vite plugin（production build 使用），不可刪除
- `CodeEditor.vue` 的 autocomplete 功能必須保留，只是修正 API 呼叫方式
- `@codemirror/autocomplete@6.20.1` 是鎖定版本，不升降版

## Goals / Non-Goals

**Goals:**

- `pnpm build` 從乾淨 checkout 可穩定完成（包含 `build:pools`、`build:wasm`、`build:pyodide`、`docs:build` 全鏈）
- `vue-tsc -p tsconfig.app.json --noEmit` 零錯誤
- `tsc -p tsconfig.node.json --noEmit` 零錯誤
- 移除所有 TOML-era 死碼殘留
- 不引入新的 runtime 行為變更

**Non-Goals:**

- 不處理 Python 環境依賴問題（屬於 `declare-release-python-toolchain` change）
- 不處理 spec 內容品質問題（屬於 `normalize-active-spec-baselines` change）
- 不升降任何 npm 依賴版本
- 不新增 CI typecheck step（可作為 follow-up，本 change 只確保命令可通過）

## Decisions

### Decision 1：修復 `generate-key-material.ts` template literal backtick escaping

**選擇**：將第 52 行的 `\\`` ` 改為 `` \` ``（兩處）。

**原因**：在 JS template literal 中，`\\` 是字面反斜線的 escape sequence，後面的 `` ` `` 會被視為 template literal 的結束符號。正確的 escape 是 `` \` ``，在 template 內產生一個 literal backtick。生成的 Rust doc-comment `` /// ... `Zeroizing` `` 在 Rust 中是合法的 markdown 語法，不需要額外 escape。

**替代方案**：
- 使用 `String.raw` tagged template → 會改變所有 `${}` 插值行為，過度侵入
- 將 Rust 模板移到外部檔案 → 增加檔案管理複雜度，不值得

### Decision 2：刪除 `useRemoteChallenge.ts`

**選擇**：直接刪除檔案。

**原因**：grep 確認零 import。此檔案引用已刪除的 `parseChallengeMeta` 和 `.toml` glob，屬於 TOML-era challenge 載入流程的殘留。保留它唯一的效果是製造 `vue-tsc` 錯誤。

**替代方案**：
- 修復使其編譯（移除 `parseChallengeMeta` 引用）→ 保留一個無人使用的 composable 沒有價值

### Decision 3：修正 `tsconfig.node.json` include 與 import 相容性

**選擇**：

1. 在 `tsconfig.node.json` 的 `include` 加入 `.vitepress/plugins/**`，使 `strip-generator.ts` 被 node-side project 覆蓋（因為它 import `vite` 型別，需要 node 環境）
2. 在 `tsconfig.node.json` 的 `compilerOptions` 加入 `"allowImportingTsExtensions": true`，使 `vitest.config.ts` 的 `.mts` import 合法
3. 在 `tsconfig.app.json` 的 `exclude` 加入 `.vitepress/plugins/**`，避免 app project 重複 pick up plugin 檔案

**原因**：`strip-generator.ts` 是 VitePress config 的 Vite plugin，在 node context 執行，import `vite` 型別。目前它被 `tsconfig.app.json`（DOM-targeted）pick up 但該 project 沒有 `vite` 型別 → 4 個錯誤。移到 node project 解決型別問題。`vitest.config.ts` 的 `.mts` import 是 Node 24 `@tsconfig/node24` 的已知限制。

### Decision 4：修正 `CodeEditor.vue` 的 `@codemirror/autocomplete` API 呼叫

**選擇**：

1. 移除 `localCompletionSource` import 與使用——此 export 在 `@codemirror/autocomplete@6.20.1` 中不存在
2. `closeBrackets()` 呼叫移除參數——v6.20.1 的 `closeBrackets` 不接受 config object（brackets 預設已包含 `(`, `[`, `{`）

**原因**：`localCompletionSource` 是 CodeMirror 早期版本的 experimental export，已在後續版本中移除。`closeBrackets` 在 v6.x 中的簽名是 `() => Extension`，不接受參數。目前的 Python autocomplete 已由 `pythonStdlibCompletions()` 提供，不需要 `localCompletionSource`。

**影響確認**：`CodeEditor.spec.ts` 測試 `closeBrackets` 被呼叫但不檢查參數，修改後測試仍通過。

### Decision 5：新增 `typecheck` npm script

**選擇**：在 `package.json` 新增 `"typecheck": "vue-tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit"`。

**原因**：提供一個明確的驗證命令，讓 developer 與未來 CI 可以用單一指令檢查型別正確性。不在本 change 中加入 CI step，但指令本身需要存在。

## Risks / Trade-offs

- **[Risk] `closeBrackets()` 移除參數可能改變 bracket 行為** → `@codemirror/autocomplete@6.20.1` 的 `closeBrackets` 預設已包含 `(`, `[`, `{`, `'`, `"`，與原本傳入的 `{ brackets: ['(', '[', '{'] }` 相比多了 `'` 和 `"`。但這是更接近標準 editor 行為的設定，且原本的參數在此版本根本無效（被忽略）。
  - Mitigation：確認 `CodeEditor.spec.ts` 測試通過；如有回報問題可 follow-up 調整。
- **[Risk] `localCompletionSource` 移除可能影響 autocomplete 品質** → 此 export 在安裝版本中根本不存在（`undefined`），所以 `pythonLanguage.data.of({ autocomplete: undefined })` 實際上沒有作用。移除後行為不變。
  - Mitigation：`pythonStdlibCompletions()` 仍然提供 Python autocomplete。
- **[Trade-off] `tsconfig.node.json` 加入 `allowImportingTsExtensions`** → 這是一個寬鬆設定，但在 `noEmit: true` 的 project 中是安全的（不影響 JS 輸出）。
