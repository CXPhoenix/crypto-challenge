## 1. Build Infrastructure & 加密 Key 管理

> 現有技術棧：VitePress 2.0 + Rust WASM + Pyodide。限制條件：維持 static site、dev mode 不受影響。[Trade-off] dev mode 仍使用不安全流程（為保持 DX）。[Risk] Build time 需要 Python 環境 → 低風險，CI 安裝 Python 為標準做法。

- [x] 1.1 在 `Cargo.toml` 新增 `aes-gcm` 和 `zeroize` 依賴（Decision: AES-256-GCM 加密 + obfuscated key 嵌入 WASM）
- [x] 1.2 建立 `.env.pool` 機制：encryption key is managed as a project secret，若檔案不存在則自動生成 256-bit key
- [x] 1.3 實作 `scripts/generate-pools.ts` 中的 key material 生成邏輯：build script generates obfuscated key material for WASM，產出 `testcase-generator/src/key_material.rs`（XOR split 4 段）
- [x] 1.4 將 `key_material.rs` 和 `.env.pool` 加入 `.gitignore`（key_material.rs is not committed to version control）

## 2. Rust WASM Crypto & Pool 模組

- [x] 2.1 實作 `testcase-generator/src/crypto.rs`：WASM key material uses obfuscated XOR split storage，包含 key 組裝函式與解密後 zeroize（key is zeroized after decryption）
- [x] 2.2 實作 `testcase-generator/src/pool.rs`：WASM module decrypts and loads encrypted pool（驗證 magic bytes、version、AES-GCM 解密），包含 tampered data rejected by GCM authentication
- [x] 2.3 實作 `testcase-generator/src/pool.rs` 的選題功能：WASM module selects random testcases with session tracking（Decision: WASM session-based API 防止 replay），回傳 `{inputs, session_id}`，確保 expected outputs not exposed in return value
- [x] 2.4 實作 `testcase-generator/src/judge.rs`：WASM module judges student outputs internally，包含 constant-time comparison、verdict_detail 控制的 data stripping、session invalidated after judging
- [x] 2.5 實作 `testcase-generator/src/judge.rs` 的 get_expected 功能：WASM module conditionally exposes expected output（verdict_detail=full 時回傳，hidden 時回傳 null）
- [x] 2.6 擴展 `testcase-generator/src/lib.rs`：匯出 `load_pool`、`select_testcases`、`judge`、`get_expected` 四個 wasm_bindgen 函式（Decision: 單一 WASM module 擴展而非新增第二個 module）
- [x] 2.7 撰寫 Rust 單元測試：pool 解密、judge 比對、key reconstruction produces correct key、session lifecycle；緩解 [Risk] WASM linear memory 可被 JS 存取 → 中等風險（驗證 decrypt on-demand + zeroize）；[Risk] WASM 反組譯可提取加密金鑰 → 中等風險（驗證 key split obfuscation）

## 3. Build Script：測資池預計算

- [x] 3.1 實作 `scripts/generate-pools.ts` 主流程：build script generates encrypted testcase pools，讀取所有 challenge Markdown、解析 frontmatter（Decision: Build-time pool 預計算使用 Python subprocess）
- [x] 3.2 實作 input 生成：使用 WASM `generate_challenge` 或等效邏輯產生隨機輸入
- [x] 3.3 實作 generator 執行：透過 Python subprocess 執行 generator code（generator with external Python dependencies executes correctly），支援 JSON factory format is supported
- [x] 3.4 實作 pool 加密：pool binary format uses AES-256-GCM encryption，寫入 `docs/public/pools/<algorithm>.bin`（Decision: Pool 二進位格式）
- [x] 3.5 實作錯誤處理：build script fails on generator error 時報告詳細資訊
- [x] 3.6 在 `package.json` 新增 `build:pools` script 並調整 build 順序（Decision: Build pipeline 順序與兩次 WASM build 的避免）

## 4. VitePress Plugin：Generator Strip

