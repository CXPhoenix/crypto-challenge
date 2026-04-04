## Context

Production runner 在 `secure-challenge-pools` change 中建立了主幹流程：fetch encrypted pool → WASM `load_pool` → `select_testcases` → Pyodide worker 執行學生程式碼 → WASM `judge` 回傳 verdict。這條線已可運作，但三個面向未收束：

1. `verdict_detail` 的 source-of-truth 仍從 frontmatter 傳入 UI，與 WASM judge 內部使用 pool 的值不一致
2. Worker 協議未區分 dev/prod 模式，prod 仍透過 `RunRequest` 傳送空的 `expected_output` 和固定的 `verdictDetail: 'actual'`
3. Spec 描述目標架構但未記錄過渡狀態

目前 8 個 challenge 皆未設定 `verdict_detail` frontmatter，全部走預設 `hidden`，因此衝突被遮蔽。

### 限制條件

- WASM export 是 `wasm_bindgen` + `serde_wasm_bindgen`，回傳值改動需同步 Rust struct 與 TypeScript type
- Worker 透過 `postMessage` 通訊，訊息類型需向後相容（dev mode 仍用 `RunRequest`）
- `tdd: true`：所有行為變更需先寫測試

## Goals / Non-Goals

**Goals:**

- `verdict_detail` 在 prod mode 的 source-of-truth 從 pool 一路貫穿到 UI，frontmatter 值僅作為 dev mode 與 fallback 使用
- Worker 協議在 prod mode 下使用語義明確的 `RunOnlyRequest`，不攜帶比較相關欄位
- Spec 準確反映目前的過渡狀態與目標架構的差距
- Production path 有前端整合測試覆蓋

**Non-Goals:**

- 不改動 dev mode 行為
- 不改動 WASM judge 內部的 constant-time comparison 或 field stripping 邏輯
- 不處理 build pipeline 的 Python 環境依賴（獨立 change）
- 不做 E2E 加解密 round-trip 測試（P2 debt）

## Decisions

### Decision 1：透過 `select_testcases` 回傳 `verdict_detail`

**選擇**：在 `pool::select_testcases` 回傳 `(session_id, inputs, verdict_detail)`，WASM export 的 `SelectResult` 增加 `verdict_detail: String` 欄位。

**替代方案**：
- (A) 新增獨立 WASM export `get_verdict_detail(challenge_id, session_id) -> String`
  - 缺點：多一次跨 WASM 呼叫；session_id 在 judge 後被消耗，呼叫時機受限
- (B) 在 `load_pool` 回傳時就提供 `verdict_detail`
  - 缺點：一個 pool 只有一個 verdict_detail，但 `load_pool` 不回傳任何值（目前只回傳 `Result<(), JsError>`）；需要額外型別改動，且 session 尚未建立

**理由**：verdict_detail 在 session 建立時即確定（`pool.verdict_detail` 複製到 `Session`），跟隨 `select_testcases` 回傳是最自然的時機點，前端在拿到 inputs 的同時就知道如何設定 UI 顯示層級。

### Decision 2：新增 `RunOnlyRequest` 訊息類型

**選擇**：在 `pyodide.worker.ts` 新增 `RunOnlyRequest` 介面：

```typescript
interface RunOnlyRequest {
  type: 'run_only'
  code: string
  inputs: string[]
  opLimit?: number
}
```

Worker 處理 `run_only` 時只執行程式碼、收集 stdout/error/elapsed_ms，不做比較、不接收 `verdictDetail`。回傳格式：

```typescript
interface RunOnlyResult {
  type: 'testcase_result'
  index: number
  stdout: string
  error?: string
  elapsed_ms: number
}
// 最後一筆: { type: 'run_complete' }
```

**替代方案**：
- (A) 在現有 `RunRequest` 加 flag（例如 `compareMode: boolean`）
  - 缺點：增加既有介面複雜度，dev/prod 語義混在同一型別
- (B) 維持現狀（`expected_output: ''` + `verdictDetail: 'actual'`）
  - 缺點：永遠保留無意義的比較路徑，未來維護者可能誤觸

**理由**：新訊息類型讓 dev 與 prod 的語義在型別層級就完全分離。Worker 的 `onmessage` handler 用 `switch(event.data.type)` 分派，新增 `'run_only'` case 不影響既有 `'run'` 路徑。

### Decision 3：`useProdRunner` verdictDetail 改為 reactive ref

**選擇**：`useProdRunner` 內部維護一個 `const poolVerdictDetail = ref<VerdictDetail>('hidden')`，在 `select_testcases` 回傳後更新。回傳值改為 `verdictDetail: poolVerdictDetail`（ComputedRef 或 Ref），取代目前的 `config.verdictDetail`（靜態值）。

**理由**：verdict_detail 在每次 `select_testcases` 時可能變更（雖然同一 pool 不會變，但語義上 ref 更正確）。ChallengeView 已透過 `runner.verdictDetail` 傳入 TestResultPanel，改成 ref 不需改動 template binding。

### Decision 4：Spec 更新策略 — 加入 Current State 段落

**選擇**：在 `challenge-runner-orchestration`、`python-generator`、`verdict-detail-control` 三份 spec 的相關 Requirement 下方加入 `#### Current State` 段落，記錄：
- 目前的過渡實作方式
- 與目標架構的差距
- 此 change 完成後的預期狀態

**理由**：Spec 是 living document。記錄過渡狀態讓後續開發者不需要反向工程就能理解「為什麼 code 跟 spec 不完全一致」。

### Decision 5：測試策略

**選擇**：為 production path 新增以下前端整合測試：

1. **`useChallengeRunner` prod path 測試**：mock `fetch` 與 WASM module，驗證：
   - `loadTestcases` 正確呼叫 `load_pool` + `select_testcases`
   - `select_testcases` 回傳的 `verdict_detail` 被設為 runner 的 verdictDetail
   - `submit` 透過 `RunOnlyRequest` 送入 worker（不含 `expected_output` / `verdictDetail`）
   - `judge` 回傳的 verdict 正確映射到 `executorStore`
   - Session 在 judge 後重新 select

2. **`ChallengeView` prod mode verdict_detail 一致性測試**：驗證 `TestResultPanel` 收到的 `verdict-detail` prop 來自 pool，而非 frontmatter

3. **Worker `run_only` 測試**：驗證 worker 收到 `RunOnlyRequest` 後只回傳 stdout/error/elapsed_ms，不回傳 verdict 或 expected

**理由**：TDD 要求先寫測試。這些測試覆蓋了 P0-2（source-of-truth）和 P1-1（RunOnlyRequest）的核心行為，不需要真實 WASM 或 Pyodide 即可驗證協議層面的正確性。

## Risks / Trade-offs

- **[Risk] `select_testcases` 回傳值變更是 breaking change** → 由於 WASM export 只被 `useProdRunner` 呼叫，影響範圍有限。但 `wasm-pack` 產生的 `.d.ts` 不會自動更新型別，需手動確認 TypeScript 側的型別一致。
  - Mitigation：在 `useChallengeRunner.ts` 的 `WasmPoolMod` type 同步更新 `select_testcases` 回傳型別。
- **[Risk] Worker `RunOnlyRequest` handler 引入 regression** → `'run'` handler 路徑不變，新增 `'run_only'` 是 additive。
  - Mitigation：既有 worker 測試繼續覆蓋 `'run'` 路徑；新增測試覆蓋 `'run_only'`。
- **[Trade-off] 過渡期 worker 同時支援兩種 request 類型** → 增加 worker 程式碼量。但這是刻意的向後相容設計，dev mode 繼續用 `RunRequest`。
