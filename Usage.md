# Challenge 建立指南

本文說明如何在本專案新增一道密碼學挑戰題目。

---

## 目錄

- [快速流程](#快速流程)
- [命名規則](#命名規則)
- [Frontmatter 欄位說明](#frontmatter-欄位說明)
  - [基本欄位](#基本欄位)
  - [params 參數型別](#params-參數型別)
  - [generator 產生器程式碼](#generator-產生器程式碼)
  - [starter\_code 起始程式碼](#starter_code-起始程式碼)
- [Markdown 內文結構](#markdown-內文結構)
- [完整範本](#完整範本)
- [現有難度參考](#現有難度參考)
- [開發與測試](#開發與測試)

---

## 快速流程

1. 在 `docs/challenge/` 新增一個 Markdown 檔案（檔名用 kebab-case）
2. 填入必要的 frontmatter（見下方說明）
3. 撰寫題目說明、輸入輸出規格與範例
4. 執行 `pnpm dev` 在瀏覽器確認題目與測資是否正常

> **不需要** 修改任何設定檔或 TOML 檔。所有題目資料皆定義在 Markdown 的 frontmatter 中。

---

## 命名規則

| 欄位 | 格式 | 範例 |
|------|------|------|
| 檔案名稱 | `kebab-case.md` | `caesar-encrypt.md` |
| `algorithm` | `snake_case` | `caesar_encrypt` |
| `id` | 遞增整數 | `16`（接續現有最大值） |

**演算法名稱與檔名的對應：**

```
algorithm: caesar_encrypt  →  docs/challenge/caesar-encrypt.md
algorithm: aes_ecb_encrypt →  docs/challenge/aes-ecb-encrypt.md
```

規則：`algorithm` 欄位的底線（`_`）全部替換為連字號（`-`），即為檔名（不含 `.md`）。

---

## Frontmatter 欄位說明

### 基本欄位

```yaml
---
layout: challenge          # 固定值，觸發 ChallengeView 元件
id: 16                     # 題目 ID，整數，全站唯一，依序遞增
title: 題目名稱             # 顯示於題目清單的中文名稱
difficulty: easy           # 難度：easy | medium | hard
tags:                      # 選填：分類標籤陣列
  - 對稱加密
  - 古典密碼
algorithm: my_algorithm    # snake_case，用於 WASM 產生測資的識別鍵
testcase_count: 5          # 選填，預設 5，測試案例數量
params: ...                # 必填，定義 WASM 產生測資的參數規格（見下方）
generator: |               # 必填，Python 程式，讀入參數並輸出正確答案
  ...
starter_code: |            # 必填，使用者初始程式碼範本
  ...
---
```

---

### params 參數型別

`params` 是一個 YAML 物件，**每個鍵代表一個輸入參數**，順序即為 stdin 的行順序。

WASM 產生的每筆測資為多行字串，每行對應一個參數，`generator` 程式碼用 `input()` 依序讀取。

#### 型別一覽

| `type` | 說明 | 必要欄位 |
|--------|------|----------|
| `int` | 整數 | `min`, `max` |
| `alpha_upper` | 大寫英文字母（A–Z） | `min_len`, `max_len` |
| `alpha_lower` | 小寫英文字母（a–z） | `min_len`, `max_len` |
| `alpha_mixed` | 大小寫混合英文字母（A–Za–z） | `min_len`, `max_len` |
| `hex_string` | 十六進位字串（0–9a–f） | `min_len`, `max_len` |

#### 範例

```yaml
params:
  plaintext:
    type: alpha_upper
    min_len: 5
    max_len: 12
  shift:
    type: int
    min: 1
    max: 25
```

以上定義產生的測資格式（兩行）：

```
HELLO
3
```

#### 固定值參數

若某個參數需要固定值（不隨機），使用 `min == max`：

```yaml
params:
  e:
    type: int
    min: 17
    max: 17
  n:
    type: int
    min: 3233
    max: 3233
```

---

### generator 產生器程式碼

`generator` 是一段 Python 程式碼，由後端（Pyodide Worker）執行，用於**產生正確答案**。

**規範：**

- 用 `input()` 依照 `params` 的宣告順序讀取每個參數
- 將最終答案 `print()` 到 stdout（只輸出一行結果）
- 數值型態需自行轉換（`int(input())`）
- 避免使用外部套件（Pyodide 環境，可用標準函式庫）

**範例（凱薩加密）：**

```yaml
generator: |
  plaintext = input()
  shift = int(input())
  result = ''.join(chr((ord(c) - ord('A') + shift) % 26 + ord('A')) for c in plaintext)
  print(result)
```

---

### starter_code 起始程式碼

`starter_code` 是使用者在編輯器中看到的**初始程式碼範本**。

**規範：**

- 提供函式骨架，使用者填入實作
- 不需要包含讀取 `input()` 的程式碼，使用者自行撰寫
- 通常只包含一個空白函式作為提示

**範例：**

```yaml
starter_code: |
  def caesar_encrypt(plaintext: str, shift: int) -> str:
      # 在此實作凱薩加密
      pass

  # 讀取輸入
  plaintext = input()
  shift = int(input())
  print(caesar_encrypt(plaintext, shift))
```

---

## Markdown 內文結構

frontmatter 之後的 Markdown 內文會顯示於題目說明面板（左側）。建議依照以下結構撰寫：

```markdown
## 題目名稱

一段簡短的演算法說明，讓使用者了解這道題目在考什麼。

### 演算法說明

詳細說明演算法的步驟（可選）。

### 輸入說明

- 第一行：`plaintext`，長度 5~12 的大寫英文字串
- 第二行：`shift`，整數 1~25

### 輸出說明

- 輸出加密後的字串

### 範例

**輸入：**

```
HELLO
3
```

**輸出：**

```
KHOOR
```
```

---

## 完整範本

以下是一道新 Challenge 的完整 Markdown 範本，複製後修改即可：

```markdown
---
layout: challenge
id: 16
title: 你的題目名稱
difficulty: easy
tags:
  - 標籤一
  - 標籤二
algorithm: my_algorithm
testcase_count: 5
params:
  plaintext:
    type: alpha_upper
    min_len: 5
    max_len: 12
  key:
    type: int
    min: 1
    max: 25
generator: |
  plaintext = input()
  key = int(input())
  # 在此實作正確的演算法邏輯
  result = plaintext  # 替換為實際計算
  print(result)
starter_code: |
  def my_algorithm(plaintext: str, key: int) -> str:
      # 在此實作你的解法
      pass

  plaintext = input()
  key = int(input())
  print(my_algorithm(plaintext, key))
---

## 你的題目名稱

簡短說明此密碼學演算法的用途與背景。

### 演算法說明

說明演算法的操作步驟。

### 輸入說明

- 第一行：`plaintext`，長度 5~12 的大寫英文字串
- 第二行：`key`，整數 1~25

### 輸出說明

- 輸出一行加密/解密結果

### 範例

**輸入：**

\`\`\`
HELLO
3
\`\`\`

**輸出：**

\`\`\`
KHOOR
\`\`\`
```

---

## 現有難度參考

| 難度 | 題目範例 | 特徵 |
|------|----------|------|
| `easy` | 凱薩加密/解密、XOR 加密 | 單一簡單運算，參數少 |
| `medium` | Vigenère 加密/解密 | 需要鍵值串列概念，稍複雜 |
| `hard` | Playfair、AES-ECB、RSA | 多步驟演算法，需理解密碼學原理 |

---

## 開發與測試

```bash
# 安裝依賴
pnpm install

# 啟動開發伺服器（會先重新編譯 WASM，再啟動 VitePress）
pnpm dev

# 執行單元測試
pnpm test

# 正式建置
pnpm build
```

> **注意：** WASM 僅在第一次啟動或修改 `testcase-generator/` Rust 程式碼後需要重新編譯。若只新增 Challenge Markdown 檔，直接執行 `pnpm docs:dev` 即可跳過 WASM 編譯步驟。

### 驗證新題目是否正常

1. 執行 `pnpm dev`，開啟瀏覽器
2. 前往首頁確認新題目出現在清單中
3. 點入題目，確認測資正常產生（左側顯示測試案例）
4. 在編輯器貼入正確解法，確認所有測資通過
5. 故意送出錯誤解法，確認失敗案例正確顯示
