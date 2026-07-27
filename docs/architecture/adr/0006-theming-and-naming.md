# ADR 0006: Keep naming provisional and theming semantically adaptable

- Status: accepted
- Date: 2026-07-27

## Context

Wayglass is a working name without a public npm scope or completed trademark review. The design
language must support substantial brand adaptation without allowing themes to change operational
meaning.

## Decision

Use `@wayglass/*`, `wg-`, and `--wg-` provisionally and keep every package private. Centralize names
so a future rename is mechanical. Themes may replace reference values and adapt semantic and
component presentation while preserving value roles, state meaning, functional boundaries, focus
visibility, accessibility, and interaction behavior.

No software license is selected during Phase 0.

## Consequences

Packages cannot be published accidentally. Public release requires explicit naming, scope, license,
and trademark decisions. Theme contracts remain semantic rather than palette-specific.

## Alternatives considered

- Delay all package naming: rejected because coherent workspace imports are needed now.
- Allow unrestricted theme overrides: rejected because brands could erase known-state semantics.