- [x] 4.1 實作 `.vitepress/plugins/strip-generator.ts`：VitePress plugin strips generator field in production builds，plugin operates on Markdown transform hook，只處理 `challenge/**/*.md`
- [x] 4.2 確保 plugin does not modify files in development mode（generator field available in dev mode）
- [x] 4.3 在 `.vitepress/config.mts` 註冊 plugin，確保 other frontmatter fields preserved
- [x] 4.4 驗證 production build 後 generator field absent in production page data

## 5. Frontend 解耦：useChallengeRunner

- [x] 5.1 實作 `.vitepress/theme/composables/useChallengeRunner.ts`：useChallengeRunner composable provides unified challenge lifecycle API（Decision: useChallengeRunner 以策略模式統一 dev/prod 流程）
- [x] 5.2 實作 Dev strategy：dev strategy uses existing WASM + Pyodide generator flow，dev mode uses generator from frontmatter，dev mode submit sends expected_output to Worker
- [x] 5.3 實作 Prod strategy：prod strategy uses encrypted pool + WASM judge flow，prod mode fetches encrypted pool，prod mode does not expose expected_output in JS when hidden，prod mode submit only sends inputs to Worker
- [x] 5.4 撰寫 `useChallengeRunner.spec.ts` 測試：dev/prod 模式切換、API 完整性

## 6. 現有模組重構

- [x] 6.1 重構 `useExecutor.ts`：production mode 的 `run()` 介面改為只接收 `(code, inputs[])`，回傳 raw outputs（Decision: Worker 職責精簡為純執行引擎）
- [x] 6.2 重構 `pyodide.worker.ts`：Pyodide Worker executes generator to produce expected outputs 僅限 dev mode；production 下 RunRequest does not carry expected_output in production mode，移除 production mode 的 generate handler（generate message not handled in production mode）
- [x] 6.3 重構 `worker-utils.ts`：移除 `computeVerdict` 和 `buildTestcaseResultFields`（verdict 邏輯移至 WASM），保留 `buildWrappedCode`
- [x] 6.4 精簡 `ChallengeView.vue`：ChallengeView delegates to useChallengeRunner，ChallengeView does not import useWasm directly，ChallengeView does not hold expected_output（ChallengeView orchestrates two-phase testcase generation 透過 useChallengeRunner 委派）
- [x] 6.5 更新 `stores/challenge.ts`：store never contains expected_output in production（production mode 下 testcases 型別移除 expected_output）
- [x] 6.6 更新 `stores/executor.ts`：適配來自 WASM judge 的 verdict 結果格式
- [x] 6.7 確認 `TestResultPanel.vue` Test Result Panel Verdict Detail Display 在兩種模式下行為一致（component renders verdict data identically regardless of source）

## 7. Verdict Detail 整合

- [x] 7.1 確保 production mode 的 Worker testcase result data stripping 由 WASM judge 執行（hidden mode strips both fields via WASM judge）
- [x] 7.2 確保 dev mode Worker stripping unchanged
- [x] 7.3 確保 production reads Verdict Detail Frontmatter Field from encrypted pool（verdict_detail is integrity-protected）
- [x] 7.4 驗證 challenge store data stripping 在兩種模式下正確運作

## 8. 測試更新

- [x] 8.1 更新 `ChallengeView-verdict-detail.spec.ts`：適配 useChallengeRunner 委派模式
- [x] 8.2 更新 `pyodide-worker-verdict-detail.spec.ts`：production RunRequest 不再帶 expected_output
- [x] 8.3 更新或移除 `pyodide-worker-generate.spec.ts`：generate handler 在 production mode 已移除
- [x] 8.4 驗證 pool file starts with correct magic and version（build script 整合測試）
- [x] 8.5 端對端驗證：production build → pool 生成 → WASM 載入 → 選題 → judge → verdict 正確回傳；確認 [Risk] Pool 測資有限，理論上可窮舉 → 低風險（200 筆 pool size 足夠）
