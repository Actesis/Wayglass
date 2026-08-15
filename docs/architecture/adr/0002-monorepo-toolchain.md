# ADR 0002: Use pnpm, Turborepo, Vite, and strict TypeScript

- Status: accepted
- Date: 2026-07-27
- Amended: 2026-08-15 — align the Node floor with pnpm 11.9's executable requirement

## Context

Wayglass needs multiple independently consumable packages, shared quality gates, deterministic
dependency resolution, and fast local development without committing to a hosted build system.

## Decision

Use a pnpm workspace with exact dependency versions and a shared lockfile. Use Turborepo to
coordinate builds, tests, and type checks. Use Vite-compatible tools for applications and fixtures.
Compile production packages from strict TypeScript using the requirements in `SPEC.md`.

## Consequences

The repository requires Node.js 22.13 or newer and pnpm 11.9. Tasks remain runnable without GitHub
Actions. A future CI system should call the same root scripts rather than introduce a parallel
workflow.

## Alternatives considered

- npm workspaces: viable, but pnpm provides stronger workspace linking and dependency isolation.
- Nx: capable, but broader than the current task-graph needs.
- Per-package scripts without an orchestrator: rejected because dependency ordering and caching
  would be duplicated.
