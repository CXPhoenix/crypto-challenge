use std::collections::HashMap;
use std::sync::OnceLock;

mod aes;
mod caesar;
mod playfair;
mod railfence;
mod rsa;
mod vigenere;
mod xor;

/// Result of one test case: (stdin_input, expected_stdout)
pub type Testcase = (String, String);

/// Common parameter helpers (accessible to submodules via `super::`)
pub(crate) fn get(params: &HashMap<String, String>, key: &str) -> String {
    params.get(key).cloned().unwrap_or_default()
}

pub(crate) fn get_usize(params: &HashMap<String, String>, key: &str) -> usize {
    get(params, key).parse().unwrap_or(0)
}

/// Trait that every algorithm implementation must satisfy.
///
/// The trait is `Send + Sync` so it can be stored in a `OnceLock`-backed
/// static registry and shared safely across WASM calls.
pub trait Algorithm: Send + Sync {
    fn name(&self) -> &'static str;
    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase;
}

// ─── Registry ────────────────────────────────────────────────────────────────

static REGISTRY: OnceLock<HashMap<&'static str, Box<dyn Algorithm + Send + Sync>>> =
    OnceLock::new();

fn get_registry() -> &'static HashMap<&'static str, Box<dyn Algorithm + Send + Sync>> {
    REGISTRY.get_or_init(|| {
        let algos: Vec<Box<dyn Algorithm + Send + Sync>> = vec![
            Box::new(caesar::CaesarEncrypt),
            Box::new(caesar::CaesarDecrypt),
            Box::new(vigenere::VigenereEncrypt),
            Box::new(vigenere::VigenereDecrypt),
            Box::new(playfair::PlayfairEncrypt),
            Box::new(playfair::PlayfairDecrypt),
            Box::new(railfence::RailfenceEncrypt),
            Box::new(railfence::RailfenceDecrypt),
            Box::new(xor::XorEncrypt),
            Box::new(xor::XorDecrypt),
            Box::new(rsa::RsaEncrypt),
            Box::new(rsa::RsaDecrypt),
            Box::new(aes::AesEcbEncrypt),
            Box::new(aes::AesEcbDecrypt),
            Box::new(aes::SimpleEcbEncrypt),
            Box::new(aes::SimpleEcbDecrypt),
        ];
        // a.name() returns &'static str — the borrow ends before the move into the map.
        algos.into_iter().map(|a| (a.name(), a)).collect()
    })
}

/// Returns all registered algorithm names in sorted order.
pub fn list_algorithm_names() -> Vec<&'static str> {
    let mut names: Vec<&'static str> = get_registry().keys().copied().collect();
    names.sort_unstable();
    names
}

/// Dispatch to the correct algorithm by key.
pub fn generate_testcases(
    algorithm: &str,
    params: &HashMap<String, String>,
    count: usize,
) -> Result<Vec<Testcase>, String> {
    let algo = get_registry()
        .get(algorithm)
        .ok_or_else(|| format!("Unknown algorithm: '{algorithm}'"))?;
    Ok((0..count).map(|_| algo.generate_testcase(params)).collect())
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // ── Registry tests ──────────────────────────────────────────────────────

    #[test]
    fn registry_is_populated() {
        assert!(!get_registry().is_empty());
    }

    #[test]
    fn registry_contains_all_algorithms() {
        let registry = get_registry();
        let expected = [
            "caesar_encrypt",
            "caesar_decrypt",
            "vigenere_encrypt",
            "vigenere_decrypt",
            "playfair_encrypt",
            "playfair_decrypt",
            "railfence_encrypt",
            "railfence_decrypt",
            "xor_encrypt",
            "xor_decrypt",
            "rsa_encrypt",
            "rsa_decrypt",
            "aes_ecb_encrypt",
            "aes_ecb_decrypt",
            "simple_ecb_encrypt",
            "simple_ecb_decrypt",
        ];
        for name in expected {
            assert!(registry.contains_key(name), "Missing algorithm: '{name}'");
        }
    }

    #[test]
    fn list_algorithm_names_returns_all_sorted() {
        let names = list_algorithm_names();
        assert_eq!(names.len(), 16);
        let mut sorted = names.clone();
        sorted.sort_unstable();
        assert_eq!(names, sorted, "list_algorithm_names must return sorted order");
    }

    // ── Dispatch tests ──────────────────────────────────────────────────────

    #[test]
    fn unknown_algorithm_errors() {
        let params = HashMap::new();
        let result = generate_testcases("unknown_algo", &params, 1);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("unknown_algo"));
    }

    #[test]
    fn dispatch_caesar_encrypt_returns_correct_output() {
        let mut params = HashMap::new();
        params.insert("plaintext".to_string(), "HELLO".to_string());
        params.insert("shift".to_string(), "3".to_string());
        let result = generate_testcases("caesar_encrypt", &params, 1).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].1, "KHOOR");
    }
}
