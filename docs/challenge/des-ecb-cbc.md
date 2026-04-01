---
layout: challenge
id: 7
title: DES ECB/CBC 模式
difficulty: medium
tags: ["modern", "symmetric", "block-cipher", "encrypt"]
algorithm: des_ecb_cbc
testcase_count: 8
params:
  key:
    type: hex
    len: 16
  plaintext:
    type: hex
    min_len: 16
    max_len: 64
    multiple_of: 16
  mode:
    type: string
    values: ["ECB", "CBC"]
  iv:
    type: hex
    len: 16
generator: |
  from Crypto.Cipher import DES
  key = bytes.fromhex(input())
  plaintext = bytes.fromhex(input())
  mode = input().strip()
  iv = bytes.fromhex(input())
  if mode == "ECB":
      cipher = DES.new(key, DES.MODE_ECB)
  else:
      cipher = DES.new(key, DES.MODE_CBC, iv=iv)
  ciphertext = cipher.encrypt(plaintext)
  print(ciphertext.hex().upper())
starter_code: |
  from Crypto.Cipher import DES

  key = bytes.fromhex(input())
  plaintext = bytes.fromhex(input())
  mode = input().strip()
  iv = bytes.fromhex(input())

  # 在此實作 DES ECB/CBC 模式加密
  # 提示：使用 pycryptodome 的 DES.new()
  result = ""

---

## DES ECB/CBC 模式

DES（Data Encryption Standard）是經典的對稱式區塊加密演算法，每個區塊為 8 位元組（64 位元），金鑰長度同樣為 8 位元組。

本題要求實作 DES 的兩種操作模式：

- **ECB（Electronic Codebook）模式**：每個區塊獨立加密，相同的明文區塊會產生相同的密文區塊。
- **CBC（Cipher Block Chaining）模式**：每個明文區塊在加密前先與前一個密文區塊（第一個區塊與 IV）進行 XOR，使相同的明文區塊在不同位置產生不同的密文。

本題使用 `pycryptodome` 套件。安裝方式：`pip install pycryptodome`

## 輸入說明

第一行：金鑰（16 個十六進位字元，即 8 位元組）

第二行：明文（十六進位字串，長度為 16 的倍數，即若干個 8 位元組區塊）

第三行：模式（`ECB` 或 `CBC`）

第四行：初始向量 IV（16 個十六進位字元，僅 CBC 模式使用；ECB 模式時仍須讀入但忽略）

## 輸出說明

輸出一行密文（大寫十六進位字串）。

## 範例

**輸入：**
```plaintext
0123456789ABCDEF
4E6F772069732074
ECB
0000000000000000
```

**輸出：**
```plaintext
3FA40E8A984D4815
```
