use std::collections::HashMap;

use super::{Algorithm, Testcase};

fn railfence_pattern(len: usize, rails: usize) -> Vec<usize> {
    let mut pattern = vec![0usize; len];
    let mut rail: isize = 0;
    let mut dir: isize = 1;
    for p in pattern.iter_mut() {
        *p = rail as usize;
        if rail == 0 {
            dir = 1;
        } else if rail == (rails - 1) as isize {
            dir = -1;
        }
        rail += dir;
    }
    pattern
}

pub fn railfence_encrypt(plaintext: &str, rails: usize) -> String {
    if rails <= 1 {
        return plaintext.to_string();
    }
    let chars: Vec<char> = plaintext.chars().collect();
    let pattern = railfence_pattern(chars.len(), rails);
    let mut fence: Vec<Vec<char>> = vec![Vec::new(); rails];
    for (&r, &c) in pattern.iter().zip(chars.iter()) {
        fence[r].push(c);
    }
    fence.into_iter().flatten().collect()
}

pub fn railfence_decrypt(ciphertext: &str, rails: usize) -> String {
    if rails <= 1 {
        return ciphertext.to_string();
    }
    let n = ciphertext.len();
    let pattern = railfence_pattern(n, rails);
    let mut counts = vec![0usize; rails];
    for &r in &pattern {
        counts[r] += 1;
    }
    let mut pos = vec![0usize; rails];
    let mut acc = 0;
    for r in 0..rails {
        pos[r] = acc;
        acc += counts[r];
    }
    let chars: Vec<char> = ciphertext.chars().collect();
    let mut result = vec![' '; n];
    for (i, &r) in pattern.iter().enumerate() {
        result[i] = chars[pos[r]];
        pos[r] += 1;
    }
    result.into_iter().collect()
}

pub struct RailfenceEncrypt;
pub struct RailfenceDecrypt;

impl Algorithm for RailfenceEncrypt {
    fn name(&self) -> &'static str {
        "railfence_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let rails = super::get_usize(params, "rails");
        let ct = railfence_encrypt(&pt, rails);
        (format!("{pt}\n{rails}"), ct)
    }
}

impl Algorithm for RailfenceDecrypt {
    fn name(&self) -> &'static str {
        "railfence_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let rails = super::get_usize(params, "rails");
        let ct = railfence_encrypt(&pt, rails);
        (format!("{ct}\n{rails}"), railfence_decrypt(&ct, rails))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn railfence_roundtrip() {
        let pt = "WEAREDISCOVEREDFLEEAYNOW";
        let ct = railfence_encrypt(pt, 3);
        assert_eq!(railfence_decrypt(&ct, 3), pt);
    }

    #[test]
    fn railfence_known_value() {
        assert_eq!(railfence_encrypt("HELLO", 2), "HLOEL");
        assert_eq!(railfence_decrypt("HLOEL", 2), "HELLO");
    }
}
