## Why

active specs 目前仍混有 archive placeholder、重複 requirement block 與互相衝突的規範段落，已經不足以當作 staging 前審查基準。若不先清理，後續任何 `apply` 或 release review 都會建立在不可信的規格基線上。

## What Changes

- 將 active specs 中所有 `TBD - created by archiving ...` 的 Purpose 改為專案實際語境下的明確描述。
- 移除或合併 duplicated / conflicting normative sections，優先修正 `verdict-detail-control` 中並存的兩套 production 模型。
- 補齊與整理 active specs 的敘述，讓每份 spec 僅保留一套 authoritative requirements。
- 保持 trace 與 capability 命名一致，避免 archive 遺留內容繼續污染 active baseline。

## Capabilities

### New Capabilities

- `spec-baseline-governance`: 定義 active specs 的最小治理基線，包括 Purpose 不得保留 archive placeholder，且 active baseline 不得同時保留多套互相競爭的 normative text。

### Modified Capabilities

- `verdict-detail-control`: 合併重複且彼此衝突的 requirement blocks，保留單一 production / development 規範。

## Impact

- Affected specs: `spec-baseline-governance`, `verdict-detail-control`
- Affected code: `openspec/specs/challenge-runner-orchestration/spec.md`, `openspec/specs/encrypted-pool-generation/spec.md`, `openspec/specs/execute-mode/spec.md`, `openspec/specs/generator-strip-plugin/spec.md`, `openspec/specs/non-blocking-challenge-load/spec.md`, `openspec/specs/python-generator/spec.md`, `openspec/specs/release-dist-packaging/spec.md`, `openspec/specs/resizable-result-panel/spec.md`, `openspec/specs/verdict-detail-control/spec.md`, `openspec/specs/vitepress-markdown-panel/spec.md`, `openspec/specs/wasm-pool-judge/spec.md`
