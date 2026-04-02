## Why

RSA 基礎運算挑戰的 generator 在 dev mode 下產生大量假陽性判定（false AC）。根因是 frontmatter 中宣告的參數約束（`prime: true`、`valid_public_exponent: true`、`less_than: n`）被 WASM RNG 和 pool generator 的 Python RNG 靜默忽略，導致約 58% 的隨機輸入使 generator 在 `pow(e, -1, phi)` 處崩潰，expected_output 變成空字串，與學生未實作的空輸出匹配而誤判為 AC。Prod mode 的 pool 生成同樣會因此崩潰。

## What Changes

- 將 `docs/challenge/rsa-basic.md` 的 generator 從「接收 WASM 隨機參數」改為「factory generator 格式」，由 generator 自行產生合法的 RSA 參數（質數 p/q、與 phi 互質的 e、m < n）並輸出 `{"input": "...", "expected_output": "..."}` JSON
- 簡化 `rsa-basic.md` 的 `params` 為僅保留觸發用的 dummy 參數（因 factory generator 會忽略 WASM 生成的輸入，但 params 仍需存在以驅動 testcase_count 次生成）

## Non-Goals (optional)

- 不在 WASM param system 實作 `prime`、`valid_public_exponent`、`less_than` 等跨參數約束（列為 future work）
- 不變更 factory generator 的 JSON 協定（dev worker 和 pool generator 已支援）
- 不修改其他挑戰的 generator

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `python-generator`: generator 從「純接收參數產出 expected_output」改為支援 factory 模式自行產生合法輸入。此為 spec 中 JSON factory format 的既有能力，但 RSA 挑戰是第一個實際需要使用此模式的案例，需確認 spec 描述涵蓋此用法。

## Impact

- 受影響檔案：`docs/challenge/rsa-basic.md`（generator 與 params 重寫）
- 受影響 spec：`python-generator`（可能需要補充 factory generator 使用情境的描述）
- 不影響 WASM testcase-generator、useChallengeRunner、pyodide worker 或 generate-pools.ts（這些元件已支援 factory format）
