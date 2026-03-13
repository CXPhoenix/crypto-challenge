<div align="center">

# 🔐 Cryptography Challenge

**一個在瀏覽器中執行的互動式密碼學程式設計挑戰平台**

[![License](https://img.shields.io/github/license/CXPhoenix/cryptography-challenge)](./LICENSE)
[![VitePress](https://img.shields.io/badge/VitePress-2.x_alpha-646cff?logo=vite)](https://vitepress.dev)
[![Node](https://img.shields.io/badge/Node-22+-339933?logo=node.js)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm)](https://pnpm.io)
[![Vitest](https://img.shields.io/badge/Tests-43_passing-6e9f18?logo=vitest)](./vitepress/theme/__tests__)

[快速開始](#快速開始) ❖ [題目列表](#題目列表) ❖ [貢獻指南](#貢獻指南)

</div>

---

## 簡介

Cryptography Challenge 是一個完全運行於瀏覽器端的密碼學程式設計練習平台，無需後端伺服器。使用者以 Python 撰寫解答，測試案例由 **Rust/WASM** 產生器即時生成，程式碼透過 **Pyodide**（WebAssembly Python）在 Web Worker 中執行與驗證。

```
使用者撰寫 Python → Rust/WASM 產生測試輸入 → Pyodide 執行驗證 → 即時顯示結果
```

## 功能特色

- **全瀏覽器執行** — 零後端依賴，Pyodide + WASM 處理所有運算
- **15 道密碼學挑戰** — 涵蓋古典密碼與現代加密演算法
- **即時測試驗證** — 隨機產生測試案例，每次解題結果均不同
- **分割視窗 IDE** — 左側題目說明 / 右側 CodeMirror 6 編輯器
- **難度分級篩選** — 簡單 / 中等 / 困難

## 題目列表

| # | 演算法 | 操作 | 難度 |
|---|--------|------|------|
| 1–2 | 凱薩密碼 (Caesar) | 加密 / 解密 | 🟢 簡單 |
| 3 | XOR | 加密 | 🟢 簡單 |
| 4–5 | 維吉尼亞密碼 (Vigenère) | 加密 / 解密 | 🟡 中等 |
| 6–7 | Playfair 密碼 | 加密 / 解密 | 🟡 中等 |
| 8–9 | 柵欄密碼 (Rail Fence) | 加密 / 解密 | 🟡 中等 |
| 10–11 | Simple ECB | 加密 / 解密 | 🟡 中等 |
| 12–13 | AES-ECB | 加密 / 解密 | 🔴 困難 |
| 14–15 | RSA | 加密 / 解密 | 🔴 困難 |

## 技術架構

| 層次 | 技術 |
|------|------|
| 靜態站框架 | [VitePress](https://vitepress.dev) 2.x alpha |
| 前端 | [Vue 3](https://vuejs.org) + TypeScript |
| 樣式 | [Tailwind CSS 4](https://tailwindcss.com) + Typography |
| 狀態管理 | [Pinia](https://pinia.vuejs.org) |
| 程式碼編輯器 | [CodeMirror 6](https://codemirror.net) |
| Python 執行環境 | [Pyodide](https://pyodide.org) 0.29（WebAssembly） |
| 測試案例產生器 | Rust + [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) |
| 測試框架 | [Vitest](https://vitest.dev) + Vue Test Utils |
| 套件管理 | [pnpm](https://pnpm.io) 10 |

## 快速開始

### 前置需求

- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io) 10+
- [Rust](https://rustup.rs) 工具鏈 + wasm-pack

```bash
cargo install wasm-pack
```

### 安裝

```bash
pnpm install
```

### 開發

```bash
pnpm dev
```

啟動後開啟 `http://localhost:5173`。首次執行會自動編譯 Rust/WASM 模組。

> [!NOTE]
> Pyodide 需要 `SharedArrayBuffer`，本地開發伺服器已自動設定 COOP / COEP 安全標頭。請使用 Chromium 系瀏覽器（Chrome / Edge）。

### 建置

```bash
pnpm build          # 建置完整靜態站（WASM + VitePress）
pnpm docs:preview   # 預覽建置結果
```

### 測試

```bash
pnpm test           # 執行 Vitest（43 個測試）
```

## 專案結構

```
cryptography-challenge/
├── .vitepress/
│   └── theme/
│       ├── components/        # UI 元件（編輯器、題目面板、挑戰卡片）
│       ├── views/             # ChallengeView、ChallengeListView
│       ├── stores/            # Pinia stores（challenge、executor）
│       ├── composables/       # useWasm、useExecutor
│       ├── workers/           # Pyodide Web Worker
│       └── __tests__/         # Vitest 測試（9 個測試檔）
├── docs/
│   ├── challenge/             # 15 道題目 Markdown（含 frontmatter）
│   ├── public/wasm/           # Rust/WASM 建置輸出（.gitignored）
│   └── shared/                # VitePress data loader
└── testcase-generator/        # Rust crate（產生隨機測試輸入）
```

## 貢獻指南

### 新增題目

每道題目以一個 Markdown 檔案定義，位於 `docs/challenge/<slug>.md`：

```yaml
---
layout: challenge
id: <number>
title: <題目名稱>
difficulty: easy | medium | hard
tags: ["classical", "substitution", "encrypt"]
algorithm: <snake_case_name>      # 對應 Rust 產生器邏輯
testcase_count: 5
params:
  plaintext:
    type: alpha_upper
    min_len: 5
    max_len: 12
  shift:
    type: int
    min: 1
    max: 25
generator: |
  # Python 正確解答（用於產生預期輸出，不對使用者顯示）
starter_code: |
  # Python 起始程式碼（提供給使用者作為起點）
---
```

`params` 規格由 `testcase-generator`（Rust/WASM）解析並隨機產生輸入，再由 Pyodide 執行 `generator` 產生對應的預期輸出。

### 提交 Pull Request

1. Fork 此專案並建立功能分支：`git checkout -b feat/<feature-name>`
2. 確認測試全數通過：`pnpm test`
3. 格式化程式碼：`pnpm format`
4. 送出 Pull Request，說明改動動機與影響範圍

## 授權

本專案採用 [LICENSE](./LICENSE) 授權條款。
