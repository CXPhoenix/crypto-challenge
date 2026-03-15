---
layout: challenge
id: 2
title: 自製密碼表的凱薩密碼
difficulty: easy
tags: ["classical", "substitution", "customized table"]
algorithm: caesar_decrypt
testcase_count: 10
params:
  ciphertext:
    type: alpha_upper
    min_len: 5
    max_len: 12
  shift:
    type: int
    min: 1
    max: 25
generator: |
  ciphertext = input()
  shift = int(input())
  result = ""
  for ch in ciphertext:
      result += chr((ord(ch) - ord('A') - shift) % 26 + ord('A'))
  print(result)
starter_code: |
  customized_table = [alphabet for alphabet in map(lambda n: chr(n), range(0x21, 0x7F))]
  ciphertext = input()
  shift = int(input())

  # 在此實作凱薩密碼解密
  result = ""
  
---

## 凱薩解密

給定密文和位移量，將每個字母向左位移相同位數，還原原始明文。

## 輸入說明

第一行：密文（僅含大寫英文字母，長度 5–12）

第二行：位移量（整數，1 ≤ shift ≤ 25）

## 輸出說明

輸出一行明文（大寫英文字母）。

## 範例

**輸入：**
```
KHOOR
3
```

**輸出：**
```
HELLO
```
