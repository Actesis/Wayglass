# Phase 5G integrated validation

**Status:** Stages 5G-A through 5G-D completed on September 1, 2026. `P5G-E01` through `P5G-E08`
pass. Stage 5G-E remains pending; this record does not authorize publication, deployment, candidate
promotion, or a new compatibility or support claim.

This is the cumulative evidence record for the accepted
[Phase 5G closeout plan](./phase-5g-closeout-plan.md). Results are added by stage so an unavailable,
failed, skipped, or inferred result cannot be mistaken for completed evidence.

## Stage 5G-A — Ledger and repository baseline

### Frozen baseline

| Field           | Recorded value                                                                              |
| --------------- | ------------------------------------------------------------------------------------------- |
| Source baseline | `89349962935e267a754b4c0796567bafca4f78b1`                                                  |
| Host            | macOS 26.6.2 (`25G83`), Darwin arm64                                                        |
| Node            | `v26.4.0`                                                                                   |
| pnpm            | `11.9.0`; root manifest declares `pnpm@11.9.0`                                              |
| TypeScript      | `6.0.3`                                                                                     |
| Playwright      | `1.62.0`                                                                                    |
| Chromium        | Chrome for Testing `151.0.7922.34`, Playwright revision `1234`, present locally             |
| Firefox         | `153.0`, Playwright revision `1538`, present locally                                        |
| WebKit          | `26.5`, Playwright revision `2336`, present locally                                         |
| Lockfile        | `pnpm-lock.yaml` SHA-256 `6d3b70b144bde5e52ed63562b4f343bea22857639482a6265ebec278cbdb5b17` |

The source baseline is the accepted closeout-plan commit. Stage 5G-A documentation is layered on a
branch from that exact commit. Stage 5G-B must record the final validation commit separately and
must perform its own frozen install and uncached checks.

### Reconciled track ledger

| Track                     | Lifecycle and outcome                                                             | Retained boundary                                                                                            | Cleanup and unsupported claims                                                                                               | Objective next gate                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 5A ecosystem architecture | Complete                                                                          | ADRs 0031–0032, exploration and release governance, validation plan                                          | No publication or deployment authority inferred                                                                              | Separately approved release or deployment proposal                                                                             |
| 5B token interchange      | `dispositioned`; trimmed private tooling implemented under ADR 0033               | `tooling/token-interchange`, authored token sources, deterministic outputs, historical evidence              | No public package or general interoperability claim                                                                          | Independent consumer before package or interoperability proposal                                                               |
| 5C rich visualization     | `dispositioned`; narrow native SVG/HTML candidate retained, uPlot and D3 rejected | Private native proof, focused tests, browser cases, historical comparative evidence                          | Rejected code and dependencies removed; no package, stable API, broad chart, AT, or device claim                             | Named independent application before implementation/package work; NVDA/Firefox and physical-device gates remain claim-specific |
| 5D-A icon tooling         | `dispositioned`; trimmed private pipeline implemented under ADR 0034              | `tooling/icon-pipeline`, authenticated runtime outputs, review artifact, manifest, historical evidence       | Superseded executable proof removed; no public contribution, design-tool, or publication claim                               | Independent contribution workflow and release governance                                                                       |
| 5D-B design library       | Deferred                                                                          | Governance records only                                                                                      | No Figma dependency, credential, generated library, or second token authority                                                | Named workspace, access, versions, reviewer, backup, linkage, and drift plan                                                   |
| 5E Home Assistant         | `dispositioned`; guidance only                                                    | Domain-neutral guide, bounded recipe, charter, historical evidence and raw measurements                      | Executable proof, root commands, runtime dependency, credentials, provider import, and compatibility claim removed or absent | Separate live-environment approval; second consumer and compatibility/security owner before shared runtime                     |
| 5F framework wrapper      | `dispositioned`; deferred                                                         | Demand-audit record only                                                                                     | React remains the only accepted binding; no speculative wrapper, peer, or compatibility claim                                | Named application, reproducible direct-use gap, exact versions/rendering mode, and maintainer                                  |
| Package release           | Unapproved                                                                        | Seven candidate public-package manifests remain private at `0.0.0`; eslint config remains repository-private | No registry, version, tag, provenance, publish, or support action authorized                                                 | Separate exact release proposal and release-governance gates                                                                   |
| Documentation delivery    | Architecture accepted; implementation and launch unapproved                       | Local VitePress, Storybook, examples, and ADR 0032                                                           | No tracked Cloudflare/Worker deployment configuration or public deployment claim                                             | Separate implementation, preview, rollback, and launch approvals                                                               |

