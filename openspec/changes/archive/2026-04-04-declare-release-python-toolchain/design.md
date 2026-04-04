## Context

目前 `pnpm build` 的完整流程中，`build:pools` 步驟會透過 `scripts/generate-pools.ts` 呼叫 Python 3 子程序三次：

1. **`parseFrontmatter()`** — 使用 `python3 -c "import yaml..."` 解析 YAML frontmatter，需要 **PyYAML** 套件。
2. **`generateInputs()`** — 使用 `python3 -c` 搭配 stdlib（`json`, `random`, `string`），無額外依賴。
3. **`runGenerator()`** — 透過 `exec()` 執行各題目的 generator 程式碼；其中 `des-ecb-cbc.md` 的 generator 需要 **pycryptodome**（`from Crypto.Cipher import DES`）。

這些 Python 依賴目前屬於「隱含」狀態：

- **README.md** 的前置需求只列出 Node.js、pnpm、Rust + wasm-pack，完全未提及 Python。
- **release workflow**（`.github/workflows/release.yml`）缺少 `setup-python` 步驟；目前能建置成功純粹是因為 `ubuntu-latest` runner image 恰巧內建了 Python 3 與部分常見套件，但這不是專案自己宣告的可重現條件。
- **專案根目錄不存在 `requirements.txt`**，無法透過標準方式一次安裝所有 Python 依賴。

## Goals / Non-Goals

**Goals:**

- 將 Python 3 runtime 與第三方套件（PyYAML、pycryptodome）正式宣告為 pool generation 的建置依賴。
- 在 release workflow 中明確安裝 Python 環境，使 CI 建置不再依賴 runner image 的偶然狀態。
- 在 `generate-pools.ts` 中加入前置檢查（preflight check），缺少依賴時提供可操作的錯誤訊息。
- 更新 README.md，讓新貢獻者知道需要安裝 Python 及相關套件。

**Non-Goals:**

- 不更換 frontmatter 解析方式（例如改用 Node.js YAML parser）。
- 不引入 Python virtual environment 管理工具（如 poetry、pipenv）；專案的 Python 使用範圍小，`pip install -r requirements.txt` 即可。
- 不改動 generator 本身的邏輯或測試案例產生演算法。
- 不新增 Python 版本管理（如 pyenv）至 CI 流程。

## Decisions

### 使用 requirements.txt 管理 Python 依賴

在專案根目錄建立 `requirements.txt`，列出 `PyYAML` 與 `pycryptodome` 及其版本約束。

**理由：** 這是 Python 生態最簡單且最廣泛支援的依賴宣告方式。專案僅有兩個 Python 套件依賴，不需要 poetry/pipenv 等更重量級的工具。CI 與本機開發者都能透過 `pip install -r requirements.txt` 一致地安裝依賴。

**替代方案：**
- `pyproject.toml` — 較現代，但對此專案而言過於複雜（非 Python 主體專案）。
- 在 workflow 中直接 `pip install PyYAML pycryptodome` — 可行但將依賴散落在 workflow 中，不易維護且本機開發者無法參照。

### 在 release workflow 加入 setup-python 步驟

在 `pnpm install` 之前插入 `actions/setup-python@v5` 步驟，搭配 `pip install -r requirements.txt`。

**理由：** `actions/setup-python` 是 GitHub Actions 官方維護的 action，提供 Python 版本固定與 pip cache 支援。放在 Node.js setup 之後、`pnpm install` 之前，確保 `pnpm build` 執行時 Python 環境已就緒。

**替代方案：**
- 僅依賴 runner image 內建 Python — 正是目前的問題根源，不可靠。
- 使用 Docker container job — 過度工程化，此專案不需要容器化 CI。

### 在 generate-pools.ts 加入 Python 依賴前置檢查

在 `main()` 函式開頭新增 preflight check 函式，執行 `python3 -c "import yaml; from Crypto.Cipher import DES"` 驗證 runtime 與套件均可用。失敗時輸出包含安裝指令的錯誤訊息並以非零狀態碼退出。

**理由：** 目前缺少 Python 依賴時，錯誤會在處理第一個題目時才發生，且錯誤訊息是 Python traceback，不易判讀。前置檢查能在建置開始前就清楚告知問題與解法。

**替代方案：**
- 在 `package.json` 加入 `prebuild:pools` script — 可行但與建置邏輯分離，且無法在錯誤訊息中直接引導使用者。
- Lazy check（遇到錯誤再補充說明）— 使用體驗較差，且同一次建置可能重複報錯。

### 更新 README.md 前置需求區段

在「前置需求」區段加入 Python 3.10+ 與 `pip install -r requirements.txt` 說明。

**理由：** README 是新貢獻者最先閱讀的文件，目前完全未提及 Python 依賴，導致環境設定不完整。Python 3.10+ 是因為 `pycryptodome` 的最低支援版本，也與 `ubuntu-latest` 內建版本一致。

## Risks / Trade-offs

- **[Runner image 變動]** `ubuntu-latest` 未來可能移除或升級內建 Python 版本。 → 透過 `actions/setup-python` 明確指定版本來緩解，不再依賴 ambient state。
- **[套件版本衝突]** `requirements.txt` 固定版本可能與開發者本機已安裝的版本衝突。 → 記錄建議使用 venv 但不強制（Non-Goal），並在 README 提供 `python3 -m venv` 建議。
- **[Preflight check 的維護成本]** 新增 Python 依賴時需同步更新 preflight check。 → 檢查邏輯直接 import `requirements.txt` 中的套件，與依賴列表保持一致即可。
- **[建置時間增加]** CI 多一個 `setup-python` + `pip install` 步驟。 → 增加約 10-15 秒，相對於完整建置流程（Rust/WASM 編譯）微不足道。
