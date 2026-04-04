## MODIFIED Requirements

### Requirement: Challenge pages use custom VitePress layout

Challenge markdown pages SHALL set `layout: challenge` in frontmatter instead of `layout: false`. The VitePress `Layout.vue` SHALL render `ChallengeView` when `frontmatter.layout === 'challenge'`, bypassing the DefaultTheme layout. The `ChallengeView` component SHALL be registered as the layout entry point, not as inline page content.

Challenge page data SHALL be sourced exclusively from Markdown frontmatter. The active codebase SHALL NOT contain any loader or composable that references TOML-based challenge files (`*.toml`) or the removed `parseChallengeMeta` WASM export.

#### Scenario: Challenge page renders with custom layout

- **WHEN** a user navigates to a challenge page with `layout: challenge` in frontmatter
- **THEN** `Layout.vue` renders `ChallengeView` directly without DefaultTheme wrapping

#### Scenario: Non-challenge pages are unaffected

- **WHEN** a user navigates to any page without `layout: challenge`
- **THEN** `Layout.vue` renders the DefaultTheme layout as before

#### Scenario: No TOML-era challenge loader exists

- **WHEN** the codebase is searched for composables that import TOML challenge files via `import.meta.glob`
- **THEN** zero results SHALL be found
