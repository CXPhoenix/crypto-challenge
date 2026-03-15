## 1. 安裝依賴

- [x] 1.1 在 `package.json` 新增 `@codemirror/autocomplete` 並執行 `pnpm install`

## 2. 建立 stdlib 補全 composable

- [x] 2.1 新增 `.vitepress/theme/composables/pythonCompletions.ts`，實作 `pythonStdlibCompletions(): CompletionSource`，涵蓋 `math`、`string`、`hashlib`、`binascii`、`collections`、`itertools`、`functools`、`re` 八個模組（自訂 stdlib 清單獨立成 composable）
- [x] 2.2 模組名本身以 `type: 'namespace'`、`detail: 'module'` 加入補全清單（對應 Requirement: Stdlib static completion list）
- [x] 2.3 函數條目的 `apply` 欄位以 `(` 結尾，觸發 closeBrackets 補入 `)`（對應 Requirement: Stdlib static completion list 及決策：函數補全的 apply 欄位以 `(` 結尾）
- [x] 2.4 確認 `os`/`sys` 未列入清單（對應 Requirement: Excluded stdlib modules）

## 3. 整合至 CodeEditor.vue

- [ ] 3.1 在 `CodeEditor.vue` 的 `Promise.all` lazy import 區塊新增 `@codemirror/autocomplete`（`autocompletion`、`closeBrackets`、`closeBracketsKeymap`、`localCompletionSource`）及 `pythonLanguage`（從 `@codemirror/lang-python`）
- [ ] 3.2 加入 `closeBrackets({ brackets: ['(', '[', '{'] })` extension（對應 Requirement: Bracket auto-closing；決策：closeBrackets 限制為三種括號）
- [ ] 3.3 以 `pythonLanguage.data.of({ autocomplete: localCompletionSource })` 注入文件掃描補全（使用 language data 而非 override 注入自訂補全源；對應 Requirement: Document-local identifier completion）
- [ ] 3.4 以 `pythonLanguage.data.of({ autocomplete: pythonStdlibCompletions() })` 注入 stdlib 補全（使用 language data 而非 override 注入自訂補全源）
- [ ] 3.5 加入 `autocompletion()` extension，不使用 `override`，確保三層補全源共存（對應 Requirement: Python keyword and builtin autocompletion；Requirement: Automatic completion trigger）
- [ ] 3.6 更新 `keymap.of([closeBracketsKeymap, indentWithTab, ...defaultKeymap, ...historyKeymap])`，確保 `closeBracketsKeymap` 排在最前面

## 4. 測試

- [ ] 4.1 新增 `.vitepress/theme/__tests__/pythonCompletions.spec.ts`，驗證：至少回傳一個補全、模組名為 `namespace` 且 `detail: 'module'`、`sha256` 的 `detail` 為 `'hashlib'`、函數條目 `apply` 以 `(` 結尾、edge case 不 crash（對應 Requirement: Stdlib static completion list；Requirement: Excluded stdlib modules）
- [ ] 4.2 擴充 `.vitepress/theme/__tests__/CodeEditor.spec.ts`，mock `@codemirror/autocomplete`，確認 `closeBrackets` 與 `autocompletion` 在 extensions 初始化時被呼叫（對應 Requirement: Bracket auto-closing；Requirement: Automatic completion trigger）
- [ ] 4.3 執行全套測試 `pnpm test`，確認所有測試通過
