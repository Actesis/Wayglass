# Phase 5B formal validation

This record consolidates charter rows `P5B-E01` through `P5B-E10` on 2026-08-15. It moves the
private proof to evidence review; it does not accept an artifact, approve a dependency, establish a
public contract, or authorize publication.

## Result

The bounded proof completed its precommitted evidence plan. Rows `P5B-E01`, `P5B-E02`, `P5B-E03`,
`P5B-E05`, `P5B-E06`, `P5B-E07`, `P5B-E08`, `P5B-E09`, and `P5B-E10` pass within their named
envelopes. `P5B-E04` is a qualified pass: the proof validates its pinned, representable DTCG 2025.10
subset and reports every omission, but neither an external conformance suite nor a target tool has
validated the output.

The evidence is sufficient for a project-owner disposition. It is not sufficient for a DTCG
conformance claim, design-tool compatibility, a separate package, or a permanent production
artifact.

## Authenticated environment matrix

The deterministic fingerprint ran from clean commit `003bc8b56876a2335ece615a80806e66a17a8a76` on
Apple silicon with macOS 26.5.2 and pnpm 11.9.0. The official Node 22.13.0 archive was authenticated
against Node.js `SHASUMS256.txt`; both the published and locally calculated archive SHA-256 were
`bc1e374e7393e2f4b20e5bbc157d02e9b1fb2c634b2f992136b38fb8ca2023b7`.

| Runtime      | Locale        | Time zone          | Launch directory | Result                    |
| ------------ | ------------- | ------------------ | ---------------- | ------------------------- |
| Node 26.4.0  | `C`           | `UTC`              | Repository root  | Pass; fingerprint matched |
| Node 26.4.0  | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; fingerprint matched |
| Node 22.13.0 | `C`           | `UTC`              | Repository root  | Pass; fingerprint matched |
| Node 22.13.0 | `en_US.UTF-8` | `Pacific/Auckland` | `/private/tmp`   | Pass; fingerprint matched |

The complete 49-test experiment suite also passed under Node 22.13.0. The current-runtime full
repository gate passed under Node 26.4.0. Tests independently reverse raw input order, exercise one
meaningful source-value change, and compare exact artifacts.

## Common fingerprint

Every matrix case reported the same normalized graph and artifact measurements:

- graph: 528 tokens, four modes, and 197 overrides;
- web tokens: 38,607 bytes, SHA-256
  `b253b9a03c856a8a4b619f4c7b53042b32a5234ae3126b6963392ad188aa1263`;
- web themes: 79,109 bytes, SHA-256
  `00a0c6bb7342c4f1d79aac93244732e5f16564a4943c65171e80d98fb48cfa92`;
- exchange status: `partial-dtcg-2025.10-candidate`, with 524 included tokens, four documented
  omitted tokens, and zero omitted overrides.

| Exchange file                     |   Bytes | SHA-256                                                            |
| --------------------------------- | ------: | ------------------------------------------------------------------ |
| `modes/density/comfortable.json`  |  22,069 | `27678d80d3340fb6add3965e2862afb2de9745628f1579ee58cdec6b2e2e7f72` |
| `modes/density/compact.json`      |  21,793 | `28df8b07915ed81d458973b53f814f58f9749ff4d18b0682d724ffa7da27ca4e` |
| `modes/theme/wayglass-dark.json`  |  12,630 | `fd21c7b6843cfff9e83fc0608085e43880e7b5e58e059c76de8103d297696e89` |
| `modes/theme/wayglass-light.json` |  13,095 | `1fcee330818528588a4f7e096d51f403bc92bf9ed9aaf1338ca6b2ef672657c7` |
| `resolver.json`                   |   1,358 | `813e71cbe835302775bfa7dfcd7a719df8202f260fae4eb10db03aca20b6f799` |
| `tokens.json`                     | 241,217 | `b58a94e49d6cc7de744cc7387710f99662a5cde2882da7bd78490b9b697595d8` |
| `wayglass-manifest.json`          |  63,373 | `774294957845329cab982b64c3f5207827fab511de71a600a1929ae468b74ba1` |

The four omissions are the `4ch`, `1fr`, and `1.5fr` dimensions that the pinned DTCG dimension shape
cannot represent, plus the component alias whose target is omitted. The manifest names each source
identity and reason; the proof does not silently coerce them.

## Evidence-row findings

### `P5B-E01` — task and ownership: pass

A focused test changes `color.reference.blue.500` once in the normalized authoritative graph. The
web transform changes only the corresponding CSS declaration, the exchange changes only
`tokens.json`, and interchange identities and omission records remain stable. Documentation alone
can describe this ownership but cannot enforce propagation, identity preservation, or targeted
drift. The owned projection therefore adds reusable safety within the proof. No external consumer
has yet shown that this safety requires a permanent package.

