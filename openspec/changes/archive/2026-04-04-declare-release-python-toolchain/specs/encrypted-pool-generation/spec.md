## MODIFIED Requirements

### Requirement: Build script generates encrypted testcase pools

A build script (`scripts/generate-pools.ts`) SHALL read all `docs/challenge/*.md` files, parse frontmatter to extract `params`, `generator`, `testcase_count`, `algorithm`, and `verdict_detail` fields. For each challenge, it SHALL generate a configurable number of random inputs (default: 200) using the existing WASM `generate_challenge()` function or equivalent param-based generation, execute the `generator` Python code via subprocess for each input to produce `expected_output`, and package all `{input, expected_output}` pairs into an encrypted binary pool file.

The build script SHALL declare its Python runtime and third-party package dependencies via a `requirements.txt` file at the project root. The `requirements.txt` file SHALL list `PyYAML` and `pycryptodome` with version constraints.

Before processing any challenge files, the build script SHALL perform a preflight check that verifies the Python 3 runtime is available and all required packages (`yaml`, `Crypto.Cipher.DES`) can be imported. If the preflight check fails, the build script SHALL exit with a non-zero code and print an actionable error message that includes the exact installation command (`pip install -r requirements.txt`).

#### Scenario: Pool file created for each challenge

- **WHEN** the build script runs
- **THEN** one `.bin` file SHALL be created in `docs/public/pools/` for each challenge, named `<algorithm>.bin`

#### Scenario: Generator with external Python dependencies executes correctly

- **WHEN** a challenge generator imports `pycryptodome` (e.g., `from Crypto.Cipher import DES`)
- **THEN** the build script SHALL execute it via Python subprocess with the dependency available, producing correct expected outputs

#### Scenario: JSON factory format is supported

- **WHEN** a generator outputs a JSON string `{"input": "...", "expected_output": "..."}`
- **THEN** the build script SHALL parse the JSON and use the transformed `input` and `expected_output` values in the pool

#### Scenario: Build script fails on generator error

- **WHEN** a generator script raises a Python exception for any input
- **THEN** the build script SHALL report the error with challenge name and input details, and exit with a non-zero code

#### Scenario: Python dependencies declared in requirements.txt

- **WHEN** a developer or CI environment needs to install Python dependencies for pool generation
- **THEN** a `requirements.txt` file SHALL exist at the project root listing `PyYAML` and `pycryptodome` with version constraints

#### Scenario: Preflight check passes with all dependencies installed

- **WHEN** the build script starts and Python 3 is available with `PyYAML` and `pycryptodome` installed
- **THEN** the preflight check SHALL pass silently and pool generation SHALL proceed

#### Scenario: Preflight check fails when Python is missing

- **WHEN** the build script starts and the `python3` command is not found
- **THEN** the build script SHALL exit with a non-zero code and print an error message indicating that Python 3 is required

#### Scenario: Preflight check fails when a required package is missing

- **WHEN** the build script starts and `PyYAML` or `pycryptodome` is not installed
- **THEN** the build script SHALL exit with a non-zero code and print an error message that includes the command `pip install -r requirements.txt`

## ADDED Requirements

### Requirement: Python dependency manifest exists at project root

A `requirements.txt` file SHALL exist at the project root directory. It SHALL list all Python packages required by the pool generation build step. At minimum, it SHALL contain `PyYAML` and `pycryptodome` with pinned or minimum version constraints. The file SHALL NOT include packages that are only part of the Python standard library.

#### Scenario: requirements.txt contains PyYAML

- **WHEN** a user reads `requirements.txt`
- **THEN** it SHALL contain a line specifying `PyYAML` with a version constraint

#### Scenario: requirements.txt contains pycryptodome

- **WHEN** a user reads `requirements.txt`
- **THEN** it SHALL contain a line specifying `pycryptodome` with a version constraint

#### Scenario: All listed packages install successfully

- **WHEN** a user runs `pip install -r requirements.txt` in a clean Python 3.10+ environment
- **THEN** all packages SHALL install without errors
