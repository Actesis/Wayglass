# Phase 5E Stage 3 scale and isolation evidence

- Date: 2026-08-31
- Subject revision: `fd5f517f1710e91fa87de14baf9348d075cb1b8c`
- GitHub validation:
  [Node 22.13/Linux run](https://github.com/Actesis/Wayglass/actions/runs/33469797789)
- External effects: one temporary credential-free GitHub Actions job; no Home Assistant connection,
  credential, provider mutation, deployment, or publication

## Result

Stage 3 passes the accepted scale, runtime, isolation, comparison, removal, and regression gates.
The fixed 100-binding snapshot and 1,000-message stream preserve final semantics across ordered,
duplicate, older, unknown, unavailable, removal, recovery, and final updates. Both measured
environments remain below the precommitted 100 millisecond median and 32 MiB retained-heap limits.

| Environment                                  |   Median |      p95 |  Maximum |   Variance | Retained heap growth | Result |
| -------------------------------------------- | -------: | -------: | -------: | ---------: | -------------------: | ------ |
| macOS 26, Apple M4, Node 26.4.0, pnpm 11.9.0 |  9.31 ms |  9.86 ms | 11.12 ms | 0.1162 ms² |         36,280 bytes | Pass   |
| Ubuntu 24.04, x64, Node 22.13.0, pnpm 11.9.0 | 38.76 ms | 45.48 ms | 49.13 ms | 6.0567 ms² |         45,280 bytes | Pass   |

Each record contains all 50 measured durations after five warmup runs. These timings measure only
the pure reducer and validation path; they do not include network, Home Assistant, serialization,
browser rendering, device, or command latency.

Raw records:

- [current macOS capacity](./raw/stage-3-capacity-node-26-macos.json)
- [Node 22.13/Linux capacity](./raw/stage-3-capacity-node-22-linux.json)
- [current macOS isolation](./raw/stage-3-isolation-node-26-macos.json)
- [Node 22.13/Linux isolation](./raw/stage-3-isolation-node-22-linux.json)
- [comparison](./raw/stage-3-comparison.json)

## Direct application-owned comparison

Both paths complete the same four-entity snapshot, change, removal, and acknowledged-then-confirmed
request task. The direct path is the smaller choice for one application: its source and focused
tests contain 257 nonblank lines, compared with 977 for the candidate's shared model, types,
validation, and focused tests. This comparison intentionally records that adverse result rather than
treating reuse as inherently valuable.

The direct path also repeats the four provider identities in eight selection sites, accepts a
malformed timestamp, and provides no stable provider-envelope diagnostic. The candidate centralizes
four application binding records and rejects the same malformed input with `P5E_HA_TIMESTAMP`. Its
larger implementation supplies reusable ordering, missing-knowledge, validation, and
acknowledgement/effect behavior. Both paths correctly leave entity selection, labels, formatting,
condition, desired-state meaning, authorization, optimistic policy, and timeouts with the
application.

This is safer failure behavior within the fixed success criterion, but one synthetic consumer does
not justify a public adapter. The evidence supports disposition review among guidance, a private
example, or an independently versioned integration candidate only if a second credible consumer and
maintainer are named.

## Isolation, security, and removal

The current post-build audit scanned 210 production source files, 861 built JavaScript/CSS/HTML
files, and 27 proof executable/JSON files. The Linux audit scanned 206 production source files, 857
built files, and 23 proof files. Both found:

- zero proof runtime markers in production source or built output;
- zero proof references in `pnpm-lock.yaml` and no dependency or package delta;
- zero secret-shaped values, credential-bearing messages, or endpoint URLs;
- zero unexpected references outside the private proof and retained governance documentation; and
- an exact removal plan that deletes the proof and its six root commands without leaving a proof
  reference in the remaining root scripts.

The proof still defines no Custom Element, import-time registration, network client, environment
credential read, real timer, random source, browser route, production export, or live log. The
temporary validation workflow was deleted after its artifact was retained. Removing the proof does
not change a core package, reference application, or browser bundle.

## Validation

- `pnpm experiment:phase5e:check`: 8 files and 41 tests pass on the current environment and in the
  Node 22.13/Linux job.
- `pnpm check`: passes locally and from a clean frozen-lockfile Linux checkout.
- `pnpm test:browser`: 1,458 pass and 48 are intentionally skipped across Chromium, Firefox, and
  WebKit. No production UI changed.
- `git diff --check` and the documentation build pass.

The first Linux run completed the full repository gate and capacity measurement, then failed the
isolation command because the workflow created its comparison JSON inside the checkout before
scanning for unexpected retained references. The audit correctly reported that generated directory.
The workflow was reordered to audit before generating evidence; the second clean run passed and
uploaded all records. No threshold, fixture, or audit exclusion changed.

## Claims not supported

Stage 3 does not establish live Home Assistant compatibility, complete message acceptance, network
or provider latency, credential handling, browser transport, least-privilege permissions, physical
device truth, service idempotence, a compatibility range, production reliability, a public package,
or publication readiness. Those remain outside revision 1 and require a separately approved live
environment or post-disposition implementation contract.
