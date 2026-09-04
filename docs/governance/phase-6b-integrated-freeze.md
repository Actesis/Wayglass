# Phase 6B integrated v1 scope-freeze proposal

**Status:** Accepted by the project owner on September 4, 2026. This record identifies the exact
private v1 candidate source and integrates the completed Phase 6B contract, compatibility, support,
browser, package, security, and documentation evidence. It does not begin Phase 6C, publish, create
tags, change repository visibility, contact npm for publication, or deploy documentation.

## Proposed freeze identity

| Field                     | Exact value                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| Candidate source commit   | `ce400e89930a047c6af1c6992c64cfe422a1eeee`                                     |
| Candidate Git tree        | `da2550b5aa2636d0896ae61e08c340f405fe1412`                                     |
| Lockfile SHA-256          | `bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`             |
| Candidate package version | `0.1.0` for all six private candidates                                         |
| Foundation release unit   | `@wayglass/core`, `@wayglass/tokens`, `@wayglass/themes`, `@wayglass/elements` |
| Independent release units | `@wayglass/icons`, `@wayglass/react`                                           |

Commit `ce400e8` is the merge of the accepted support-claim disposition into `main`. It therefore
contains every accepted Phase 6B package surface, component contract, design-asset fingerprint,
identity/stewardship baseline, compatibility decision, and support boundary. This proposal branch
adds governance documentation and executable documentation guards only; it does not alter a
candidate package, export, declaration, token, theme, icon, element, style, or React wrapper.

The exact freeze is the candidate source commit above, not whatever commit happens to be at the tip
of a future documentation or release branch. Phase 6C must build from that source without silently
substituting a later package tree. A required correction creates a new reviewed freeze identity and
repeats affected evidence.

## Freeze contents

The proposed v1 release remains exactly:

- the accepted core, token, theme, and element entry points and root symbols as one synchronized
  foundation family;
- the independently versioned four-icon runtime and its two equivalent public specifiers;
- the independently versioned React 19 client binding over the accepted elements contracts;
- Apache-2.0 package copies, package-specific READMEs, exact identity metadata, and the accepted
  changelog, migration, deprecation, security, support, and release-note baselines;
- the accepted `0.1.0`, `^0.1.0`, React, TypeScript, Node, side-effect, source-map, and
  packed-script policies; and
- the accepted current-engine and input/accessibility support claims, including every explicit
  unclaimed environment.

`@wayglass/testing`, ESLint configuration, examples, reference applications, Storybook, VitePress,
experiments, provider guidance, token/icon tooling, visualization proof, SpaceTraders work, release
automation, and deployment infrastructure remain outside the npm release set. They may supply
evidence or documentation but do not become public package contracts by proximity.

## Validation environment

The integrated run used the clean tracked tree at `ce400e8` on one Apple Silicon host:

| Item             | Version or identity                                        |
| ---------------- | ---------------------------------------------------------- |
| Operating system | macOS 26.6.2, build 25G83, arm64                           |
| Node             | 26.8.1                                                     |
| pnpm             | 11.9.0                                                     |
| TypeScript       | 6.0.3                                                      |
| Playwright       | 1.62.0                                                     |
| Chromium         | Chrome for Testing 151.0.7922.34, Playwright revision 1234 |
| Firefox          | 153.0, Playwright revision 1538                            |
| WebKit           | 26.5, Playwright revision 2336                             |

The accepted compatibility record separately contains the minimum Node 22.13 Linux, TypeScript
5.9.3, React 19.0.0, and isolated typed-consumer evidence. No package source changed after that
record and before `ce400e8`; this integrated run revalidated the current end of each accepted range.
Phase 6C must repeat minimum/current checks against projected packed manifests and emitted
declarations.

## Integrated matrix

### Repository gate

`TURBO_FORCE=true pnpm check` passed with all Turbo caches bypassed:

- formatting and full-repository ESLint passed;
- generated token output remained unchanged and authenticated to `ce400e8`;
- all 14 scheduled builds passed with zero cache hits, including the six candidates, VitePress,
  Storybook, examples, and reference applications;
- all 20 scheduled typecheck tasks passed with zero cache hits;
- all 20 scheduled test tasks passed with zero cache hits;
- all 208 documentation and governance assertions passed;
- all 58 private icon-pipeline tests and the four-icon/four-artifact integrity check passed;
- all 93 private token-tooling tests and the 528-token, 197-override, three-web-artifact, and
  seven-exchange-file integrity check passed; and
- the retained private visualization proof passed typechecking and all 24 unit tests.

The command left the tracked tree unchanged.

### Browser, accessibility, visual, and performance gate

Playwright listed 1,515 cases in 54 files, 505 per engine. The full first run completed in 3.5
minutes:

| Engine                 | Scheduled |    Passed | Intentionally skipped | Failed |
| ---------------------- | --------: | --------: | --------------------: | -----: |
| Chromium 151.0.7922.34 |       505 |       505 |                     0 |      0 |
| Firefox 153.0          |       505 |       481 |                    24 |      0 |
| WebKit 26.5            |       505 |       481 |                    24 |      0 |
| **Total**              | **1,515** | **1,467** |                **48** |  **0** |

