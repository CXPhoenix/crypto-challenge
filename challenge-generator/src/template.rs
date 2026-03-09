use std::collections::HashMap;

/// Replace `{{ key }}` placeholders in `text` with values from `vars`.
/// Unknown placeholders are left as-is.
pub fn render(text: &str, vars: &HashMap<String, String>) -> String {
    let mut result = text.to_string();
    for (key, value) in vars {
        let placeholder = format!("{{{{ {key} }}}}");
        result = result.replace(&placeholder, value);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vars(pairs: &[(&str, &str)]) -> HashMap<String, String> {
        pairs.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect()
    }

    #[test]
    fn substitutes_single_var() {
        let result = render("Hello {{ name }}!", &vars(&[("name", "World")]));
        assert_eq!(result, "Hello World!");
    }

    #[test]
    fn substitutes_multiple_vars() {
        let result = render(
            "Plaintext: {{ plaintext }}, shift: {{ shift }}",
            &vars(&[("plaintext", "HELLO"), ("shift", "3")]),
        );
        assert_eq!(result, "Plaintext: HELLO, shift: 3");
    }

    #[test]
    fn leaves_unknown_placeholders() {
        let result = render("{{ unknown }}", &vars(&[]));
        assert_eq!(result, "{{ unknown }}");
    }

    #[test]
    fn substitutes_example_input_output() {
        let result = render(
            "Input: {{ example_input }}\nOutput: {{ example_output }}",
            &vars(&[("example_input", "HELLO\n3"), ("example_output", "KHOOR")]),
        );
        assert!(result.contains("HELLO\n3"));
        assert!(result.contains("KHOOR"));
    }
}
