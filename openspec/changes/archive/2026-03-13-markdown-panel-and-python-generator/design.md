## Context

目前的挑戰系統需要同時維護兩份文件：TOML 存放元資料（`[meta]`）、亂數參數規格（`[params]`）、題目描述（`[description]`）和程式碼（`[starter_code]`）；`.md` 僅作為頁面入口（`<ChallengeView />`）。Rust/WASM 負責全流程：解析 TOML → 生成亂數輸入 → 執行演算法計算預期輸出。新增演算法需修改 Rust 程式碼並重新編譯 WASM，對非 Rust 開發者造成高門檻。

## Goals / Non-Goals

**Goals:**

- 完全移除 TOML 檔案，挑戰改為單一 `.md` 檔定義（frontmatter + markdown 內容）
- 讓出題者在 `.md` 以原生 Markdown 撰寫題目描述，由 VitePress 渲染
- 讓出題者以 Python 參考解（generator）計算預期輸出，取代 Rust 演算法實作
- 保留 Rust WASM 的亂數輸入生成能力，改為接收 JSON params 而非 TOML
- 刪除 `algorithms/` 目錄，徹底消除 WASM 與演算法邏輯的耦合

**Non-Goals:**

- 不改變 Pyodide Worker 執行學生程式碼的流程
- 不修改 params 支援的參數型別（ParamSpec 維持不變）
- 不支援 generator 跨 testcase 共享狀態

## Decisions

### VitePress Custom Layout 取代 `layout: false`

VitePress 的 `Layout.vue` 可在 `frontmatter.layout === 'challenge'` 時直接渲染 `ChallengeView` 元件（取代原本的 DefaultTheme Layout）。`ChallengeView` 成為 layout 後，`ProblemPanel` 內的 `<Content />` 自然渲染當頁的 markdown 內容，不會有遞迴問題。

**Alternative**: 在 `.md` 內容使用 `<ChallengeView>...markdown...</ChallengeView>` slot 語法。拒絕：VitePress 對 block 元件內 markdown 的處理有已知不穩定性，且要求出題者在 HTML tag 內撰寫 markdown，體驗差。

### Pyodide Worker 新增 `generate` 訊息，重用現有 Worker

在現有 `pyodide.worker.ts` 新增 `generate` 訊息類型，對每個 input 執行 generator 程式碼並擷取 stdout 為 expected_output。這樣可重用已暖機的 Pyodide 實例，避免另開 Worker 的初始化成本。

**Alternative**: 在主執行緒呼叫 `runPythonAsync` 生成測試資料。拒絕：會阻塞 UI，使用者體驗差。

### `generate_challenge(params_json, count)` 改為接收 JSON params

移除 TOML 後，Rust 不再解析 TOML 字串。函式簽名改為 `generate_challenge(params_json: &str, count: usize)`，其中 `params_json` 為 frontmatter `params` 物件序列化後的 JSON 字串。前端從 frontmatter 讀取 `params`、`generator`、`starter_code`，直接傳入 WASM。

**Alternative**: 保留 TOML 僅作為 params/generator/starter_code 的載體。拒絕：用戶明確要求單一 `.md` 格式，減少後續維護。

### params 順序保證：`indexmap::IndexMap`

Params 各值依宣告順序逐行拼成 input 字串（`param1\nparam2\n...`）。標準 `HashMap` 不保證順序，改用 `indexmap::IndexMap` 確保 JSON 物件 key 順序（前端需以 Array 形式傳遞或保序序列化）即為 stdin 行順序。前端傳遞 params 時，使用 YAML frontmatter 的原始 key 順序，以 JSON 序列化後傳入 WASM。

### Rust `algorithms/` 目錄完整刪除

新架構中 Rust 不需要知道任何演算法邏輯，僅負責按 params 規格生成亂數值並格式化為 input 字串。刪除 7 個演算法 .rs 檔和 `mod.rs`，同步刪除 `template.rs`（description 模板渲染不再需要）。

## Risks / Trade-offs

- **Generator 執行失敗無法在 build time 偵測** → 前端顯示明確錯誤訊息，告知出題者 generator 程式碼有誤
- **Generator 執行時間影響頁面載入** → Generator 與學生程式共用同一 op-limit/wall-clock 保護；generator 通常極短，風險低
- **indexmap 新增 Rust dependency** → 輕量套件，WASM bundle 增加極小
- **frontmatter YAML 中的 Python 多行字串排版** → 使用 YAML `|` block scalar；出題者需注意縮排，但比 TOML 的 `"""` 更符合 YAML 使用者的直覺
- **15 個 .md 需一次性遷移** → 一次性工作，遷移後只有單一格式要維護

## Migration Plan

1. 更新 Rust WASM（parser 改為 JSON，lib，刪除 algorithms/、template.rs），重新編譯
2. 更新前端（Layout.vue、ChallengeView.vue、Worker、composables、store）
3. 遷移 15 個 `.md`（加入 params/generator/starter_code frontmatter，加入描述 markdown 內容）
4. 刪除 15 個 TOML 檔案
5. 更新測試

Rollback: git revert，無資料庫遷移。
