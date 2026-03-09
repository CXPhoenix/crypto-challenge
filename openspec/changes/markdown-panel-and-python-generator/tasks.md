## 1. Rust WASM 重構

- [x] 1.1 新增 `indexmap` dependency 到 `Cargo.toml`，實作 params 順序保證：`indexmap::IndexMap` 取代 `HashMap` 以確保 JSON key 順序即為 stdin 行順序
- [x] 1.2 修改 `src/parser.rs`：改為解析 JSON params（`serde_json`），移除所有 TOML 解析邏輯；Frontmatter defines a Python generator instead of Rust algorithm
- [x] 1.3 修改 `src/lib.rs`：`generate_challenge(params_json, count)` 改為接收 JSON params 字串，只回傳 `{ inputs: Vec<String> }`；Rust WASM generates random inputs only；`generate_challenge(params_json, count)` 改為接收 JSON params
- [x] 1.4 移除 `list_algorithms` 和 `parse_challenge_meta` WASM export（Rust algorithms directory is removed）
- [x] 1.5 刪除 `src/algorithms/` 整個目錄（Rust `algorithms/` 目錄完整刪除）
- [x] 1.6 刪除 `src/template.rs`
- [x] 1.7 重新編譯 WASM 並確認 `docs/public/wasm/` 產出正確

## 2. VitePress Layout 系統

- [x] 2.1 修改 `Layout.vue`：新增 challenge layout 分支，當 `frontmatter.layout === 'challenge'` 時渲染 `ChallengeView`（VitePress Custom Layout 取代 `layout: false`）；Challenge pages use custom VitePress layout
- [x] 2.2 修改 `ProblemPanel.vue`：確認已使用 `<Content />`，移除 `:markdown` prop 定義（Left panel renders VitePress native markdown）
- [x] 2.3 修改 `ChallengeView.vue`：移除 `import.meta.glob` TOML 載入邏輯，改從 `frontmatter` 讀取 `title`、`difficulty`、`params`、`generator`、`starter_code`；Challenge metadata lives entirely in frontmatter；No TOML files exist in the repository

## 3. Pyodide Worker 與 Generator 流程

- [x] 3.1 在 `pyodide.worker.ts` 新增 `GenerateRequest`（含 `generatorCode: string, inputs: string[]`）與 `GenerateComplete` 訊息型別（Pyodide Worker 新增 `generate` 訊息，重用現有 Worker）
- [x] 3.2 實作 Worker 的 `generate` 訊息處理：對每個 input 執行 generatorCode，stdin = input，擷取 stdout 為 expected_output；錯誤時填入 error 欄位（Pyodide Worker executes generator to produce expected outputs）
- [x] 3.3 更新 `useWasm.ts`：`generateChallenge` 改為接收 `params_json` 字串，回傳型別改為 `{ inputs: string[] }`
- [x] 3.4 修改 `ChallengeView.vue` `onMounted`：實作兩階段生成流程——先呼叫 WASM 取得 inputs（傳入 frontmatter params JSON），再發送 `generate` 訊息給 Worker 取得 testcases（ChallengeView orchestrates two-phase testcase generation；Missing generator field causes visible error）
- [x] 3.5 更新 `challenge.ts` store：移除 `GeneratedChallenge` 的 `description` 欄位

## 4. 資料遷移：Markdown 頁面（15 個檔案）

將 15 個 `.md` 頁面更新：`layout: false` → `layout: challenge`，移除 `<ChallengeView />`，在 frontmatter 加入 `params`、`generator`、`starter_code`，在內容區加入完整描述 markdown；Challenge metadata lives entirely in frontmatter

- [ ] 4.1 遷移 `caesar-encrypt.md`
- [ ] 4.2 遷移 `caesar-decrypt.md`
- [ ] 4.3 遷移 `vigenere-encrypt.md`
- [ ] 4.4 遷移 `vigenere-decrypt.md`
- [ ] 4.5 遷移 `playfair-encrypt.md`
- [ ] 4.6 遷移 `playfair-decrypt.md`
- [ ] 4.7 遷移 `railfence-encrypt.md`
- [ ] 4.8 遷移 `railfence-decrypt.md`
- [ ] 4.9 遷移 `xor-encrypt.md`
- [ ] 4.10 遷移 `rsa-encrypt.md`
- [ ] 4.11 遷移 `rsa-decrypt.md`
- [ ] 4.12 遷移 `aes-ecb-encrypt.md`
- [ ] 4.13 遷移 `aes-ecb-decrypt.md`
- [ ] 4.14 遷移 `simple-ecb-encrypt.md`
- [ ] 4.15 遷移 `simple-ecb-decrypt.md`

## 5. 刪除 TOML 檔案

- [ ] 5.1 刪除 `.vitepress/theme/challenges/` 目錄下所有 15 個 `.toml` 檔案（No TOML files exist in the repository）

## 6. 測試更新

- [ ] 6.1 更新 `useWasm.spec.ts`：測試新版 `generateChallenge` 接收 params JSON，回傳 `{ inputs }`
- [ ] 6.2 更新 `challenge.store.spec.ts`：移除 `description` 欄位相關測試
- [ ] 6.3 更新 `ProblemPanel.spec.ts`：移除 `:markdown` prop 相關測試
- [ ] 6.4 新增 Pyodide Worker `generate` 訊息的單元測試
- [ ] 6.5 執行 `pnpm test` 確認所有測試通過
