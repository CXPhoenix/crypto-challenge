## ADDED Requirements

### Requirement: VitePress plugin strips generator field in production builds

A Vite plugin registered in `.vitepress/config.mts` SHALL intercept Markdown file processing during production builds (`vitepress build`) and remove the `generator` field from YAML frontmatter before it reaches the client bundle. The plugin SHALL NOT modify the source `.md` files on disk.

#### Scenario: Generator field absent in production page data

- **WHEN** `vitepress build` completes and a challenge page's JavaScript is inspected
- **THEN** the page data SHALL NOT contain a `generator` property

#### Scenario: Other frontmatter fields preserved

- **WHEN** the plugin strips the `generator` field
- **THEN** all other frontmatter fields (`title`, `params`, `starter_code`, `algorithm`, `testcase_count`, `verdict_detail`, `difficulty`, `tags`, `id`, `layout`) SHALL remain intact

### Requirement: Plugin does not modify files in development mode

When running `vitepress dev`, the plugin SHALL NOT strip the `generator` field. Frontmatter SHALL be passed through unmodified so that the dev strategy in `useChallengeRunner` can access generator code at runtime.

#### Scenario: Generator field available in dev mode

- **WHEN** `vitepress dev` is running and a challenge page loads
- **THEN** `frontmatter.generator` SHALL contain the Python generator code from the Markdown file

### Requirement: Plugin operates on Markdown transform hook

The plugin SHALL use Vite's `transform` hook (or VitePress's markdown processing pipeline) to modify frontmatter. It SHALL only process files matching `**/challenge/**/*.md` to avoid affecting non-challenge Markdown content.

#### Scenario: Non-challenge Markdown unaffected

- **WHEN** a non-challenge Markdown file (e.g., `docs/index.md`) is processed
- **THEN** the plugin SHALL NOT modify its frontmatter
