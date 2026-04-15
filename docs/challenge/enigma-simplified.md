---
layout: challenge
id: 7
title: 簡化 Enigma 機器
difficulty: hard
tags: ["classical", "machine", "polyalphabetic", "encrypt"]
algorithm: enigma_simplified
testcase_count: 8
params:
  rotor_wiring:
    type: alpha_upper
    min_len: 26
    max_len: 26
  rotor_position:
    type: int
    min: 0
    max: 25
  plaintext:
    type: alpha_upper
    min_len: 5
    max_len: 20
generator: |
  rotor_wiring = input()
  rotor_position = int(input())
  plaintext = input()
  result = ""
  for i, ch in enumerate(plaintext):
      shift = (rotor_position + i) % 26
      idx = (ord(ch) - ord('A') + shift) % 26
      result += rotor_wiring[idx]
  print(result)
starter_code: |
  rotor_wiring = input()
  rotor_position = int(input())
  plaintext = input()

  # 在此實作簡化 Enigma 加密
  result = ""

---

## 簡化 Enigma 機器

Enigma 機器是二戰時期德軍使用的加密裝置。它的核心特色是**多表替換**：同一個字母在不同位置會被加密成不同的字母，因為轉子（rotor）在每次加密後會轉動一格。

本題實作一個簡化版 Enigma：
1. 給定一個轉子接線表（rotor_wiring），它是 26 個大寫字母的排列，代表 A~Z 的替換對應。
2. 給定轉子初始位置（rotor_position，0~25）。
3. 加密第 i 個字母時（i 從 0 開始），先將字母在字母表中向右位移 `(rotor_position + i) % 26` 格，得到一個索引，再查轉子接線表取得密文字母。

這樣同一個字母出現在不同位置時，會因為位移量不同而產生不同的密文。

## 輸入說明

第一行：轉子接線表（26 個大寫英文字母的排列）

第二行：轉子初始位置（整數，0 ≤ rotor_position ≤ 25）

第三行：明文（僅含大寫英文字母，長度 5~20）

## 輸出說明

輸出一行密文（大寫英文字母）。

## 範例

**輸入：**
```plaintext
EKMFLGDQVZNTOWYHXUSPAIBRCJ
0
HELLO
```

**輸出：**
```plaintext
QGWYS
```
