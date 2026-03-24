## ADDED Requirements

### Requirement: Semantic version in package.json

The `package.json` file SHALL contain a `version` field following [Semantic Versioning 2.0.0](https://semver.org/) format (`MAJOR.MINOR.PATCH`).

#### Scenario: Version reflects 1.0.0 for first stable release

- **WHEN** the project reaches its first stable release milestone
- **THEN** the `version` field in `package.json` SHALL be set to `1.0.0`

### Requirement: CHANGELOG follows Keep a Changelog format

The project SHALL maintain a `CHANGELOG.md` file in the repository root following the [Keep a Changelog](https://keepachangelog.com/) convention.

Each version entry SHALL use the heading format `## [VERSION] - YYYY-MM-DD` and organize changes under the categories: `Added`, `Fixed`, `Changed`.

#### Scenario: CHANGELOG contains version entry

- **WHEN** a new version is released
- **THEN** `CHANGELOG.md` SHALL contain a `## [VERSION] - YYYY-MM-DD` section with at least one categorized change entry
