use indexmap::IndexMap;
use serde::Deserialize;

/// Supported parameter types for randomisation.
/// Serialised in JSON with `"type"` as a discriminant tag.
#[derive(Debug, Deserialize, Clone, PartialEq)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ParamSpec {
    Int { min: i64, max: i64 },
    AlphaUpper { min_len: usize, max_len: usize },
    AlphaLower { min_len: usize, max_len: usize },
    AlphaMixed { min_len: usize, max_len: usize },
    HexString { min_len: usize, max_len: usize },
}

/// Ordered map of param_name → ParamSpec.
/// `IndexMap` preserves JSON key insertion order, which determines
/// the line order in the generated stdin input string.
pub type Params = IndexMap<String, ParamSpec>;

/// Parse a JSON params object (from VitePress frontmatter) into an ordered Params map.
///
/// Expected format:
/// ```json
/// {
///   "plaintext": {"type": "alpha_upper", "min_len": 5, "max_len": 12},
///   "shift":     {"type": "int", "min": 1, "max": 25}
/// }
/// ```
pub fn parse_params(json_str: &str) -> Result<Params, String> {
    serde_json::from_str(json_str).map_err(|e| format!("JSON parse error: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_int_param() {
        let json = r#"{"shift": {"type": "int", "min": 1, "max": 25}}"#;
        let params = parse_params(json).unwrap();
        assert_eq!(params["shift"], ParamSpec::Int { min: 1, max: 25 });
    }

    #[test]
    fn parses_alpha_upper_param() {
        let json = r#"{"pt": {"type": "alpha_upper", "min_len": 5, "max_len": 12}}"#;
        let params = parse_params(json).unwrap();
        assert_eq!(params["pt"], ParamSpec::AlphaUpper { min_len: 5, max_len: 12 });
    }

    #[test]
    fn parses_hex_string_param() {
        let json = r#"{"k": {"type": "hex_string", "min_len": 32, "max_len": 32}}"#;
        let params = parse_params(json).unwrap();
        assert_eq!(params["k"], ParamSpec::HexString { min_len: 32, max_len: 32 });
    }

    #[test]
    fn preserves_param_declaration_order() {
        let json = r#"{"plaintext": {"type": "alpha_upper", "min_len": 5, "max_len": 12}, "shift": {"type": "int", "min": 1, "max": 25}}"#;
        let params = parse_params(json).unwrap();
        let keys: Vec<&str> = params.keys().map(|s| s.as_str()).collect();
        assert_eq!(keys, vec!["plaintext", "shift"]);
    }

    #[test]
    fn returns_error_on_invalid_json() {
        let result = parse_params("not valid json {{{");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("JSON parse error"));
    }

    #[test]
    fn returns_error_on_unknown_param_type() {
        let json = r#"{"x": {"type": "unknown_type"}}"#;
        let result = parse_params(json);
        assert!(result.is_err());
    }

    #[test]
    fn parses_multiple_params() {
        let json = r#"{"a": {"type": "int", "min": 1, "max": 10}, "b": {"type": "alpha_lower", "min_len": 3, "max_len": 5}}"#;
        let params = parse_params(json).unwrap();
        assert_eq!(params.len(), 2);
        assert_eq!(params["a"], ParamSpec::Int { min: 1, max: 10 });
        assert_eq!(params["b"], ParamSpec::AlphaLower { min_len: 3, max_len: 5 });
    }
}
