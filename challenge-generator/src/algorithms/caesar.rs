use std::collections::HashMap;

use super::{Algorithm, Testcase};

pub fn caesar_encrypt(plaintext: &str, shift: u8) -> String {
    plaintext
        .chars()
        .map(|c| {
            if c.is_ascii_uppercase() {
                (((c as u8 - b'A' + shift) % 26) + b'A') as char
            } else {
                c
            }
        })
        .collect()
}

pub fn caesar_decrypt(ciphertext: &str, shift: u8) -> String {
    caesar_encrypt(ciphertext, 26 - (shift % 26))
}

pub struct CaesarEncrypt;
pub struct CaesarDecrypt;

impl Algorithm for CaesarEncrypt {
    fn name(&self) -> &'static str {
        "caesar_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let shift: u8 = super::get(params, "shift").parse().unwrap_or(1);
        let ct = caesar_encrypt(&pt, shift);
        (format!("{pt}\n{shift}"), ct)
    }
}

impl Algorithm for CaesarDecrypt {
    fn name(&self) -> &'static str {
        "caesar_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt = super::get(params, "plaintext");
        let shift: u8 = super::get(params, "shift").parse().unwrap_or(1);
        let ct = caesar_encrypt(&pt, shift);
        (format!("{ct}\n{shift}"), pt)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn caesar_roundtrip() {
        assert_eq!(caesar_decrypt(&caesar_encrypt("HELLO", 3), 3), "HELLO");
    }

    #[test]
    fn caesar_known_value() {
        assert_eq!(caesar_encrypt("HELLO", 3), "KHOOR");
    }
}
