use std::collections::HashMap;

use super::{Algorithm, Testcase};

pub fn vigenere_encrypt(plaintext: &str, key: &str) -> String {
    let key_bytes: Vec<u8> = key
        .chars()
        .filter(|c| c.is_ascii_alphabetic())
        .map(|c| c.to_ascii_uppercase() as u8 - b'A')
        .collect();
    if key_bytes.is_empty() {
        return plaintext.to_string();
    }
    let mut ki = 0;
    plaintext
        .chars()
        .map(|c| {
            if c.is_ascii_uppercase() {
                let enc =
                    ((c as u8 - b'A' + key_bytes[ki % key_bytes.len()]) % 26 + b'A') as char;
                ki += 1;
                enc
            } else {
                c
            }
        })
        .collect()
}

pub fn vigenere_decrypt(ciphertext: &str, key: &str) -> String {
    let key_bytes: Vec<u8> = key
        .chars()
        .filter(|c| c.is_ascii_alphabetic())
        .map(|c| c.to_ascii_uppercase() as u8 - b'A')
        .collect();
    if key_bytes.is_empty() {
        return ciphertext.to_string();
    }
    let mut ki = 0;
    ciphertext
        .chars()
        .map(|c| {
            if c.is_ascii_uppercase() {
                let dec = ((c as u8 - b'A' + 26 - key_bytes[ki % key_bytes.len()]) % 26 + b'A')
                    as char;
                ki += 1;
                dec
            } else {
                c
            }
        })
        .collect()
}

pub struct VigenereEncrypt;
pub struct VigenereDecrypt;

impl Algorithm for VigenereEncrypt {
    fn name(&self) -> &'static str {
        "vigenere_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let key = super::get(params, "key");
        let ct = vigenere_encrypt(&pt, &key);
        (format!("{pt}\n{key}"), ct)
    }
}

impl Algorithm for VigenereDecrypt {
    fn name(&self) -> &'static str {
        "vigenere_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let key = super::get(params, "key");
        let ct = vigenere_encrypt(&pt, &key);
        (format!("{ct}\n{key}"), pt)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn vigenere_roundtrip() {
        let ct = vigenere_encrypt("ATTACKATDAWN", "LEMON");
        assert_eq!(vigenere_decrypt(&ct, "LEMON"), "ATTACKATDAWN");
    }

    #[test]
    fn vigenere_known_value() {
        assert_eq!(vigenere_encrypt("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
    }
}
