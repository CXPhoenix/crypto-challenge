## Context

目前平台採用純 client-side 架構：VitePress 將 Markdown frontmatter（含 `generator` Python code）打包進 JS bundle，在瀏覽器端透過 Pyodide Worker 執行 generator 產生 expected output，再與學生 code 的 output 比對。這意味著題目解答（generator code + expected output）全程以明文存在於前端。

同時，`ChallengeView.vue` 作為 God Component 同時承擔測資生成協調、verdict 判定、UI 互動三大職責，`pyodide.worker.ts` 也承擔 generate / run / execute 三種角色，使安全改動的影響面過大。

### 現有技術棧

- Frontend: VitePress 2.0 + Vue 3 + Pinia + Tailwind CSS 4
- WASM: Rust (`wasm-pack`, `wasm-bindgen`) — 目前僅做 input generation
- Python runtime: Pyodide 0.29.3（self-hosted）
- Build: pnpm + Vite
- 部署: static site（無 server-side）

### 限制條件

- 維持 static site 部署模式，不引入後端
- Dev mode 不受影響（教師本機開發不需要安全防護）
- 已有 8 題，其中 `des-ecb-cbc` 需要 `pycryptodome` 套件
- 支援 JSON factory format（generator 可輸出 `{input, expected_output}` JSON 來轉換學生的 input）

## Goals / Non-Goals

**Goals:**

- Generator code 在 production build 中不進入 client bundle
- `verdict_detail=hidden` 時，expected output 不經過 JS 層
- WASM 作為黑箱判定引擎，在 linear memory 內完成解密與比對
- 解耦 ChallengeView / Worker / Executor 的職責
- Dev mode 維持現有流程

**Non-Goals:**

- 不追求抵擋 WASM 反組譯的高階攻擊（目標是 Level 3-4 防護）
- 不引入 server-side 架構
- 不改動 Markdown 檔案結構
- 不重寫 Pyodide sandbox guard / CSP policy

## Decisions

### Decision: Build-time pool 預計算使用 Python subprocess

Build script 以 Node.js（TypeScript）為主體，呼叫 Python subprocess 執行 generator code，而非在 Node.js 中載入 Pyodide npm package。

**Why**: Python subprocess 原生支援所有 pip 套件（pycryptodome 等），無需處理 Pyodide 在 Node.js 環境的 micropip 安裝問題。Build time 不需要 WASM Python runtime 的開銷。

**替代方案**: Pyodide npm package — 被拒絕，因為 `pycryptodome` 等原生套件在 Pyodide Node.js 環境下的相容性不穩定。

### Decision: 單一 WASM module 擴展而非新增第二個 module

在現有 `testcase-generator` module 中新增 crypto / pool / judge 功能，而非建立獨立的 `challenge-judge` module。

**Why**: 前端只需載入一個 WASM binary，減少網路請求和初始化複雜度。Feature flag 機制已有先例（`faker` feature）。Input generation 在 dev mode 仍需使用。

**替代方案**: 兩個獨立 WASM module — 被拒絕，因為增加前端載入複雜度且需要兩套 JS binding。

### Decision: AES-256-GCM 加密 + obfuscated key 嵌入 WASM

使用 AES-256-GCM 作為 pool 加密方案，key 以 XOR split 方式嵌入 Rust 原始碼。

**Why**: AES-GCM 提供加密 + 完整性保護（AEAD），`verdict_detail` 值嵌入加密 payload 可防止攻擊者竄改透明度設定。WASM binary 比 JS 更難 inspect。

**Key 管理**:
- 加密金鑰為專案級 secret，儲存於 `.env.pool`（gitignored）
- Build script 讀取金鑰，生成 `testcase-generator/src/key_material.rs`（gitignored）
- `key_material.rs` 將 32-byte key 拆分為 4 段 8-byte const，各自 XOR 一組 compile-time random mask
- WASM 解密時即時組裝 key，用完以 `zeroize` crate 清除

**替代方案**: ChaCha20-Poly1305 — 功能等價但 `aes-gcm` crate 在 Rust/WASM 生態更成熟。

### Decision: Pool 二進位格式

```
[magic: "CXPOOL" 6B][version: 1B][nonce: 12B][ciphertext + auth_tag]
```

加密 payload（JSON）:
```json
{
  "challenge_id": "caesar_encrypt",
  "verdict_detail": "hidden",
  "testcases": [
    {"input": "HELLO\n3\n", "expected_output": "KHOOR"},
    ...
  ]
}
```

