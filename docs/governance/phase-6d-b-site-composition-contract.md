# Phase 6D-B deterministic site-composition contract

**Status:** Proposed for project-owner acceptance on September 8, 2026. This contract and proposed
ADR 0037 specify the authorized local composer before implementation. They do not add executable
tooling or dependencies, change VitePress or Storybook output, configure or contact Cloudflare,
connect GitHub, upload a preview, alter DNS, deploy, publish packages, or use credentials.

## Purpose and boundary

Phase 6D-B creates one deterministic, provider-neutral static artifact from the independently built
documentation and Storybook outputs. It establishes which bytes may become public, proves that they
belong to one source revision, and produces evidence that can be checked without trusting the copy
operation.

The composer is private repository tooling under `tooling/site-composer/`. It is not a workspace or
npm package, public API, framework binding, documentation generator, Storybook addon, Cloudflare
client, or release unit. Imports remain effect-free and commands own all filesystem effects. Node
built-ins and current repository dependencies are sufficient, so implementation adds no dependency.

## Exact schema-version-1 inputs

The admitted surface set is closed and ordered:

| Surface         | Role         | Package               | Source output                     | Destination prefix | Required entries            |
| --------------- | ------------ | --------------------- | --------------------------------- | ------------------ | --------------------------- |
| `documentation` | `normative`  | `@wayglass/docs`      | `apps/docs/.vitepress/dist`       | `/`                | `index.html`, `404.html`    |
| `storybook`     | `inspection` | `@wayglass/storybook` | `apps/storybook/storybook-static` | `/storybook/`      | `index.html`, `iframe.html` |

No walkthrough, example, experiment, reference application, arbitrary directory, or caller-defined
surface is accepted. Surface definitions are code-owned constants rather than CLI JSON. Adding a
surface changes the closed schema and requires architecture, privacy, accessibility, support, and
ownership review.

Before composition, the command requires and records:

1. the repository root's exact clean `HEAD` commit and tree;
2. the SHA-256 of committed `pnpm-lock.yaml` bytes and confirmation that working-tree bytes match;
3. the exact package name and version read from each tracked package manifest;
4. the tooling commit and tree containing the composer;
5. exact Node and pnpm versions, platform, and architecture; and
6. both source directories, their required regular-file entries, and complete pre-copy inventories.

Untracked or ignored producer-output files are allowed only because the complete output inventory is
hashed; any other repository dirtiness fails. A producer output may not be or traverse through a
symbolic link. Inputs are never cleaned, rewritten, removed, or normalized in place.

## Owned output and transaction

`site:compose` requires `--output` with a new absolute descendant of the real operating-system
temporary directory. It rejects an existing destination, a repository descendant, a symlinked
ancestor escape, an absent safe parent, and ambiguous repeated flags.

The command creates one private staging sibling, copies admitted regular-file bytes, sets directory
mode `0755` and file mode `0644`, writes the manifest last, re-inventories both sources, verifies
the staged artifact, and atomically renames it to the requested path. Any source change since the
pre-copy inventory is rejected before the rename. The requested destination appears only after all
checks pass.

On failure, the command removes only its own staging directory. A signal or process interruption may
leave a recognizable private staging sibling; the next run may remove only a staging path whose
ownership marker matches the current tool and whose final destination still does not exist. It never
removes a caller-created path or producer output.

## Filesystem and public-content admission

Every input entry is inspected with no link following. Directories and nonempty regular files are
the only accepted filesystem types. The composer rejects:

- symbolic links, hard-linked aliases, sockets, devices, FIFOs, and path escape;
- absolute paths, backslashes, NUL, empty segments, `.` or `..` segments;
- duplicate normalized paths and collisions after Unicode NFC normalization plus Unicode lowercase;
- documentation's reserved top-level `storybook` path;
- any input claim on root `wayglass-site-manifest.json`;
- missing or non-regular required entry points;
- every `.map` file in schema version 1;
- credential-bearing file names such as `.env`, `.dev.vars`, `.npmrc`, `.netrc`, private keys,
  credential stores, and known cloud configuration files; and
- credential markers in text-like files, including private-key headers, npm automation tokens,
  GitHub tokens, Cloudflare token fields, and common secret-assignment forms.

Secret inspection reports only a stable rule identifier and normalized path, never the matching
bytes. Binary assets are classified by content rather than filename before text-marker scanning.
Public files are copied byte for byte: no HTML, JavaScript, CSS, JSON, image, font, or path rewrite
is permitted.

