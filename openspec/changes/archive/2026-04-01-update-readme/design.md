## Context

README.md 自專案初期建立後未隨開發進度同步更新。目前專案已達 v1.0.0，包含 8 道密碼學挑戰題、140 個測試、GitHub Actions Release workflow、Pyodide 自託管機制與 CSP 安全策略。README 中的題目列表、測試數量、專案結構與建置說明均已過時，缺少部署與瀏覽器相容性等關鍵資訊。

## Goals / Non-Goals

**Goals:**

- 使 README 準確反映 v1.0.0 的完整功能與專案狀態
- 為新使用者提供完整的快速上手指引（含 Pyodide 下載、安全標頭說明）
- 為有意自行部署者提供部署指引
- 為貢獻者提供更新後的 frontmatter 範例

**Non-Goals:**

- 不建立多語言 README（僅繁體中文）
- 不加入線上 Demo 連結（尚無公開部署）
- 不撰寫開發者 API 文件或深度架構指南

## Decisions

### README 章節結構

維持原有章節順序的基礎上，新增「部署」與「瀏覽器相容性」兩個章節，插入於「測試」與「專案結構」之間。

理由：部署與瀏覽器限制是使用者在 build 之後最可能遇到的問題，放在建置/測試之後、專案結構之前是自然的閱讀流。

### Badge 策略

使用 shields.io static badge 顯示版本號（`v1.0.0`）與測試數量（`140 passing`）。License badge 改為明確標示 `ECL-2.0`。

理由：static badge 不依賴外部 CI 狀態，適合目前無持續整合測試 badge 的狀態。版本號手動維護，與 package.json 同步。

### 題目列表呈現

擴充為 8 題，表格欄位：序號、演算法名稱、操作類型、難度。不加入 tags 欄位。

理由：tags 資訊過於細碎，對 README 讀者而言難度與操作類型已足夠判斷題目特性。

### frontmatter 範例更新

以 RSA 題目（最複雜的 params）作為範例，展示 `hex`、`prime`、`multiple_of`、`values` 等新 params 類型。

理由：選擇最完整的範例能讓貢獻者一次看到所有可用選項。

## Risks / Trade-offs

- **[測試數量過時]** → static badge 需手動更新，未來測試數量變動時可能再次落後。可在日後導入 CI badge 時解決。
- **[版本號同步]** → package.json 版本與 README badge 需手動保持一致。可在 release workflow 中加入自動更新步驟，但不在本次範圍。
