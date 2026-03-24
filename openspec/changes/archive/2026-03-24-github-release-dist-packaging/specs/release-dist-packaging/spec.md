## ADDED Requirements

### Requirement: Workflow triggers on release publish and tag push

The workflow SHALL trigger when a GitHub Release is published via the UI.
The workflow SHALL trigger when a tag matching the pattern `v*` is pushed to the repository.
The workflow SHALL NOT trigger on draft releases.
The workflow SHALL NOT run duplicate builds when the same tag is involved in both events.

#### Scenario: Release created from GitHub UI

- **WHEN** a user publishes a release via the GitHub UI with tag `v1.0.0`
- **THEN** the workflow SHALL execute and upload build assets to the existing release

#### Scenario: Tag pushed via git

- **WHEN** a user pushes a tag `v1.0.0` via `git push --tags`
- **THEN** the workflow SHALL execute, create a GitHub Release for the tag, and upload build assets

### Requirement: Full project build in CI

The workflow SHALL install Rust stable toolchain and wasm-pack.
The workflow SHALL install Node.js and pnpm (version from `packageManager` field in `package.json`).
The workflow SHALL run `pnpm install` to install dependencies.
The workflow SHALL run `pnpm build` to execute the full build pipeline (WASM + VitePress).

#### Scenario: Successful build

- **WHEN** the workflow executes the build step
- **THEN** the `.vitepress/dist/` directory SHALL contain the complete built site including WASM files under `wasm/`

#### Scenario: Build failure

- **WHEN** any build step fails
- **THEN** the workflow SHALL fail and SHALL NOT upload any assets to the release

### Requirement: Dist packaging in dual formats

The workflow SHALL package the contents of `.vitepress/dist/` into a `.tar.gz` archive.
The workflow SHALL package the contents of `.vitepress/dist/` into a `.zip` archive.
The archive filenames SHALL follow the pattern `crypto-challenge-{tag}.tar.gz` and `crypto-challenge-{tag}.zip` where `{tag}` is the git tag name (e.g., `v1.0.0`).
The archives SHALL contain the dist contents directly at the root level (not nested under a `dist/` directory).

#### Scenario: Archive contents

- **WHEN** a user extracts `crypto-challenge-v1.0.0.tar.gz`
- **THEN** the extracted directory SHALL contain `index.html`, `assets/`, `wasm/`, and all other build outputs at the top level

### Requirement: Asset upload to GitHub Release

The workflow SHALL upload both `.tar.gz` and `.zip` archives to the GitHub Release as downloadable assets.
The workflow SHALL use `softprops/action-gh-release` for upload.
The workflow SHALL overwrite existing assets with the same filename if the workflow is re-run.
The workflow SHALL create a new release if one does not exist for the tag (push tag scenario).
The workflow SHALL update the existing release if one already exists (UI release scenario).

#### Scenario: Assets visible on release page

- **WHEN** the workflow completes successfully
- **THEN** the GitHub Release page SHALL display both `crypto-challenge-{tag}.tar.gz` and `crypto-challenge-{tag}.zip` as downloadable assets

#### Scenario: Workflow re-run

- **WHEN** the workflow is re-run for the same tag
- **THEN** the existing assets SHALL be overwritten with freshly built archives

### Requirement: Minimal permissions

The workflow SHALL request only `contents: write` permission.
The workflow SHALL NOT require any additional repository permissions or secrets beyond the default `GITHUB_TOKEN`.

#### Scenario: Permission scope

- **WHEN** the workflow runs
- **THEN** it SHALL operate using only the default `GITHUB_TOKEN` with `contents: write` permission