The 24 skips in each non-Chromium project are explicit Chromium-only performance thresholds or
Tier-B presentation/adaptation permutations. Chromium executed them; Firefox and WebKit executed the
shared semantic, keyboard, focus, registration, React parity, native form, responsive, forced-color,
reduced-motion, RTL, automated accessibility, visual adaptation, and retained-proof paths. No failed
browser case was retried into a pass.

This automated matrix preserves the accepted support boundary. It does not become human
screen-reader evidence, a physical-device result, WCAG certification, or support for every branded
browser derived from an engine. The accepted tabs and core-control VoiceOver/Safari tasks remain the
only v1 task-observed assistive-technology evidence; every other manual procedure remains a future
claim gate.

### Package, dependency, license, and security gate

Source-manifest `npm pack --dry-run --json` inspection after the successful build produced:

| Package              | Entries | Packed bytes | Unpacked bytes |
| -------------------- | ------: | -----------: | -------------: |
| `@wayglass/core`     |      24 |        7,941 |         25,619 |
| `@wayglass/tokens`   |      18 |       46,598 |        411,817 |
| `@wayglass/themes`   |      17 |       18,213 |        138,982 |
| `@wayglass/elements` |     305 |      139,188 |        872,578 |
| `@wayglass/icons`    |      20 |       11,175 |         44,302 |
| `@wayglass/react`    |     272 |       26,187 |        151,852 |

Each dry-run contained only `dist`, `README.md`, `LICENSE`, `NOTICE`, and `package.json`; the
executable stewardship guard confirmed byte-identical Apache license and notice copies. Built maps
contained no `sourcesContent`, macOS/Linux/Windows absolute path, or authored-source inclusion.
Candidate manifests retained no lifecycle hook.

These are source-manifest inspection measurements, not approved tarball hashes. Source manifests
still contain repository-only scripts and development dependencies by design. Phase 6C must apply
the accepted deterministic manifest projection, build in a clean checkout, create actual tarballs,
record SHA-256 hashes, inspect them, and install them into clean Vanilla and React consumers.

The current production dependency audit reported no known vulnerability. Production dependency
licenses were MIT and BSD-3-Clause only. This dated result supports the freeze review but must be
repeated for the exact release candidate and again when required by release governance.

## Adverse run and observation log

1. The first sandboxed `pnpm check` attempt reached pnpm's lockfile supply-chain verification but
   could not resolve registry metadata. It was interrupted during retries; no product test had run
   and no source or lockfile changed. The identical cache-bypassed command passed with permitted
   registry access. This is an environment correction, not a product retry.
2. Storybook completed with its retained chunks-over-500-kB warning and a Node `module.register()`
   deprecation emitted by the current toolchain. Storybook is not a release unit; Phase 6D owns
   delivery optimization and current deployment-tool review.
3. The browser fixture server retained the known Vite pre-scan warning for one fixture's bare `lit`
   import. The import resolved during execution and all affected paths passed in every engine.
4. Lit development-mode messages, intentional invalid-anatomy diagnostics, and the deliberately
   rejected unknown Phase 5C candidate appeared only in tests designed to exercise those paths.
5. `npm pack --dry-run` reported that npm does not recognize two pnpm-specific `.npmrc` keys. The
   dry-runs passed; Phase 6C uses the accepted package process rather than treating npm as the
   workspace manager.

None changes a supported runtime contract or masks a failed assertion. They remain visible so a
later stage can distinguish known tooling noise from a regression.

## Blocker classification

For this freeze, a **severity-one blocker** is a credible security, secret-exposure, destructive,
data-loss, or package-integrity defect. A **severity-two blocker** makes an accepted package surface
unusable, materially inaccessible inside the claimed matrix, incorrectly registered, incompatible
with its accepted range, or unreproducible from the committed source. This local definition makes
the Phase 6B exit decision reviewable; it is not a public incident-response promise.

No unresolved severity-one or severity-two blocker was found. The observations above are non-failing
tooling or evidence-boundary items. The deliberately unclaimed assistive-technology,
physical-device, embedded-runtime, autofill/password-manager, provider, and server-rendering
environments are support boundaries rather than hidden blockers.

## Acceptance effect

Acceptance freezes `ce400e89930a047c6af1c6992c64cfe422a1eeee` as the exact source for the Phase 6C
release-candidate proof, closes Phase 6A correction 12, completes the Phase 6B exit gate, and
authorizes Phase 6C validation work only.

It does not remove `private: true`, change candidate versions, create package or release tags, make
the repository public, create or upload an npm artifact, create release automation, use release
credentials, deploy documentation, or activate public support. Any of those actions retains its
separate proposal, evidence, and approval gate.

## Project-owner decision

Accepted on September 4, 2026. The project owner approved the exact candidate source, integrated
evidence, blocker classification, and support boundaries recorded here. Phase 6B is complete and
Phase 6C release-candidate validation is authorized. Publication, tagging, repository-visibility
changes, deployment, credentials, and public support activation remain separately gated.
