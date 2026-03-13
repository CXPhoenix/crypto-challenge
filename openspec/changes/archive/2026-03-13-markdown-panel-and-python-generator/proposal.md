## Why

目前挑戰系統需要同時維護 TOML 檔和 `.md` 檔兩份文件：TOML 存放元資料、參數規格、描述和程式碼，`.md` 僅作為頁面入口。出題者需同時操作兩種格式，且新增演算法必須修改 Rust 程式碼並重新編譯 WASM。將所有挑戰資料整合到單一 `.md` 檔（frontmatter + markdown 描述），並以 Python 參考解取代 Rust 演算法，可大幅降低維護成本並提高出題者的靈活性。

## What Changes

- 刪除所有 15 個 TOML 檔案（`.vitepress/theme/challenges/*.toml`）
- 挑戰改為單一 `.md` 檔定義：frontmatter 包含 meta、params、generator（Python 參考解）、starter_code
- 左側面板改由 VitePress 原生渲染 `.md` 內容（描述 markdown）
- Rust WASM 改為接收 JSON 格式的 params（不再解析 TOML），只負責生成亂數 input 字串
- Pyodide Worker 新增 `generate` 訊息，執行 generator Python 程式碼產生 expected_output
- `ChallengeView` 直接從 frontmatter 讀取所有挑戰資料，不再使用 `import.meta.glob` 載入 TOML
- **BREAKING**: 完整移除 TOML 格式，不向下相容

## Capabilities

### New Capabilities

- `vitepress-markdown-panel`: 挑戰左側面板透過 VitePress 自訂 layout 與 `<Content />` 原生渲染 `.md` 的 markdown 描述；`ChallengeView` 成為 challenge layout，直接從 frontmatter 取得 params、generator、starter_code
- `python-generator`: Pyodide Worker 執行 frontmatter 的 Python generator 參考解，以 Rust WASM 依 params JSON 生成的亂數 input 為 stdin，擷取 stdout 作為 expected_output，組成完整測試資料

### Modified Capabilities

（無現有 spec 需要異動）

## Impact

- **Deleted**:
  - `.vitepress/theme/challenges/*.toml`（15 個 TOML 檔全部刪除）
- **Affected code**:
  - `challenge-generator/src/algorithms/`（刪除所有演算法實作）
  - `challenge-generator/src/template.rs`（刪除）
  - `challenge-generator/src/parser.rs`（改為解析 JSON params，不再解析 TOML）
  - `challenge-generator/src/lib.rs`（`generate_challenge` 改為接收 params JSON + count，移除 list_algorithms/parse_challenge_meta）
  - `.vitepress/theme/Layout.vue`（新增 challenge layout 分支）
  - `.vitepress/theme/views/ChallengeView.vue`（從 frontmatter 讀取所有資料，移除 import.meta.glob TOML 邏輯）
  - `.vitepress/theme/workers/pyodide.worker.ts`（新增 generate 訊息）
  - `.vitepress/theme/composables/useWasm.ts`（介面改為接收 params JSON）
  - `.vitepress/theme/stores/challenge.ts`（移除 description 欄位）
  - `.vitepress/theme/components/challenge/ProblemPanel.vue`（移除 :markdown prop）
  - `docs/challenge/*.md`（15 個頁面：加入 params/generator/starter_code frontmatter，加入描述 markdown 內容）