Phase 5C used the noncanonical label `disposition-accepted` despite having an accepted disposition.
Revision 4 normalizes the label to `dispositioned`; it changes no evidence, scope, authority, files,
or carried gate. All started Phase 5 exploration records now use the canonical final state.

### Repository inventory and boundary audit

- Workspace applications: private documentation and Storybook applications.
- Examples: Agent Supervision, Operations Console, React, Smart Home, and Vanilla.
- Packages: `core`, `tokens`, `themes`, `elements`, `icons`, `react`, `testing`, and the
  repository-private `eslint-config`. Every manifest remains private at `0.0.0`.
- Permanent private tooling: token interchange and icon pipeline. Retained private experiment: Phase
  5C's native visualization proof. Phase 5D keeps historical proof evidence only. Phase 5E keeps its
  README, historical evidence, and raw measurements only.
- Root commands retain permanent token/icon checks and the accepted Phase 5C private-proof checks.
  No Phase 5E executable command remains.
- No tracked GitHub workflow, temporary validation workflow, deployment configuration, credential,
  environment file, build output, package cache, browser trace, Playwright report, or test-result
  directory was found.
- No direct uPlot, D3, Home Assistant, Angular, Svelte, Figma, or Wrangler dependency was found in
  workspace manifests or the lockfile. VitePress's transitive Vue implementation remains confined to
  the private documentation application and is not an additional Wayglass binding.
- Foundation package scans found no import from private tooling, experiments, examples, Home
  Assistant, the React binding, or the icon optional runtime. Only documentation references to the
  accepted Cloudflare delivery ADR are tracked; there is no deployment implementation.

These are tracked-tree and manifest findings, not a substitute for Stage 5G-C's built-artifact,
pack, dependency, security, advisory, license, and provenance audit. Ignored local dependency and
build caches were not treated as repository artifacts and were not deleted.

### Stage-change validation

The documentation build and root `pnpm check` passed after the ledger changes. The root check
covered formatting, lint, builds, icon and token integrity, Phase 5C type and unit checks, workspace
typechecks, and unit tests. Turbo legitimately replayed prior local results for most workspace
tasks; therefore this run validates the Stage 5G-A documentation change but is not recorded as
`P5G-E02`. Stage 5G-B requires a clean frozen install and an explicitly uncached integrated run.

### Reproduction commands

```bash
git rev-parse HEAD
sw_vers
uname -sm
node --version
pnpm --version
pnpm exec tsc --version
pnpm exec playwright --version
pnpm exec playwright install --dry-run
shasum -a 256 pnpm-lock.yaml
git ls-files
rg -n '"(uplot|d3|@types/d3|home-assistant|@angular|svelte|figma|wrangler)"' \
  package.json pnpm-lock.yaml packages/*/package.json apps/*/package.json examples/*/package.json
```

The browser command reports the versions pinned by the installed Playwright package; the matching
managed-browser directories were checked separately for local presence. It does not launch a
browser. Browser execution belongs to Stage 5G-B.

## Stage 5G-B — Integrated automated and browser matrix

### Authoritative source and clean environment

The passing run used detached clean checkout `26652321299d5c3146c9f360627c68ddd3f57f7a`. That commit
contains the two portability corrections found by the earlier clean attempts. The checkout began
without `node_modules`, build output, browser output, or a local Turbo cache.

