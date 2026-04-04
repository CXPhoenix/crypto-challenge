---
layout: challenge
id: 8
title: RSA 基礎運算
difficulty: medium
tags: ["modern", "asymmetric", "math", "encrypt"]
algorithm: rsa_basic
testcase_count: 8
params:
  # Factory generator：以下 params 僅用於驅動生成次數，實際輸入由 generator 自行產生
  _seed:
    type: int
    min: 0
    max: 999999
generator: |
  import random, math, json
  primes = [11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]
  p = random.choice(primes)
  q = random.choice(primes)
  n = p * q
  phi = (p - 1) * (q - 1)
  while True:
      e = random.randint(2, phi - 1)
      if math.gcd(e, phi) == 1:
          break
  m = random.randint(0, n - 1)
  d = pow(e, -1, phi)
  c = pow(m, e, n)
  print(json.dumps({"input": f"{p}\n{q}\n{e}\n{m}", "expected_output": f"{n} {d} {c}"}))
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
