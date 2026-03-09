---
layout: challenge
id: 15
title: Simple ECB 解密
difficulty: medium
tags: ["symmetric", "block-cipher", "xor", "decrypt"]
algorithm: simple_ecb_decrypt
testcase_count: 5
params:
  plaintext_hex:
    type: hex_string
    min_len: 16
    max_len: 32
  key_hex:
    type: hex_string
    min_len: 16
    max_len: 16
generator: |
  import json
  pt_hex = input()
  key_hex = input()
  plaintext = bytes.fromhex(pt_hex)
  key = bytes.fromhex(key_hex)
  pad = 8 - (len(plaintext) % 8)
  padded = plaintext + bytes([pad] * pad)
  result = b''
  for i in range(0, len(padded), 8):
      block = padded[i:i+8]
      result += bytes(b ^ k for b, k in zip(block, key))
  print(json.dumps({"input": result.hex() + "\n" + key_hex, "expected_output": pt_hex}))
starter_code: |
  ct_hex = input()
  key_hex = input()

  ciphertext = bytes.fromhex(ct_hex)
  key = bytes.fromhex(key_hex)

  # XOR each 8-byte block with key (same as encrypt)
  decrypted = b''
  for i in range(0, len(ciphertext), 8):
      block = ciphertext[i:i+8]
      decrypted += bytes(b ^ k for b, k in zip(block, key))

  # 移除 PKCS#7 填充
  pad = decrypted[-1]
  decrypted = decrypted[:-pad]

  print(decrypted.hex())
---

## Simple ECB 解密

給定 Simple ECB 密文和金鑰，還原明文（移除 PKCS#7 填充）。

## 輸入說明

```
密文（十六進位字串）
金鑰（16 個十六進位字元 = 8 位元組）
```

## 輸出說明

```
明文（十六進位字串，不含填充）
```

## 說明

由於 XOR 是自逆的（$(a \oplus k) \oplus k = a$），解密步驟與加密相同，再移除 PKCS#7 填充即可。
