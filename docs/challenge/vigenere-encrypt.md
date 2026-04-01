---
layout: challenge
id: 4
title: 維吉尼亞密碼
difficulty: medium
tags: ["classical", "substitution", "polyalphabetic", "encrypt"]
algorithm: vigenere_encrypt
testcase_count: 10
params:
  keyword:
    type: alpha_upper
    min_len: 3
    max_len: 8
  plaintext:
    type: alpha_upper
    min_len: 8
    max_len: 30
generator: |
  keyword = input()
  plaintext = input()
  result = ""
  for i, ch in enumerate(plaintext):
      shift = ord(keyword[i % len(keyword)]) - ord('A')
      result += chr((ord(ch) - ord('A') + shift) % 26 + ord('A'))
  print(result)
starter_code: |
  keyword = input()
  plaintext = input()

  # 在此實作維吉尼亞密碼加密
  result = ""

---

## 維吉尼亞密碼

維吉尼亞密碼（Vigen`ere Cipher）是一種多表替換加密法。與凱薩密碼使用固定位移不同，維吉尼亞密碼使用一個**關鍵字（keyword）**來決定每個字母的位移量。

加密規則：
1. 將關鍵字重複延伸至與明文等長。
2. 對於明文中的每個字母，取對應位置的關鍵字字母作為位移量（A=0, B=1, ..., Z=25）。
3. 將明文字母依該位移量向右位移，超過 Z 則循環回 A。

例如關鍵字為 `KEY`，明文為 `ATTACKATDAWN`：
- 關鍵字延伸為 `KEYKEYKEYKEY`
- A 位移 K(10)=K, T 位移 E(4)=X, T 位移 Y(24)=R, ...

## 輸入說明

第一行：關鍵字（僅含大寫英文字母，長度 3~8）

第二行：明文（僅含大寫英文字母，長度 8~30）

## 輸出說明

輸出一行密文（大寫英文字母）。

## 範例

**輸入：**
```plaintext
KEY
ATTACKATDAWN
```

**輸出：**
```plaintext
KXRKGIKXBKAL
```