The pre-copy and post-copy source inventories contain every normalized relative path, byte count,
and SHA-256. A changed path, type, size, or byte fails the run. The composed inventory is compared
with the exact destination projection so an omitted, added, or cross-surface file also fails.

## Canonical manifest

The root `wayglass-site-manifest.json` has a closed version-1 object shape:

```text
artifact: "wayglass-site-bundle"
schemaVersion: 1
source: { commit, tree, lockfileSha256 }
tooling: { commit, tree }
environment: { node, pnpm, platform, architecture }
surfaces: [ documentation record, storybook record ]
files: [ destination-sorted file record ... ]
bundleSha256: lowercase SHA-256
```

Each surface record contains `id`, `classification`, `package`, `version`, `sourcePath`,
`publicPath`, ordered `requiredEntries`, `fileCount`, `bytes`, and `contentSha256`. Each file record
contains `surface`, normalized output-relative `path`, `bytes`, and `sha256`. The Storybook file
paths therefore begin with `storybook/`; documentation paths never do.

The surface content hash is SHA-256 of UTF-8 lines in sorted destination-path order, each encoded as
`path`, NUL, decimal byte count, NUL, lowercase file digest, newline. The manifest `files` array
uses the same destination order. Counts and byte totals are safe nonnegative integers. Digests are
exactly 64 lowercase hexadecimal characters.

Canonical JSON recursively sorts object keys, preserves contractual array order, uses two spaces,
UTF-8, and one final newline. Timestamps, absolute host paths, temporary names, Cloudflare account
data, environment variables, and credentials are forbidden.

`bundleSha256` is SHA-256 of compact canonical UTF-8 JSON for the complete validated manifest with
only `bundleSha256` omitted. This non-self-referential projection includes every file digest and
byte count. The final manifest adds that digest and is serialized canonically; the manifest is not
listed as a surface file.

## Commands and implementation slices

The accepted implementation will expose:

| Command                                              | Effect                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm site:compose -- --output <absolute-temp-path>` | Validate the current clean revision and already-built inputs, then create one verified artifact               |
| `pnpm site:verify -- --input <absolute-temp-path>`   | Read and independently verify one artifact without changing it                                                |
| `pnpm site:build -- --output <absolute-temp-path>`   | Build both producers from one clean revision, compose, independently verify, and report the artifact identity |

Implementation remains reviewable in three stages:

1. pure schema, canonicalization, validation, inventory, and adversarial tests;
2. effectful transactional composition, source-stability checks, command surface, and cleanup tests;
3. independent verification plus two-build byte-equality proof against real VitePress and Storybook
   outputs.

`site:build` is the eventual retained local and Workers Builds entry point. It does not invoke
Wrangler. A failed producer build, composer check, independent verification, or equality comparison
returns nonzero and leaves no final artifact from that attempt.

## Required verification

Focused tests must cover the accepted case and at least:

- unknown, missing, duplicated, reordered, or wrong-classification surfaces;
- wrong package identity/version, dirty source, changed lockfile, changed input, and missing entry;
- every unsafe path form, reserved path, same-path, case-fold, and Unicode collision;
- symlink files, symlink directories, hard-linked aliases, and special files where the host supports
  them;
- source maps, secret filenames, credential markers, binary false positives, and redacted errors;
- unknown/missing manifest fields, noncanonical JSON, bad order, unsafe integers, and malformed
  digests;
- added, removed, moved, truncated, or changed output files and cross-surface attribution;
- bad surface totals, content hashes, source/tooling identity, environment, and whole-bundle hash;
- existing or unsafe output paths, simulated failures at each write boundary, atomic visibility, and
  owned cleanup; and
- two complete clean builds whose sorted path sets and every file byte, including the manifest, are
  identical and independently accepted.

The implementation must run its focused type check and tests, documentation tests, formatting,
linting, the full repository check, and the real two-build proof before Phase 6D-B completion is
proposed. Any current producer nondeterminism or unsafe output is a blocker to that proposal, not a
reason to weaken this contract.

## Acceptance effect

Acceptance of this contract accepts proposed ADR 0037 and authorizes implementation stage 1 only:
the pure schema, canonicalization, validation, inventory primitives, and adversarial tests under
private `tooling/site-composer/`. It does not yet authorize effectful composition, Storybook prefix
changes, Wrangler installation, Cloudflare configuration or contact, GitHub connection, preview
upload, DNS mutation, production deployment, npm publication, repository visibility change, or
SpaceTraders work.
