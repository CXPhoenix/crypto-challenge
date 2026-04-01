---
layout: challenge
id: 8
title: RSA 基礎運算
difficulty: medium
tags: ["modern", "asymmetric", "math", "encrypt"]
algorithm: rsa_basic
testcase_count: 8
params:
  p:
    type: int
    prime: true
    min: 10
    max: 97
  q:
    type: int
    prime: true
    min: 10
    max: 97
  e:
    type: int
    valid_public_exponent: true
  m:
    type: int
    less_than: n
generator: |
  p = int(input())
  q = int(input())
  e = int(input())
  m = int(input())
  n = p * q
  phi = (p - 1) * (q - 1)
  d = pow(e, -1, phi)
  c = pow(m, e, n)
  print(f"{n} {d} {c}")
starter_code: |
  p = int(input())
  q = int(input())
  e = int(input())
  m = int(input())

  # 在此實作 RSA 基礎運算
  # 計算 n, phi, d, c 並輸出 "n d c"

---

## RSA 基礎運算

RSA 是最廣泛使用的非對稱式加密演算法之一。本題要求根據給定的兩個質數 p、q、公開指數 e 和明文 m，計算 RSA 的基本參數並進行加密。

RSA 演算法步驟：
1. 計算 `n = p * q`（模數）
2. 計算 `phi = (p-1) * (q-1)`（歐拉函數）
3. 計算 `d`，使得 `d * e ≡ 1 (mod phi)`（私鑰指數，即 e 對 phi 的模反元素）
4. 計算密文 `c = m^e mod n`

## 輸入說明

第一行：質數 p（10 ≤ p ≤ 97）

第二行：質數 q（10 ≤ q ≤ 97）

第三行：公開指數 e（與 phi 互質的正整數）

第四行：明文 m（整數，0 ≤ m < n）

## 輸出說明

輸出一行，包含三個以空格分隔的整數：`n d c`

## 範例

**輸入：**
```plaintext
61
53
17
65
```

**輸出：**
```plaintext
3233 2753 2790
```
