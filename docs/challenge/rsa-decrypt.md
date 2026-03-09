---
layout: challenge
id: 11
title: RSA 解密（教學版）
difficulty: hard
tags: ["asymmetric", "rsa", "decrypt"]
algorithm: rsa_decrypt
testcase_count: 5
params:
  c:
    type: int
    min: 2
    max: 3232
  d:
    type: int
    min: 2753
    max: 2753
  n:
    type: int
    min: 3233
    max: 3233
generator: |
  c = int(input())
  d = int(input())
  n = int(input())
  print(pow(c, d, n))
starter_code: |
  c = int(input())
  d = int(input())
  n = int(input())

  m = pow(c, d, n)
  print(m)
---

## RSA 解密（教學版）

RSA 解密利用私鑰 $d$ 還原明文，公式為：

$$m = c^d \bmod n$$

## 輸入說明

第一行：密文數字 $c$（整數，2 ≤ c ≤ 3232）

第二行：私鑰指數 $d$（固定為 2753）

第三行：模數 $n$（固定為 3233，即 61 × 53）

## 輸出說明

輸出一行計算結果 $m$（整數）。

## 範例

**輸入：**
```
2790
2753
3233
```

**輸出：**
```
65
```

## 說明

$n = 61 \times 53 = 3233$，$\varphi(n) = 60 \times 52 = 3120$，$e \cdot d \equiv 1 \pmod{\varphi(n)}$（即 $17 \times 2753 \bmod 3120 = 1$）。

$m = 2790^{2753} \bmod 3233 = 65$
