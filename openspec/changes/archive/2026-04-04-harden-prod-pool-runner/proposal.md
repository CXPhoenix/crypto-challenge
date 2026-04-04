## Why

production runner 的正確性目前有兩個明顯缺口：加密 pool 載入時不驗證 payload 內的 challenge identity，且手動停止執行時可能讓 `submit()` 永遠 pending。這兩類問題都會直接破壞 production judge 的可信度與可操作性。

## What Changes

- 要求 WASM `load_pool()` 驗證解密後 payload 的 `challenge_id` 與呼叫端提供的 challenge id 一致，不一致時立即拒絕載入。
- 明確定義 production runner 的 stop / cancel 語義，確保中止後 in-flight submit 會以可預期方式結束，而不是懸掛。
- 補齊 production path 的單元與整合測試，涵蓋錯誤 pool 載入、worker 中止與 runner 狀態收斂。
- 收斂 production runner 與 WASM judge 的責任邊界，避免正確性依賴未定義的實作細節。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `challenge-runner-orchestration`: production strategy 的 stop / submit lifecycle 必須定義可取消且可收斂的行為。
- `wasm-pool-judge`: pool 載入階段必須驗證 embedded challenge identity，避免合法但錯題的 pool 被靜默接受。

## Impact

- Affected specs: `challenge-runner-orchestration`, `wasm-pool-judge`
- Affected code: `.vitepress/theme/composables/useChallengeRunner.ts`, `.vitepress/theme/__tests__/useChallengeRunner-prod.spec.ts`, `testcase-generator/src/pool.rs`, `testcase-generator/src/lib.rs`, `testcase-generator/src/judge.rs`, `testcase-generator/Cargo.toml`
