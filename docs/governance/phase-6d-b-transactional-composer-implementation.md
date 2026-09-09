# Phase 6D-B stage 2 transactional-composer implementation

**Status:** Accepted by the project owner and merged in PR #265 on September 9, 2026. This record
covers the effectful local composition implementation authorized by acceptance of stage 1 in PR
#264. It does not invoke the new command against the repository's real VitePress or Storybook
outputs, implement independent artifact verification, run the two-build proof, change producer
output, install Wrangler, contact Cloudflare or npm, use credentials, deploy, publish, change DNS,
or alter repository visibility.

## Command and trust boundary

The explicit command is:

```sh
pnpm site:compose -- --output <absolute-new-temporary-directory>
```

It accepts exactly one `--output` value and rejects missing, repeated, ambiguous, or additional
arguments. Importing private `tooling/site-composer/` modules remains effect-free; filesystem and
process effects begin only when the caller invokes this command or the effectful `composeSite`
adapter directly.

The command executes local `git` and `pnpm --version` processes without a shell. It does not use the
network, read credentials, invoke a producer build, clean an input, or call Wrangler.

## Source authentication

Composition must run at the exact real repository root. Before reading an output, it records the
clean `HEAD` commit and tree, rejects staged, unstaged, or untracked source outside ignored build
material, compares working `pnpm-lock.yaml`, root `package.json`, and both producer package
manifests byte for byte with committed `HEAD`, and hashes the committed lockfile bytes.

The committed producer manifests must identify exact `@wayglass/docs` and `@wayglass/storybook`
packages and versions. The active pnpm version must match the root `packageManager` pin. The
manifest environment records the actual Node and pnpm versions, platform, and architecture. Source
and tooling identity intentionally refer to the same authenticated commit and tree.

## No-follow inventory and stable inputs

Each code-owned producer path must be a real repository-descendant directory whose path contains no
symbolic-link component. Recursive inspection uses `lstat`, never follows discovered symbolic links,
opens regular files with `O_NOFOLLOW`, confirms their identity and size remained stable while read,
and supplies complete directory and file descriptions to the accepted pure admission layer.

Before any final rename, both producer roots are inventoried again. Added, removed, moved,
type-changed, truncated, or byte-changed input and hard-link-count changes fail the transaction.
Producer contents are never rewritten, normalized, removed, or cleaned.

## Owned transaction

The requested output must be a new absolute descendant of the real operating-system temporary
directory, outside the repository, with an existing real parent. Existing output, relative paths,
missing or non-directory parents, direct symbolic-link parents, and resolved escapes fail before a
staging directory is created.

The composer creates one uniquely named private staging sibling, copies admitted source bytes to
their exact projected destinations, sets directories to `0755` and files to `0644`, and writes the
canonical root manifest last. It then re-inventories the sources and verifies the complete staged
path set, bytes, hashes, link counts, modes, and manifest bytes against the in-memory accepted
manifest. Only then does one rename make the final directory visible.

A second existence check immediately before rename rejects a destination created during the run.
Every pre-rename failure removes only the exact staging directory created by that invocation. It
never removes or changes producer output, an existing destination, or a destination created by
another actor.

## Validation

The focused TypeScript check and 98 tests across 10 files pass. Temporary, locally initialized Git
repositories prove clean source identity, ignored generated-output allowance, other dirtiness
rejection, committed-byte matching, exact package identity, and pnpm-pin enforcement. Real
filesystem fixtures cover regular files and directories, symlink files and directories, hard links,
FIFO rejection where supported, symbolic-link ancestors, and all source-stability mutations.

Transaction fixtures prove exact byte placement, canonical evidence, normalized modes, final-path
invisibility before rename, a concurrently created destination left untouched, staged tamper
detection, changed-source rejection, and cleanup after every declared write boundary. They use only
generated temporary fixtures; the command is not run against real producer outputs.

Formatting, linting, documentation tests and build, and the complete repository quality gate must
pass before this proposal is presented for acceptance.

## Acceptance effect

Acceptance completed Phase 6D-B implementation stage 2 and authorized stage 3 only: an independent
read-only `site:verify` command, a retained `site:build` orchestrator, execution against real clean
VitePress and Storybook outputs, and the two-build complete-byte-equality proof. It does not
authorize Storybook prefix changes, Wrangler installation, Cloudflare configuration or contact,
GitHub connection, preview upload, DNS mutation, production deployment, npm publication, repository
visibility change, or SpaceTraders work.
