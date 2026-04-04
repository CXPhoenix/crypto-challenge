# spec-baseline-governance Specification

## Purpose

Defines the minimum quality baseline for active specs in `openspec/specs/`. Every active spec must have a meaningful Purpose section, a single authoritative set of normative requirements, and valid `@trace` file path references. These rules prevent archive residue from degrading the active spec baseline.

## Requirements

### Requirement: Active spec Purpose section completeness

Every active spec in `openspec/specs/` SHALL have a `## Purpose` section containing a meaningful description of the capability's scope and intent. The Purpose section SHALL NOT contain archive placeholders such as `TBD - created by archiving change '...'`, `TBD`, `TODO`, or any other deferred-content marker.

#### Scenario: Spec with TBD Purpose fails governance check

- **WHEN** an active spec's Purpose section contains the text `TBD`
- **THEN** the spec SHALL be considered non-compliant with the baseline governance rules

#### Scenario: Spec with no Purpose section fails governance check

- **WHEN** an active spec has no `## Purpose` section
- **THEN** the spec SHALL be considered non-compliant with the baseline governance rules

#### Scenario: Spec with meaningful Purpose passes governance check

- **WHEN** an active spec's Purpose section contains a description of the capability's scope and intent without any placeholder markers
- **THEN** the spec SHALL be considered compliant with the Purpose completeness rule

---
### Requirement: Single authoritative normative text

An active spec SHALL contain exactly one set of authoritative normative requirements. The spec SHALL NOT contain multiple competing normative sections (e.g., both `## ADDED Requirements` and `## Requirements`) that define overlapping or contradictory rules for the same behavior.

#### Scenario: Spec with duplicate normative sections fails governance check

- **WHEN** an active spec contains both a `## ADDED Requirements` section and a `## Requirements` section that cover the same behavioral domain
- **THEN** the spec SHALL be considered non-compliant with the single-authority rule

#### Scenario: Spec with one Requirements section passes governance check

- **WHEN** an active spec contains exactly one `## Requirements` section with no competing normative blocks
- **THEN** the spec SHALL be considered compliant with the single-authority rule

---
### Requirement: Trace reference path validity

All `@trace` comment blocks in an active spec SHALL reference file paths that exist in the current project tree. A `@trace` block SHALL NOT reference deleted files, renamed files under their old names, or directories that no longer exist.

#### Scenario: Trace referencing a deleted file fails governance check

- **WHEN** an active spec contains a `@trace` code path entry pointing to a file that does not exist in the project
- **THEN** the spec SHALL be considered non-compliant with the trace validity rule

#### Scenario: Trace with all valid paths passes governance check

- **WHEN** every file path listed in an active spec's `@trace` blocks exists in the current project tree
- **THEN** the spec SHALL be considered compliant with the trace validity rule