| Command                                             | Result                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                    | Passed; all 375 packages were fetched for the clean checkout, the committed lockfile was accepted without resolution changes, and both declared install scripts completed |
| `TURBO_CACHE_DIR=.turbo-phase5g-b-final pnpm check` | Passed; the build phase executed 14 of 14 tasks with zero cache hits, followed by all focused tooling checks, typechecks, and unit suites                                 |
| `pnpm exec playwright test --list`                  | Scheduled 1,506 cases in 54 files: 502 per engine                                                                                                                         |
| `pnpm test:browser`                                 | Passed on the first permitted launch in 3.1 minutes: 1,458 passed, 48 intentionally skipped, zero failed, and no retry or flaky result                                    |

The six cache hits reported during each later Turbo typecheck and test phase were build
prerequisites created earlier in the same command and isolated cache. They were not replayed from
another checkout. Generated token files were created in the clean worktree, then authenticated
against source commit `2665232`; the final tracked tree remained unchanged.

### Automated repository coverage

- All 14 scheduled builds passed, including VitePress, Storybook, Vanilla, React, the three
  reference applications, production packages, themes, tokens, icons, and testing support.
- Icon generation and four generated artifacts passed integrity checks; 58 private icon-tooling
  tests passed.
- Token web generation, 528-token and 197-override drift checks, three web artifacts, seven exchange
  files, and 93 private token-tooling tests passed.
- The retained Phase 5C proof passed typechecking and all 24 unit tests.
- All 20 scheduled workspace typecheck tasks and all 20 scheduled workspace test tasks passed.
  Packages or applications with no unit files exited successfully only where their manifest already
  declares `--passWithNoTests`; browser behavior is covered separately below.

### Supported-browser accounting

| Engine                 | Scheduled |    Passed | Intentionally skipped | Failed |
| ---------------------- | --------: | --------: | --------------------: | -----: |
| Chromium 151.0.7922.34 |       502 |       502 |                     0 |      0 |
| Firefox 153.0          |       502 |       478 |                    24 |      0 |
| WebKit 26.5            |       502 |       478 |                    24 |      0 |
| **Total**              | **1,506** | **1,458** |                **48** |  **0** |

The 24 non-Chromium cases per engine are explicitly coded Chromium-only timing thresholds or Tier B
presentation permutations. They are not unavailable browsers or runtime skips. Chromium executed
those cases. Firefox and WebKit still executed the shared cross-engine functional, semantic,
keyboard, focus, form, responsive, forced-color, reduced-motion, accessibility, and retained Phase
5C task coverage.

Across the matrix, the accepted themes and densities, phone/desktop/wall compositions, 200% text,
long content, RTL, forced colors, grayscale, reduced motion, keyboard, pointer/touch-sized controls,
focus retention/restoration, native forms and dialogs, Axe scans, explicit registration, reference
applications, React wrappers, media, and exact telemetry paths passed. The retained Phase 5C native
candidate passed its shared summary/table equivalence, quiet nonvisual path, persistent inspection,
keyboard and touch controls, adverse update, replacement, adaptation, and supported-browser cases;
its timing and retained-heap budgets passed in Chromium as intentionally scoped.

### Corrections and adverse-run log

1. The first sandboxed frozen install could not resolve npm and was stopped during DNS retries. The
   same command passed with authorized network access. No dependency or lockfile changed.
2. The first clean check at baseline `3a1331c` found that exchange-output validation reached the
   nonempty-directory check when the repository itself lived below the OS temporary root. The tool
   now rejects the canonical repository root before considering allowed parent roots, and the test
   names the temporary-checkout case explicitly.
3. That first worktree also revealed shared Git-worktree Turbo cache reuse. Every authoritative
   rerun used a new checkout and a fresh explicit worktree-local cache directory.
4. The second clean check at `1388b3a` found that the outside-boundary test assumed the repository's
   parent could not be the temporary root. The fixture now starts at the filesystem root, which is
   outside both allowed boundaries on macOS, Linux, and Windows. The final clean check passed all 93
   token-tooling tests.
5. The sandboxed browser launch could not bind `127.0.0.1:4173`; zero tests ran. The identical
   authorized command then passed on its first launch with all four local fixture servers.
