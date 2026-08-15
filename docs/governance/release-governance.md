# Wayglass release-governance contract

**Status:** Accepted for Phase 5A on August 15, 2026. This contract defines release readiness and
publication controls. It does not make the repository public, change package privacy or versions,
create automation, deploy documentation, reserve a package, or publish an artifact.

This contract follows [ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md).
Wayglass, the `@wayglass` npm organization, Apache-2.0 license, and planned documentation origin are
confirmed by ADR 0022. Release authority remains separate from identity and architecture.

## Current state

As of August 15, 2026:

- `Actesis/Wayglass` is a private GitHub repository;
- all workspace packages are private and use version `0.0.0`;
- no `@wayglass` package exists on the npm registry;
- the root contains Apache-2.0 `LICENSE` and `NOTICE` files;
- production packages expose built files through explicit exports, but package-level repository,
  homepage, description, engine, support, and compatibility metadata is incomplete;
- no release workflow, public CI, changelog system, registry trust relationship, provenance record,
  or recovery rehearsal exists; and
- representative assistive-technology gates remain incomplete for interactive runtime surfaces.

These are expected pre-release conditions, not permission to fill gaps opportunistically. Changes to
repository visibility, npm state, package privacy, versions, automation permissions, or release
credentials require the approval points below.

## Candidate release inventory

| Artifact                  | Tier                         | Release unit                   | Current disposition                                   |
| ------------------------- | ---------------------------- | ------------------------------ | ----------------------------------------------------- |
| `@wayglass/core`          | Foundation runtime           | Synchronized foundation family | Candidate; not release-ready                          |
| `@wayglass/tokens`        | Foundation runtime           | Synchronized foundation family | Candidate; not release-ready                          |
| `@wayglass/themes`        | Foundation runtime           | Synchronized foundation family | Candidate; not release-ready                          |
| `@wayglass/elements`      | Foundation runtime           | Synchronized foundation family | Candidate; blocked by manual support gates            |
| `@wayglass/icons`         | Optional runtime             | Independent                    | Candidate; separate compatibility record required     |
| `@wayglass/react`         | Framework binding            | Independent                    | Candidate; peer and rendering support record required |
| `@wayglass/testing`       | Build and validation tooling | Independent                    | Candidate; public-helper inventory required           |
| `@wayglass/eslint-config` | Build tooling                | Independent                    | Repository-private until separately chartered         |
| `apps/*`, `examples/*`    | Examples and guidance        | Never npm release units        | Private by architecture                               |

An ecosystem charter may add a candidate. Inclusion in this table, `packages/`, documentation,
Storybook, or a release rehearsal does not approve publication.

## Readiness states

Every release unit moves through explicit states:

1. **Private:** `private: true`, version `0.0.0`, no registry artifact or public support claim.
2. **Candidate:** package contents, metadata, compatibility, validation, and support scope are under
   review; it remains private.
3. **Packed candidate:** reproducible tarballs and clean-install evidence exist locally or as
   private CI artifacts; nothing is sent to npm.
4. **Publish approved:** one release proposal names exact artifacts, versions, commit, tags,
   evidence, known limitations, and human approval. Only this state may remove `private: true` in
   the release change.
5. **Staged:** an existing npm package version is held in npm's staging area for inspection and 2FA
   approval; it is not public.
6. **Released:** registry contents, provenance, tags, installation, documentation, and release
   record have been verified after publication.
7. **Deprecated or withdrawn:** registry guidance names the replacement, limitation, or incident;
   the immutable release record remains.

State transitions are recorded in reviewed repository changes or a release record. A local command,
successful CI job, tag, GitHub release, or staged npm artifact is insufficient on its own.

## Version and compatibility policy

### Foundation family

`core`, `tokens`, `themes`, and `elements` use one SemVer version and one compatibility baseline.
Every foundation release updates all four manifests, even if one package's bytes are unchanged. The
release record identifies which packages changed materially.

Before `1.0.0`:

- patch releases fix compatible defects and documentation without intentionally breaking public
  contracts;
- minor releases may change a public contract only when the release proposal labels the break,
  supplies migration guidance, and explains why pre-1.0 compatibility cannot be preserved; and
- prereleases use SemVer prerelease identifiers and a non-`latest` npm dist-tag.

At and after `1.0.0`, incompatible public-contract changes require a major version. Deprecation is
preferred before removal whenever safety or security does not require immediate action.

### Independent artifacts

Icons, React, testing, future optional runtime packages, integrations, tools, wrappers, and design
artifacts use independent SemVer versions. Their manifests and support records name compatible
foundation, framework, provider, or design-tool ranges. A known-compatible Wayglass release set may
be documented without forcing identical versions.

### Version selection and tags

This contract does not choose the first public version. Each initial release proposal justifies its
stability level and version from the accepted public surface.

