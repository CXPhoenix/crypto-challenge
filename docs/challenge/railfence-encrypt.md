---
layout: challenge
id: 7
title: 柵欄加密
difficulty: medium
tags: ["transposition", "encrypt"]
algorithm: railfence_encrypt
testcase_count: 5
params:
  plaintext:
    type: alpha_upper
    min_len: 8
    max_len: 20
  rails:
    type: int
    min: 2
    max: 4
generator: |
  plaintext = input()
  rails = int(input())
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
  print(''.join(''.join(r) for r in fence))
starter_code: |
  plaintext = input()
  rails = int(input())

  # 建立 rails 個桶子
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

  print(''.join(''.join(r) for r in fence))
---

## 柵欄加密

柵欄加密將明文按鋸齒形（Z 形）分散到多條軌道上，再逐條軌道讀出，形成密文。

## 輸入說明

第一行：明文（僅含大寫英文字母，長度 8–20）

第二行：軌道數（整數，2 ≤ rails ≤ 4）

## 輸出說明

輸出一行密文（大寫英文字母）。

## 範例

**輸入：**
```
HELLOWORLD
3
```

**輸出：**
```
HOLELWRDLO
```

## 說明

HELLOWORLD 以 3 條軌道鋸齒排列：

```
軌道 0：H . . . O . . . L .   → HOL
軌道 1：. E . L . W . R . D   → ELWRD
軌道 2：. . L . . . O . . .   → LO
```

依序讀出：HOL + ELWRD + LO = HOLELWRDLO
