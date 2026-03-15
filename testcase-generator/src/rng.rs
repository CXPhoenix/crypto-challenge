use indexmap::IndexMap;
use rand::Rng;

use crate::parser::ParamSpec;

const UPPER: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER: &[u8] = b"abcdefghijklmnopqrstuvwxyz";
const HEX_CHARS: &[u8] = b"0123456789abcdef";
const PRINTABLE_ASCII: &[u8] = b"!\"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

/// Generate a single stdin input string from ordered params.
/// Each param value occupies one line, joined with '\n' in declaration order.
pub fn generate_input<R: Rng>(specs: &IndexMap<String, ParamSpec>, rng: &mut R) -> String {
    specs
        .values()
        .map(|spec| generate_one(spec, rng))
        .collect::<Vec<_>>()
        .join("\n")
}

fn generate_one<R: Rng>(spec: &ParamSpec, rng: &mut R) -> String {
    let count_spec = match spec {
        ParamSpec::Int { count, .. } => count,
        ParamSpec::AlphaUpper { count, .. } => count,
        ParamSpec::AlphaLower { count, .. } => count,
        ParamSpec::AlphaMixed { count, .. } => count,
        ParamSpec::HexString { count, .. } => count,
        ParamSpec::PrintableAscii { count, .. } => count,
    };

    debug_assert!(count_spec.min <= count_spec.max, "CountSpec.min must be <= max");

    let actual_count = rng.gen_range(count_spec.min..=count_spec.max);
    (0..actual_count)
        .map(|_| generate_single(spec, rng))
        .collect::<Vec<_>>()
        .join(&count_spec.separator)
}

