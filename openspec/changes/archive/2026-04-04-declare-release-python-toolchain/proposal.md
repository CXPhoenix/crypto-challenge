## Why

目前 release / staging build 隱含依賴 Python、PyYAML 與 `pycryptodome`，但 workflow 與文件都沒有把它們當成正式前提。這使建置結果依賴 runner image 的偶然狀態，而不是專案自己宣告的可重現工具鏈。

## What Changes

- 把 pool generation 所需的 Python runtime 與套件依賴正式寫入規格與文件。
- 更新 release workflow，在執行 `pnpm build` 前明確安裝 Python 與必要套件。
- 讓本機與 CI 的 pool generation 前置檢查一致，缺少依賴時提供可操作的錯誤訊息。
- 將 release build 的成功條件改為依賴專案宣告的 toolchain，而不是 ambient runner state。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `encrypted-pool-generation`: pool generation 必須宣告並驗證其 Python runtime 與第三方套件依賴。
- `release-dist-packaging`: release workflow 必須先準備 pool generation 所需的 Python 環境，再執行完整 build。

## Impact

- Affected specs: `encrypted-pool-generation`, `release-dist-packaging`
- Affected code: `.github/workflows/release.yml`, `README.md`, `package.json`, `scripts/generate-pools.ts`, `scripts/pool-key.ts`
