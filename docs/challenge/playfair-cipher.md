---
layout: challenge
id: 5
title: Playfair 密碼
difficulty: medium
tags: ["classical", "substitution", "playfair cipher"]
algorithm: playfair_encrypt
testcase_count: 10
params:
  keyword:
    type: alpha_upper
    min_len: 4
    max_len: 12
  plaintext:
    type: alpha_upper
    min_len: 8
    max_len: 30
generator: |
  def generate_matrix(keyword: str) -> list[list[str]]:
      keyword = keyword.upper().replace("J", "I")
      seen = set()
      key_chars = []
      for ch in keyword:
          if ch.isalpha() and ch not in seen:
              seen.add(ch)
              key_chars.append(ch)
      for ch in "ABCDEFGHIKLMNOPQRSTUVWXYZ":
          if ch not in seen:
              key_chars.append(ch)
      return [key_chars[i * 5 : i * 5 + 5] for i in range(5)]

  def find_position(matrix: list[list[str]], ch: str) -> tuple[int, int]:
      for r, row in enumerate(matrix):
          for c, val in enumerate(row):
              if val == ch:
                  return r, c
      raise ValueError(f"Character {ch} not found in matrix")

  def prepare_text(plaintext: str) -> list[tuple[str, str]]:
      text = plaintext.upper().replace("J", "I")
      text = "".join(ch for ch in text if ch.isalpha())
      pairs = []
      i = 0
      while i < len(text):
          a = text[i]
          if i + 1 < len(text):
              b = text[i + 1]
              if a == b:
                  pairs.append((a, "X"))
                  i += 1
              else:
                  pairs.append((a, b))
                  i += 2
          else:
              pairs.append((a, "X"))
              i += 1
      return pairs

  def encrypt(keyword: str, plaintext: str) -> str:
      matrix = generate_matrix(keyword)
      pairs = prepare_text(plaintext)
      result = []
      for a, b in pairs:
          r1, c1 = find_position(matrix, a)
          r2, c2 = find_position(matrix, b)
          if r1 == r2:
              result.append(matrix[r1][(c1 + 1) % 5])
              result.append(matrix[r2][(c2 + 1) % 5])
          elif c1 == c2:
              result.append(matrix[(r1 + 1) % 5][c1])
              result.append(matrix[(r2 + 1) % 5][c2])
          else:
              result.append(matrix[r1][c2])
              result.append(matrix[r2][c1])
      return "".join(result)
  
  keyword = input()
  plaintext = input()
  print(encrypt(keyword, plaintext))
starter_code: |
  keyword = input()
  plaintext = input()

  # 在此實作 Play Fair 密碼加密
  result = ""

---

## Playfair 密碼

Playfair 密碼是一種**雙字母替換加密法（digraph substitution cipher）**，由 Charles Wheatstone 於 1854 年發明，以 Lyon Playfair 男爵命名。與單一字母替換不同，Playfair 每次加密**兩個字母**，大幅提高了密碼分析的難度。

給定一個關鍵字 `keyword` 與一段明文 `plaintext`，請依照 Playfair 密碼的加密步驟將明文加密為密文。

## 輸入說明

第一行：關鍵字（僅含大寫英文字母，長度 4～12）

第二行：明文（僅含大寫英文字母，長度 8～30）

## 輸出說明

輸出一行加密後的密文（大寫英文字母）。

## 範例

**輸入：**
```plaintext
MONARCHY
INSTRUMENTS
```

**輸出：**
```plaintext
GATLMZCLRQXA
```
