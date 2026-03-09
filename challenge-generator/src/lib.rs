mod algorithms;
mod parser;
mod rng;
mod template;

use rand::SeedableRng;
use rand::rngs::SmallRng;
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct Testcase {
    input: String,
    expected_output: String,
}

#[derive(Serialize)]
struct GeneratedChallenge {
    id: String,
    title: String,
    difficulty: String,
    tags: Vec<String>,
    description: String,
    starter_code: String,
    testcases: Vec<Testcase>,
}

/// Returns a sorted JSON array of all registered algorithm names.
#[wasm_bindgen]
pub fn list_algorithms() -> Result<JsValue, JsError> {
    let names = algorithms::list_algorithm_names();
    serde_wasm_bindgen::to_value(&names).map_err(|e| JsError::new(&e.to_string()))
}

/// Parses only the `[meta]` section of a TOML challenge template.
/// Does not generate testcases or render description templates.
/// Returns `{ id, title, difficulty, tags, algorithm, testcase_count }`.
#[wasm_bindgen]
pub fn parse_challenge_meta(toml_str: &str) -> Result<JsValue, JsError> {
    let tmpl = parser::parse(toml_str).map_err(|e| JsError::new(&e))?;
    serde_wasm_bindgen::to_value(&tmpl.meta).map_err(|e| JsError::new(&e.to_string()))
}

/// Main WASM entry point.
/// Parses the TOML template, generates random parameters, runs the algorithm,
/// and returns a JSON-serialisable GeneratedChallenge object.
#[wasm_bindgen]
pub fn generate_challenge(toml_str: &str) -> Result<JsValue, JsError> {
    let tmpl = parser::parse(toml_str).map_err(|e| JsError::new(&e))?;

    let mut rng = SmallRng::from_entropy();

    // Generate multiple param sets (one per testcase)
    let count = tmpl.meta.testcase_count;
    let mut testcases: Vec<Testcase> = Vec::with_capacity(count);

    for _ in 0..count {
        let param_values = rng::generate_params(&tmpl.params, &mut rng);
        let (input, expected_output) =
            algorithms::generate_testcases(&tmpl.meta.algorithm, &param_values, 1)
                .map_err(|e| JsError::new(&e))?
                .into_iter()
                .next()
                .unwrap();

        testcases.push(Testcase { input, expected_output });
    }

    // Build template vars from the FIRST testcase for example substitution
    let first_params = rng::generate_params(&tmpl.params, &mut rng);
    let mut desc_vars = first_params.clone();
    if let Some(first) = testcases.first() {
        desc_vars.insert("example_input".to_string(), first.input.clone());
        desc_vars.insert("example_output".to_string(), first.expected_output.clone());
    }

    let description = template::render(&tmpl.description.text, &desc_vars);

    let challenge = GeneratedChallenge {
        id: tmpl.meta.id,
        title: tmpl.meta.title,
        difficulty: tmpl.meta.difficulty,
        tags: tmpl.meta.tags,
        description,
        starter_code: tmpl.starter_code.python,
        testcases,
    };

    serde_wasm_bindgen::to_value(&challenge).map_err(|e| JsError::new(&e.to_string()))
}
