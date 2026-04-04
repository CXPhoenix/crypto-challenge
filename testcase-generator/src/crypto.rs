/// AES-256-GCM decryption for encrypted pool files.
///
/// The encryption key is assembled from obfuscated segments in `key_material.rs`.
/// After decryption the key is zeroized.
use aes_gcm::{Aes256Gcm, KeyInit, Nonce};
use aes_gcm::aead::Aead;
use zeroize::Zeroizing;

use crate::key_material;

/// Pool binary format constants.
pub const MAGIC: &[u8; 6] = b"CXPOOL";
pub const VERSION: u8 = 1;
pub const NONCE_LEN: usize = 12;
/// Header = magic (6) + version (1) + nonce (12) = 19 bytes.
pub const HEADER_LEN: usize = 6 + 1 + NONCE_LEN;

/// Decrypt an encrypted pool file and return the plaintext JSON bytes.
///
/// Expected binary layout:
///   [CXPOOL 6B][version 1B][nonce 12B][ciphertext + auth_tag]
pub fn decrypt_pool(data: &[u8]) -> Result<Zeroizing<Vec<u8>>, String> {
    if data.len() < HEADER_LEN + 16 {
        // At minimum: header + 16-byte GCM tag
        return Err("Pool file too short".into());
    }

    // Validate magic
    if &data[..6] != MAGIC {
        return Err(format!(
            "Invalid pool magic: expected CXPOOL, got {:?}",
            &data[..6]
        ));
    }

    // Validate version
    if data[6] != VERSION {
        return Err(format!("Unsupported pool version: {}", data[6]));
    }

    // Extract nonce and ciphertext
    let nonce_bytes = &data[7..7 + NONCE_LEN];
    let ciphertext = &data[HEADER_LEN..];

    // Reconstruct key (zeroized on drop)
    let key = key_material::reconstruct_key();

    // Decrypt
    let cipher =
        Aes256Gcm::new_from_slice(key.as_ref()).map_err(|e| format!("Cipher init: {e}"))?;
    let nonce = Nonce::from_slice(nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "AES-GCM decryption failed: authentication error".to_string())?;

    Ok(Zeroizing::new(plaintext))
}

#[cfg(test)]
mod tests {
    use super::*;
    use aes_gcm::aead::OsRng;
    use aes_gcm::{AeadCore, Aes256Gcm, KeyInit};

    /// Helper: encrypt data using the reconstructed key so we can test round-trip.
    fn encrypt_with_pool_key(plaintext: &[u8]) -> Vec<u8> {
        let key = key_material::reconstruct_key();
        let cipher = Aes256Gcm::new_from_slice(key.as_ref()).unwrap();
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let ciphertext = cipher.encrypt(&nonce, plaintext).unwrap();

        let mut out = Vec::with_capacity(HEADER_LEN + ciphertext.len());
        out.extend_from_slice(MAGIC);
        out.push(VERSION);
        out.extend_from_slice(nonce.as_slice());
        out.extend_from_slice(&ciphertext);
        out
    }

    #[test]
    fn round_trip_decrypt() {
        let plaintext = b"hello world";
        let encrypted = encrypt_with_pool_key(plaintext);
        let decrypted = decrypt_pool(&encrypted).unwrap();
        assert_eq!(decrypted.as_slice(), plaintext);
    }

    #[test]
    fn rejects_invalid_magic() {
        let mut data = encrypt_with_pool_key(b"test");
        data[0] = b'X'; // corrupt magic
        let err = decrypt_pool(&data).unwrap_err();
        assert!(err.contains("Invalid pool magic"));
    }

    #[test]
    fn rejects_tampered_ciphertext() {
        let mut data = encrypt_with_pool_key(b"test");
        let last = data.len() - 1;
        data[last] ^= 0xff; // flip a byte in auth tag
        let err = decrypt_pool(&data).unwrap_err();
        assert!(err.contains("authentication error"));
    }

    #[test]
    fn rejects_too_short() {
        let err = decrypt_pool(b"CXPOOL").unwrap_err();
        assert!(err.contains("too short"));
    }
}
