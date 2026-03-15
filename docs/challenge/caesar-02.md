---
layout: challenge
id: 1
title: 凱薩密碼轉換
difficulty: medium
tags: ["classical", "substitution", "encrypt"]
algorithm: caesar_encrypt
testcase_count: 10
params:
  shift:
    type: int
    min: 1
    max: 25
  plaintext:
    type: alpha_lower
    min_len: 5
    max_len: 30
    count:
      min: 1
      max: 100
  ciphertext:
    type: alpha_upper
    min_len: 5
    max_len: 30
    count: 
      min: 1
      max: 100
generator: |
  shift = int(input())
  plaintext = input().split()
  ciphertext = input().split()
  encrypt = lambda t: ''.join([chr((ord(c) - ord('a') + shift) % 26 + ord('A')) for c in t])
  decrypt = lambda t: ''.join([chr(((ord(c) - ord('A') - shift) + 26) % 26 + ord('a')) for c in t])
  print(' '.join([encrypt(pt) for pt in plaintext]))
  print(' '.join([decrypt(ct) for ct in ciphertext]))

starter_code: |
  shift = int(input())
  plaintext = input().split()
  ciphertext = input().split()

  # 在此實作凱薩密碼加密
  
---

## 凱薩密碼轉換

在密碼學的範例中，我們習慣將明文用英文字母小寫表示，而密文則是英文字母大寫表示。

今天你將按照這個邏輯來進行程式設計。

## 輸入說明

共輸入三行：

* 第一行：位移量（整數，1 ≤ shift ≤ 25）
* 第二行：待加密測試資料集（1 ≤ 組數 ≤ 100；每一組資料將用一個空白符號隔開）
* 第三行：待解密測試資料集（1 ≤ 組數 ≤ 100；每一組資料將用一個空白符號隔開）

## 輸出說明

共輸出兩行：

* 第一行：加密後的資料（每一組資料用一個空白符號隔開）。
* 第二行：解密後的資料（每一組資料用一個空白符號隔開）。

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
