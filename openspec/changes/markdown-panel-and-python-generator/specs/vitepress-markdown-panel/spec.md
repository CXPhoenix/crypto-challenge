## ADDED Requirements

### Requirement: Challenge pages use custom VitePress layout

Challenge markdown pages SHALL set `layout: challenge` in frontmatter instead of `layout: false`. The VitePress `Layout.vue` SHALL render `ChallengeView` when `frontmatter.layout === 'challenge'`, bypassing the DefaultTheme layout. The `ChallengeView` component SHALL be registered as the layout entry point, not as inline page content.

#### Scenario: Challenge page renders with custom layout

- **WHEN** a user navigates to a challenge page with `layout: challenge` in frontmatter
- **THEN** `Layout.vue` renders `ChallengeView` directly without DefaultTheme wrapping

#### Scenario: Non-challenge pages are unaffected

- **WHEN** a user navigates to any page without `layout: challenge`
- **THEN** `Layout.vue` renders the DefaultTheme layout as before

### Requirement: Left panel renders VitePress native markdown

The `ProblemPanel` component SHALL render the current page's markdown content using VitePress's `<Content />` component. The challenge `.md` file's body (after frontmatter) SHALL contain the full problem description in standard Markdown. No description text SHALL be stored in the TOML file.

#### Scenario: Problem description is rendered from page content

- **WHEN** a challenge page is loaded
- **THEN** the left panel displays the formatted markdown from the `.md` file body using VitePress's rendering pipeline (including syntax highlighting, prose styles, etc.)

#### Scenario: Description updates without WASM changes

- **WHEN** a challenge author edits the `.md` file body
- **THEN** the updated description is rendered on the next page load without any TOML or WASM changes

### Requirement: Challenge metadata lives entirely in frontmatter

All challenge data SHALL reside in the `.md` file only — no TOML files SHALL exist. The frontmatter SHALL contain: `id`, `title`, `difficulty`, `tags`, `algorithm`, `testcase_count`, `params` (object), `generator` (Python string), and `starter_code` (Python string). `ChallengeView` SHALL read all challenge data from `frontmatter` (via `useData()`) rather than from any external file. The `import.meta.glob` TOML loading logic in `ChallengeView` SHALL be removed.

#### Scenario: AppHeader reads title from frontmatter

- **WHEN** a challenge page loads
- **THEN** the AppHeader displays the title from `frontmatter.title` without waiting for WASM generation

#### Scenario: Data loader continues to work from frontmatter

- **WHEN** `challenge.data.ts` builds the challenge catalogue
- **THEN** it reads all metadata from `.md` frontmatter fields as before (no TOML parsing at build time)

#### Scenario: No TOML files exist in the repository

- **WHEN** the migration is complete
- **THEN** the `.vitepress/theme/challenges/` directory and all `.toml` files are deleted
