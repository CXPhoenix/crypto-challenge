## 1. 修復 verdict-detail-control 結構性缺陷（D1：verdict-detail-control 重複段落處理策略）

- [x] 1.1 刪除 `verdict-detail-control/spec.md` 中 `## ADDED Requirements` section（行 1–260），僅保留 `## Requirements` section，滿足 Verdict Detail Spec Structure 要求
- [x] 1.2 在保留的 `## Requirements` section 上方加入 spec 標題與 `## Purpose` 段落，確保檔案結構完整

## 2. 填寫 TBD Purpose placeholder（D2：TBD Purpose 填寫方式）

以下 11 項任務可並行執行，每項從對應 spec 的 Requirements 提煉 Purpose 摘要，取代 `TBD - created by archiving change '...'` placeholder，滿足 Active spec Purpose section completeness 要求。

- [x] 2.1 填寫 `release-dist-packaging/spec.md` 的 Purpose 段落
- [x] 2.2 填寫 `challenge-runner-orchestration/spec.md` 的 Purpose 段落
- [x] 2.3 填寫 `wasm-pool-judge/spec.md` 的 Purpose 段落
- [x] 2.4 填寫 `paramspec-enum-faker/spec.md` 的 Purpose 段落
- [x] 2.5 填寫 `resizable-result-panel/spec.md` 的 Purpose 段落
- [x] 2.6 填寫 `non-blocking-challenge-load/spec.md` 的 Purpose 段落
- [x] 2.7 填寫 `python-generator/spec.md` 的 Purpose 段落
- [x] 2.8 填寫 `vitepress-markdown-panel/spec.md` 的 Purpose 段落
- [x] 2.9 填寫 `execute-mode/spec.md` 的 Purpose 段落
- [x] 2.10 填寫 `generator-strip-plugin/spec.md` 的 Purpose 段落
- [x] 2.11 填寫 `encrypted-pool-generation/spec.md` 的 Purpose 段落

## 3. 補齊缺少 Purpose section 的 spec（D3：缺少 Purpose section 的 spec 處理方式）

以下 7 項任務可並行執行（其中 verdict-detail-control 已在 1.2 處理）。對沒有 Purpose section 的 spec 插入 `## Purpose` 段落；若有 `## Overview`，將其重新命名為 `## Purpose`。

- [x] 3.1 為 `challenge-dual-theme/spec.md` 補上 `## Purpose` 段落（現有 `## Overview` 重新命名）
- [x] 3.2 為 `csp-policy/spec.md` 補上 `## Purpose` 段落
- [x] 3.3 為 `editor-autocomplete/spec.md` 補上 `## Purpose` 段落
- [x] 3.4 為 `pyodide-sandbox-guard/spec.md` 補上 `## Purpose` 段落
- [x] 3.5 為 `pyodide-self-host/spec.md` 補上 `## Purpose` 段落
- [x] 3.6 為 `release-convention/spec.md` 補上 `## Purpose` 段落

## 4. 清除陳舊 @trace 參考（D4：陳舊 @trace 參考清除範圍）

以下任務可並行執行，修正最嚴重的 @trace 錯誤路徑，滿足 Trace reference path validity 要求。

- [x] 4.1 移除或更新 `vitepress-markdown-panel/spec.md` 中指向已刪除 `challenge-generator/` crate 與 `*.toml` 的 @trace 條目
- [x] 4.2 移除或更新 `editor-autocomplete/spec.md` 中指向不存在的 `caesar-01/02/03.md` 與 `docs/superpowers/specs/` 的 @trace 條目
- [x] 4.3 更新 `python-generator/spec.md` 中指向已改名舊 challenge 檔名的 @trace 條目

## 5. 建立 spec-baseline-governance 治理規範（D5：spec-baseline-governance 治理規則定位）

- [x] 5.1 在 `openspec/specs/` 建立 `spec-baseline-governance/spec.md`，包含 Active spec Purpose section completeness、Single authoritative normative text、Trace reference path validity 三項治理要求
