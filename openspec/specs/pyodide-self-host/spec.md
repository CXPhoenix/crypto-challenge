## ADDED Requirements

### Requirement: Pyodide runtime is loaded from local origin

The Pyodide Web Worker SHALL load `pyodide.mjs` and all associated runtime files from a local path (`/pyodide/`) instead of an external CDN. No network requests to `cdn.jsdelivr.net` or any other external CDN SHALL be made for Pyodide resources.

#### Scenario: Pyodide loads from local path

- **WHEN** the Pyodide worker calls `ensurePyodide()`
- **THEN** the dynamic import SHALL resolve to `/pyodide/pyodide.mjs`
- **AND** `loadPyodide({ indexURL })` SHALL use `/pyodide/` as the index URL

#### Scenario: No external CDN requests during Pyodide initialization

- **WHEN** the application initializes Pyodide
- **THEN** zero network requests SHALL be sent to `cdn.jsdelivr.net` or any other external origin


<!-- @trace
source: frontend-security-hardening
updated: 2026-03-24
code:
  - .vitepress/theme/workers/worker-utils.ts
  - .vitepress/config.mts
  - scripts/download-pyodide.sh
  - .vitepress/theme/workers/pyodide.worker.ts
tests:
  - .vitepress/theme/__tests__/worker-utils.spec.ts
-->

### Requirement: Download script provisions Pyodide files

A shell script at `scripts/download-pyodide.sh` SHALL download the required Pyodide release files to `docs/public/pyodide/`. The script SHALL accept a version parameter or use a pinned default version. The script SHALL verify successful download of all required files.

#### Scenario: Script downloads Pyodide files to correct location

- **WHEN** `scripts/download-pyodide.sh` is executed
- **THEN** the required Pyodide files SHALL be present in `docs/public/pyodide/`
- **AND** the files SHALL include at minimum: `pyodide.mjs`, `pyodide.asm.js`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`

#### Scenario: Script is idempotent

- **WHEN** the script is executed and Pyodide files already exist in the target directory
- **THEN** the script SHALL skip downloading and report that files are already present


<!-- @trace
source: frontend-security-hardening
updated: 2026-03-24
code:
  - .vitepress/theme/workers/worker-utils.ts
  - .vitepress/config.mts
  - scripts/download-pyodide.sh
  - .vitepress/theme/workers/pyodide.worker.ts
tests:
  - .vitepress/theme/__tests__/worker-utils.spec.ts
-->

### Requirement: Pyodide files are excluded from Git tracking

The `docs/public/pyodide/` directory SHALL be listed in `.gitignore` to prevent large binary files from being committed to the repository.

#### Scenario: Pyodide directory is gitignored

- **WHEN** a developer runs `git status` after downloading Pyodide files
- **THEN** the `docs/public/pyodide/` directory SHALL NOT appear as untracked files

## Requirements


<!-- @trace
source: frontend-security-hardening
updated: 2026-03-24
code:
  - .vitepress/theme/workers/worker-utils.ts
  - .vitepress/config.mts
  - scripts/download-pyodide.sh
  - .vitepress/theme/workers/pyodide.worker.ts
tests:
  - .vitepress/theme/__tests__/worker-utils.spec.ts
-->

### Requirement: Pyodide runtime is loaded from local origin

The Pyodide Web Worker SHALL load `pyodide.mjs` and all associated runtime files from a local path (`/pyodide/`) instead of an external CDN. No network requests to `cdn.jsdelivr.net` or any other external CDN SHALL be made for Pyodide resources.

#### Scenario: Pyodide loads from local path

- **WHEN** the Pyodide worker calls `ensurePyodide()`
- **THEN** the dynamic import SHALL resolve to `/pyodide/pyodide.mjs`
- **AND** `loadPyodide({ indexURL })` SHALL use `/pyodide/` as the index URL

#### Scenario: No external CDN requests during Pyodide initialization

- **WHEN** the application initializes Pyodide
- **THEN** zero network requests SHALL be sent to `cdn.jsdelivr.net` or any other external origin

---
### Requirement: Download script provisions Pyodide files

A shell script at `scripts/download-pyodide.sh` SHALL download the required Pyodide release files to `docs/public/pyodide/`. The script SHALL accept a version parameter or use a pinned default version. The script SHALL verify successful download of all required files.

#### Scenario: Script downloads Pyodide files to correct location

- **WHEN** `scripts/download-pyodide.sh` is executed
- **THEN** the required Pyodide files SHALL be present in `docs/public/pyodide/`
- **AND** the files SHALL include at minimum: `pyodide.mjs`, `pyodide.asm.js`, `pyodide.asm.wasm`, `python_stdlib.zip`, `pyodide-lock.json`

#### Scenario: Script is idempotent

- **WHEN** the script is executed and Pyodide files already exist in the target directory
- **THEN** the script SHALL skip downloading and report that files are already present

---
### Requirement: Pyodide files are excluded from Git tracking

The `docs/public/pyodide/` directory SHALL be listed in `.gitignore` to prevent large binary files from being committed to the repository.

#### Scenario: Pyodide directory is gitignored

- **WHEN** a developer runs `git status` after downloading Pyodide files
- **THEN** the `docs/public/pyodide/` directory SHALL NOT appear as untracked files