6. Vite logged one non-failing dependency pre-scan warning for a root fixture's bare `lit` import;
   the fixture and all affected routes resolved and passed in every engine. Storybook also retained
   its existing large-chunk warning. Both observations carry into Stage 5G-C's dependency and bundle
   audit; neither was treated as a browser failure or silently removed.

No failed test was rerun into a pass, and no product failure was classified as environmental. The
two failed clean checks led to committed corrections and wholly new clean checkouts.

## Stage 5G-C — Package, isolation, security, and license audit

### Audit boundary and method

The local audit used source baseline `371e576f27043111427efaea2fec8dad954247cf`, the merged Stage
5G-B commit, on September 1, 2026. Its lockfile retained SHA-256
`6d3b70b144bde5e52ed63562b4f343bea22857639482a6265ebec278cbdb5b17`. The host remained macOS 26.6.2
on Darwin arm64 with Node `v26.4.0` and pnpm `11.9.0`.

All work occurred in temporary local directories. No manifest version, `private` field, registry,
repository visibility, GitHub setting, npm state, tag, workflow, credential, or deployment state
changed. These are inspection tarballs, not packed-candidate promotion or publish approval.

### Manifest and dependency inventory

All seven candidates remain private at `0.0.0`, declare Apache-2.0, package only `dist`, and expose
type and import targets that exist in the tarball. pnpm replaced each packed `workspace:*` range
with the current unpublished `0.0.0`, which is syntactically valid but not registry-resolvable.

| Package              | Export targets | Packed runtime dependencies                           | Packed peers                   | Side effects |
| -------------------- | -------------: | ----------------------------------------------------- | ------------------------------ | ------------ |
| `@wayglass/core`     |              2 | None                                                  | None                           | Not declared |
| `@wayglass/tokens`   |              4 | None                                                  | None                           | Not declared |
| `@wayglass/themes`   |              3 | `@wayglass/tokens@0.0.0`                              | None                           | CSS          |
| `@wayglass/elements` |            135 | `@wayglass/core@0.0.0`, `@wayglass/themes@0.0.0`, Lit | None                           | CSS          |
| `@wayglass/icons`    |              4 | Lit                                                   | None                           | `false`      |
| `@wayglass/react`    |            130 | `@lit/react`                                          | React `>=19`, elements `0.0.0` | `false`      |
| `@wayglass/testing`  |              2 | None                                                  | None                           | `false`      |

`core` and `tokens` still need an explicit package-level side-effect decision. None of the packed
manifests contains an install, prepare, prepack, publish, or other lifecycle script. Their retained
build, test, and typecheck scripts refer to repository files excluded from the tarballs and must be
reviewed as package metadata before release. Package author/contributor attribution, ownership,
description, keywords, homepage, public repository, engines, `publishConfig`, funding where
applicable, support and security links, and compatibility metadata remain incomplete. No package
README, package NOTICE, changelog, support record, or package security record exists.

### Tarball contents

`pnpm build` passed before the seven `pnpm pack` rehearsals. Every export target resolved inside its
archive, tests and private records were excluded, and each auto-included `LICENSE` exactly matched
the root Apache-2.0 file. NOTICE was absent from every archive. Source maps were included without
embedded `sourcesContent`, absolute personal paths, or Windows user paths; their inclusion still
requires the explicit package-level decision required by release governance.