/// Produce a single value for the given spec.
fn generate_single<R: Rng>(spec: &ParamSpec, rng: &mut R) -> String {
    match spec {
        ParamSpec::Int { min, max, .. } => rng.gen_range(*min..=*max).to_string(),
        ParamSpec::AlphaUpper { min_len, max_len, .. } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| UPPER[rng.gen_range(0..UPPER.len())] as char)
                .collect()
        }
        ParamSpec::AlphaLower { min_len, max_len, .. } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| LOWER[rng.gen_range(0..LOWER.len())] as char)
                .collect()
        }
        ParamSpec::AlphaMixed { min_len, max_len, .. } => {
            let combined: Vec<u8> = UPPER.iter().chain(LOWER.iter()).copied().collect();
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| combined[rng.gen_range(0..combined.len())] as char)
                .collect()
        }
        ParamSpec::HexString { min_len, max_len, .. } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| HEX_CHARS[rng.gen_range(0..HEX_CHARS.len())] as char)
                .collect()
        }
        ParamSpec::PrintableAscii { min_len, max_len, .. } => {
            let len = rng.gen_range(*min_len..=*max_len);
            (0..len)
                .map(|_| PRINTABLE_ASCII[rng.gen_range(0..PRINTABLE_ASCII.len())] as char)
                .collect()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parser::CountSpec;
    use rand::SeedableRng;
    use rand::rngs::SmallRng;

    fn seeded() -> SmallRng {
        SmallRng::seed_from_u64(42)
    }

    fn make_params(pairs: &[(&str, ParamSpec)]) -> IndexMap<String, ParamSpec> {
        pairs.iter().map(|(k, v)| (k.to_string(), v.clone())).collect()
    }

    #[test]
    fn int_within_range() {
        let mut rng = seeded();
        let spec = ParamSpec::Int { min: 1, max: 25, count: CountSpec::default() };
        for _ in 0..100 {
            let v: i64 = generate_one(&spec, &mut rng).parse().unwrap();
            assert!((1..=25).contains(&v));
        }
    }

    #[test]
    fn alpha_upper_only_uppercase() {
        let mut rng = seeded();
        let spec = ParamSpec::AlphaUpper { min_len: 5, max_len: 10, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_uppercase()));
        assert!((5..=10).contains(&v.len()));
    }

    #[test]
    fn hex_string_valid_chars() {
        let mut rng = seeded();
        let spec = ParamSpec::HexString { min_len: 4, max_len: 8, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn deterministic_with_seed() {
        let spec = ParamSpec::Int { min: 0, max: 1000, count: CountSpec::default() };
        let v1 = generate_one(&spec, &mut SmallRng::seed_from_u64(7));
        let v2 = generate_one(&spec, &mut SmallRng::seed_from_u64(7));
        assert_eq!(v1, v2);
    }

    #[test]
    fn alpha_lower_only_lowercase() {
        let mut rng = seeded();
        let spec = ParamSpec::AlphaLower { min_len: 5, max_len: 10, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_lowercase()), "expected all lowercase, got: {v}");
        assert!((5..=10).contains(&v.len()));
    }

    #[test]
    fn alpha_mixed_only_alpha() {
        let mut rng = seeded();
        let spec = ParamSpec::AlphaMixed { min_len: 20, max_len: 30, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().all(|c| c.is_ascii_alphabetic()), "expected only alpha chars, got: {v}");
        assert!((20..=30).contains(&v.len()));
    }

    #[test]
    fn alpha_mixed_contains_both_cases() {
        let mut rng = seeded();
        let spec = ParamSpec::AlphaMixed { min_len: 50, max_len: 50, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(v.chars().any(|c| c.is_ascii_uppercase()), "expected at least one uppercase");
        assert!(v.chars().any(|c| c.is_ascii_lowercase()), "expected at least one lowercase");
    }

    #[test]
    fn printable_ascii_valid_chars() {
        let mut rng = seeded();
        let spec = ParamSpec::PrintableAscii { min_len: 20, max_len: 30, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(
            v.chars().all(|c| c as u8 >= 0x21 && c as u8 <= 0x7e),
            "expected printable non-space ASCII (0x21–0x7e), got: {v}"
        );
        assert!((20..=30).contains(&v.len()));
    }

    #[test]
    fn count_greater_than_one_produces_space_separated_values() {
        let mut rng = seeded();
        let spec = ParamSpec::Int {
            min: 1,
            max: 100,
            count: CountSpec { min: 3, max: 3, separator: " ".to_string() },
        };
        let v = generate_one(&spec, &mut rng);
        let parts: Vec<&str> = v.split(' ').collect();
        assert_eq!(parts.len(), 3, "expected 3 space-separated values, got: {v}");
        for part in parts {
            let n: i64 = part.parse().expect("each part should be a valid integer");
            assert!((1..=100).contains(&n));
        }
    }

    #[test]
    fn count_one_produces_no_spaces_for_int() {
        let mut rng = seeded();
        let spec = ParamSpec::Int { min: 0, max: 1000, count: CountSpec::default() };
        let v = generate_one(&spec, &mut rng);
        assert!(!v.contains(' '), "count=1 should produce a single value with no spaces, got: {v}");
    }

    #[test]
    fn generate_input_joins_in_declaration_order() {
        let params = make_params(&[
            ("plaintext", ParamSpec::AlphaUpper { min_len: 5, max_len: 5, count: CountSpec::default() }),
            ("shift", ParamSpec::Int { min: 3, max: 3, count: CountSpec::default() }),
        ]);
        let mut rng = seeded();
        let input = generate_input(&params, &mut rng);
        let lines: Vec<&str> = input.lines().collect();
        assert_eq!(lines.len(), 2);
        assert!(lines[0].chars().all(|c| c.is_ascii_uppercase()), "first line should be alpha_upper");
        assert_eq!(lines[1], "3", "second line should be the fixed shift=3");
    }

    #[test]
    fn generate_input_single_param() {
        let params = make_params(&[("n", ParamSpec::Int { min: 42, max: 42, count: CountSpec::default() })]);
        let mut rng = seeded();
        let input = generate_input(&params, &mut rng);
        assert_eq!(input, "42");
    }

    #[test]
    fn generate_input_three_params_ordered() {
        let params = make_params(&[
            ("m", ParamSpec::Int { min: 65, max: 65, count: CountSpec::default() }),
            ("e", ParamSpec::Int { min: 17, max: 17, count: CountSpec::default() }),
            ("n", ParamSpec::Int { min: 3233, max: 3233, count: CountSpec::default() }),
        ]);
        let mut rng = seeded();
        let input = generate_input(&params, &mut rng);
        assert_eq!(input, "65\n17\n3233");
    }

    #[test]
    fn test_multiple_count_space_separated() {
        let mut rng = seeded();
        let spec = ParamSpec::Int {
            min: 5,
            max: 5,
            count: CountSpec { min: 4, max: 4, separator: " ".to_string() },
        };
        let v = generate_one(&spec, &mut rng);
        assert_eq!(v, "5 5 5 5");
    }

    // Task 3.4: CountSpec with min and max generates variable number of values
    #[test]
    fn count_spec_variable_count_within_range() {
        let spec = ParamSpec::Int {
            min: 1,
            max: 1,
            count: CountSpec { min: 2, max: 5, separator: " ".to_string() },
        };
        // Run many times to confirm count always stays within [2, 5]
        for seed in 0..200u64 {
            let mut rng = SmallRng::seed_from_u64(seed);
            let v = generate_one(&spec, &mut rng);
            let parts: Vec<&str> = v.split(' ').collect();
            assert!(
                (2..=5).contains(&parts.len()),
                "seed={seed}: expected 2–5 parts, got {} (value: {v})", parts.len()
            );
        }
    }

    // Task 3.5: CountSpec with custom separator joins values correctly
    #[test]
    fn count_spec_custom_separator_comma() {
        let mut rng = seeded();
        let spec = ParamSpec::Int {
            min: 7,
            max: 7,
            count: CountSpec { min: 3, max: 3, separator: ",".to_string() },
        };
        let v = generate_one(&spec, &mut rng);
        assert_eq!(v, "7,7,7", "expected comma-separated values, got: {v}");
        assert!(!v.contains(' '), "should use comma, not space");
    }

    #[test]
    fn count_spec_custom_separator_no_trailing() {
        let mut rng = seeded();
        let spec = ParamSpec::Int {
            min: 3,
            max: 3,
            count: CountSpec { min: 2, max: 2, separator: "|".to_string() },
        };
        let v = generate_one(&spec, &mut rng);
        assert_eq!(v, "3|3", "expected pipe-separated values without trailing separator");
        // Must not end with the separator
        assert!(!v.ends_with('|'), "should have no trailing separator");
    }
}
