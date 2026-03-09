---
layout: challenge
id: 13
title: AES-ECB 解密
difficulty: hard
tags: ["symmetric", "aes", "block-cipher", "decrypt"]
algorithm: aes_ecb_decrypt
testcase_count: 5
params:
  plaintext_hex:
    type: hex_string
    min_len: 32
    max_len: 32
  key_hex:
    type: hex_string
    min_len: 32
    max_len: 32
generator: |
  import json
  # Pure-Python AES-128
  _S=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22]
  _R=[1,2,4,8,16,32,64,128,27,54]
  def _x(b): return((b<<1)^27 if b&128 else b<<1)&255
  def _ks(k):
      w=list(k)
      for i in range(16,176,4):
          t=w[i-4:i]
          if i%16==0: t=[_S[t[1]]^_R[i//16-1],_S[t[2]],_S[t[3]],_S[t[0]]]
          w+=[a^b for a,b in zip(t,w[i-16:i-12])]
      return w
  def _eb(blk,ks):
      s=[a^b for a,b in zip(blk,ks[:16])]
      for r in range(1,11):
          s=[_S[b] for b in s]
          s=[s[0],s[5],s[10],s[15],s[4],s[9],s[14],s[3],s[8],s[13],s[2],s[7],s[12],s[1],s[6],s[11]]
          if r<10:
              t=[]
              for c in range(0,16,4):
                  a=s[c:c+4];ta,tb,td,te=_x(a[0]),_x(a[1]),_x(a[2]),_x(a[3]);u=a[0]^a[1]^a[2]^a[3]
                  t+=[ta^tb^u^a[0],tb^td^u^a[1],td^te^u^a[2],te^ta^u^a[3]]
              s=t
          s=[a^b for a,b in zip(s,ks[r*16:(r+1)*16])]
      return bytes(s)
  def aes_ecb(pt,key):
      ks=_ks(list(key));n=16-(len(pt)%16);pt+=bytes([n]*n)
      return b''.join(_eb(list(pt[i:i+16]),ks) for i in range(0,len(pt),16))

  pt_hex = input()
  key_hex = input()
  pt = bytes.fromhex(pt_hex)
  key = bytes.fromhex(key_hex)
  ct = aes_ecb(pt, key)
  print(json.dumps({"input": ct.hex() + "\n" + key_hex, "expected_output": pt_hex}))
starter_code: |
  from Crypto.Cipher import AES
  from Crypto.Util.Padding import unpad

  ct_hex = input()
  key_hex = input()

  ciphertext = bytes.fromhex(ct_hex)
  key = bytes.fromhex(key_hex)

  cipher = AES.new(key, AES.MODE_ECB)
  plaintext = unpad(cipher.decrypt(ciphertext), 16)
  print(plaintext.hex())
---

## AES-ECB 解密

給定密文和金鑰，進行 AES-ECB 解密並移除 PKCS#7 填充，還原原始明文。

## 輸入說明

```
密文（64 個十六進位字元 = 32 位元組，含 PKCS#7 填充）
金鑰（32 個十六進位字元 = 16 位元組）
```

## 輸出說明

```
明文（32 個十六進位字元 = 16 位元組，不含填充）
```

## 說明

1. 將十六進位字串解碼為位元組
2. 進行 AES-128 ECB 解密
3. 移除 PKCS#7 填充
4. 輸出為小寫十六進位字串

**提示：** 使用 `pycryptodome` 的 `AES` 和 `unpad`。
