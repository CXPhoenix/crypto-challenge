## ADDED Requirements

### Requirement: CSP meta tag is present in all built pages

The application SHALL include a `<meta http-equiv="Content-Security-Policy">` tag in every page's `<head>` section, configured via VitePress `head` option in `.vitepress/config.mts`.

#### Scenario: CSP meta tag exists in built HTML

- **WHEN** the VitePress site is built
- **THEN** every generated HTML file SHALL contain a `<meta http-equiv="Content-Security-Policy">` tag in the `<head>` section


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

### Requirement: CSP restricts script sources to self and necessary unsafe directives

The `script-src` directive SHALL be set to `'self' 'unsafe-inline' 'wasm-unsafe-eval'`. No external origins SHALL be permitted in `script-src`.

#### Scenario: External script injection is blocked

- **WHEN** an attacker injects a `<script src="https://evil.com/xss.js">` tag into the page
- **THEN** the browser SHALL block the script from loading due to CSP violation

#### Scenario: WASM modules load successfully

- **WHEN** the testcase generator WASM module is loaded from `/wasm/testcase_generator.js`
- **THEN** the module SHALL load and execute without CSP violations

#### Scenario: VitePress inline scripts function correctly

- **WHEN** the page loads with VitePress's built-in inline script for dark mode detection
- **THEN** the script SHALL execute without CSP violations


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

### Requirement: CSP restricts worker sources

The `worker-src` directive SHALL be set to `'self' blob:`, allowing only same-origin workers and blob URL workers.

#### Scenario: Pyodide web worker loads successfully

- **WHEN** the application creates a new Worker from a local module path
- **THEN** the worker SHALL be created without CSP violations

#### Scenario: External worker creation is blocked

- **WHEN** code attempts to create a Worker from an external URL
- **THEN** the browser SHALL block the worker creation due to CSP violation


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

### Requirement: CSP restricts network connections to self

The `connect-src` directive SHALL be set to `'self'`, preventing any network requests to external origins from both the main thread and workers.

#### Scenario: Fetch to external origin is blocked

- **WHEN** code in the main thread or a worker attempts `fetch('https://external.com/data')`
- **THEN** the browser SHALL block the request due to CSP violation


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

### Requirement: CSP sets restrictive default

The `default-src` directive SHALL be set to `'self'`. The `img-src` directive SHALL include `'self' data:`. The `font-src` directive SHALL be set to `'self'`. The `style-src` directive SHALL be set to `'self' 'unsafe-inline'`.

#### Scenario: All resource types default to same-origin

- **WHEN** the page attempts to load any resource type not explicitly covered by other directives
- **THEN** only same-origin resources SHALL be permitted

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

### Requirement: CSP meta tag is present in all built pages

The application SHALL include a `<meta http-equiv="Content-Security-Policy">` tag in every page's `<head>` section, configured via VitePress `head` option in `.vitepress/config.mts`.

#### Scenario: CSP meta tag exists in built HTML

- **WHEN** the VitePress site is built
- **THEN** every generated HTML file SHALL contain a `<meta http-equiv="Content-Security-Policy">` tag in the `<head>` section

---
### Requirement: CSP restricts script sources to self and necessary unsafe directives

The `script-src` directive SHALL be set to `'self' 'unsafe-inline' 'wasm-unsafe-eval'`. No external origins SHALL be permitted in `script-src`.

#### Scenario: External script injection is blocked

- **WHEN** an attacker injects a `<script src="https://evil.com/xss.js">` tag into the page
- **THEN** the browser SHALL block the script from loading due to CSP violation

#### Scenario: WASM modules load successfully

- **WHEN** the testcase generator WASM module is loaded from `/wasm/testcase_generator.js`
- **THEN** the module SHALL load and execute without CSP violations

#### Scenario: VitePress inline scripts function correctly

- **WHEN** the page loads with VitePress's built-in inline script for dark mode detection
- **THEN** the script SHALL execute without CSP violations

---
### Requirement: CSP restricts worker sources

The `worker-src` directive SHALL be set to `'self' blob:`, allowing only same-origin workers and blob URL workers.

#### Scenario: Pyodide web worker loads successfully

- **WHEN** the application creates a new Worker from a local module path
- **THEN** the worker SHALL be created without CSP violations

#### Scenario: External worker creation is blocked

- **WHEN** code attempts to create a Worker from an external URL
- **THEN** the browser SHALL block the worker creation due to CSP violation

---
### Requirement: CSP restricts network connections to self

The `connect-src` directive SHALL be set to `'self'`, preventing any network requests to external origins from both the main thread and workers.

#### Scenario: Fetch to external origin is blocked

- **WHEN** code in the main thread or a worker attempts `fetch('https://external.com/data')`
- **THEN** the browser SHALL block the request due to CSP violation

---
### Requirement: CSP sets restrictive default

The `default-src` directive SHALL be set to `'self'`. The `img-src` directive SHALL include `'self' data:`. The `font-src` directive SHALL be set to `'self'`. The `style-src` directive SHALL be set to `'self' 'unsafe-inline'`.

#### Scenario: All resource types default to same-origin

- **WHEN** the page attempts to load any resource type not explicitly covered by other directives
- **THEN** only same-origin resources SHALL be permitted