# Phase 6C release-candidate proof contract

**Status:** Proposed for project-owner acceptance on September 4, 2026. This contract defines the
private, offline proof for the exact Phase 6B source freeze. It does not publish, contact npm,
remove package privacy, change a version, create a tag or release, change repository visibility,
deploy documentation, or begin work in an external application.

## Exact inputs and authority

| Input                     | Required identity                                                               |
| ------------------------- | ------------------------------------------------------------------------------- |
| Candidate source commit   | `ce400e89930a047c6af1c6992c64cfe422a1eeee`                                      |
| Candidate source tree     | `da2550b5aa2636d0896ae61e08c340f405fe1412`                                      |
| Candidate lockfile hash   | `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`              |
| Foundation release unit   | core, tokens, themes, elements at `0.1.0`                                       |
| Independent release units | icons and React, each at `0.1.0`                                                |
| Assembly architecture     | Proposed ADR 0036; exact accepted tooling commit recorded by every evidence run |

Candidate source owns package code, metadata, documentation, and build configuration. The later
tooling commit owns only isolated assembly, inspection, probes, and evidence. It may reject the
candidate but may not correct or reinterpret it. Any package-source correction returns to Phase 6B
for a new freeze identity.

## Network and credential boundary

Phase 6C makes no npm registry request and performs no publication-like action. Dependency
materialization uses `pnpm install --offline --frozen-lockfile --ignore-scripts` against an existing
content-addressed local store. Local packing disables lifecycle scripts, audit, funding, update
checks, and network use. Consumer installs resolve Wayglass only from exact local tarball paths and
run with scripts and network disabled.

The runner rejects npm tokens, registry credentials, GitHub tokens, Cloudflare credentials, and
recognized release secrets rather than attempting to sanitize or use them. Current advisory data,
when refreshed, comes from a separately named read-only source and is recorded with retrieval time;
it cannot authorize publication. A missing offline dependency or unavailable advisory source is
reported as a limitation or blocker according to the affected claim.

## Private tool boundary

Implementation belongs at `tooling/release-candidate/` and uses no new dependency. Pure modules own:

- exact package inventory and dependency ordering;
- manifest validation and deterministic projection;
- file allowlisting, path and source-map inspection;
- hashing, byte measurement, and evidence-model construction; and
- consumer-probe expectations.

One explicit command adapter owns Git and package-manager subprocesses, temporary paths,
diagnostics, cleanup, and exit codes. Importing any module performs no filesystem write, subprocess,
network request, telemetry, environment mutation, or process exit.

The initial command surface is private:

| Command                                                                  | Effect                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `pnpm release-candidate:check -- --source <full-sha>`                    | Validate inputs and projection in memory; write nothing      |
| `pnpm release-candidate:build -- --source <full-sha> --output <abs-dir>` | Run the complete isolated proof into a new explicit run root |
| `pnpm release-candidate:verify -- --evidence <abs-path>`                 | Rehash and verify an existing run without accepting it anew  |

The build command refuses an existing output directory. Exit `0` means the requested proof passed;
exit `1` means candidate or evidence failure; exit `2` means invalid invocation, missing offline
material, unsupported environment, credential exposure, or unsafe path.

## Deterministic manifest projection

Each staged `package.json` preserves only the reviewed source fields: `name`, `version`, `private`,
`description`, `license`, `author`, `homepage`, `repository`, `bugs`, `keywords`, `publishConfig`,
`type`, `sideEffects`, `engines`, `files`, `exports`, `dependencies`, and `peerDependencies` when
present. Fields retain one canonical order and two-space JSON with a final newline.

Projection must:

- retain `private: true`, exact `0.1.0` versions, Apache-2.0 metadata, the npm public-access
  metadata already reviewed for a future release, exact exports, engine bounds, and side-effect
  declarations;
- retain production third-party versions and `^0.1.0` Wayglass relationships;
- remove `scripts`, `devDependencies`, package-manager fields, lifecycle configuration, and unknown
  fields rather than copying source manifests wholesale;
- reject any `workspace:`, `file:`, `link:`, URL, Git, or unpublished Wayglass relationship in a
  retained dependency or peer field; and
- validate the projection again after packing and after consumer installation.

The source manifest remains unchanged. Phase 6E owns the distinct publish-approved projection that
may remove `private: true`; therefore Phase 6C hashes are proof artifacts, not preapproved npm
bytes.

## Clean source and artifact assembly

The driver creates a detached Git worktree in a new operating-system temporary run root and verifies
the exact commit, tree, lockfile hash, clean status, and six-package inventory before installing or
building. The tool code executes from its recorded governance commit but accepts package inputs only
from that worktree.

