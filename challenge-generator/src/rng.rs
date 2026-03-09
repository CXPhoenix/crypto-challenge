use rand::Rng;
use std::collections::HashMap;

use crate::parser::ParamSpec;

const UPPER: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const HEX_CHARS: &[u8] = b"0123456789abcdef";

/// Generate a concrete value for each declared parameter.
/// Returns a map of param_name → generated_value (as String).
pub fn generate_params<R: Rng>(
    specs: &HashMap<String, ParamSpec>,
    rng: &mut R,
) -> HashMap<String, String> {
    specs
        .iter()
        .map(|(name, spec)| {
            let value = generate_one(spec, rng);
            (name.clone(), value)
        })
        .collect()
}

fn generate_one<R: Rng>(spec: &ParamSpec, rng: &mut R) -> String {
    match spec {
        ParamSpec::Int { min, max } => rng.gen_range(*min..=*max).to_string(),
        ParamSpec::AlphaUpper { min_len, max_len } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| UPPER[rng.gen_range(0..UPPER.len())] as char)
                .collect()
        }
        ParamSpec::AlphaLower { min_len, max_len } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| LOWER[rng.gen_range(0..LOWER.len())] as char)
                .collect()
        }
        ParamSpec::AlphaMixed { min_len, max_len } => {
            let combined: Vec<u8> = UPPER.iter().chain(LOWER.iter()).copied().collect();
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| combined[rng.gen_range(0..combined.len())] as char)
                .collect()
        }
        ParamSpec::HexString { min_len, max_len } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| HEX_CHARS[rng.gen_range(0..HEX_CHARS.len())] as char)
                .collect()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    fn seeded() -> SmallRng { SmallRng::seed_from_u64(42) }

    #[test]
    fn int_within_range() {
        let mut rng = seeded();
        let spec = ParamSpec::Int { min: 1, max: 25 };
        for _ in 0..100 {
            let v: i64 = generate_one(&spec, &mut rng).parse().unwrap();
            assert!((1..=25).contains(&v));
        }
    }

    #[test]
    fn alpha_upper_only_uppercase() {
        let mut rng = seeded();
        let spec = ParamSpec::AlphaUpper { min_len: 5, max_len: 10 };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_uppercase()));
        assert!((5..=10).contains(&v.len()));
    }

    #[test]
    fn hex_string_valid_chars() {
        let mut rng = seeded();
        let spec = ParamSpec::HexString { min_len: 4, max_len: 8 };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn deterministic_with_seed() {
        let spec = ParamSpec::Int { min: 0, max: 1000 };
        let v1 = generate_one(&spec, &mut SmallRng::seed_from_u64(7));
        let v2 = generate_one(&spec, &mut SmallRng::seed_from_u64(7));
        assert_eq!(v1, v2);
    }
}