| Archive                       | Packed bytes | Unpacked bytes | Files | Maps | SHA-256                                                            |
| ----------------------------- | -----------: | -------------: | ----: | ---: | ------------------------------------------------------------------ |
| `wayglass-core-0.0.0.tgz`     |        7,205 |         23,700 |    22 |   10 | `9aab5ea48e00e059e1b99eb3b7580711df267133f7ec04a9c9e32c8762f8ccb4` |
| `wayglass-elements-0.0.0.tgz` |      142,124 |        869,545 |   303 |  148 | `605d51e1ea210cd77c06a66c8725cf761fa7cd4b56cbbe5b2525adc9302777b9` |
| `wayglass-icons-0.0.0.tgz`    |       10,350 |         42,430 |    18 |    8 | `d085d3db3b843876207b1e6c8afd8487a792127249a112583a86373db4b7afcb` |
| `wayglass-react-0.0.0.tgz`    |       26,007 |        149,791 |   270 |  134 | `2ac721565e9a6527423538a09a328a8dacdc3ac55451a60b23ea1eadbebe78f4` |
| `wayglass-testing-0.0.0.tgz`  |        4,884 |         13,225 |     6 |    2 | `cd0936b52580032903358b4d8b526bd2c663b9f8b734c2822fbb649c684be474` |
| `wayglass-themes-0.0.0.tgz`   |       17,569 |        137,648 |    15 |    6 | `e6eacfc5f65f22cf94133ba04bca28ecbba03fd3b35434bddb4f75d145b2716e` |
| `wayglass-tokens-0.0.0.tgz`   |       46,029 |        409,806 |    16 |    6 | `4546106999b15582d85d3b7e6c4f8cb27bae4dd237c389ba0861ce986e5529f6` |

The exact hashes authenticate this one local rehearsal only. They are not release artifacts and are
not retained in the repository.

### Isolated consumers and dependency direction

The first clean foundation install without workspace links or overrides failed truthfully because
elements, themes, and React refer to unpublished `@wayglass/*@0.0.0` versions. That failure is a
release blocker, not an environmental skip. Temporary `pnpm-workspace.yaml` overrides then pointed
those exact names to the inspected tarballs so the package bytes could be assessed without changing
their manifests.

With those audit-only overrides:

- the complete foundation family passed a strict TypeScript consumer check and Node import smoke;
- importing the button module did not register `wg-button`, and the explicit `defineWgButton`
  function remained available;
- a Vite `8.1.5` production consumer build transformed 15 modules and produced 21.87 kB of
  JavaScript and 108.30 kB of CSS before gzip;
- the resulting foundation lock graph contained only core, tokens, themes, elements, Lit and Lit's
  transitive runtime packages, plus audit build tooling—no icons, React binding, provider,
  visualization, token tooling, icon tooling, design-tool, or deployment package;
- independent icon, React `19.2.8`, and testing-helper consumers each passed strict typechecks and
  import smokes; importing the icon module did not register `wg-icon`; and
- static source, packed output, and graph scans found no uPlot, D3, Home Assistant runtime, Figma
  SDK, Wrangler, Angular, Svelte, speculative wrapper, private tooling, experiment, example, or
  reverse dependency in a production package.

The audit override prevents these results from satisfying the release contract's clean
registry-resolvable consumer gate. Exact approved versions and internal SemVer ranges must be tested
again without overrides in a release proposal.

### Security and privacy boundary

Tracked source, manifests, configurations, evidence, generated package output, and all 314 maps were
scanned by filename and content. No credential or environment file, high-confidence private key or
service token, populated password/client-secret/API-key assignment, personal filesystem path,
private endpoint, package-runtime `fetch`, WebSocket, EventSource, beacon, XHR, cookie,
local-storage, or session-storage access was found. Production package modules contain no analytics
or network telemetry; `wg-telemetry-strip` remains a local presentation component, not data
collection.

The Vite audit consumer's generated module-preload helper contains browser `fetch`, but that code is
owned by the temporary build harness and is absent from every package tarball. Wayglass package
manifests have no lifecycle install scripts. This scan supports the retained credential-free,
consumer-owned-network boundary; it is not a production penetration test or a guarantee against
future changes.

### Dated advisory and license results

The September 1, 2026 registry audit returned no known vulnerability for production dependencies
with `pnpm audit --prod --audit-level low`. The full private workspace audit returned six
development or documentation-tool findings: three high and three moderate. They comprise a Vite 5
documentation chain with three advisories plus its esbuild 0.21 advisory, brace-expansion 5.0.8
through ESLint, and nanoid 3.3.16 through PostCSS/Vite. None enters a candidate runtime dependency
graph, but all must be re-audited and remediated or explicitly dispositioned before public
documentation deployment or a release proposal. An audit result is current only for this date and
lockfile.

