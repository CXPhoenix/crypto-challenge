use std::collections::HashMap;

use super::{Algorithm, Testcase};

pub fn xor_cipher(text: &[u8], key: u8) -> Vec<u8> {
    text.iter().map(|b| b ^ key).collect()
}

/// XOR is its own inverse — encrypt and decrypt are the same operation.
pub struct XorEncrypt;
pub struct XorDecrypt;

fn xor_testcase(params: &HashMap<String, String>) -> Testcase {
    let pt = super::get(params, "plaintext");
    let key: u8 = super::get(params, "key").parse().unwrap_or(42);
    let ct_bytes = xor_cipher(pt.as_bytes(), key);
    let ct_hex = hex::encode(&ct_bytes);
    (format!("{pt}\n{key}"), ct_hex)
}

impl Algorithm for XorEncrypt {
    fn name(&self) -> &'static str {
        "xor_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        xor_testcase(params)
    }
}

impl Algorithm for XorDecrypt {
    fn name(&self) -> &'static str {
        "xor_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        xor_testcase(params)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn xor_roundtrip() {
        let pt = b"HELLO";
        let key = 42u8;
        let ct = xor_cipher(pt, key);
        assert_eq!(xor_cipher(&ct, key), pt);
    }
}
