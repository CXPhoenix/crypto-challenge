use std::collections::HashMap;

use super::{Algorithm, Testcase};

fn build_playfair_square(key: &str) -> [[char; 5]; 5] {
    let mut seen = [false; 26];
    seen[('J' as u8 - b'A') as usize] = true; // merge I/J
    let mut letters: Vec<char> = Vec::with_capacity(25);
    for c in key.chars().filter(|c| c.is_ascii_alphabetic()) {
        let idx = (c.to_ascii_uppercase() as u8 - b'A') as usize;
        if !seen[idx] {
            seen[idx] = true;
            letters.push(c.to_ascii_uppercase());
        }
    }
    for i in 0u8..26 {
        if !seen[i as usize] {
            letters.push((b'A' + i) as char);
        }
    }
    let mut sq = [['A'; 5]; 5];
    for (i, &ch) in letters.iter().enumerate() {
        sq[i / 5][i % 5] = ch;
    }
    sq
}

fn playfair_pos(sq: &[[char; 5]; 5], c: char) -> (usize, usize) {
    let c = if c == 'J' { 'I' } else { c };
    for r in 0..5 {
        for col in 0..5 {
            if sq[r][col] == c {
                return (r, col);
            }
        }
    }
    (0, 0)
}

pub fn playfair_encrypt(plaintext: &str, key: &str) -> String {
    let sq = build_playfair_square(key);
    let mut chars: Vec<char> = plaintext
        .chars()
        .filter(|c| c.is_ascii_alphabetic())
        .map(|c| if c == 'J' { 'I' } else { c.to_ascii_uppercase() })
        .collect();
    // insert X between repeated pairs
    let mut i = 0;
    while i + 1 < chars.len() {
        if chars[i] == chars[i + 1] {
            chars.insert(i + 1, 'X');
        }
        i += 2;
    }
    if chars.len() % 2 != 0 {
        chars.push('X');
    }
    let mut result = String::new();
    for pair in chars.chunks(2) {
        let (r1, c1) = playfair_pos(&sq, pair[0]);
        let (r2, c2) = playfair_pos(&sq, pair[1]);
        let (e1, e2) = if r1 == r2 {
            (sq[r1][(c1 + 1) % 5], sq[r2][(c2 + 1) % 5])
        } else if c1 == c2 {
            (sq[(r1 + 1) % 5][c1], sq[(r2 + 1) % 5][c2])
        } else {
            (sq[r1][c2], sq[r2][c1])
        };
        result.push(e1);
        result.push(e2);
    }
    result
}

pub fn playfair_decrypt(ciphertext: &str, key: &str) -> String {
    let sq = build_playfair_square(key);
    let chars: Vec<char> = ciphertext
        .chars()
        .filter(|c| c.is_ascii_alphabetic())
        .map(|c| c.to_ascii_uppercase())
        .collect();
    let mut result = String::new();
    for pair in chars.chunks(2) {
        if pair.len() < 2 {
            break;
        }
        let (r1, c1) = playfair_pos(&sq, pair[0]);
        let (r2, c2) = playfair_pos(&sq, pair[1]);
        let (d1, d2) = if r1 == r2 {
            (sq[r1][(c1 + 4) % 5], sq[r2][(c2 + 4) % 5])
        } else if c1 == c2 {
            (sq[(r1 + 4) % 5][c1], sq[(r2 + 4) % 5][c2])
        } else {
            (sq[r1][c2], sq[r2][c1])
        };
        result.push(d1);
        result.push(d2);
    }
    result
}

pub struct PlayfairEncrypt;
pub struct PlayfairDecrypt;

impl Algorithm for PlayfairEncrypt {
    fn name(&self) -> &'static str {
        "playfair_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let key = super::get(params, "key");
        let ct = playfair_encrypt(&pt, &key);
        (format!("{pt}\n{key}"), ct)
    }
}

impl Algorithm for PlayfairDecrypt {
    fn name(&self) -> &'static str {
        "playfair_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let key = super::get(params, "key");
        let ct = playfair_encrypt(&pt, &key);
        (format!("{ct}\n{key}"), playfair_decrypt(&ct, &key))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn playfair_encrypt_known() {
        let ct = playfair_encrypt("HELLO", "PLAYFAIR");
        assert!(!ct.is_empty());
        assert_eq!(ct.len(), 6); // 3 pairs → 6 output chars
        assert_eq!(playfair_decrypt(&ct, "PLAYFAIR"), "HELXLO");
    }
}
