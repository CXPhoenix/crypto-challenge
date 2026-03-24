# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-24

### Added

- 初始化專案並將架構完整遷移至 VitePress
- 將挑戰生成架構重構為雙階段 Python Generator 模型
- 將挑戰定義遷移至 Markdown Frontmatter，支援 Python Generator Factory Format
- 實作 non-blocking testcase 生成與 TestResultPanel 可拖曳高度調整
- 新增 Rust WASM `PrintableAscii` param 型別及對應 unit test
- 新增 `count` 欄位至所有 `ParamSpec` variant，支援彈性 count 範圍與自訂 separator（`CountSpec`）
- 新增 CodeMirror Python autocomplete 與 stdlib 補全來源，整合至 CodeEditor
- 新增凱薩密碼（Caesar Cipher）系列挑戰頁面
- 升級 caesar-custom-table 為基於自製密碼表的凱薩解密題
- 實作 dark/light mode 雙主題切換，涵蓋 AppHeader、ChallengeCard 及所有元件
- 實作前端三層安全加固（CSP、Pyodide self-host、Python sandbox guard）
- 新增 GitHub Actions release 自動打包 workflow
- 新增「執行」模式，讓使用者可自訂 stdin 執行程式碼查看輸出
- 實作 verdict detail 三層資料剝離，防止 judge 預期答案洩漏

### Fixed

- 修正 ProblemPanel 內 code block 複製按鈕消失與版面空白問題
- 移除 ProblemPanel 內 h2 標題上方的多餘分隔線與間距
- 修正 caesar-custom-table 解密邏輯與相關設定錯誤
- 移除 `postcss.config.mjs` 中無效的 TypeScript `import type` 語法

### Changed

- 將 drag handle 與高度管理邏輯從 TestResultPanel 移至 ChallengeView
- 將 Rust WASM 套件目錄從 `challenge-generator` 更名為 `testcase-generator`
- 精簡題目範圍，移除非凱薩密碼題目並清空 starter code 範例解
- 將 PostCSS 設定檔從 `.mts` 改名為 `.mjs` 並移除型別斷言
