---
layout: challenge
id: 5
title: 柵欄密碼
difficulty: medium
tags: ["classical", "transposition", "encrypt"]
algorithm: rail_fence_encrypt
testcase_count: 10
params:
  rails:
    type: int
    min: 2
    max: 5
  plaintext:
    type: alpha_upper
    min_len: 8
    max_len: 30
generator: |
  rails = int(input())
  plaintext = input()
  fence = [[] for _ in range(rails)]
  rail = 0
  direction = 1
  for ch in plaintext:
      fence[rail].append(ch)
      if rail == 0:
          direction = 1
      elif rail == rails - 1:
          direction = -1
      rail += direction
  result = ""
  for row in fence:
      result += "".join(row)
  print(result)
starter_code: |
  rails = int(input())
  plaintext = input()

  # 在此實作柵欄密碼加密
  result = ""

---

## 柵欄密碼

柵欄密碼（Rail Fence Cipher）是一種轉置加密法。它不改變字母本身，而是重新排列字母的順序。

加密規則：
1. 將明文字母以鋸齒形（zigzag）方式寫在指定數量的「柵欄」（rails）上。
2. 依序從第一排到最後一排讀出所有字母，串接成密文。

例如 `ATTACKATDAWN` 以 3 個柵欄排列：

```
A . . . C . . . D . . .
. T . A . K . T . A . N
. . T . . . A . . . W .
```

從上到下逐行讀取：`ACD` + `TAKTAN` + `TAW` = `ACDTAKTANTAW`

## 輸入說明

第一行：柵欄數（整數，2 ≤ rails ≤ 5）

第二行：明文（僅含大寫英文字母，長度 8~30）

## 輸出說明

輸出一行密文（大寫英文字母）。

## 範例

**輸入：**
```plaintext
3
ATTACKATDAWN
```

**輸出：**
```plaintext
ACDTAKTANTAW
```
