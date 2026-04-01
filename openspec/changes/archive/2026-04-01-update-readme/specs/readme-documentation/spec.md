## ADDED Requirements

### Requirement: README reflects current project state

The README.md file SHALL accurately represent the current version, challenge count, test count, project structure, and build instructions of the project at the time of each release.

#### Scenario: All badges display correct data

- **WHEN** a reader views README.md
- **THEN** the version badge SHALL match package.json version, the test badge SHALL match the actual passing test count, and the license badge SHALL display "ECL-2.0"

#### Scenario: Challenge list is complete

- **WHEN** a reader views the challenge list table
- **THEN** all challenge markdown files in `docs/challenge/` SHALL have a corresponding row in the table with correct id, title, operation type, and difficulty

### Requirement: README includes deployment guidance

The README.md SHALL contain a deployment section that describes the required HTTP security headers (COOP/COEP) and the GitHub Actions release workflow.

#### Scenario: Deployment headers documented

- **WHEN** a user deploys the built site to a static hosting provider
- **THEN** the README SHALL list the required `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` header values

#### Scenario: Release workflow documented

- **WHEN** a maintainer pushes a version tag
- **THEN** the README SHALL describe that GitHub Actions automatically packages `.tar.gz` and `.zip` dist archives

### Requirement: README includes browser compatibility

The README.md SHALL contain a browser compatibility section that specifies the SharedArrayBuffer requirement and recommended browsers.

#### Scenario: Browser recommendation

- **WHEN** a reader checks browser compatibility
- **THEN** the README SHALL recommend Chromium-based browsers (Chrome, Edge) and note that SharedArrayBuffer requires COOP/COEP headers
