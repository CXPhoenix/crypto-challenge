## Context

目前 `openspec/specs/` 底下的 18 份 active spec 存在三類基線問題：

1. **TBD Purpose placeholder**：11 份 spec 的 Purpose 段落仍保留 `TBD - created by archiving change '...'`，無法提供有效的規格摘要。
2. **結構性缺陷**：`verdict-detail-control/spec.md` 同時存在兩份完整的 normative section（`## ADDED Requirements` 與 `## Requirements`），二者對 Worker stripping 責任歸屬與 Challenge Store 規則互相矛盾。
3. **缺少 Purpose 段落**：7 份較早期歸檔的 spec（`challenge-dual-theme`、`csp-policy`、`editor-autocomplete`、`pyodide-sandbox-guard`、`pyodide-self-host`、`release-convention`、`verdict-detail-control`）完全沒有 Purpose section。
4. **陳舊 @trace 參考**：部分 spec 仍指向已刪除的 crate、已改名的檔案或不存在的路徑。

這些問題導致 active baseline 不可信，任何後續 `apply` 或 release review 都可能基於錯誤的規範做出判斷。

## Goals / Non-Goals

**Goals:**

- 消除所有 TBD Purpose placeholder，讓每份 active spec 都有反映實際功能的 Purpose 段落。
- 移除 `verdict-detail-control` 中重複的 `## ADDED Requirements` section，僅保留 `## Requirements` 作為唯一 authoritative normative text。
- 為 7 份缺少 Purpose section 的 spec 補上 Purpose 段落。
- 清除最嚴重的陳舊 @trace 參考（`vitepress-markdown-panel`、`editor-autocomplete`、`python-generator`、`verdict-detail-control`）。
- 建立 `spec-baseline-governance` spec，定義 active spec 的最小治理規則，防止同類問題再次發生。

**Non-Goals:**

- 不重寫任何 spec 的 Requirements 內容——本次變更只處理結構與後設資訊。
- 不變更任何應用程式碼。
- 不處理 archived/parked 變更中的 spec 問題。
- 不全面稽核所有 @trace 參考——僅修正最嚴重的 4 份 spec。

## Decisions

### D1：verdict-detail-control 重複段落處理策略

保留 `## Requirements` section（行 261–417），刪除整個 `## ADDED Requirements` section（行 1–260）。

**理由**：`## Requirements` 與當前程式碼實作一致，是最後一次 archive 合併後的正式版本。`## ADDED Requirements` 是更早期的 delta 殘留，其 Worker stripping 模型已過時。

**替代方案考慮**：曾考慮手動合併兩段，但二者互相矛盾，合併會引入語義歧義。直接保留較新且與程式碼一致的版本最為安全。

### D2：TBD Purpose 填寫方式

逐一閱讀每份 spec 的 Requirements section，從中提煉一段 1-3 句的 Purpose 摘要，描述該 capability 解決的問題與提供的核心能力。

**理由**：Purpose 段落的作用是讓讀者快速理解 spec 的範圍，不需要完整複述 Requirements。從現有 Requirements 提煉確保 Purpose 與實際規範保持一致。

### D3：缺少 Purpose section 的 spec 處理方式

對 7 份完全沒有 Purpose section 的 spec，在 `# Spec:` / `# <name> Specification` 標題之後、第一個 `## Requirements` 或 `### Requirement:` 之前插入 `## Purpose` 段落。如果 spec 有 `## Overview` 段落，將其重新命名為 `## Purpose` 以統一格式。

**理由**：統一所有 active spec 的結構，讓自動化工具和人工審查都能預期相同的 section 層級。

### D4：陳舊 @trace 參考清除範圍

僅處理以下 4 份 spec 中明確指向不存在路徑的 @trace：

| Spec | 問題 |
|------|------|
| `vitepress-markdown-panel` | 指向已刪除的 `challenge-generator/` crate 與 `*.toml` 檔案 |
| `editor-autocomplete` | 指向不存在的 `caesar-01/02/03.md` 與 `docs/superpowers/specs/` |
| `python-generator` | 指向已改名的舊 challenge 檔名 |
| `verdict-detail-control` | `## ADDED Requirements` 中的 `useExecutor.ts` trace（隨段落刪除一併消除） |

**理由**：全面掃描所有 @trace 超出本次變更範圍，但這 4 份是最嚴重的。`verdict-detail-control` 的 trace 問題會隨 D1 的段落刪除自動解決。

### D5：spec-baseline-governance 治理規則定位

新增 `spec-baseline-governance` spec 作為 meta-spec，定義 active spec 的最低品質門檻：

- Purpose 段落不得保留 archive placeholder 或 TBD。
- Active spec 不得同時存在多套互相競爭的 normative text。
- @trace 參考的路徑必須指向存在的檔案。

**理由**：沒有明確的治理規則，archive 流程會持續產生不合格的 active spec。定義規則後，未來的 `spectra validate` 或 code review 可以檢查合規性。

## Risks / Trade-offs

- **TBD Purpose 填寫品質** → 由 AI 從 Requirements 提煉的 Purpose 可能遺漏微妙語境。Mitigation：每份 Purpose 控制在 1-3 句，後續 review 可逐一修正。
- **刪除 ADDED Requirements 段落不可逆** → 資訊在 git history 中保留。Mitigation：刪除前確認 `## Requirements` 完整涵蓋所有 normative content。
- **@trace 清除可能遺漏部分條目** → 本次僅處理 4 份最嚴重的 spec。Mitigation：後續可開獨立 change 做全面 trace audit。
- **spec-baseline-governance 缺乏自動化驗證** → 本次僅建立文字規範，尚無 CI 自動檢查。Mitigation：規則明確後，後續可為 `spectra validate` 加入對應 lint rule。
