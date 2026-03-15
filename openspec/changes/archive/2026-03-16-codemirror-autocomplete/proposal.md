## Why

目前 CodeMirror 6 編輯器缺乏自動補全與括號自動配對，學習者需要手動輸入所有符號，降低了學習體驗；對於不熟悉 Python 語法和標準函式庫的初學者尤為不利。

## What Changes

- 安裝 `@codemirror/autocomplete` 套件
- 加入 Python 關鍵字與內建函數自動補全（由 `@codemirror/lang-python` 原生提供）
- 加入文件掃描補全：自動識別使用者已輸入的變數與函數名稱
- 加入密碼學相關 stdlib 靜態補全清單（`math`、`string`、`hashlib`、`binascii`、`collections`、`itertools`、`functools`、`re`）
- 加入括號自動配對：`()`、`[]`、`{}` — 引號不處理（Pyodide 環境限制排除 `os`/`sys`）
- 補全自動觸發（每次按鍵後）

## Capabilities

### New Capabilities

- `editor-autocomplete`: CodeMirror 編輯器的 Python 自動補全功能，含語言關鍵字、文件掃描、stdlib 靜態清單三層來源

### Modified Capabilities

（無 — 現有 spec 的需求層級不受影響）

## Impact

- Affected code:
  - `package.json` — 新增 `@codemirror/autocomplete` 依賴
  - `.vitepress/theme/composables/pythonCompletions.ts` — 新增 stdlib 補全來源
  - `.vitepress/theme/components/editor/CodeEditor.vue` — 加入 autocomplete 與 closeBrackets extensions
  - `.vitepress/theme/__tests__/pythonCompletions.spec.ts` — 新增單元測試
  - `.vitepress/theme/__tests__/CodeEditor.spec.ts` — 擴充 smoke test
