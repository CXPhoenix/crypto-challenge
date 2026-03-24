## Context

專案自初始化以來已有 50+ commits，涵蓋 VitePress 遷移、Python Generator、WASM testcase 生成、CodeMirror autocomplete、dark/light mode 雙主題、CSP/Pyodide self-host/sandbox guard 三層安全加固、執行模式、verdict detail 資料剝離等功能。`package.json` 版本仍為 `0.0.0`，沒有 CHANGELOG。

## Goals / Non-Goals

**Goals:**

- 將 `package.json` 版本更新為 `1.0.0`
- 新增 `CHANGELOG.md`，遵循 [Keep a Changelog](https://keepachangelog.com/) 格式
- CHANGELOG 涵蓋自專案初始化至今所有有意義的變更（feat / fix / refactor / build）

**Non-Goals:**

- 不建立 git tag（使用者後續手動處理）
- 不修改 CI workflow 或其他程式碼
- 不調整 npm publish 相關設定（專案為 private）

## Decisions

### CHANGELOG 格式

採用 [Keep a Changelog](https://keepachangelog.com/) 格式，以 `## [1.0.0] - YYYY-MM-DD` 作為唯一版本段落，底下依 `Added`、`Fixed`、`Changed`、`Build` 分類。從 git log 提取有意義的 commit（排除純 chore/docs/歸檔類 commit）。

### 版本號策略

直接從 `0.0.0` 跳至 `1.0.0`，不補中間版本。這是首次正式發佈，所有既有功能統一歸入 `1.0.0`。

## Risks / Trade-offs

- **CHANGELOG 完整性**：手動從 git log 彙整可能遺漏或歸類不精確。→ 以 git log 為基礎逐條檢視，確保主要功能皆有記錄。
- **向後相容**：首次定義版本，無向後相容問題。
