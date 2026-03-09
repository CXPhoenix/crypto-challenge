use std::collections::HashMap;

use ::aes::Aes128;
use ::aes::cipher::{BlockDecrypt, BlockEncrypt, KeyInit, generic_array::GenericArray};

use super::{Algorithm, Testcase};

pub fn pad_pkcs7(data: &[u8], block_size: usize) -> Vec<u8> {
    let pad = block_size - (data.len() % block_size);
    let mut out = data.to_vec();
    out.extend(std::iter::repeat(pad as u8).take(pad));
    out
}

pub fn unpad_pkcs7(data: &[u8]) -> Vec<u8> {
    if let Some(&pad) = data.last() {
        let pad = pad as usize;
        if pad > 0
            && pad <= data.len()
            && data[data.len() - pad..].iter().all(|&b| b == pad as u8)
        {
            return data[..data.len() - pad].to_vec();
        }
    }
    data.to_vec()
}

pub fn aes_ecb_encrypt(plaintext: &[u8], key: &[u8; 16]) -> Vec<u8> {
    let cipher = Aes128::new(GenericArray::from_slice(key));
    let padded = pad_pkcs7(plaintext, 16);
    let mut out = padded.clone();
    for chunk in out.chunks_mut(16) {
        let block = GenericArray::from_mut_slice(chunk);
        cipher.encrypt_block(block);
    }
    out
}

pub fn aes_ecb_decrypt(ciphertext: &[u8], key: &[u8; 16]) -> Vec<u8> {
    let cipher = Aes128::new(GenericArray::from_slice(key));
    let mut out = ciphertext.to_vec();
    for chunk in out.chunks_mut(16) {
        let block = GenericArray::from_mut_slice(chunk);
        cipher.decrypt_block(block);
    }
    unpad_pkcs7(&out)
}

/// Simple ECB: XOR each 8-byte block with the key (educational, not secure)
pub fn simple_ecb_encrypt(plaintext: &[u8], key: &[u8; 8]) -> Vec<u8> {
    let padded = pad_pkcs7(plaintext, 8);
    padded
        .chunks(8)
        .flat_map(|block| block.iter().zip(key.iter()).map(|(b, k)| b ^ k))
        .collect()
}

pub fn simple_ecb_decrypt(ciphertext: &[u8], key: &[u8; 8]) -> Vec<u8> {
    let dec: Vec<u8> = ciphertext
        .chunks(8)
        .flat_map(|block| block.iter().zip(key.iter()).map(|(b, k)| b ^ k))
        .collect();
    unpad_pkcs7(&dec)
}

pub struct AesEcbEncrypt;
pub struct AesEcbDecrypt;
pub struct SimpleEcbEncrypt;
pub struct SimpleEcbDecrypt;

impl Algorithm for AesEcbEncrypt {
    fn name(&self) -> &'static str {
        "aes_ecb_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt_hex = super::get(params, "plaintext_hex");
        let key_hex = super::get(params, "key_hex");
        let pt = hex::decode(&pt_hex).unwrap_or_default();
        let key_bytes = hex::decode(&key_hex).unwrap_or_default();
        let key: [u8; 16] = key_bytes.try_into().unwrap_or([0u8; 16]);
        let ct = aes_ecb_encrypt(&pt, &key);
        (format!("{pt_hex}\n{key_hex}"), hex::encode(ct))
    }
}

impl Algorithm for AesEcbDecrypt {
    fn name(&self) -> &'static str {
        "aes_ecb_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt_hex = super::get(params, "plaintext_hex");
        let key_hex = super::get(params, "key_hex");
        let pt = hex::decode(&pt_hex).unwrap_or_default();
        let key_bytes = hex::decode(&key_hex).unwrap_or_default();
        let key: [u8; 16] = key_bytes.try_into().unwrap_or([0u8; 16]);
        let ct = aes_ecb_encrypt(&pt, &key);
        let ct_hex = hex::encode(&ct);
        (format!("{ct_hex}\n{key_hex}"), pt_hex)
    }
}

impl Algorithm for SimpleEcbEncrypt {
    fn name(&self) -> &'static str {
        "simple_ecb_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt_hex = super::get(params, "plaintext_hex");
        let key_hex = super::get(params, "key_hex");
        let pt = hex::decode(&pt_hex).unwrap_or_default();
        let key_bytes = hex::decode(&key_hex).unwrap_or_else(|_| vec![0u8; 8]);
        let key: [u8; 8] = key_bytes.try_into().unwrap_or([0u8; 8]);
        let ct = simple_ecb_encrypt(&pt, &key);
        (format!("{pt_hex}\n{key_hex}"), hex::encode(ct))
    }
}

impl Algorithm for SimpleEcbDecrypt {
    fn name(&self) -> &'static str {
        "simple_ecb_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let pt_hex = super::get(params, "plaintext_hex");
        let key_hex = super::get(params, "key_hex");
        let pt = hex::decode(&pt_hex).unwrap_or_default();
        let key_bytes = hex::decode(&key_hex).unwrap_or_else(|_| vec![0u8; 8]);
        let key: [u8; 8] = key_bytes.try_into().unwrap_or([0u8; 8]);
        let ct = simple_ecb_encrypt(&pt, &key);
        let ct_hex = hex::encode(&ct);
        (format!("{ct_hex}\n{key_hex}"), pt_hex)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aes_ecb_roundtrip() {
        let key = b"0123456789abcdef";
        let pt = b"Hello, AES-ECB!!";
        let ct = aes_ecb_encrypt(pt, key);
        assert_eq!(aes_ecb_decrypt(&ct, key), pt);
    }

    #[test]
    fn simple_ecb_roundtrip() {
        let key = b"mykey123";
        let pt = b"HELLO!!";
        let ct = simple_ecb_encrypt(pt, key);
        assert_eq!(simple_ecb_decrypt(&ct, key), pt);
    }
}
