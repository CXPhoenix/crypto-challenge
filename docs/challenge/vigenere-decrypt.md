---
layout: challenge
id: 4
title: 維吉尼亞解密
difficulty: medium
tags: ["classical", "polyalphabetic", "decrypt"]
algorithm: vigenere_decrypt
testcase_count: 5
params:
  ciphertext:
    type: alpha_upper
    min_len: 6
    max_len: 16
  key:
    type: alpha_upper
    min_len: 3
    max_len: 8
generator: |
  ciphertext = input()
  key = input()
  result = ""
  ki = 0
  for ch in ciphertext:
      shift = ord(key[ki % len(key)]) - ord('A')
      result += chr((ord(ch) - ord('A') - shift) % 26 + ord('A'))
      ki += 1
  print(result)
starter_code: |
  ciphertext = input()
  key = input()

  result = ""
  ki = 0
  for ch in ciphertext:
      if ch.isalpha():
          shift = ord(key[ki % len(key)]) - ord('A')
          result += chr((ord(ch) - ord('A') - shift) % 26 + ord('A'))
          ki += 1
      else:
          result += ch

  print(result)
---

## 維吉尼亞解密

給定密文和關鍵字，將每個字母反向位移還原明文。

## 輸入說明

第一行：密文（僅含大寫英文字母，長度 6–16）

第二行：關鍵字（僅含大寫英文字母，長度 3–8，循環使用）

## 輸出說明

輸出一行明文（大寫英文字母）。

## 範例

**輸入：**
```
RIJVS
KEY
```

**輸出：**
```
HELLO
```
