## ADDED Requirements

### Requirement: Build pipeline provisions Pyodide runtime before VitePress build

The project build pipeline SHALL execute `scripts/download-pyodide.sh` before running `vitepress build`. The `package.json` `build` script SHALL include a `build:pyodide` step that invokes the download script, ensuring that `docs/public/pyodide/` contains all required runtime files in every build environment (local, CI, Cloudflare Pages).

#### Scenario: Pyodide files are present in CI build output

- **WHEN** the `pnpm build` command is executed in a fresh CI environment (no pre-existing `docs/public/pyodide/` directory)
- **THEN** `scripts/download-pyodide.sh` SHALL run before `vitepress build`
- **AND** `.vitepress/dist/pyodide/pyodide.mjs` SHALL exist in the build output
- **AND** `.vitepress/dist/pyodide/` SHALL contain all 5 required files: `pyodide.mjs`, `pyodide.asm.js`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`

#### Scenario: Build is idempotent when Pyodide files already exist

- **WHEN** `pnpm build` is executed and `docs/public/pyodide/pyodide.mjs` already exists
- **THEN** `scripts/download-pyodide.sh` SHALL skip the download for existing files
- **AND** the build SHALL complete without re-downloading the Pyodide runtime
