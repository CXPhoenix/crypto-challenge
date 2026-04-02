## 1. 重寫 RSA 基礎運算 Generator

- [x] 1.1 將 `docs/challenge/rsa-basic.md` 的 `generator` 改為 factory mode：使用內嵌質數表產生合法 RSA 參數，輸出 JSON factory format `{"input": "...", "expected_output": "..."}`（對應 spec「Frontmatter defines a Python generator instead of Rust algorithm」的 factory mode 場景）
- [x] 1.2 params 保留 dummy 定義：簡化 `rsa-basic.md` 的 `params` 為 dummy 參數（使用 factory generator 而非修改 param system），並加上 YAML 註解說明 factory mode 用法
- [x] 1.3 確認 generator 內嵌質數表覆蓋 [10, 97] 範圍所有質數，並使用 `math.gcd` 做 e 的選取策略（rejection sampling）

## 2. 驗證

- [x] 2.1 在 dev mode 開啟 `localhost:5174/challenge/rsa-basic.html`，確認 8/8 測資皆可正確判定（空 starter code 應為 0/8 AC，正確實作應為 8/8 AC）
- [x] 2.2 執行 pool 生成（`pnpm build:pools` 或等效指令），確認 `rsa_basic.bin` 可成功產生且不因 generator 崩潰而失敗（對應 factory mode generator 產生數學上合法的 RSA 參數場景）
