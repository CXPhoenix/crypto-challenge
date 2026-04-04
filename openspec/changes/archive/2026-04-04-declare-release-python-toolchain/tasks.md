## 1. Python 依賴宣告（Python dependency manifest exists at project root）

- [x] 1.1 在專案根目錄建立 `requirements.txt`，列出 `PyYAML` 與 `pycryptodome` 及版本約束（使用 requirements.txt 管理 Python 依賴）
- [x] 1.2 驗證 `pip install -r requirements.txt` 在乾淨 Python 3.10+ 環境中能成功安裝

## 2. 建置腳本前置檢查（Build script generates encrypted testcase pools — preflight check）

- [x] 2.1 在 `scripts/generate-pools.ts` 的 `main()` 開頭新增 preflight check 函式，驗證 `python3` 可用且能 import `yaml` 與 `Crypto.Cipher.DES`（在 generate-pools.ts 加入 Python 依賴前置檢查）
- [x] 2.2 preflight check 失敗時輸出包含 `pip install -r requirements.txt` 的可操作錯誤訊息，並以非零狀態碼退出

## 3. Release Workflow 更新（Full project build in CI — Python 環境設定）

- [x] 3.1 在 `.github/workflows/release.yml` 的 `pnpm install` 步驟前加入 `actions/setup-python@v5`，指定 Python 3.12（在 release workflow 加入 setup-python 步驟）
- [x] 3.2 在 setup-python 之後加入 `pip install -r requirements.txt` 步驟
- [x] 3.3 確認 workflow 步驟順序為：checkout → Rust → wasm-pack → Python → pnpm → Node.js → install → build → package → upload

## 4. 文件更新（更新 README.md 前置需求區段）

- [x] 4.1 在 `README.md`「前置需求」區段加入 Python 3.10+ 與 `pip install -r requirements.txt` 說明
- [x] 4.2 在「部署」的 GitHub Actions Release 說明中補充 Python 環境安裝步驟的描述