The production dependency inventory contains Apache-2.0 for Wayglass; BSD-3-Clause for Lit,
`@lit/react`, and their Lit runtime packages; and MIT for React, React DOM, Scheduler, CSSType, and
type-only support packages. No copyleft or unknown production license appeared. Dependencies are not
vendored into Wayglass tarballs, and their own installed license files do not replace Wayglass's
missing package NOTICE requirement.

### Provenance, compatibility, and release disposition

`Actesis/Wayglass` remains private. There is no tracked GitHub workflow, protected release tag,
public source identity, trusted-publisher relationship, provenance statement, public package,
registry recovery rehearsal, or publish evidence. Provenance therefore cannot be produced under the
accepted contract and was recorded as blocked rather than fabricated.

Release compatibility and support evidence also remains incomplete: no package declares engines;
Windows and NVDA/Firefox remain unavailable; elements cannot generalize completed browser and
VoiceOver evidence into all support claims; icons lacks its independent compatibility record;
React's broad `>=19` peer has only been rehearsed here at `19.2.8`; and testing lacks an approved
public-helper inventory. The initial public versions, changelogs, migration records, package owners,
support scope, public repository decision, npm controls, and release workflow remain undecided.

The Stage 5G-C documentation change passed the full root `pnpm check`: formatting, lint, all package
and documentation builds, icon and token integrity, private-tool checks, typechecks, and unit suites
completed. Turbo replayed valid local results for workspace tasks, so this run verifies the audit
record without replacing Stage 5G-B's clean uncached integrated evidence.

Accordingly, every package stays private at candidate state. The local archives are sufficient to
pass the knowledge and isolation goals of `P5G-E04` through `P5G-E06`; they are not sufficient for
packed-candidate, publish-approved, staged, or released status.

## Stage 5G-D — Documentation-system and deployment-boundary audit

### Correction and authoritative source

The initial audit began at merged Stage 5G-C commit `53ae4a68d14b200a8a443bc92a1d33319e2b9979`. A
fresh VitePress build succeeded but an independent include-target check found two wrappers that
resolved outside the repository, leaving the Phase 3H integrated-validation and
production-surface-audit pages empty. The same review found three stale claims: the documentation
home and README still described the accepted Phase 5 roadmap as a proposal, the README tied package
privacy to already-accepted release governance instead of a separate release proposal, and the React
guide stopped its wrapper inventory at Phase 2.

Commit `fbda0e065f97ac9b18c8ba24d5ea9b36d3cc5afe` corrects those paths and claims and adds a focused
VitePress include-wrapper test. That clean correction commit is the authoritative Stage 5G-D build
source. The evidence and roadmap changes in this section layer on top of the audited source, as in
the prior closeout stages.

### Same-revision builds and generated integrity

With `TURBO_FORCE=true` and a new temporary Turbo cache, the root build executed 14 of 14 scheduled
tasks with zero cache hits. VitePress, Storybook, all five examples, production packages, React,
themes, tokens, icons, and testing support built from `fbda0e0`. Token generation changed no file;
the write-free check verified 528 tokens, 197 overrides, three web artifacts, and seven in-memory
exchange artifacts at the exact source revision. The icon check verified four icons and four
generated artifacts.

| Local output                                | Files |      Bytes | Local inventory digest                                             |
| ------------------------------------------- | ----: | ---------: | ------------------------------------------------------------------ |
| VitePress                                   |   418 | 15,890,555 | `70dd6e6737b0c537608421306cb8d9ac9bd81b108fab8bca4bc9ee14c579a3f9` |
| Storybook payload, excluding `project.json` |   133 |  9,225,837 | `6f8d82b1a6582f6fc07d666edfeb14a666ab9faa16405ef4071dfbb2641a31f0` |
| Agent Supervision example                   |     3 |    465,165 | `c2d9fa8026f73067cb2085a4d9da764d31b609874c83a5679ae8c8a1c26869f8` |
| Operations Console example                  |     3 |    505,325 | `2b729d4e170c34a7fd7225cb449bd1943c3e88a6a61aba318a50481f8a29569b` |
| React example                               |     3 |    495,258 | `b44ed308e3627217707553ab1768178abe91e1109defc901b8ac107197cf4da7` |
| Smart Home example                          |     4 |    881,288 | `eb0d0c515b9cadd72fcf6630051cc2859142e8226ec7a2951eadd40f24275065` |
| Vanilla example                             |     3 |    309,151 | `5563d62cf98f1929b54f7863494f0c921c12680ee823336054970ac0e209438d` |

