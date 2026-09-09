# Phase 6D-B stage 1 pure-composer implementation

**Status:** Accepted by the project owner on September 8, 2026, by approval and merge of PR #264.
This record covers only the pure implementation authorized by the accepted Phase 6D-B contract and
ADR 0037. Its acceptance authorized implementation stage 2; it did not itself add a composition
command, traverse a real producer output, write or remove an artifact, change VitePress or Storybook
output, install Wrangler, contact Cloudflare or npm, use credentials, deploy, publish, change DNS,
or alter repository visibility.

## Private implementation boundary

The implementation lives under `tooling/site-composer/`. It is private repository tooling rather
than a workspace, npm package, runtime dependency, framework binding, or public Wayglass API. The
root quality gate calls its focused type check and tests, but importing its `src/index.ts` entry has
no output, process, network, environment, or filesystem effect.

The stage uses only Node built-ins and existing repository development dependencies. No dependency
or lockfile entry is added. Effects remain reserved for the explicit commands in implementation
stage 2.

## Closed surface and path model

Code-owned constants admit exactly two ordered surfaces:

1. normative `@wayglass/docs` bytes from `apps/docs/.vitepress/dist` at the output root, requiring
   `index.html` and `404.html`; and
2. inspection `@wayglass/storybook` bytes from `apps/storybook/storybook-static` under `storybook/`,
   requiring `index.html` and `iframe.html`.

The pure inventory accepts caller-supplied entry descriptions so filesystem discovery remains
outside this stage. It rejects unsupported entry types, hard links, empty files, missing file bytes,
file-as-ancestor conflicts, duplicate paths, case-fold and Unicode-normalization collisions, unsafe
relative forms, documentation claims on `storybook/` or the root manifest, source maps,
credential-bearing names, and recognized credential markers. Text decoding is strict UTF-8 and
secret failures report only a stable rule and path; matching content remains redacted. Binary bytes
are not decoded or scanned as text.

Admitted files receive their exact destination path, byte count, and lowercase SHA-256. Merging
requires the exact documentation-then-Storybook surface set and rechecks destination collisions. The
source-stability comparator rejects any changed surface, path, count, digest, or inventory length.

## Canonical evidence model

The pure manifest factory and independent validator implement the closed schema-version-1 shape.
They validate exact artifact and surface literals, package identities, exact semantic versions,
source and tooling Git identities, lockfile and content digests, environment values, safe counts,
required entries, destination order, attribution, per-surface totals and content hashes, and the
whole-bundle projection hash.

Canonical JSON recursively sorts object keys, preserves contractual array order, emits two-space
UTF-8 JSON with one final newline, and rejects unsupported values. The `bundleSha256` is computed
over compact canonical JSON with only that field omitted. Parsing additionally rejects otherwise
valid but noncanonical serialized JSON.

## Validation

The focused TypeScript check passes. Seventy tests across six files prove the accepted cases and
adverse canonical-value, path, reserved-name, secret, redaction, binary, entry-type, hard-link,
collision, required-entry, surface-set, input-change, manifest-shape, ordering, attribution, count,
identity, digest, total, content-hash, and whole-bundle-hash cases. An isolated child-process test
imports the public pure entry from an empty temporary directory and proves it emits nothing and
creates no file.

Formatting, linting, documentation tests and build, and the complete repository quality gate must
pass before this proposal is presented for acceptance.

## Acceptance effect

Project-owner acceptance completed Phase 6D-B implementation stage 1 and authorized stage 2 only:
effectful transactional composition, repository and producer-source validation, input-stability
checks, explicit command handling, atomic output, and bounded cleanup tests. It did not authorize
command execution against real producer outputs, independent artifact verification, the two-build
proof, Storybook prefix changes, Wrangler installation, Cloudflare configuration or contact, GitHub
connection, preview upload, DNS mutation, production deployment, npm publication, repository
visibility change, or SpaceTraders work.
