use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Supported parameter types for randomisation
#[derive(Debug, Deserialize, Clone, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ParamSpec {
    Int {
        min: i64,
        max: i64,
    },
    AlphaUpper {
        min_len: usize,
        max_len: usize,
    },
    AlphaLower {
        min_len: usize,
        max_len: usize,
    },
    AlphaMixed {
        min_len: usize,
        max_len: usize,
    },
    HexString {
        min_len: usize,
        max_len: usize,
    },
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct MetaSection {
    pub id: String,
    pub title: String,
    pub difficulty: String,
    pub tags: Vec<String>,
    pub algorithm: String,
    pub testcase_count: usize,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DescriptionSection {
    pub text: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct StarterCodeSection {
    pub python: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct ChallengeTemplate {
    pub meta: MetaSection,
    #[serde(default)]
    pub params: HashMap<String, ParamSpec>,
    pub description: DescriptionSection,
    pub starter_code: StarterCodeSection,
}

/// Parse a TOML string into a ChallengeTemplate.
pub fn parse(toml_str: &str) -> Result<ChallengeTemplate, String> {
    toml::from_str(toml_str).map_err(|e| format!("TOML parse error: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"
[meta]
id = "caesar-encrypt"
title = "凱薩密碼加密"
difficulty = "easy"
tags = ["classical"]
algorithm = "caesar_encrypt"
testcase_count = 3

[params]
shift = { type = "int", min = 1, max = 25 }
plaintext = { type = "alpha_upper", min_len = 5, max_len = 10 }

[description]
text = "Encrypt {{ plaintext }} with shift {{ shift }}."

[starter_code]
python = "result = ''"
"#;

    #[test]
    fn parses_valid_toml() {
        let tmpl = parse(SAMPLE).expect("should parse");
        assert_eq!(tmpl.meta.id, "caesar-encrypt");
        assert_eq!(tmpl.meta.testcase_count, 3);
        assert_eq!(tmpl.params.len(), 2);
    }

    #[test]
    fn returns_error_on_invalid_toml() {
        let result = parse("not valid toml {{{");
        assert!(result.is_err());
    }

    #[test]
    fn parses_int_param() {
        let tmpl = parse(SAMPLE).unwrap();
        let shift = &tmpl.params["shift"];
        assert_eq!(*shift, ParamSpec::Int { min: 1, max: 25 });
    }

    #[test]
    fn parses_string_param() {
        let tmpl = parse(SAMPLE).unwrap();
        let pt = &tmpl.params["plaintext"];
        assert_eq!(*pt, ParamSpec::AlphaUpper { min_len: 5, max_len: 10 });
    }
}
