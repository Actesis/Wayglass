# Deterministic generation and drift evidence

- Evidence: `P5D-A-E06` partial automated pass
- Date: 2026-08-29
- Environment: Node 26.4.0, TypeScript 6.0.3, Vitest 4.1.10
- Production effect: none

## Result

The private proof validates the canonical catalog before producing an in-memory artifact set. It
then sorts records by stable identifier and emits exactly three candidates:

1. `runtime-catalog.ts`, containing safe structured primitives rather than raw SVG;
2. `source-manifest.json`, containing catalog and per-icon SHA-256 fingerprints; and
3. `output-manifest.json`, authenticating the two generated payloads and their byte counts.

The committed candidates match a fresh generation byte for byte. Repeated generation and reversed
authored catalog order produce identical outputs. A synthetic revision to `close` changes its
per-icon fingerprint without changing the other four identities. The drift comparison reports
changed, missing, and unexpected artifacts in a stable order. Invalid source fails validation before
an artifact set is returned, and the generator has no filesystem write or repair path.

The generated directory is excluded from repository formatting because a formatter would be an
untracked second writer. It remains covered by exact generated-output comparison, while generator
and test source remain subject to the normal formatting and lint gates.

## Limits retained

This slice does not yet prove environment independence across the minimum Node runtime, locale, time
zone, or working directory. It does not add the 50-run timing or 500-glyph capacity evidence, static
visual review index, browser inspection, production runtime migration, or a public generator
command. The candidate artifacts have no production authority.
