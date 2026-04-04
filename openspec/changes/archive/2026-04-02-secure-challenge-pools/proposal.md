## Why

VitePress 會將 frontmatter 的 `generator` 欄位（本質上是題目解答）以明文送到前端 JS bundle，學生僅需開啟 DevTools 即可取得完整答案。此外，即使 `verdict_detail='hidden'`，`expected_output` 仍以明文在 JS 記憶體中全程流動（`localTestcases` → `postMessage` RunRequest → Worker），攻擊者可透過 Vue DevTools、`postMessage` hook 等方式攔截。同時，`ChallengeView.vue` 作為 God Component 耦合了測資生成、判定、UI 三大職責，使得安全改動牽連過廣。

## What Changes

- **Build time 預計算測資池**：新增 build script，於 build time 執行所有 generators，將 `{input, expected_output}` 以 AES-256-GCM 加密後輸出為 `.bin` 檔案（每題一個 pool）
- **Production build strip generator**：新增 VitePress plugin，在 production build 時從 frontmatter 移除 `generator` 欄位，使其不進入 client bundle
- **WASM 擴展為黑箱判定引擎**：擴展現有 Rust WASM module，新增 pool 解密、隨機選題、verdict 比對功能；加密金鑰以 obfuscated 形式嵌入 WASM binary
- **expected_output 不再經過 JS**：`verdict_detail=hidden` 時，expected output 永遠不離開 WASM linear memory；比對邏輯在 WASM 內部完成
- **Per-challenge 透明度控制**：`verdict_detail` 嵌入加密 payload 內，由 WASM 判斷是否允許回傳 expected output（GCM 完整性保護，攻擊者無法竄改）
- **Frontend 解耦**：新增 `useChallengeRunner` composable 作為統一協調層，`ChallengeView.vue` 不再直接碰 WASM/Worker/generator
- **Worker 職責精簡**：Pyodide Worker 移除 generate handler 和 verdict 比對邏輯，僅負責執行學生 code 並回傳 stdout
- **useExecutor 介面瘦身**：`run()` 不再接收 `expected_output`，只傳入 `inputs[]`
- **Dev mode 不受影響**：開發環境維持現有流程（WASM inputs → Pyodide generator → JS 比對）

## Non-Goals (optional)

- 不追求完美安全（client-side 永遠可被逆向工程）—— 目標是顯著提高攻擊門檻至 WASM 反組譯 + AES-256 解密
- 不導入 server-side 架構 —— 維持 static site 部署模式
- 不改動 Markdown 檔案結構（`generator` 欄位保留在 source 中，僅在 production build 被 strip）
- 不改動 Pyodide sandbox guard、CSP policy、CodeEditor、RunModal 等不相關元件

## Capabilities

### New Capabilities

- `encrypted-pool-generation`: Build time 測資池預計算與 AES-256-GCM 加密流程，包含 pool 二進位格式定義與 build script
- `wasm-pool-judge`: WASM module 的 pool 解密、隨機選題、黑箱比對功能，包含加密金鑰嵌入與 obfuscation 策略
- `challenge-runner-orchestration`: `useChallengeRunner` composable 的統一協調層，抽象 dev/production 兩種模式的測資生成與判定流程
- `generator-strip-plugin`: VitePress plugin 在 production build 時 strip frontmatter 的 `generator` 欄位

### Modified Capabilities

- `python-generator`: Generator 不再於 runtime 執行（production mode）；Pyodide Worker 移除 `GenerateRequest` handler；`RunRequest` 不再攜帶 `expected_output`
- `verdict-detail-control`: Verdict detail 邏輯從 Worker/JS 層移至 WASM 內部；`verdict_detail` 值嵌入加密 pool 由 WASM 控制

## Impact

- **新增檔案**：
  - `scripts/generate-pools.ts` — build script
  - `testcase-generator/src/crypto.rs` — AES-GCM 解密 + key assembly
  - `testcase-generator/src/pool.rs` — pool 管理與選題
  - `testcase-generator/src/judge.rs` — verdict 比對
  - `testcase-generator/src/key_material.rs` — obfuscated key（gitignored）
  - `.vitepress/plugins/strip-generator.ts` — VitePress plugin
  - `.vitepress/theme/composables/useChallengeRunner.ts` — 協調層 composable
- **修改檔案**：
  - `testcase-generator/Cargo.toml` — 新增 `aes-gcm`, `zeroize` 依賴
  - `testcase-generator/src/lib.rs` — 新增 WASM exports
  - `.vitepress/config.mts` — 註冊 strip-generator plugin
  - `package.json` — 新增 `build:pools` script，調整 build 順序
  - `.vitepress/theme/composables/useWasm.ts` — 擴展 pool/judge API
  - `.vitepress/theme/composables/useExecutor.ts` — 移除 expected_output 參數
  - `.vitepress/theme/workers/pyodide.worker.ts` — 移除 generate handler，精簡 RunRequest
  - `.vitepress/theme/workers/worker-utils.ts` — 移除 `computeVerdict`, `buildTestcaseResultFields`
  - `.vitepress/theme/views/ChallengeView.vue` — 委派給 useChallengeRunner
  - `.vitepress/theme/stores/challenge.ts` — 型別移除 expected_output
  - `.vitepress/theme/stores/executor.ts` — 適配新 verdict 來源
  - `.gitignore` — 新增 `key_material.rs`
- **依賴變更**：Rust crates `aes-gcm`, `zeroize`；Node.js `gray-matter`（build script 用）
- **Build pipeline**：新增 `build:pools` 步驟，build 順序變為 `build:wasm-base` → `build:pools` → `build:wasm` → `build:pyodide` → `docs:build`
