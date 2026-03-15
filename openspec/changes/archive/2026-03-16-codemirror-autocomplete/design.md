## Context

CodeMirror 6 編輯器（`CodeEditor.vue`）目前僅具備語法高亮、行號、歷史紀錄、Tab 縮排等基本功能，缺乏自動補全與括號配對。編輯器運行在 Pyodide（WebAssembly）靜態架構下，無後端服務。現有依賴：`@codemirror/view`、`@codemirror/commands`、`@codemirror/lang-python`、`@codemirror/state`、`@codemirror/theme-one-dark`。

## Goals / Non-Goals

**Goals:**

- 啟用 Python 關鍵字與內建函數自動補全（由 `@codemirror/lang-python` 原生提供）
- 啟用文件掃描補全（`localCompletionSource`）
- 提供密碼學相關 stdlib 模組靜態補全清單
- 啟用 `()`、`[]`、`{}` 三種括號的自動配對

**Non-Goals:**

- 引號自動配對（干擾 Python 字串模式）
- LSP 型別推斷
- `os`/`sys` 模組補全（Pyodide 環境下行為不可預期）
- Snippet 展開
- 函數簽名提示

## Decisions

### 使用 language data 而非 override 注入自訂補全源

`autocompletion({ override: [...] })` 會取代所有補全源，包括 `python()` 語言內建的關鍵字/builtins 源。為保留三層補全並存，採用 `pythonLanguage.data.of({ autocomplete: source })` 方式注入，讓 `autocompletion()` 自動合併所有已註冊的源。

替代方案：在 `override` 中顯式列出 `pythonLanguage.data.autocomplete` — 較脆弱，需跟隨 `@codemirror/lang-python` API 變動。

### 自訂 stdlib 清單獨立成 composable

stdlib 補全資料（`pythonCompletions.ts`）獨立於 `CodeEditor.vue`，職責單一、可單獨測試，且未來可依題目需求擴充清單，不需修改 Vue 元件。

### closeBrackets 限制為三種括號

預設 `closeBrackets()` 會包含引號。透過 `closeBrackets({ brackets: ['(', '[', '{'] })` 限制範圍，避免在輸入 Python 字串時插入多餘的配對符號。

### 函數補全的 apply 欄位以 `(` 結尾

stdlib 清單中的函數條目設定 `apply: label + '('`，接受補全時游標落在 `func(|)`（`closeBrackets()` 自動補入 `)`）。此組合依賴 `closeBracketsKeymap` 必須排在 `defaultKeymap` 之前，確保 Backspace 能正確刪除配對符號。

## Risks / Trade-offs

- **靜態清單維護成本**：stdlib 清單需手動跟進 Python 版本更新。→ 清單僅涵蓋密碼學挑戰常用符號，異動頻率低。
- **補全優先順序**：CodeMirror 6 以 boost 分數合併多源結果，無法精確控制跨源排序。→ Python 語言源的關鍵字 boost 通常高於自訂源，實測優先順序符合需求。
- **`apply + closeBrackets` 互動**：兩個獨立子系統的組合行為。→ 在單元測試中以 `apply` 欄位結尾 `(` 進行合約驗證；整合行為在瀏覽器中手動驗收。
