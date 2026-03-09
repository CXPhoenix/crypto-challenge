use std::collections::HashMap;

use super::{Algorithm, Testcase};

fn mod_pow(mut base: u64, mut exp: u64, modulus: u64) -> u64 {
    let mut result = 1u64;
    base %= modulus;
    while exp > 0 {
        if exp & 1 == 1 {
            result = result.wrapping_mul(base) % modulus;
        }
        exp >>= 1;
        base = base.wrapping_mul(base) % modulus;
    }
    result
}

pub fn rsa_encrypt_num(m: u64, e: u64, n: u64) -> u64 {
    mod_pow(m, e, n)
}

pub fn rsa_decrypt_num(c: u64, d: u64, n: u64) -> u64 {
    mod_pow(c, d, n)
}

pub struct RsaEncrypt;
pub struct RsaDecrypt;

impl Algorithm for RsaEncrypt {
    fn name(&self) -> &'static str {
        "rsa_encrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let m: u64 = super::get(params, "message").parse().unwrap_or(42);
        let e: u64 = super::get(params, "e").parse().unwrap_or(65537);
        let n: u64 = super::get(params, "n").parse().unwrap_or(3233);
        let c = rsa_encrypt_num(m, e, n);
        (format!("{m}\n{e}\n{n}"), c.to_string())
    }
}

impl Algorithm for RsaDecrypt {
    fn name(&self) -> &'static str {
        "rsa_decrypt"
    }

    fn generate_testcase(&self, params: &HashMap<String, String>) -> Testcase {
        let m: u64 = super::get(params, "message").parse().unwrap_or(42);
        let e: u64 = super::get(params, "e").parse().unwrap_or(65537);
        let d: u64 = super::get(params, "d").parse().unwrap_or(2753);
        let n: u64 = super::get(params, "n").parse().unwrap_or(3233);
        let c = rsa_encrypt_num(m, e, n);
        (format!("{c}\n{d}\n{n}"), m.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rsa_roundtrip() {
        // p=61, q=53, n=3233, e=17, d=2753
        let m = 65u64;
        let c = rsa_encrypt_num(m, 17, 3233);
        assert_eq!(rsa_decrypt_num(c, 2753, 3233), m);
    }
}
