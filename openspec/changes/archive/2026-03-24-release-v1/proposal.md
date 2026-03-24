## Why

專案自初始化以來已累積大量功能（VitePress 遷移、Python Generator、WASM testcase 生成、CodeMirror autocomplete、dark/light mode、CSP 安全加固、執行模式、verdict detail 資料剝離等），但 `package.json` 版本仍停留在 `0.0.0`，也沒有 CHANGELOG 記錄變更歷程。需要正式標記為 `1.0.0` 並產生 CHANGELOG，作為首次正式發佈的版本基線。

## What Changes

- 將 `package.json` 的 `version` 欄位從 `0.0.0` 更新為 `1.0.0`
- 新增 `CHANGELOG.md`，依 [Keep a Changelog](https://keepachangelog.com/) 格式，彙整自專案初始化至今所有功能、修正、重構的變更紀錄

## Capabilities

### New Capabilities

（無——本次為版本管理維護工作，不引入新的功能規格）

### Modified Capabilities

（無——不修改任何既有功能的行為規格）

## Impact

- 受影響的檔案：
  - `package.json` — version 欄位更新
  - `CHANGELOG.md` — 新增檔案
- 不影響任何功能程式碼、測試或 CI workflow