- Foundation Git tags use `foundation-v<version>`.
- Independent npm artifacts use `<artifact>-v<version>`, such as `react-v<version>`.
- Prereleases use an explicit non-`latest` dist-tag such as `next`.
- The `latest` dist-tag moves only through an approved stable-release record.
- Published versions are immutable and are never rebuilt or reused.

## Required package contents and metadata

Before a package becomes publish approved, its packed tarball must contain only the reviewed runtime
or tool surface and the metadata required to understand it.

Required package metadata includes:

- exact `name`, approved `version`, description, `license: "Apache-2.0"`, homepage, funding when
  applicable, author or contributor attribution, and keywords that do not overstate capability;
- an exact, case-correct public `repository` URL plus package directory when needed;
- supported Node, browser, framework, or provider engines where enforceable;
- explicit `exports`, types, files, side-effect declarations, dependencies, optional dependencies,
  and peer dependencies;
- `publishConfig` with the npm registry and public access for an approved public scoped package;
- README usage, registration, support, compatibility, security-reporting, and migration links; and
- Apache-2.0 `LICENSE` and `NOTICE` content in the tarball.

The tarball must exclude secrets, credentials, local paths, private fixtures, screenshots with
sensitive data, unpublished plans, tests unless intentionally public, caches, coverage, editor
state, and unrelated source. Source maps and authored source files require an explicit package-level
decision rather than accidental inclusion.

Packed internal dependencies must resolve to approved registry SemVer ranges, never `workspace:*`,
filesystem paths, or unpublished package versions. CSS and other intentional side effects must be
declared accurately. Importing a runtime module must not register a Custom Element implicitly.

## Release evidence

Every release proposal links one immutable evidence record containing:

- release unit, exact versions, commit, Git tag, npm dist-tag, date, and approver;
- public API and package-content diff from the prior release or accepted baseline;
- changelog, migration notes, deprecations, known limitations, and support scope;
- dependency, license, notice, vulnerability, bundle, install-script, and side-effect audit;
- `pnpm check`, relevant full browser matrix, manual assistive-technology results, and tier-specific
  validation required by the Phase 5 plan;
- deterministic pack manifests, tarball hashes, unpacked size, dependency ranges, and clean consumer
  install, import, typecheck, build, and runtime smoke results;
- provenance source, workflow identity, and verification result;
- documentation build and links for the exact version; and
- publish, partial-failure, deprecation, and recovery results.

Cached results may support development but do not replace a clean release build. Release evidence
uses a clean checkout and the committed lockfile. Release jobs do not restore dependency or build
caches.

## Approval and publication workflow

### 1. Prepare a release proposal

A reviewed release proposal updates versions, dependency ranges, changelog, package metadata,
support scope, release evidence template, and any migration documentation. It names every manual or
external gate as passed, excluded from the release surface, or blocking. Ordinary feature pull
requests do not publish.

The proposal must pass the complete candidate validation in a clean environment. The generated
tarballs are unpacked and inspected, then installed into temporary Vanilla and typed consumer
projects without workspace links. Foundation-family consumers test the family together; independent
artifacts test both their minimum and current supported peer ranges where practical.

### 2. Approve repository and registry prerequisites

Public provenance currently requires a public source repository. Because `Actesis/Wayglass` is
private, an explicit repository-visibility decision is a hard prerequisite for a provenance-bearing
public npm release. This contract does not change visibility.

Before any publish:

- the release commit is on protected `main` with required checks complete;
- release tags are protected and created only for the approved commit;
- the GitHub-hosted release workflow and every third-party action are reviewed and pinned to a full
  commit SHA;
- workflow permissions are minimal and explicit;
- npm organization ownership, maintainer 2FA, package access, and recovery contacts are verified;
- the public repository metadata exactly matches every package's `repository` field; and
- no fork, pull-request workflow, untrusted script, or self-hosted runner can reach publish
  authority.

### 3. Bootstrap a brand-new npm package deliberately

npm staged publishing requires an existing registry package, so the first version of each package
uses a one-time bootstrap path. The approved initial-release workflow:

1. runs on a GitHub-hosted runner from the protected release commit;
2. receives one short-expiry granular npm token through a protected release environment;
3. has the minimum organization scope needed to create the named public packages;
4. builds without caches, repeats candidate validation, and directly publishes with explicit public
   access and provenance;
5. publishes the foundation family in dependency order from one precomputed artifact set;
6. verifies registry metadata, tarball hashes, provenance, and clean installation; and
7. immediately revokes the bootstrap token.

The bootstrap credential is never written to a file, echoed, exposed to package lifecycle scripts,
or retained for normal releases. If npm supports pre-publication trusted-publisher configuration for
new packages at implementation time, the release proposal must re-evaluate and prefer that tokenless
path.

After each package exists, configure its trusted publisher to the exact GitHub organization,
repository, workflow filename, and release environment. Allow `npm stage publish` but not direct
`npm publish`, require 2FA and disallow traditional publish tokens at the package level, then verify
and record the configuration.

