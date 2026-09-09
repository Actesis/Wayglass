# Phase 6D-B stage 3 verifier, retained build, and deterministic proof

**Status:** Implementation candidate on September 9, 2026; the required real two-build proof and
complete quality gates remain to be recorded before project-owner acceptance is proposed.

## Implemented boundary

`pnpm site:verify -- --input <absolute-temporary-directory>` independently parses the closed
manifest schema, traverses without following links, reconstructs the exact file and directory set,
recomputes file, surface, and bundle identities, repeats public-content admission, and requires
normalized modes. It imports no composer or build orchestration. Only the canonical-JSON, path,
hash, filesystem-scanning, constants, errors, and type primitives permitted by ADR 0037 are shared.

`pnpm site:build -- --output <absolute-new-temporary-directory>` authenticates the clean repository,
builds documentation and Storybook in their declared order, invokes transactional composition, then
invokes the independent verifier and checks that its identity agrees. A producer, composition, or
verification failure returns nonzero; once the final output is owned, later failure removes it. The
command does not invoke Wrangler, access a network service, read credentials, deploy, or publish.

The retained complete-byte comparator independently verifies both inputs and compares their exact
sorted entry sets, kinds, modes, link counts, and every byte including the manifest. Empty producer
directories are not copied because they have no manifest representation; any extra artifact
directory is rejected.

## Focused evidence

The focused suite contains 118 tests across 12 files. Stage 3 adds accepted-artifact, read-only,
added, removed, moved, truncated, changed, extra-directory, bad-mode, symlink, hard-link, malformed
manifest, producer-failure, verifier-failure, identity-disagreement, equal-build, and unequal-build
coverage. The verifier owns an independent schema parser and does not trust the composer's in-memory
result or call its copy path.

## Remaining exit evidence

Before acceptance is proposed, an exact clean candidate commit must pass two real `site:build` runs
into fresh temporary destinations. Both outputs must pass `site:verify`, and the comparator must
establish identical complete path sets and bytes. The evidence record must name the commit, tree,
lockfile, environment, manifest hash, bundle hash, counts, byte totals, commands, and full quality
gate results. Any producer nondeterminism or prohibited public output remains a blocker.

Acceptance will complete Phase 6D-B and authorize the already planned Phase 6D-C Storybook subpath
and cross-surface-navigation work only. It will not authorize Wrangler installation, Cloudflare or
GitHub connection, upload, deployment, DNS change, npm publication, repository visibility change, or
SpaceTraders work.
