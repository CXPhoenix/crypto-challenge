## ADDED Requirements

### Requirement: script-src does not include unsafe-eval

The CSP `script-src` directive SHALL NOT include `'unsafe-eval'`. All JavaScript modules SHALL load via standard `import()` expressions, not via `new Function()` or `eval()`.

#### Scenario: No eval-based dynamic imports in production bundle

- **WHEN** the application is built and deployed
- **THEN** no JavaScript module SHALL use `new Function()` or `eval()` for dynamic imports
- **AND** the CSP `script-src` directive SHALL remain `'self' 'unsafe-inline' 'wasm-unsafe-eval'` without `'unsafe-eval'`
