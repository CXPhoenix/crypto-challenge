## Context

目前 production runner 存在兩個正確性缺口：

1. **Pool identity 未驗證** — `pool.rs` 的 `load_pool()` 解密後取得 `PoolPayload`，其中包含 `challenge_id` 欄位，但該欄位標記為 `#[allow(dead_code)]` 且從未被讀取。呼叫端傳入的 `challenge_id` 直接作為 key 存入 `HashMap`，不與 payload 內嵌的值比對。由於所有 pool 使用相同 AES-GCM key 加密，任意 pool 檔案可被載入到任意 challenge name 下而不會報錯。現有測試全部使用相同 id（`"test"`）作為 payload 與 load 參數，因此從未覆蓋 mismatch 情境。

2. **Stop/cancel 導致 submit 懸掛** — production runner 的 `stop()` 呼叫 `runWorker?.terminate()` 並設 `isRunning = false`，但 `runStudentCode` 內部的 `killTimer`（`setTimeout` closure）未被清除，且 Promise 的三個 resolve 路徑（`run_complete`、`onerror`、`killTimer`）均未被觸發。這導致 `submit()` 返回的 Promise 永遠 pending，直到 `killTimer` 最終觸發（但 worker 已 terminated，不會再收到訊息）。Dev runner 有相同結構性問題：`stop()` 只 terminate `activeWorker`（generator 階段），不處理 submission worker 的 `killTimer`。`cleanup()` 也無法取消 killTimer，可能在 component unmount 後觸發 stale timer。

前端呼叫端為 `useChallengeRunner.ts`，其中 prod runner 在 line 267 呼叫 `wasm.load_pool(config.algorithm, data)`，直接以 `config.algorithm` 作為 `challenge_id`。

## Goals / Non-Goals

**Goals:**

- 在 WASM `load_pool()` 中加入 challenge_id 驗證，確保解密後 payload 的 `challenge_id` 與呼叫端提供的值一致，不一致時拒絕載入
- 統一修復 prod runner 與 dev runner 的 stop/cancel 語義，確保 `stop()` 後所有 in-flight Promise 以可預期方式 settle
- 確保 `cleanup()` 能取消所有 pending timer，避免 unmount 後 stale callback
- 補齊兩個缺口的測試覆蓋

**Non-Goals:**

- 不變更 pool 加密格式或 key management 機制
- 不重構 dev/prod runner 為共用 base class（結構差異過大，不值得為此次修復引入）
- 不處理 Pyodide worker 內部的 timeout 機制（由 worker 自行管理）
- 不變更前端 UI 行為或 ChallengeView 元件

## Decisions

### Pool identity 驗證加入 load_pool

在 `pool.rs` 的 `load_pool()` 中，解密並反序列化 `PoolPayload` 後，立即比對 `payload.challenge_id == challenge_id`。不一致時回傳 `Err` 並附帶兩個 id 值的訊息。

移除 `#[allow(dead_code)]` 標記，因為 `challenge_id` 欄位將被實際使用。

**替代方案考量：** 曾考慮在前端（`useChallengeRunner.ts`）做驗證，但 pool payload 只有 WASM 層能存取，前端無法讀取解密後的 `challenge_id`，因此驗證必須在 Rust 側進行。

**測試策略：** 新增 Rust 單元測試，使用 `make_encrypted_pool` helper 產生 payload 含 `challenge_id: "foo"` 的加密資料，但以 `"bar"` 作為參數呼叫 `load_pool`，斷言回傳 identity mismatch 錯誤。

### Stop 時取消 killTimer 並 settle in-flight Promise

核心問題是 `stop()` terminate worker 後，`runStudentCode` 的 Promise 無人 resolve。修復方式：

**Prod runner (`runStudentCode`)：**
- 將 `killTimer` 的 timer id 提升為可從 `stop()` 存取的變數（例如 closure 外的 `let` 或 runner 層級變數）
- `stop()` 中：(1) `clearTimeout(killTimer)` (2) `worker.terminate()` (3) 透過 abort 機制使 Promise resolve（`null` 表示中止）

具體實作：使用一個 `AbortController` 或等效的 flag + resolve reference 模式。將 `resolve` 函式存為 runner 層級變數，`stop()` 時直接呼叫 `resolve(null)` 並 `clearTimeout`。

**Dev runner (`submit` 中的 submission worker)：**
- 同樣的結構性問題：`submit()` 建立的 worker 與 `killTimer` 對 `stop()` 不可見
- 將 submission worker reference 與 killTimer id 提升為 runner 層級變數
- `stop()` 中同時處理 generator worker（`activeWorker`）與 submission worker

**替代方案考量：** 曾考慮使用 `AbortController` + `AbortSignal`，但 Promise executor 內的 abort 處理較繁瑣，且不需要跨 API 傳遞 signal。直接持有 `resolve` reference 更簡單直接。

### Cleanup 取消所有 pending timer

`cleanup()` 需與 `stop()` 共用相同的清理邏輯：清除 killTimer、terminate worker、settle pending Promise。實作上 `cleanup()` 可直接呼叫 `stop()` 再做額外清理（如 null 化 references）。

## Risks / Trade-offs

- **[Risk] 持有 resolve reference 可能導致記憶體洩漏** — 若 Promise 已 settle 但 reference 未清除。Mitigation：在每次 resolve 呼叫後立即將 reference 設為 `null`，並在 `onmessage`/`onerror` handler 中檢查是否已被 stop 搶先 resolve。
- **[Risk] Pool identity 驗證可能在 pool 重新生成後產生格式不匹配** — 若 `generate-pools.ts` 產出的 `challenge_id` 與前端 `config.algorithm` 不一致。Mitigation：確認 pool 生成腳本使用相同的 algorithm name 作為 `challenge_id`，並在 CI 中加入 pool 載入驗證。
- **[Risk] 雙 runner 修復增加測試負擔** — Dev runner 和 prod runner 的 stop 修復需各自獨立測試。Mitigation：兩者測試可平行撰寫，且結構相似，可共用 test helper。
- **[Trade-off] 不引入共用 base 代表 dev/prod 的 stop 邏輯會有重複** — 接受此 trade-off，因為兩者的 worker 管理流程差異明顯（dev 有 generator + submission 兩階段，prod 只有 submission），共用 base 反而會增加複雜度。
