# Phase 6C-D1 independent-consumer harness

**Status:** Proposed for project-owner acceptance on September 5, 2026. This record covers the
private fixture contract and isolated consumer-project harness authorized by acceptance of Phase
6C-C. It does not yet claim that a Vanilla or React candidate passes, retain a candidate run,
authorize Phase 6C-D2, publish or contact npm, remove package privacy, create a tag or release,
change repository visibility, deploy, or build an external application.

## Exact scenario contract

The private pure core defines six compatibility scenarios:

| Consumer | TypeScript | React / React DOM | React types                         |
| -------- | ---------- | ----------------- | ----------------------------------- |
| Vanilla  | `5.9.3`    | none              | none                                |
| Vanilla  | `6.0.3`    | none              | none                                |
| React    | `5.9.3`    | `19.0.0`          | React `19.0.0`, React DOM `19.0.0`  |
| React    | `5.9.3`    | `19.2.8`          | React `19.2.17`, React DOM `19.2.3` |
| React    | `6.0.3`    | `19.0.0`          | React `19.0.0`, React DOM `19.0.0`  |
| React    | `6.0.3`    | `19.2.8`          | React `19.2.17`, React DOM `19.2.3` |

Vite remains exact at `8.1.5`. Vanilla consumes core, tokens, themes, elements, and icons. React
consumes core, tokens, themes, elements, and the React binding. All selected Wayglass packages are
direct `file:./vendor/*.tgz` dependencies, so a transitive registry resolution cannot replace the
candidate under test. Generated consumer manifests are private, ESM, script-free, and contain no
workspace protocol.

The cross-product is intentional. Testing only the two corners would not show whether a declaration
or wrapper failure belongs to the compiler line or React line.

## Pure fixture boundary

Consumer templates are data: one accepted scenario and an in-memory list of relative UTF-8 files.
Validation rejects absolute paths, traversal, backslashes, controls, empty segments, filesystem-
portable collisions, empty templates, and reserved roots including `package.json`, `pnpm-lock.yaml`,
`vendor`, `node_modules`, `.git`, npm or pnpm configuration, and workspace files. The harness—not a
fixture—owns generated manifests, locks, vendored tarballs, installation state, caches, and cleanup.

Imports of the pure core still perform no filesystem read or write, subprocess, environment access,
network request, telemetry, registration, or process exit. Consumer behavior remains outside the
runtime packages and framework-neutral package behavior remains outside the React binding.

## Isolated effect harness

For each future probe, the harness:

1. rejects recognized release credentials and validates an existing absolute content-addressed store
   path;
2. reads and verifies one Phase 6C candidate evidence file and every retained tarball hash;
3. creates a fresh project below the operating-system temporary root;
4. copies only that scenario's exact local tarballs into a project-local `vendor/` directory;
5. writes the projected private consumer manifest and already-validated fixture files;
6. uses an empty temporary npm user configuration, temporary cache, offline mode, and disabled
   lifecycle scripts;
7. performs an explicit non-frozen offline lockfile-only resolution followed by an offline
   frozen-lockfile install;
8. gives the specific Vanilla or React probe a bounded project context; and
9. recursively removes the owned project after success, install failure, or probe failure.

No global cache, user configuration, repository workspace, source package, or evidence directory is
mutated. A missing offline version is an environmental blocker; the harness never contacts a
registry to rescue it.

## Ephemeral candidate clarification

Phase 6C-D may invoke the accepted assembler into a new temporary output, use those exact tarballs
for independent-consumer validation, and delete the output afterward. This is necessary to test
packed bytes rather than workspace source. Phase 6C-E remains the first stage that retains and
proposes authoritative integrated evidence, hashes, dependency and license audits, advisory input,
and the final candidate record.

## Retained validation and remaining work

Focused tests cover the exact six-scenario matrix, private script-free manifest projection, local-
tarball package sets, unsafe and colliding fixture paths, remote or missing tarballs, mismatched
React inputs, evidence and store validation, credential rejection, isolated two-step installation,
scenario-specific vendoring, and cleanup after both install and probe failures. A fake command
runner proves command shape without requiring or claiming a candidate artifact.

The focused implementation gate passes 48 release-candidate assertions across nine test files, and
all 232 documentation/governance assertions pass with the accepted 6C-C status, active 6C-D roadmap
state, navigation wrapper, and ephemeral-candidate clarification. Formatting, focused ESLint,
TypeScript, and `git diff --check` also pass. No dependency, lockfile, package source, candidate
artifact, user cache, or external state changed.

The complete offline repository gate also passes against the final implementation: formatting and
repository lint; all 14 scheduled builds; 58 icon-tooling, 93 token-tooling, 48 release-candidate,
and 24 visualization assertions; all 20 scheduled typecheck tasks; and all 20 scheduled package and
application test tasks, including the 232 documentation assertions. Only the repository's existing
informational Storybook chunk-size and Lit development-mode warnings were emitted.

Phase 6C-D2 still owns the authored Vanilla fixtures and their exact packed import, declaration,
production-build, CSS, registration, interaction, state-axis, tree-shaking, and removal assertions.
Later D slices own the React matrix, cross-browser runtime proof, and ephemeral integrated
rehearsal.

## Acceptance effect

Acceptance completes Phase 6C-D1 and authorizes Phase 6C-D2 Vanilla consumer implementation only. It
does not accept a Vanilla or React result, tarball, hash, evidence run, publication readiness,
package privacy change, npm or registry access, credential use, tag, release, repository visibility
change, deployment, or external application work.
