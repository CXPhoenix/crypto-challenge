---
layout: challenge
id: 3
title: 自製密碼表的凱薩密碼解碼
difficulty: easy
tags: ["classical", "substitution", "decrypt", "customized table"]
algorithm: caesar_decrypt
testcase_count: 10
params:
  ciphertext:
    type: printable_ascii
    min_len: 5
    max_len: 32
  shift:
    type: int
    min: 1
    max: 25
generator: |
  ciphertext = input()
  shift = int(input())
  customized_table = [alphabet for alphabet in map(lambda n: chr(n), range(0x21, 0x7F))]
  findIndex: int = lambda t: customized_table.index(t)
  decrypt: str = lambda ct: ''.join([chr((findIndex(t) - shift + len(customized_table)) % len(customized_table)) for t in ct])
  print(decrypt(ciphertext))
starter_code: |
  # 測試資料產生會用的 table，勿改動
  customized_table = [alphabet for alphabet in map(lambda n: chr(n), range(0x21, 0x7F))]

  # INPUT
  ciphertext = input()
  shift = int(input())

  # 在此實作凱薩密碼解密
  
---

## 凱薩解密

給定密文和位移量，將每個字母向左位移相同位數，還原原始明文。

（需使用自製的密碼表 `customized_table`）

## 輸入說明

第一行：密文

第二行：位移量（整數，1 ≤ shift ≤ 25）

## 輸出說明

輸出一行明文。

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