The complete repository gate runs with Turbo caches bypassed. Candidate outputs are then rebuilt in
dependency order. Staging copies exactly the `files` allowlist plus the projected manifest. It
rejects missing or extra packed roots, symlinks, sockets, generated credentials, absolute paths,
authored TypeScript, embedded `sourcesContent`, private fixtures, tests, screenshots, caches, and
tooling or application files.

Local tarballs are produced in this order:

1. `@wayglass/core`;
2. `@wayglass/tokens`;
3. `@wayglass/themes`;
4. `@wayglass/elements`;
5. `@wayglass/icons`; and
6. `@wayglass/react`.

Every tarball is unpacked independently and compared with its staged manifest and file inventory.
Two complete builds with fresh temporary roots must produce byte-identical projections, contents,
and SHA-256 tarball hashes. Tool-owned time, path, locale, and ordering data stays outside hashed
artifacts.

## Independent consumer probes

Retained fixture templates may describe probes, but each actual project is generated into a fresh
temporary directory outside every workspace and Git worktree.

The Vanilla probe installs core, tokens, themes, elements, and icons tarballs. It verifies root and
accepted subpath imports, declarations under the supported TypeScript range, production bundling,
CSS availability, no import-time Custom Element registration, explicit registration, representative
rendering and keyboard/pointer behavior, Boolean assertion distinct from condition, knowledge, and
activity, and removal of every unused package.

The React probe installs the five required local Wayglass tarballs plus React and React DOM at the
minimum and current accepted React 19 lines. It verifies TypeScript at the accepted minimum and
current compiler bounds, production build, hydration-safe client behavior within the accepted
client-only contract, wrapper/direct-element parity, interaction and event adaptation, guarded
registration only for a retained wrapper, tree-shaking of unused wrappers, and complete
React-binding removal while direct elements continue to work.

Browser runtime probes cover Chromium, Firefox, and WebKit for the applicable supported paths.
Automated semantics and accessibility evidence remains automated; it does not become a new human
screen-reader, physical-device, embedded-runtime, provider, or server-rendering claim.

## Evidence matrix

One immutable evidence directory records:

- source commit/tree/lockfile and tooling commit/tree;
- OS, architecture, Node, pnpm, npm, TypeScript, React, Playwright, and browser versions;
- exact commands, relevant environment controls, start/end times, exit status, and uncached status;
- formatting, lint, typecheck, unit, component, browser, accessibility, visual, performance,
  documentation, token, icon, and package results required by the accepted scope;
- projected manifest and packed-file inventories, unpacked and packed byte counts, and SHA-256
  hashes;
- dependency graph, production licenses, notices, lifecycle scripts, current dated advisory input,
  source-map findings, side effects, and provenance inputs;
- Vanilla and React install, import, typecheck, build, runtime, registration, interaction, semantic,
  tree-shaking, and removal results; and
- every retry, correction, warning, skipped path, environmental limitation, and unsupported claim.

Raw logs may accompany the record but cannot replace normalized results. Evidence contains no token,
credential, machine username, absolute temporary path, or arbitrary environment dump. A failure is
never overwritten by a rerun; the final record explains the disposition.

## Implementation sequence

1. **6C-A — architecture and contract:** accept ADR 0036, this execution boundary, and the exact
   evidence schema before code.
2. **6C-B — pure projection and inspection:** implement package inventory, manifest projection,
   dependency-range checks, allowlist inspection, hashing, and adverse unit fixtures.
3. **6C-C — isolated assembler:** add authenticated worktree, offline install/build, safe staging,
   deterministic local packing, verification, cleanup, and repeated-build tests.
4. **6C-D — independent consumers:** add temporary Vanilla and React templates and prove minimum/
   current compiler/framework, browser runtime, tree-shaking, and removal behavior.
5. **6C-E — integrated candidate record:** run the entire clean matrix twice, audit dependencies,
   licenses, advisories, maps, contents, and provenance inputs, then propose exact evidence and
   hashes.

Each stage is a separate reviewable change. A stage may narrow the proposal when evidence fails but
may not alter frozen package source, invent a support claim, or contact npm to rescue the run.

## Acceptance effect

Accepting this proposal authorizes Phase 6C-B private tooling only. It does not accept future code,
candidate artifacts, hashes, consumer evidence, publication readiness, package privacy changes,
repository visibility, npm access, tags, releases, deployment, or external application work. Each
later stage retains its own review and the Phase 6C exit gate requires project-owner acceptance of
the integrated evidence.