These hashes cover untracked local output and are evidence measurements, not a deployment manifest.
Two successive VitePress builds were byte-identical. Example hashes also remained identical across
the two fresh root builds. Successive Storybook builds differed only in the millisecond
`generatedAt` value in `project.json`; all other 133 files were byte-identical at the payload digest
above. The future deterministic assembler must explicitly normalize, exclude, or record that
volatile metadata rather than claiming whole-directory reproducibility. Storybook retained its known
non-failing large-chunk warning and Node's `module.register()` deprecation warning.

The three generated token artifacts authenticated by the token check had SHA-256 values
`b253b9a03c856a8a4b619f4c7b53042b32a5234ae3126b6963392ad188aa1263`,
`eeb8066bcf909cba5ce29dc9f9345deb4c545d119bfbb381fa1ca2500a2d5f28`, and
`00a0c6bb7342c4f1d79aac93244732e5f16564a4943c65171e80d98fb48cfa92`. The icon source catalog, source
manifest, review output, and output manifest retained their independently checked hashes. No
documentation, Storybook, or example build emitted a source map.

### Documentation, fixtures, links, and claims

- All 132 include wrappers among 137 tracked VitePress Markdown files now resolve to regular files
  inside the repository. Five intentionally authored VitePress files remain independent. The new
  unit check enforces the path and containment boundary.
- The VitePress build rendered 138 HTML files without its dead-link failure. An independent output
  scan checked 20,156 root-relative link occurrences and found no missing target.
- A documentation code-sample scan resolved 32 distinct `@wayglass/*` import specifiers against the
  current package export maps with no missing package or subpath.
- Storybook compiled all 26 source story files into 102 indexed story entries. Its build imports
  production packages and retains the accepted Operational Activity example-owned renderer facade;
  VitePress contains prose and links but does not import or reproduce Storybook's interactive
  fixtures.
- VitePress remains the normative contract and guidance surface. Storybook remains private visual,
  state, accessibility-tooling, and interaction inspection evidence; its stories are not presented
  as package contracts.
- Every example manifest remains private at `0.0.0`. Their deterministic fixture state, routing, and
  domain data remain application-owned; examples import no other reference application and no
  Storybook or VitePress source. No walkthrough has an admission record or enters a public bundle.
- The documentation now states the accepted Phase 5 status, current private-candidate package
  status, planned origin, and separate release/deployment authority without npm installation,
  provider compatibility, live-data, deployed-site, or public-support claims.

Tracked documentation-system source contains no network client, analytics beacon, cookie, account,
credential, submitted-form handler, or deployment side effect. Storybook's build command explicitly
disables its tooling telemetry. Static output naturally contains framework-owned browser runtime,
but no analytics service signature, beacon, or cookie write was found. The credential and personal
path results from Stage 5G-C remain unchanged.

### ADR 0032 implementation-gate map

No tracked or generated Wrangler configuration, Worker, `_headers`, `_redirects`, deployment or site
manifest, environment file, Cloudflare dependency, GitHub workflow, deployment output, or hosting
configuration exists. The only hostname references describe the planned `wayglass.hoagsoftworks.com`
origin and explicitly reject the misspelling; none claims that the site is live. `Actesis/Wayglass`
remains private.

