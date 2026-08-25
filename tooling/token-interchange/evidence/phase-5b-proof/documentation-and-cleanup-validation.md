# Phase 5B documentation and cleanup validation

> Historical record: Stage 8 relocated this evidence and removed the experiment implementation.
> Paths, inventory, and commands below describe the repository on 2026-08-15.

This records charter row `P5B-E10` on 2026-08-15. It validates the private proof's documentation,
links, sample contract, unsupported-claim boundaries, repository isolation, and cleanup state. It
does not approve the proof, complete the other evidence rows, or make an artifact public.

## Result

The documentation and cleanup slice passes:

- the VitePress documentation build resolves the Phase 5B charter include and retained evidence
  links;
- every relative Markdown link in the charter, experiment guide, and evidence records resolves to a
  repository file;
- external specification, runtime, registry, source, and advisory references resolve at the time of
  review;
- the documented seven-file candidate output matches the executable inventory assertion;
- production packages, workspace manifests, generated runtime artifacts, and the lockfile have no
  Phase 5B dependency or export;
- no generated exchange release, pointer, stage, registry tarball, temporary lockfile, untracked
  proof file, or ignored proof artifact remains; and
- the only discovered residue, an experiment-local Vitest cache under `node_modules/.vite`, was
  removed.

Publication and permanent implementation remain blocked pending the complete evidence review and
formal disposition.

## Documentation and link checks

The review covers:

- [`P5B-TOKEN-INTERCHANGE-001`](../../../../docs/governance/explorations/phase-5b-token-interchange.md);
- the archived [experiment guide](./proof-guide.md);
- every retained record in this `evidence/` directory; and
- the VitePress include at `apps/docs/governance/explorations/phase-5b-token-interchange.md`.

The local-link check resolves Markdown destinations relative to their source file. External links
were requested with redirects and failures enabled. npm's human package pages rejected the automated
client with HTTP 403, so the comparison now links the exact versioned npm registry manifests
instead. The registry is the authoritative metadata source used by the comparison and is
machine-verifiable without pretending that bot rejection is a broken package record.

The documentation build remains the authority for the published VitePress surface. The experiment
guide and evidence stay GitHub repository documents; Phase 5B does not add them as public product
documentation or a supported interchange guide.

## Candidate artifact sample

The private transform returns this deterministic inventory in memory:

```text
tokens.json
modes/density/comfortable.json
modes/density/compact.json
modes/theme/wayglass-dark.json
modes/theme/wayglass-light.json
resolver.json
wayglass-manifest.json
```

The manifest identifies the output as `partial-dtcg-2025.10-candidate`, names Wayglass TypeScript
definitions as source authority, records the caller-supplied source revision and schema version,
maps all 528 reversible identities, measures the six non-manifest artifacts by SHA-256 and UTF-8
bytes, includes 524 tokens, and accounts explicitly for four omitted tokens and zero omitted mode
overrides. Tests reject missing or unexpected artifacts and any content, byte-count, or serialized
manifest mismatch.

This is a contract sample, not a checked-in generated release. The transform and writer tests use
temporary directories and leave no accepted output in the repository.

## Unsupported-claim audit

The charter, experiment guide, source labels, manifest status, and evidence consistently block:

- DTCG conformance or complete interchange;
- Figma, Tokens Studio, or other design-tool compatibility;
- Android, Apple, Flutter, Compose, or other non-web platform support;
- bidirectional or round-trip editing;
- public package, CLI, plugin, schema, or production-artifact readiness;
- publication, deployment, or a permanent canonical token authority;
- dependency adoption based on the transformer comparison;
- performance budgets inferred after the capacity results; and
- durability, concurrency, or cross-platform filesystem guarantees not exercised by the writer
  proof.

Historical Node 22.12 evidence remains intentionally adverse. The older Node 26 and Node 22.12
records now carry explicit historical-status notes so their original pending/minimum language cannot
be mistaken for the current Node 22.13 support contract.

## Isolation and artifact inventory

### Retained for disposition review

- the experiment guide and three local configurations;
- ten private transform, verification, capacity, and writer source modules;
- seven focused test files plus the separately invoked capacity measurement;
- three authenticated capacity records for current, corrected-minimum, and historical-adverse Node
  environments;
- the exact-version transformer comparison; and
- this validation record.

The root exposes only explicit `experiment:phase5b:*` development commands. The experiment is not a
pnpm workspace package and has no package manifest, runtime entry point, production barrel export,
Custom Element registration, browser bundle, or npm dependency.

### Removed

- temporary Node 22.12 and 22.13 runtimes and checksum files after their recorded measurements;
- temporary transformer tarballs, extracted packages, package-lock-only resolutions, and audit
  inputs after the comparison; and
- the ignored experiment-local Vitest cache discovered during this review.

### Not created or retained

- `current.json`, content-addressed release directories, or writer stage directories;
- generated DTCG or CSS output;
- third-party transformer code, configuration, or dependencies;
- credentials, network configuration, source maps, logs, screenshots, or deployment files; and
- a package, public export, schema declaration, design-tool file, or platform transform.

## Reproduction

From a clean supported checkout:

```sh
pnpm experiment:phase5b:check
pnpm check
git diff --check
git status --short --ignored experiments/phase-5b-token-interchange
```

The informational capacity command remains separate because it requires an explicit exact source
revision and produces machine-dependent observations.

## Limitations and disposition impact

- External-link success is a dated network observation; future review must repeat it.
- The sample contract is exercised by repository tests, not by an external consumer or conforming
  third-party tool.
- A clean private boundary does not prove that the candidate should be promoted or retained after
  disposition.
- This row does not substitute for formal actual results and review of `P5B-E01` through `P5B-E09`.

`P5B-E10` is ready for reviewer acceptance. The next work is the formal validation and disposition
pass: consolidate the actual results for all rows, decide which proof artifacts remain useful, and
either authorize a narrowly owned follow-up or remove the unaccepted proof.
