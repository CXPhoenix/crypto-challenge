## Why

README.md 的內容大幅落後於專案現狀：題目僅列 3 道（實際 8 道）、測試數量標示 43（實際 140）、專案結構仍引用已移除的 `.toml` 目錄、缺少部署說明、瀏覽器相容性與安全標頭等關鍵資訊。作為專案的第一印象，README 必須準確反映 v1.0.0 的完整功能與使用方式。

## What Changes

- 更新所有 badge（Tests 140 passing、版本 v1.0.0、License ECL-2.0）
- 題目列表從 3 題擴充為完整 8 題（含難度、分類標籤）
- 新增「部署」章節：說明 GitHub Actions Release workflow、靜態 hosting 的 COOP/COEP 安全標頭需求
- 新增「瀏覽器相容性」章節：SharedArrayBuffer 限制、Chromium 系瀏覽器建議
- 更新「快速開始」：補充 Pyodide 自動下載步驟說明（`pnpm build:pyodide`）
- 更新「專案結構」：移除不存在的 `challenges/*.toml`，反映實際目錄配置
- 更新「貢獻指南」frontmatter 範例：補充新的 params 類型（`hex`、`prime`、`multiple_of`、`values`）
- 明確標示授權為 ECL-2.0
- 加入 GitHub repo 連結

## Non-Goals (optional)

- 不加入線上 Demo 連結（目前無公開部署）
- 不撰寫多語言版本（僅繁體中文）
- 不在 README 中加入 API 文件或開發者深度指南

## Capabilities

### New Capabilities

（無新功能，本次為文件更新）

### Modified Capabilities

（無 spec 層級的行為變更，僅更新文件）

## Impact

- 受影響檔案：`README.md`
- 無程式碼、API 或依賴變更
