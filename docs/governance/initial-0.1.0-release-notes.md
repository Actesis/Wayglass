# Wayglass 0.1.0 — draft release notes

Status: unreleased draft, not a release announcement. Proposed initial tag: `next`, subject to exact
owner approval. No registry version is asserted as available by this document.

## Release units

The proposed first feedback release contains the synchronized foundation family `@wayglass/core`,
`@wayglass/tokens`, `@wayglass/themes`, and `@wayglass/elements`, plus the independently versioned
`@wayglass/icons` and `@wayglass/react`. All start at `0.1.0`, under Apache-2.0; this is not `1.0.0`
stability. Compatible internal relationships use `^0.1.0`.

Core provides framework-neutral semantics/utilities. Tokens and themes supply the shared visual
language, official themes, and density roles. Elements provide domain-neutral layout, controls,
forms, feedback, operational data, and media/overlay contracts. Icons are optional reinforcement
with a deliberately small catalog. React provides thin client-rendered bindings, not a separate
component implementation or server-rendered internals.

Known-state condition, knowledge, and activity remain distinct from domain values. Boolean assertion
does not imply health. Direct element/icon imports do not register globals; applications call the
documented `defineWg*` functions and import CSS explicitly. A retained React wrapper uses its
accepted guarded client registration; importing solely for registration is unsupported.

## Compatibility and evidence

Proposed Node consumption range: `>=22.13.0 <27`; TypeScript: `>=5.9.0 <6.1.0`; React binding:
`>=19.0.0 <20`. These ranges follow ADR 0035. Publishing/staging tools have a separate, stricter
Node minimum and are not consumer runtime dependencies.

The [hosted rehearsal result](./hosted-publication-rehearsal-result.md) binds six exact
public-review archives, two identical offline builds, six independent consumers, 36 browser stage
cases, and 48 resolved/installed graph files. Chromium, Firefox, and WebKit were automated engine
tests; zero axe violations and page errors do not certify human accessibility or universal
compatibility.

Carry forward the [support matrix](../../SUPPORT.md) without broadening its human
assistive-technology, Windows/NVDA, physical mobile, embedded, PWA, Electron/Tauri, low-power
hardware, or real-provider claims. Historical VoiceOver/Safari observations cover only their exact
recorded tasks. Application domain logic, transport, authorization, hosting, and arbitrary CSS
remain application-owned.

The separately installed `@lit-labs/ssr-dom-shim@1.6.0` retains its accepted missing package-root
license/notice-file limitation; it is not bundled by Wayglass. Read the
[exact-source attribution and owner disposition](./ssr-dom-shim-license-review.md). Do not invent a
license file or treat the disposition as legal certification.

## Adoption and feedback

After registry verification and announcement, consumers should initially pin exact `0.1.0` versions
or explicitly select the approved feedback tag; unqualified install behavior must match the final
dist-tag decision. Do not install an npm-generated `0.0.0-stage` placeholder as if it were Wayglass.
Install instructions become active only after the real package set is verified.

Start with the [documentation](https://wayglass.hoagsoftworks.com/) and
[Storybook](https://wayglass.hoagsoftworks.com/storybook/); review package READMEs and the
[support policy](../../SUPPORT.md). Report reproducible issues with exact package/browser/runtime
versions and a minimal example; report vulnerabilities through [SECURITY.md](../../SECURITY.md), not
public issue details. No guaranteed response SLA is introduced.

Testing helpers, ESLint configuration, applications, examples, experiments, chart/adapter/provider
packages, and private tooling are not npm release units. The intended first real-world SpaceTraders
consumer is a separate project, not implemented or claimed as tested by this release. Pre-1.0 minor
contract changes require explicit migration guidance; patches remain compatible. Final publication,
provenance, registry-install validation, dates, and owner acceptance remain pending in the
[release proposal](./initial-npm-release-proposal.md).