**Why**: `verdict_detail` 在加密內部，攻擊者無法在不破解加密的情況下竄改。Magic bytes + version 提供格式驗證和未來擴展能力。JSON payload 簡化序列化邏輯。

### Decision: WASM session-based API 防止 replay

WASM module 使用 session_id 概念：`select_testcases()` 回傳一組 `session_id`，後續 `judge()` 和 `get_expected()` 必須提供相同 session_id。Session 為一次性（judge 完成後自動銷毀）。

**Why**: 防止攻擊者重複查詢不同的 expected output（如果 verdict_detail=full 只在 judge 時回傳，而非可以無限次呼叫 get_expected）。

### Decision: useChallengeRunner 以策略模式統一 dev/prod 流程

新增 `useChallengeRunner` composable，內部根據 `import.meta.env.MODE` 切換兩種策略：

- **Dev 策略**: WASM generate inputs → Pyodide Worker run generator → JS 比對（現有流程）
- **Prod 策略**: fetch encrypted pool → WASM decrypt + select → Pyodide Worker run student code → WASM judge

兩種策略對外暴露相同 API:
```typescript
interface ChallengeRunner {
  loadTestcases(): Promise<void>
  inputs: Ref<string[]>
  submit(code: string): Promise<void>
  isReady: Ref<boolean>
  verdictDetail: VerdictDetail
}
```

**Why**: ChallengeView 不再需要知道測資來源和判定機制，實現了 God Component 的解耦。Dev mode 完全不受影響。

### Decision: Worker 職責精簡為純執行引擎

Production mode 下，Pyodide Worker 只處理 `run` 和 `execute` 兩種 message：
- `run`: 接收 `{code, inputs[]}` → 回傳 `{outputs[{stdout, error?, elapsed_ms}]}`
- `execute`: 不變（RunModal 用）

`GenerateRequest` handler 僅在 dev mode 保留（由 useChallengeRunner dev 策略呼叫）。Verdict 比對完全移至 WASM module。

**Why**: Worker 不再接觸 expected_output，切斷了最後一條 JS 層的答案洩漏路徑。

### Decision: Build pipeline 順序與兩次 WASM build 的避免

Build 順序：
1. `build:wasm` — 完整 build（含 crypto/pool/judge，使用 key_material.rs）
2. `build:pools` — Node.js script 用 Python subprocess 生成 pool（不需要 WASM）
3. `build:pyodide` — 下載 Pyodide
4. `docs:build` — VitePress build（含 strip-generator plugin）

**Why**: Pool 生成不依賴 WASM（input 也由 Python 生成），因此 WASM 和 pool 可以平行或任意順序 build。唯一前提是 `key_material.rs` 在 WASM build 之前已存在（由初始化腳本或 CI 設定生成）。

## Risks / Trade-offs

### [Risk] WASM linear memory 可被 JS 存取 → 中等風險

**描述**: 攻擊者可透過 `wasmInstance.exports.memory.buffer` 存取 WASM linear memory，搜尋解密後的 testcase 資料。

**緩解**:
- Decrypt on-demand：僅解密本次 session 選中的 testcases
- Judge 完成後立即 `zeroize` 清除解密資料
- 控制 WASM memory 的配置不 export（使用 `wasm-bindgen` 預設行為）

### [Risk] WASM 反組譯可提取加密金鑰 → 中等風險

**描述**: 攻擊者可使用 `wasm2wat` 反組譯 WASM binary，搜尋 key material。

**緩解**:
- Key 拆分為多段 XOR mask，非連續儲存
- 組裝邏輯分散在多個函式中
- 這是 client-side 方案的固有限制，但已大幅提高門檻（從「開 DevTools 5 秒」到「反組譯 WASM + 理解 key 組裝邏輯」）

### [Risk] Pool 測資有限，理論上可窮舉 → 低風險

**描述**: Pool 預計算 200 組測資，隨機選 10 組。學生理論上可收集所有可能的測資組合。

**緩解**: C(200, 10) ≈ 2.2 × 10^16 種組合，窮舉不可行。每次 build 可重新生成不同 pool。

### [Risk] Build time 需要 Python 環境 → 低風險

**描述**: Build script 需要系統安裝 Python 3 + pycryptodome。

**緩解**: CI/CD 環境中安裝 Python 是標準做法。本地開發 dev mode 不需要 pool generation。

### [Trade-off] Dev mode 仍使用不安全流程

**描述**: Dev mode 為了 DX 保留現有流程（generator code 在 JS 中流動）。

**接受原因**: Dev mode 只在教師本機執行，不需要對學生防護。要求 dev mode 也走 pool 流程會嚴重影響開發效率（每次改 generator 都要重新生成 pool）。
