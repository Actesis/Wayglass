# ADR 0035: Select the initial version and compatibility boundaries

- Status: accepted
- Date: 2026-09-04

## Context

Phase 6B has frozen the proposed v1 package surfaces and design assets, but the six candidates still
use placeholder versions and publish-time workspace ranges. React admits untested future majors,
TypeScript support has no stated floor, Node expectations exist only at the repository root, two
pure packages lack explicit side-effect metadata, and repository-only scripts would be misleading in
an installed tarball.

The first release is intended to gather independent real-world feedback. Calling that first artifact
`1.0.0` would imply a maturity commitment that the planned consumer exercise has not yet tested;
leaving it at `0.0.0` would provide no usable release identity or compatibility range.

## Decision

Use `0.1.0` as the initial candidate version for all six packages. Core, tokens, themes, and
elements remain one synchronized foundation release unit. Icons and React are independently
versioned even though their first versions happen to match the foundation version.

Use `^0.1.0` for every published Wayglass dependency or peer range. Under SemVer this admits
compatible `0.1.x` patches but not a `0.2.0` contract change. Keep repository-only workspace links
only in development dependencies that are omitted from packed manifests.

Constrain React to `>=19.0.0 <20`. Support TypeScript `>=5.9.0 <6.1.0`; this is a documentation and
validation contract rather than a runtime peer dependency. Declare Node `>=22.13.0 <27` in all six
manifests. The Node engine bounds supported package consumption and tooling environments; it does
not create a browser claim.

Declare `sideEffects: false` for core, tokens, icons, and React so unused modules can be removed.
Core, tokens, icons, and direct element imports do not register or mutate globals. A retained React
wrapper performs its separately accepted guarded client registration; importing a wrapper solely for
that effect is unsupported. Themes and elements retain `**/*.css` as their only declared
bundler-visible side effects.

Source manifests retain build, test, coverage, and typecheck commands for repository orchestration.
Packed manifests retain no scripts, development dependencies, or lifecycle hooks. Phase 6C must
produce that deterministic manifest projection and verify installed tarballs; this ADR does not
authorize publishing or a general release-tool package.

## Consequences

The first release can evolve from real consumer feedback under the accepted pre-1.0 policy. A
consumer can combine patch releases within the initial contract line without accidentally receiving
a `0.2.0` change. Future React majors, TypeScript 6.1+, and Node 27+ require explicit evidence and a
reviewed compatibility update.

The eventual approved tags are `foundation-v0.1.0`, `icons-v0.1.0`, and `react-v0.1.0`; this
decision does not create them. The packages remain private until the separate release proposal
approves the exact source commit, artifacts, visibility, registry, and publication action.

## Alternatives considered

- **Start at `1.0.0`:** rejected because real-world consumer feedback intentionally follows the
  initial release and may expose contract corrections.
- **Keep `0.0.0` until publication:** rejected because Phase 6C needs exact candidate identities and
  registry-resolvable dependency ranges for clean package rehearsal.
- **Use `workspace:*` in published relationships:** rejected because it is repository syntax, not a
  consumer compatibility promise.
- **Allow React `>=19` or unbounded Node/TypeScript:** rejected because untested future majors and
  compiler lines cannot inherit support automatically.
- **Pack repository scripts or authored source:** rejected because the commands depend on excluded
  repository context, while including that context would contradict the accepted package-content
  boundary.
