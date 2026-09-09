# Phase 6D-B stage 3 verifier, retained build, and deterministic proof

**Status:** Proposed for project-owner acceptance on September 9, 2026. The implementation, real
two-build proof, and complete repository quality gate pass at the exact candidate identified below.

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

The first real comparison found Storybook's optional `project.json` metadata file embedding a
`generatedAt` wall-clock timestamp. The owning Storybook configuration now uses its supported
`core.disableProjectJson` option. This removes non-runtime diagnostic metadata rather than rewriting
generated output; all declared Storybook entry points and static application assets remain admitted.

## Focused evidence

The focused suite contains 118 tests across 12 files. Stage 3 adds accepted-artifact, read-only,
added, removed, moved, truncated, changed, extra-directory, bad-mode, symlink, hard-link, malformed
manifest, producer-failure, verifier-failure, identity-disagreement, equal-build, and unequal-build
coverage. The verifier owns an independent schema parser and does not trust the composer's in-memory
result or call its copy path.

## Real deterministic proof

The first proof attempt against implementation commit `3b2370f` correctly exposed only
`storybook/project.json` and the derived root manifest as different. Inspection showed the optional
metadata's `generatedAt` timestamp; the correction described above was then committed and the proof
was restarted from two fresh destinations.

Two complete sequential `pnpm site:build -- --output <fresh-canonical-temp-path>` runs from the same
clean candidate produced independently accepted and completely byte-identical artifacts:

| Evidence          | Exact value                                                         |
| ----------------- | ------------------------------------------------------------------- |
| Candidate commit  | `9c71f954fc8e0957deb76037290ccd84c7136cc3`                          |
| Candidate tree    | `4dfee8274730f47d4162c00c1417615524ee6171`                          |
| Lockfile SHA-256  | `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`  |
| Environment       | Node `26.8.1`; pnpm `11.9.0`; `darwin`; `arm64`                     |
| Bundle SHA-256    | `031f97a42ac99ce72dfec9fa8a6bd97b6d11346e17c024b8ad889ce0a47a135b`  |
| Manifest SHA-256  | `3ba42a372878d2f913de2b633006db00e82c3530517eba098b97a59031e43744`  |
| Documentation     | 577 files; 26,833,701 bytes                                         |
| Storybook         | 133 files; 9,226,154 bytes                                          |
| Complete artifact | 710 surface files; 36,059,855 surface bytes, plus the root manifest |

Each result separately passed `pnpm site:verify -- --input <artifact>`. The retained comparator then
verified both again and compared the exact sorted path set, entry kinds, modes, link counts, and
every file byte including the manifest, returning the bundle SHA-256 above.

Focused type checking and all 118 tests across 12 files pass. Documentation has 335 tests across 50
files and builds successfully. Formatting and linting pass. The complete `pnpm check` gate passes,
including repository builds, generated-artifact checks, all tooling suites, all workspace type
checks, and all workspace tests. Any future producer nondeterminism or prohibited public output
remains a blocker rather than an allowed difference.

Acceptance will complete Phase 6D-B and authorize the already planned Phase 6D-C Storybook subpath
and cross-surface-navigation work only. It will not authorize Wrangler installation, Cloudflare or
GitHub connection, upload, deployment, DNS change, npm publication, repository visibility change, or
SpaceTraders work.
