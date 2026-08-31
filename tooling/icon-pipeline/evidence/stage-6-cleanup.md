# Icon-tooling Stage 6 cleanup

- Date: 2026-08-30
- Approval: project-owner approval after review of the Stage 5 validation matrix
- Scope: retire superseded executable proof while preserving history and permanent coverage

## Result

Stage 6 completes Phase 5D-A. The temporary executable experiment, generated proof candidates,
proof-only browser cases, root experiment commands, root-gate invocation, removal manifest, and
migration-only coordinate oracle are removed. The nine historical evidence records remain exactly
where their existing governance links expect them.

The permanent private pipeline, canonical catalog, authenticated outputs, runtime implementation,
Storybook story, focused supported-browser suite, repository drift command, and all public package
behavior are unchanged. No package manifest, lockfile, dependency, production export, glyph, runtime
API, deployment, publication, or design-tool claim changed.

## Removed surfaces

- `experiments/phase-5d-icon-tooling/` now retains only its `evidence/` directory. Its source,
  generated candidates, tests, configs, README, and machine removal plan are retired.
- `tests/browser/phase-5d-icon-review.spec.ts` and
  `tests/browser/phase-5d-runtime-isolation.spec.ts` are retired proof cases.
- The three `experiment:phase5d:*` root scripts and their root `check` invocation are removed. The
  ordinary gate now invokes `icon-tooling:core:check` so permanent type and test coverage replaces
  the retired proof coverage.
- `tooling/icon-pipeline/test/runtime-parity.test.ts`, which duplicated the old inline coordinates
  solely during migration, is removed now that generated data is the accepted runtime source.

## Coverage mapping

| Accepted behavior                                                                     | Permanent owner after cleanup                                                    |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Canonical identity, provenance, direction, safe geometry, and closed input            | `src/catalog.ts`, `catalog-validation.test.ts`                                   |
| Deterministic runtime data, manifests, review HTML, and targeted drift                | `generation-drift.test.ts`, `integrity.test.ts`, committed authenticated outputs |
| Stable CLI, fixed paths, locking, staging, rollback, recovery, and cleanup            | `cli-entry.test.ts`, `command.test.ts`, `repository.test.ts`, `writer.test.ts`   |
| No tooling leakage, registration, network, or runtime dependency                      | `isolation.test.ts`, package-surface tests, packed-output evidence               |
| Exact production names and visible geometry                                           | `packages/icons/test/icons.test.ts`, generated catalog, output manifest hashes   |
| Accessibility, direction, styling, missing-name behavior, and browser support         | `packages/icons` tests and `tests/browser/icons.spec.ts`                         |
| Root drift enforcement, permanent suite execution, and removal of experiment commands | `root-check-integration.test.ts`                                                 |
| Retired-path absence and historical-record retention                                  | `proof-cleanup.test.ts`                                                          |
| Minimum/current runtime, clean build, visual, package, and audit evidence             | Stage 5 validation matrix                                                        |
| Proof-only capacity and maintenance comparisons                                       | retained historical evidence; not a permanent runtime promise                    |

The old inline implementation remains recoverable through version control and the authenticated
historical records. It is no longer a live oracle or a second source of geometry.

## Retained historical records

The following nine records remain under `experiments/phase-5d-icon-tooling/evidence/`:

1. current contract and source inventory;
2. deterministic generation and drift;
3. documentation cleanup and proposed disposition;
4. environment and capacity;
5. maintenance and task comparison;
6. Node 22/Linux validation;
7. runtime compatibility and isolation;
8. security, dependency, and removal; and
9. static review and accessibility.

Governance records, ADR 0034, the implementation contract, the runtime reconciliation, the Phase 5
roadmap, and Stage 4/5 validation records also remain.

## Validation

Validation after removal passes:

- the permanent icon-pipeline TypeScript check and all 58 tests, including the new cleanup guard;
- all 10 `@wayglass/icons` runtime and package-surface tests;
- the write-free four-icon/four-artifact drift check;
- the VitePress documentation build and the complete root `pnpm check`, which now executes the
  permanent icon-tooling suite instead of the retired experiment; and
- formatting and `git diff --check`.

The cleanup does not substitute new browser evidence for Stage 4/5: the unchanged permanent 24-case
icon suite and its retained three-engine results remain authoritative.

## Remaining boundaries

Phase 5D-B design-library work remains deferred. This cleanup does not authorize public icon
tooling, schema stability, external contribution support, Figma integration, package publication, or
expanded catalog content.