### 4. Stage subsequent releases with OIDC

Normal releases use npm trusted publishing from the pinned GitHub-hosted workflow. The job receives
only `contents: read` and `id-token: write` permissions needed for checkout and OIDC. It holds no
long-lived npm write token.

The workflow sends each existing package to npm with `npm stage publish`, explicit access and
dist-tag, and the precomputed tarball. Trusted publishing supplies short-lived authentication and
automatic npm provenance for public packages built from the public repository.

A maintainer then:

1. lists and views every staged version;
2. downloads and compares each staged tarball and hash with the approved candidate;
3. verifies package metadata, dependency order, provenance expectation, and dist-tag;
4. rejects any mismatch; and
5. approves each correct staged package interactively with 2FA.

OIDC is not used to approve or reject staged artifacts. Human proof of presence is intentional.

### 5. Verify before announcing

After registry publication, the release job or maintainer verifies:

- exact version, access, dist-tag, maintainers, repository link, license, notice, signatures, and
  provenance;
- registry tarball hash and contents against the approved artifact;
- clean installation and representative runtime or tool use from the public registry;
- documentation and migration links; and
- the complete foundation family or independent release unit is available.

Only then may the GitHub release, documentation, and project channels describe the version as
released. Documentation deployment remains a separate approved workflow and must not race ahead of
registry verification.

## Partial failure and recovery

npm publication is not atomic across packages. The release record contains a dependency-ordered
recovery plan before the first package becomes public.

- If staging fails, approve nothing; reject incorrect stages and create a new version when npm's
  version uniqueness requires it.
- If a foundation bootstrap or approval stops partway, publish the remaining approved artifacts only
  when they exactly match the precomputed release set and doing so restores the tested family.
- If the set cannot be completed safely, deprecate the partial versions with a precise warning,
  advance the entire foundation family to a new version, and rebuild from a new approved commit.
- Never overwrite a published version or move a release tag to different source.
- Prefer a corrective patch or deprecation over unpublishing. Unpublish is reserved for an approved
  legal, secret-exposure, malware, or severe safety response that satisfies npm policy.
- A deprecated or unpublished `name@version` is never reused.
- Dist-tags may move to a previously verified safe version as incident mitigation, with the change
  recorded and announced.

A security or release incident pauses all publication authority until credentials, trusted-publisher
configuration, workflow source, registry state, affected versions, and consumer guidance are
audited.

## Support and human gates

Publishing code and claiming support are separate decisions, but public publication may not bypass
an existing gate by calling the version experimental.

- Interactive runtime packages require the representative VoiceOver/Safari and NVDA/Firefox results
  attached to their released surface, or an explicit release scope that excludes the affected
  component or workflow.
- Mobile assistive-technology support requires VoiceOver with iOS Safari.
- Framework bindings require direct-use parity and supported framework-version evidence.
- Integrations require deterministic fixtures plus a named real provider environment; mocks alone do
  not establish provider compatibility.
- Tool and design artifacts require determinism, drift, version, and target-tool evidence rather
  than inheriting runtime browser claims.
- Documentation, Storybook, examples, and walkthroughs state whether they are normative contracts,
  supported examples, or illustrative evidence.

No release note may convert local performance measurements, automated accessibility checks,
synthetic integration fixtures, or implementing-agent visual review into a universal support claim.

## Changes that still require explicit approval

This contract does not authorize:

- making `Actesis/Wayglass` public;
- removing `private: true` or changing a package from `0.0.0`;
- creating npm packages, trusted publishers, granular tokens, workflows, environments, tags, GitHub
  releases, or documentation deployments;
- selecting the initial public version or stability label;
- choosing a changelog or release automation dependency;
- publishing a prerelease, test package, placeholder, reserved name, or empty package;
- granting another maintainer, automation identity, provider, or integration access; or
- collecting analytics, credentials, personal data, or private registry information.

Each action belongs to a reviewed implementation or release proposal with a reversible dry run where
the platform permits one.

## External basis

This contract was verified on August 15, 2026 against primary platform guidance:

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), including OIDC, stage-only
  permissions, token restrictions, hosted-runner limits, and automatic provenance;
- [npm staged publishing](https://docs.npmjs.com/staged-publishing/), including the existing-package
  prerequisite, downloadable staged tarballs, and interactive 2FA approval;
- [npm provenance statements](https://docs.npmjs.com/generating-provenance-statements/), including
  public repository and supported hosted-CI requirements;
- [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/),
  including explicit public access;
- [npm unpublish policy](https://docs.npmjs.com/policies/unpublish/), including immutable version
  identity and deprecation as the normal recovery path; and
- [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use),
  including minimal permissions and full-commit-SHA action pinning.

Platform capabilities may change. The release proposal re-verifies these requirements before adding
automation or publishing.
