# ADR 0037: Compose public site surfaces with private deterministic tooling

- Status: accepted
- Date: 2026-09-08

## Context

ADR 0032 places normative VitePress documentation at `/` and Storybook inspection at `/storybook/`
in one Cloudflare Workers Static Assets collection. The two producers remain independent and
currently emit `apps/docs/.vitepress/dist` and `apps/storybook/storybook-static`. Deployment needs
one attributable artifact without making either producer own the other, rewriting generated HTML or
JavaScript, or admitting private examples and walkthroughs.

Copying two directories with a general-purpose shell command would not establish that they came from
the same clean revision, stayed unchanged during composition, contained only reviewed files, or
produced a reproducible bundle. Cloudflare tooling is unnecessary for those local guarantees and
would couple artifact creation to a deployment provider.

This decision defines the local composition boundary. It does not configure Storybook's base path,
install Wrangler, add Cloudflare configuration, contact an external service, or deploy anything.

## Decision

### Use private, framework-neutral repository tooling

Create the composer under `tooling/site-composer/`. It is not a pnpm workspace package, npm package,
public API, runtime dependency, or release unit. It uses Node built-ins and existing repository
development dependencies; no dependency is added.

The tooling knows only the declared static-surface contract. It does not import VitePress,
Storybook, Lit, or Cloudflare code. Imports have no side effects. Explicit commands own every read,
write, verification, and cleanup effect.

### Admit exactly two independently built surfaces

Schema version 1 admits exactly these ordered surfaces:

| Identity        | Classification | Source output                     | Public destination | Required entries            |
| --------------- | -------------- | --------------------------------- | ------------------ | --------------------------- |
| `documentation` | `normative`    | `apps/docs/.vitepress/dist`       | `/`                | `index.html`, `404.html`    |
| `storybook`     | `inspection`   | `apps/storybook/storybook-static` | `/storybook/`      | `index.html`, `iframe.html` |

Their package names and versions come from the exact source revision's manifests. Walkthroughs,
examples, experiments, reference applications, and any unrecognized surface are rejected rather than
copied opportunistically.

The composer consumes outputs that the caller built from one clean repository revision and committed
lockfile. It validates the repository commit, tree, lockfile hash, cleanliness, package identities,
source paths, and required entries before writing. It inventories each input before and after
copying and rejects any path, byte count, or SHA-256 change. Source outputs are read-only.

### Copy bytes into one transactionally owned temporary output

The compose command requires an explicit, absolute destination that does not exist. The canonical
destination must be a descendant of the operating-system temporary directory and outside the
repository. The command creates a private sibling staging directory, writes only there, verifies the
complete candidate, and atomically renames it to the requested destination. Temporary names and
absolute host paths never enter the artifact.

Documentation contents are copied byte for byte to the output root. Storybook contents are copied
byte for byte under `storybook/`. Generated HTML, JavaScript, CSS, and asset names are never
rewritten. Regular output files are normalized to mode `0644` and directories to `0755`; file modes
are deployment mechanics and do not enter the content hash.

`storybook/` and `wayglass-site-manifest.json` are reserved at the root. A documentation input that
claims either path is a collision. The composer rejects duplicate normalized paths, Unicode
normalization or case-fold collisions, absolute or backslash paths, empty segments, `.` and `..`,
NUL bytes, and any path whose resolved destination escapes its declared root.

Only directories and regular files are admitted. Symbolic links, hard-linked aliases, sockets,
devices, FIFOs, and other filesystem types fail closed. All `.map` files are unexpected in schema
version 1. Secret-like file names and credential markers are rejected without printing matched
content. A later source-map or public-metadata allowance requires a reviewed schema revision rather
than an ad hoc exception.

On every failure the command removes only the staging path it created and never creates or mutates
the requested final destination. It never removes a pre-existing path, a producer output, the
repository, or previously accepted evidence.

### Bind every public byte with one canonical manifest

The output root contains `wayglass-site-manifest.json`. Its closed schema records:

