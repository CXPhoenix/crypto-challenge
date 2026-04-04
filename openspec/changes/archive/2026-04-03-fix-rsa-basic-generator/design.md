## Context

目前 `rsa-basic.md` 的 generator 是「被動式」：接收 WASM 根據 params 產生的隨機 p, q, e, m，直接計算 RSA 值。但 WASM 的 `ParamSpec::Int` 不支援 `prime`、`valid_public_exponent`、`less_than` 等約束，產出的參數大多不合法，導致 `pow(e, -1, phi)` 崩潰。

系統已內建 factory generator JSON 協定（`{"input": "...", "expected_output": "..."}`），dev worker 和 pool generator 都已支援。RSA 挑戰只需切換到此模式即可。

## Goals / Non-Goals

**Goals:**

- RSA 基礎運算的所有測資都是數學上合法的（p, q 為質數、gcd(e, phi)=1、0 ≤ m < n）
- Generator 不再因無效輸入崩潰
- Dev mode 和 prod mode（pool 生成）都能正常運作

**Non-Goals:**

- 不實作 WASM param system 的 constraint 機制
- 不變動 factory generator JSON 協定
- 不影響其他挑戰

## Decisions

### 使用 factory generator 而非修改 param system

Factory generator 由 generator 腳本自行產生合法輸入，繞過 WASM RNG 的限制。

- **選項 A（採用）**：Factory generator — generator 輸出 JSON，自行控制輸入產生
  - 優點：零架構改動，現有協定已支援
  - 缺點：WASM 產生的 params 被浪費（但開銷極低）
- **選項 B（不採用）**：在 WASM param system 加入跨參數約束
  - 優點：宣告式、通用
  - 缺點：需要依賴圖、reject-resample 邏輯，改動量大，目前只有 RSA 一題需要

### params 保留 dummy 定義

Factory generator 忽略 WASM 傳入的值，但 `params` 欄位仍需存在於 frontmatter，因為 `useChallengeRunner` 和 `generate-pools.ts` 都依賴它來驅動生成迴圈。保留一個最小化的 dummy int param 即可。

### Generator 內嵌質數表

10–97 範圍內的質數固定為 21 個，直接硬編碼在 generator 中，用 `random.choice()` 取值。不使用 `sympy` 等外部套件，避免 Pyodide 環境的依賴問題。

### e 的選取策略

在 `[2, phi-1]` 範圍內隨機取值，以 `math.gcd(e, phi) == 1` 做 rejection sampling。由於 phi 的歐拉函數密度通常夠高，rejection loop 幾乎不會超過幾次迭代。

## Risks / Trade-offs

- **[風險] Generator 用 `random` 模組，不同 Python 環境的隨機序列不同** → 不影響正確性，因為每次執行都是獨立生成，不依賴 deterministic seed
- **[風險] Dummy params 可能讓未來維護者困惑** → 在 frontmatter 中加註解說明此為 factory generator，params 僅用於觸發
- **[取捨] WASM 仍會為 dummy param 生成無用數值** → 開銷可忽略（一個 int 生成 8 次）
