## Problem

Production 模式下，使用者點擊「提交」時瀏覽器拋出 `DataCloneError: Failed to execute 'postMessage' on 'Worker': [object Array] could not be cloned`，導致整個提交流程失敗，無法進行判定。

## Root Cause

`useProdRunner` 的 `loadTestcases()` 將 WASM `select_testcases()` 回傳的 `inputs` 陣列直接存入 Vue `ref<string[]>()`。Vue 3 的 reactivity 系統會將 ref 內部值包裝為 Proxy。當 `submit()` 呼叫 `runStudentCode(code, inputs.value)` 並透過 `worker.postMessage()` 傳送時，瀏覽器的 structured clone algorithm 無法複製 Proxy 物件，因此拋出 `DataCloneError`。

Dev runner 不受影響，因為它使用 `localTestcases`（普通 `let` 變數）並透過 `.map()` 產生新的純 JS 陣列傳送。

## Proposed Solution

在 `runStudentCode` 的 `postMessage` 呼叫中，使用展開運算子 `[...codeInputs]` 將 Vue Proxy 陣列轉換為純 JS 陣列，確保 structured clone 可正常運作。

## Non-Goals

- 不重構 reactive 架構或改用 `shallowRef` — 展開運算子已足夠且影響最小
- 不變更 dev runner 的 postMessage 邏輯 — dev runner 已經透過 `.map()` 產生純陣列，不受此問題影響

## Success Criteria

- Production 模式下點擊「提交」不再拋出 `DataCloneError`
- WASM 判定流程正常完成，顯示測資結果
- 既有的 `useChallengeRunner-prod` 測試全數通過

## Impact

- Affected specs: `challenge-runner-orchestration` — 補充 prod runner 透過 `postMessage` 傳送資料時 SHALL 使用 structured-clone 相容的純 JS 值
- Affected code: `.vitepress/theme/composables/useChallengeRunner.ts`（`runStudentCode` 函式的 `postMessage` 呼叫）