### `P5B-E02` — public surface and isolation: pass

The experiment remains outside workspace package globs and has no package manifest, runtime export,
Custom Element registration, dependency, lockfile change, generated production artifact, network
operation, or import-time write. The full repository build and tests pass with the proof present.

### `P5B-E03` — semantic fidelity: pass

Tests account for every source token and official override exactly once; preserve reversible dotted
identity, type, alias, role, description, deprecation, theme, and density metadata; and keep
condition, knowledge, activity, selection, and Boolean assertion separate when values share a
reference. Adverse fixtures reject duplicate or invalid identities, missing and mismatched aliases,
cycles, empty descriptions, missing mode targets, and mode self-aliases.

### `P5B-E04` — DTCG compatibility: qualified pass

Tests validate nested identities, `$root` use, structured values for every currently supported
primitive, references, orthogonal resolver contexts, and optional namespaced Wayglass extensions
against the proof's pinned interpretation of the 2025.10 format, color, and resolver reports. Four
unrepresentable dimensions are explicit omissions. This is internal structural validation of a
partial candidate, not DTCG conformance or evidence that any design tool accepts the files.

### `P5B-E05` — web compatibility: pass

The normalized graph reproduces current base-token CSS and theme/density CSS byte for byte and keeps
CSS custom-property identities stable. Existing package, browser, documentation, example, and
Storybook gates pass. Forced-colors behavior remains explicit web runtime policy rather than being
misrepresented as an exchange token. This result preserves the existing support matrix; it does not
expand it.

### `P5B-E06` — determinism and drift: pass

The four-case runtime, locale, time-zone, and launch-directory matrix produced identical
fingerprints. Tests also reverse source order and verify identical files and measurements. A single
meaningful source-value change creates stable, targeted output drift. Filesystem evidence covers one
APFS/macOS host only; it does not establish cross-platform filesystem behavior.

### `P5B-E07` — failure and recovery: pass within the simulated envelope

Tests fail invalid graphs and artifact sets before acceptance, protect existing accepted releases,
use immutable content-addressed release directories, advance the pointer atomically, clean an
ordinary partial write, and recover simulated stale-stage and orphan-release states. Diagnostics are
stable and actionable in the exercised cases. The proof does not exercise process kill timing, power
loss, concurrent writers, disk exhaustion, permission changes, or non-APFS filesystems.

### `P5B-E08` — performance and capacity: pass

The retained Node 26 and corrected-minimum Node 22.13 records measure cold and repeated work, peak
memory, output size, and an exact 10× synthetic corpus without inventing a threshold after results.
The Node 22.12 record remains adverse historical evidence for the corrected runtime floor. Results
are synthetic observations from one machine, not a general performance guarantee.

### `P5B-E09` — dependency and maintenance: pass

The exact-version comparison evaluates Style Dictionary 5.5.1 and `@tokens-studio/sd-transforms`
2.0.3. Style Dictionary remains eligible for a future isolated prototype, but the bounded projection
required no repository dependency. Published metadata and source review do not substitute for a
parity implementation or maintenance commitment.

### `P5B-E10` — documentation and cleanup: pass

The retained documentation-and-cleanup record verifies links, samples, unsupported-claim language,
workspace isolation, generated-output absence, and proof residue cleanup. The formal fingerprint is
an explicit local validation command and produces no accepted repository output.

## Limitations and disposition impact

- There is no external consumer, target design tool, importer, or non-web platform transform.
- The output is a documented partial candidate, not a DTCG conformance surface.
- Cross-runtime determinism was observed on one operating system, architecture, and filesystem.
- Writer recovery covers controlled fixtures, not concurrent processes or physical interruption.
- The proof demonstrates that an owned projection can be safer than documentation alone; it does not
  demonstrate the repeated consumer boundary required for a separate package.
- No evidence authorizes production exports, dependency adoption, publication, deployment,
  bidirectional editing, or permanent retention.

The project owner can now choose the charter's formal disposition. Until that decision, the private
proof remains review evidence and all public or production follow-up stays blocked.

## Reproduction

From the exact clean commit being evaluated:

```sh
pnpm experiment:phase5b:check
WAYGLASS_SOURCE_REVISION=<full-checked-out-commit> pnpm experiment:phase5b:fingerprint
pnpm check
git diff --check
git status --short --ignored experiments/phase-5b-token-interchange
```

Runtime, locale, time-zone, and launch-directory variation requires invoking the same committed
Vitest fingerprint configuration with the chosen authenticated Node binary and environment. The test
rejects a source-revision mismatch or tracked changes.