| ADR 0032 gate                                                    | Stage 5G-D finding and remaining prerequisite                                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zone and exact hostname control                                  | Unverified external account state; requires owner verification.                                                                                   |
| Existing DNS and route conflict review                           | Not performed and no DNS state entered the repository.                                                                                            |
| Public repository and content decision                           | Not accepted; repository and every candidate surface remain private.                                                                              |
| Cloudflare tooling justification and audit                       | No Wrangler or Cloudflare dependency exists; re-verify current platform guidance before an implementation proposal.                               |
| Deterministic assembler, manifest, collisions, and local command | Unimplemented; current outputs build independently and Storybook has one volatile metadata field.                                                 |
| Storybook `/storybook/` base-path proof                          | No explicit base configuration, composed-prefix server, direct-navigation check, or return link exists.                                           |
| Walkthrough admission and base paths                             | No walkthrough is admitted; all five Vite outputs still reference root-absolute `/assets/...` URLs and cannot be copied under the planned prefix. |
| Headers, cache, CSP, 404, canonical URL, and preview `noindex`   | No response contract or path-aware routing implementation exists.                                                                                 |
| Account, GitHub, production, rollback, and incident owners       | Not assigned for an implementation or launch.                                                                                                     |
| Preview, promotion, domain, and rollback rehearsal               | Not performed; no Cloudflare state was touched.                                                                                                   |

The accepted Operational Activity sharing remains valid private evidence, but Storybook currently
re-exports its renderer from the Vanilla example. A public composed-site proposal must reconcile
that relationship with ADR 0032's independent-source-build rule rather than exposing private example
source by accident.

These open implementation gates are the expected proof of the undeployed boundary, not skipped Stage
5G-D work. Local coherence and honest claims pass `P5G-E07`; the complete absence and explicit map
of deployment state pass `P5G-E08`. Neither result authorizes Cloudflare implementation, a
walkthrough, preview, custom domain, analytics, or launch.

After the evidence was formatted, the root `pnpm check` gate passed on September 1, 2026. It covered
formatting, lint, all 14 builds, icon and token generated-artifact checks, both tooling core suites,
the Phase 5C experiment, type checking, and package tests. The documentation package executed the
new include-wrapper regression test as part of the 20-task test schedule.

## Evidence status

| Evidence ID         | Result  | Basis and limitation                                                                                                                                                                               |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P5G-E01`           | Passed  | Every started track has one accepted state, retained boundary, cleanup result, unsupported-claim boundary, and objective gate. The one vocabulary mismatch was revisioned and corrected.           |
| `P5G-E02`           | Passed  | A clean frozen install and isolated-cache repository check passed at `2665232`; every scheduled build, tooling check, typecheck, and unit task completed.                                          |
| `P5G-E03`           | Passed  | The full three-engine matrix passed 1,458 cases with 48 explicit Chromium-only skips and no failure, retry, or flaky result.                                                                       |
| `P5G-E04`           | Passed  | Static, packed, isolated-consumer, registration, dependency, and bundle checks preserve foundation direction; audit-only overrides are explicitly not registry-install evidence.                   |
| `P5G-E05`           | Passed  | Seven local tarballs were inspected and hashed; contents, metadata, notices, maps, dependencies, licenses, advisories, provenance blocks, and release blockers are now explicit.                   |
| `P5G-E06`           | Passed  | Source, outputs, maps, evidence, and configuration scans found no credential, personal-path, unexpected package network/storage, telemetry, lifecycle-script, or provider-runtime leak.            |
| `P5G-E07`           | Passed  | Fresh same-revision builds, generated integrity, include and export checks, 20,156 internal-link checks, fixture ownership, privacy, claims, output inventories, and adverse results are recorded. |
| `P5G-E08`           | Passed  | No deployment implementation or state exists; every ADR 0032 account, assembler, base-path, routing, header, ownership, preview, rollback, DNS, and launch prerequisite is mapped.                 |
| `P5G-E09`–`P5G-E10` | Pending | Stage 5G-E carried-gate and final project-owner disposition remain open.                                                                                                                           |

## Next stage

Stage 5G-E reconciles every carried human and external gate, then presents the final Phase 5 roadmap
disposition and the separate keep-private, keep-undeployed, release, and deployment decisions for
project-owner review.