- schema and artifact identity;
- source commit, source tree, and `pnpm-lock.yaml` SHA-256;
- tooling commit and tooling tree;
- exact Node and pnpm versions plus operating-system platform and architecture;
- the two ordered surface identities, classifications, package names and versions, repository-
  relative source paths, public paths, required entries, file counts, byte counts, and content
  hashes;
- every copied file's surface, normalized destination-relative path, byte count, and SHA-256; and
- one `bundleSha256` covering the whole manifest projection and every admitted file.

Object keys are sorted recursively, arrays retain their contractual order, JSON uses two spaces,
UTF-8, and one final newline, and timestamps are forbidden. Files are sorted by normalized
destination path using JavaScript code-unit order. Surface order is `documentation`, then
`storybook`; required-entry order is contractual.

To avoid a self-referential digest, `bundleSha256` is computed from the compact canonical UTF-8 JSON
of the complete manifest with only `bundleSha256` omitted. That projection already contains every
file SHA-256, size, identity, and environment field. The final manifest inserts the lowercase
hexadecimal digest and is serialized canonically. The manifest file itself is not listed as a
surface file. Any field, ordering, serialization, inventory, digest, or byte mismatch fails
verification.

### Keep composition and verification distinct

The future root commands are:

| Command                                              | Contract                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| `pnpm site:compose -- --output <absolute-temp-path>` | Validate already-built inputs and create one new composed artifact               |
| `pnpm site:verify -- --input <absolute-temp-path>`   | Independently traverse and verify an existing artifact without writing it        |
| `pnpm site:build -- --output <absolute-temp-path>`   | Clean-build both producers, compose, and verify through one retained entry point |

The verifier reparses the closed schema, traverses the output without following links, recomputes
all path, byte, surface, inventory, and bundle hashes, and repeats the prohibited-file checks. It
does not trust the composer's in-memory result or call its copy orchestration. Sharing small pure
canonical-JSON, path-validation, and hashing primitives is allowed; composition success is not
verification evidence.

The deterministic exit proof runs `site:build` twice from the same clean commit, tree, lockfile, and
accepted environment into two fresh temporary destinations. It compares the complete sorted path set
and every file byte, including the manifest, then verifies both outputs independently. A producer
that embeds time, host paths, unstable ordering, or random identifiers fails this proof and must be
corrected in its owning slice.

## Consequences

- Deployment receives one provider-neutral artifact attributable to exact source and tooling.
- VitePress and Storybook keep independent ownership and must support their public paths themselves.
- The closed surface and file rules prevent private repository outputs from becoming public by
  proximity.
- Environment identity is intentionally part of the manifest, so byte equality is claimed only for
  repeated builds in the same accepted environment; cross-platform reproducibility may be measured
  separately without weakening same-environment proof.
- Strict source-map rejection may expose current producer behavior that needs an explicit security
  decision before delivery.
- Cloudflare configuration can later consume the verified directory without becoming part of its
  construction or trust boundary.

## Alternatives considered

### Copy directories with shell commands

Rejected because ordinary copying does not provide a closed surface inventory, input-stability
check, collision defense, canonical evidence, transactional cleanup, or independent verification.

### Make documentation or Storybook own composition

Rejected because either producer would gain knowledge of and authority over the other surface.
Composition is repository release tooling, not documentation-theme or component-inspection logic.

### Use Wrangler to assemble the artifact

Rejected because local composition has no Cloudflare-specific requirement. Wrangler remains a later,
pinned development dependency for configuration validation, local serving, and delivery.

### Rewrite generated output for the Storybook prefix

Rejected because it makes final bytes depend on brittle post-processing. Storybook must generate
correct prefix-aware output in Phase 6D-C.

### Store composed output in the repository

Rejected because generated deployment bytes and host-dependent evidence would create stale,
review-hostile source state. Every artifact is rebuilt into an owned temporary path.

## Related records

- [ADR 0032: unified Cloudflare documentation delivery](./0032-unified-cloudflare-documentation-delivery.md)
- [ADR 0036: private release-candidate tooling](./0036-private-release-candidate-tooling.md)
- [Phase 6D delivery implementation plan](../../governance/phase-6d-delivery-implementation-plan.md)
- [Phase 6D-B site-composition contract](../../governance/phase-6d-b-site-composition-contract.md)
