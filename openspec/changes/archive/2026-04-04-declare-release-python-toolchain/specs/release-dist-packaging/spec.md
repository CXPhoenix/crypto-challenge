## MODIFIED Requirements

### Requirement: Full project build in CI

The workflow SHALL install Rust stable toolchain and wasm-pack.
The workflow SHALL install Python 3 using `actions/setup-python@v5` and install Python dependencies from `requirements.txt` using `pip install -r requirements.txt`.
The workflow SHALL install Node.js and pnpm (version from `packageManager` field in `package.json`).
The workflow SHALL run `pnpm install` to install dependencies.
The workflow SHALL run `pnpm build` to execute the full build pipeline (WASM + pools + VitePress).

The Python setup step SHALL be placed before `pnpm build` so that the pool generation subprocess has access to all required Python packages.

#### Scenario: Successful build

- **WHEN** the workflow executes the build step
- **THEN** the `.vitepress/dist/` directory SHALL contain the complete built site including WASM files under `wasm/` and encrypted pool files under `pools/`

#### Scenario: Build failure

- **WHEN** any build step fails
- **THEN** the workflow SHALL fail and SHALL NOT upload any assets to the release

#### Scenario: Python environment is ready before build

- **WHEN** the `pnpm build` step executes
- **THEN** `python3` SHALL be available on `PATH` with `PyYAML` and `pycryptodome` importable

#### Scenario: Pool generation succeeds in CI

- **WHEN** the build step runs `pnpm build` which triggers `build:pools`
- **THEN** the pool generation subprocess SHALL find all required Python packages and generate encrypted pool files without import errors
