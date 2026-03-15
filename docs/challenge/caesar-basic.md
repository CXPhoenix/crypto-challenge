---
layout: challenge
id: 1
title: 凱薩密碼
difficulty: easy
tags: ["classical", "substitution", "encrypt"]
algorithm: caesar_encrypt
testcase_count: 10
params:
  plaintext:
    type: alpha_upper
    min_len: 5
    max_len: 24
  shift:
    type: int
    min: 1
    max: 25
generator: |
  plaintext = input()
  shift = int(input())
  result = ""
  for ch in plaintext:
      result += chr((ord(ch) - ord('A') + shift) % 26 + ord('A'))
  print(result)
starter_code: |
  plaintext = input()
  shift = int(input())

  # 在此實作凱薩密碼加密
  result = ""
  
---

## 凱薩密碼

凱薩加密是一種替換加密，將每個大寫字母在字母表中向右位移固定位數，超過 Z 則循環回 A。

## 輸入說明

第一行：明文（僅含大寫英文字母）

第二行：位移量（整數，1 ≤ shift ≤ 25）

## 輸出說明

輸出一行密文（大寫英文字母）。

## 範例

**輸入：**
```plaintext
HELLO
3
```

**輸出：**
```plaintext
KHOOR
```
