# Phase 5B transformer-candidate comparison

This completes the research required by charter row `P5B-E09`. It compares exact published versions
without adding either candidate to the Wayglass workspace, lockfile, generated artifacts, or runtime
graph.

## Decision

Retain **Style Dictionary 5.5.1** as a qualified candidate for a future isolated build-tool
prototype, but do not adopt it in Phase 5B. It is maintained, extensible, Apache-2.0 licensed,
typed, and capable of producing web and non-web outputs. It does not replace the proof's
Wayglass-owned normalization, identity mapping, orthogonal theme/density resolver, omission
accounting, artifact manifest, or content verification. Its own documentation also says support for
the latest DTCG 2025.10 format is not yet complete.

Do not adopt **`@tokens-studio/sd-transforms` 2.0.3** unless a later charter selects Tokens Studio
as an authorized source format. It is a maintained, typed companion to Style Dictionary, but its
platform gap is Tokens Studio export normalization. Wayglass has no approved Tokens Studio source,
design-tool access model, or second token authority.

No external transformer is approved by this result. A future dependency proposal must rerun
security, capability, parity, and cost checks against the then-current exact versions.

## Method and sources

Observed on 2026-08-15 from:

- the exact npm registry manifests and tarballs for
  [`style-dictionary@5.5.1`](https://www.npmjs.com/package/style-dictionary/v/5.5.1) and
  [`@tokens-studio/sd-transforms@2.0.3`](https://www.npmjs.com/package/@tokens-studio/sd-transforms/v/2.0.3);
- the tagged
  [Style Dictionary manifest](https://github.com/style-dictionary/style-dictionary/blob/v5.5.1/package.json)
  and
  [`sd-transforms` manifest](https://github.com/tokens-studio/sd-transforms/blob/v2.0.3/package.json);
- the official [Style Dictionary DTCG statement](https://styledictionary.com/info/dtcg/), release
  history, and security advisories; and
- temporary npm package-lock-only resolutions with scripts disabled, followed by `npm audit`.

The temporary resolutions installed no package contents and changed no repository file. Published
tarballs were extracted only to count files and declarations. All temporary artifacts were removed
after recording the observations.

## Package and maintenance comparison

| Observation                         | Style Dictionary 5.5.1                                          | `sd-transforms` 2.0.3                                               |
| ----------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Role                                | General design-token build system, CLI, transforms, and formats | Tokens Studio preprocessor and transforms for Style Dictionary      |
| Release                             | 2026-08-07                                                      | 2025-12-10                                                          |
| Repository                          | Active, unarchived; latest release follows a security fix       | Unarchived; latest source push and release were 2025-12-10          |
| License                             | Apache-2.0; compatible with Wayglass Apache-2.0                 | MIT; notice-compatible, but an additional license family            |
| Module and runtime                  | ESM; Node `>=22.0.0`; compatible with Wayglass Node `>=22.13.0` | ESM; Node `>=18.0.0`; Style Dictionary `^5.0.0` peer                |
| Direct dependencies                 | 13                                                              | 6 plus the Style Dictionary peer                                    |
| Resolved dependency package entries | 106                                                             | 113 for Style Dictionary plus `sd-transforms`, seven more than base |
| Published package                   | 4,378,423 unpacked bytes; 701 files                             | 84,110 unpacked bytes; 57 files                                     |
| Type surface                        | 115 declaration files; 157,072 bytes                            | 27 declaration files; 8,513 bytes                                   |
| Executable surface                  | `style-dictionary` CLI plus module exports                      | One module export; no CLI                                           |
| Install lifecycle                   | No `preinstall`, `install`, or `postinstall` script             | No `preinstall`, `install`, or `postinstall` script                 |
| Browser/runtime bundle if isolated  | Zero; proposed placement is development-only build tooling      | Zero; proposed placement is development-only build tooling          |
| npm audit on resolved closure       | Zero known advisories at observation time                       | Zero known advisories in the combined closure at observation time   |

The package-entry counts exclude the temporary root project. They describe resolution count, not
unique maintainers or equivalent risk. Published `prepare` scripts are source-package workflows;
neither manifest declares dependency-install lifecycle scripts.

## Security assessment

Style Dictionary recently repaired two high-severity prototype-pollution paths in
`convertTokenData`:

- [GHSA-vj5c-m527-mpff](https://github.com/style-dictionary/style-dictionary/security/advisories/GHSA-vj5c-m527-mpff)
  affected versions `>=4.3.0 <5.4.4`; and
- [GHSA-xmr7-549p-98w3](https://github.com/style-dictionary/style-dictionary/security/advisories/GHSA-xmr7-549p-98w3)
  affected 5.5.0 and was patched in 5.5.1.

The prompt response and signed patch releases are positive maintenance evidence. The recurrence in
token-data path handling also means a future prototype must pin at least 5.5.1, treat input as
untrusted until validated by Wayglass, keep execution local and development-only, subscribe to
advisories, and rerun the audit during every update. A zero-result registry audit is a dated
observation, not proof that the dependency graph is vulnerability-free.

## Capability comparison against the Wayglass proof

| Required capability                                  | Style Dictionary 5.5.1                                                                    | `sd-transforms` 2.0.3                                                 | Current Wayglass ownership                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Read DTCG-shaped tokens                              | First-class DTCG syntax support, but official docs say 2025.10 support remains incomplete | Delegates to Style Dictionary and aligns Tokens Studio-specific types | Normalized graph accepts only reviewed authored TypeScript sources                |
| Produce web CSS                                      | Strong built-in formats and custom hooks                                                  | Adds vendor-oriented CSS transforms                                   | Exact parity compiler owns selectors, layers, themes, densities, and forced color |
| Produce a portable DTCG candidate                    | Conversion helpers exist; no Wayglass exchange, resolver, or manifest contract            | Not a general DTCG exchange writer                                    | Seven DTCG artifacts, orthogonal resolver, and partial-candidate manifest         |
| Preserve reversible identities and descriptions      | Possible through custom metadata and hooks                                                | Possible only through custom Style Dictionary integration             | Explicit reversible source/exchange identity map                                  |
| Preserve orthogonal theme and density modes          | Requires custom configuration and output orchestration                                    | Theme permutation helper targets Tokens Studio theme exports          | Explicit independent dimensions and deterministic resolver                        |
| Account for unsupported `ch` and `fr` values         | Does not remove the DTCG 2025.10 representational limit                                   | Does not remove the DTCG 2025.10 representational limit               | Manifest accounts for every omitted token and override                            |
| Hash, inventory, drift, and immutable-write evidence | Requires custom formats, actions, and filesystem policy                                   | No independent support                                                | Wayglass-owned verification, comparison, writer, and recovery proof               |
| Future native-platform output                        | Strong candidate with Android, iOS, Compose, and custom format support                    | Compose additions are Tokens Studio-oriented                          | Deferred until a named non-web consumer exists                                    |

Style Dictionary could eventually own generic parsing, transform orchestration, or platform
formatting while Wayglass adapters retain semantic and artifact policy. Adopting it now would add a
large dependency closure and a second graph model without eliminating the custom code that carries
the charter's decisive guarantees.

## Scripts, generated artifacts, and dependency direction

If later accepted, the dependency belongs only in an isolated build-and-validation tool. Production
CSS, DTCG JSON, manifests, and consumer packages must contain no import or installation requirement
for either candidate. Foundation runtime packages must not re-export the tool or execute it during
module import. Generation must remain explicit, deterministic, locally reproducible, and protected
by parity and drift checks.

No candidate script is adopted by this comparison. A future prototype would add one explicit
purpose-qualified repository command and would invoke a Wayglass-owned adapter rather than exposing
third-party configuration as public API.

## Removal and replacement

The current removal cost is zero because neither package was added. For any later prototype:

1. isolate exact dev dependencies, configuration, and adapters under the authorized experiment or
   build-tool boundary;
2. keep accepted generated output independent of the generator;
3. remove the explicit script, adapter, and exact dev dependencies together;
4. verify that the lockfile loses the complete candidate closure and no production manifest changes;
5. regenerate or restore artifacts with the Wayglass-owned transform; and
6. run parity, drift, type, test, documentation, and build gates before considering removal
   complete.

A replacement must meet the same capability, license, security, deterministic-output, type-cost, and
cleanup review. Similar output text is insufficient if identity, modes, manifests, omissions, or
failure behavior change.

## Limitations

- No candidate was executed against Wayglass inputs; this row compares maintenance and published
  capability, not behavioral parity.
- Registry sizes exclude the installed sizes of transitive packages; resolved entry counts do not
  measure disk deduplication.
- Repository activity and registry audits are dated observations and can change immediately.
- No non-web consumer or design-tool authority exists, so native output and Tokens Studio value are
  prospective rather than demonstrated requirements.
