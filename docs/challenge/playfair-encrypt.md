---
layout: challenge
id: 5
title: Playfair 加密
difficulty: hard
tags: ["classical", "digraph", "encrypt"]
algorithm: playfair_encrypt
testcase_count: 5
params:
  plaintext:
    type: alpha_upper
    min_len: 6
    max_len: 14
  key:
    type: alpha_upper
    min_len: 4
    max_len: 10
generator: |
  plaintext = input()
  key = input()

  def build_square(k):
      seen = set()
      sq = []
      for ch in (k + 'ABCDEFGHIKLMNOPQRSTUVWXYZ'):
          c = 'I' if ch == 'J' else ch
          if c not in seen:
              seen.add(c)
              sq.append(c)
      return [sq[i*5:(i+1)*5] for i in range(5)]

  def find_pos(sq, ch):
      c = 'I' if ch == 'J' else ch
      for r, row in enumerate(sq):
          if c in row:
              return r, row.index(c)
      return 0, 0

  sq = build_square(key)
  pt = plaintext
  if len(pt) % 2 == 1:
      pt += 'X'

  result = ''
  for i in range(0, len(pt), 2):
      a, b = pt[i], pt[i+1]
      r1, c1 = find_pos(sq, a)
      r2, c2 = find_pos(sq, b)
      if r1 == r2:
          result += sq[r1][(c1+1)%5] + sq[r2][(c2+1)%5]
      elif c1 == c2:
          result += sq[(r1+1)%5][c1] + sq[(r2+1)%5][c2]
      else:
          result += sq[r1][c2] + sq[r2][c1]
  print(result)
starter_code: |
  plaintext = input()
  key = input()

  # 建立 Playfair 5x5 方格
  def build_square(key):
      seen = set()
      sq = []
      for ch in (key + 'ABCDEFGHIKLMNOPQRSTUVWXYZ'):
          c = 'I' if ch == 'J' else ch
          if c not in seen:
              seen.add(c)
              sq.append(c)
      return [sq[i*5:(i+1)*5] for i in range(5)]

  def find_pos(sq, ch):
      c = 'I' if ch == 'J' else ch
      for r, row in enumerate(sq):
          if c in row:
              return r, row.index(c)
      return 0, 0

  sq = build_square(key)

  # 準備明文（補 X 使長度為偶數）
  pt = plaintext
  if len(pt) % 2 == 1:
      pt += 'X'

  result = ''
  for i in range(0, len(pt), 2):
      a, b = pt[i], pt[i+1]
      r1, c1 = find_pos(sq, a)
      r2, c2 = find_pos(sq, b)
      if r1 == r2:
          result += sq[r1][(c1+1)%5] + sq[r2][(c2+1)%5]
      elif c1 == c2:
          result += sq[(r1+1)%5][c1] + sq[(r2+1)%5][c2]
      else:
          result += sq[r1][c2] + sq[r2][c1]

  print(result)
---

## Playfair 加密

Playfair 加密將明文每兩個字母分為一組，在 5×5 方格密碼表上依同行、同列、對角三種規則加密。I 和 J 視為同一字母。

## 輸入說明

第一行：明文（僅含大寫英文字母，長度 6–14；奇數長度時末尾自動補 X）

第二行：關鍵字（僅含大寫英文字母，長度 4–10）

## 輸出說明

輸出一行密文（大寫英文字母，長度為偶數）。

## 範例

**輸入：**
```
HELP
KEY
```

**輸出：**
```
DBIQ
```

## 說明

以關鍵字 KEY 建立 5×5 方格（去除重複後填入剩餘字母）：

```
K E Y A B
C D F G H
I L M N O
P Q R S T
U V W X Z
```

加密規則（每對字母）：
- 同行：各取右一格（循環）
- 同列：各取下一格（循環）
- 對角：取矩形另兩個對角的字母

HE → H(1,4)、E(0,1) 對角 → D(1,1)、B(0,4)

LP → L(2,1)、P(3,0) 對角 → I(2,0)、Q(3,1)
