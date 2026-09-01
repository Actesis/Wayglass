# Phase 5E Stage 4 accepted disposition and cleanup

- Date: 2026-08-31
- Record: `P5E-HOME-ASSISTANT-001`, revision 3
- Approver: project owner
- Outcome: accept guidance only
- Lifecycle: dispositioned

## Accepted result

Wayglass retains the reusable semantic rules established by the proof as
[external-state integration guidance](../../../docs/guides/external-state-integrations.md) and a
bounded Home Assistant application recipe. It does not retain or accept a Home Assistant adapter,
transport, credential boundary, package, public API, production export, or compatibility claim.

The decision preserves the safer separation of reported value, knowledge, activity, request
acknowledgement, and later provider-reported effect. A consuming application remains responsible for
provider transport, credentials, entity selection, labels, formatting, domain interpretation,
condition, desired state, authorization, optimistic policy, persistence, and confirmation timeout.

The candidate and its focused tests contained 977 nonblank lines versus 257 for the direct
application-owned baseline. With one synthetic consumer, no independent compatibility maintainer, no
live-provider evidence, and no approved credential design or version range, that cost does not
justify a permanent provider runtime. The guidance captures the durable rules without creating an
unsupported compatibility and security surface.

## Retained evidence

The charter, Stage 1–4 records, raw Stage 3 capacity and comparison measurements, and recorded
adverse findings remain as historical decision evidence. They support the fixture-driven semantic
findings only. They do not support live Home Assistant compatibility, complete provider-message
acceptance, browser-safe credentials, service idempotence, physical-device truth, or production
reliability.

## Cleanup completed

The reviewed cleanup removed:

- `experiments/phase-5e-home-assistant/src/`, including the candidate model, deterministic fake
  port, fixtures, validation, capacity harness, isolation model, and direct baseline;
- `experiments/phase-5e-home-assistant/test/` and its 41 focused proof tests;
- `experiments/phase-5e-home-assistant/scripts/`, including the isolation, capacity, and comparison
  runners;
- the proof-only `tsconfig.json`, `vitest.config.ts`, and `removal-plan.json`; and
- the six root commands `experiment:phase5e:audit`, `experiment:phase5e:check`,
  `experiment:phase5e:compare`, `experiment:phase5e:measure`, `experiment:phase5e:test`, and
  `experiment:phase5e:typecheck`.

No production package, application, public export, dependency, lockfile entry, or browser bundle was
added or changed by the experiment. Its executable code is no longer retained.

## Remaining gates

Live-provider work remains deferred. It requires a separately accepted environment and credential
record naming the exact provider version and installation, least-privilege token owner and storage,
network boundary, approved entity and mutation set, redaction, revocation, and cleanup.

A shared runtime may be reconsidered only when a second named real application needs the complete
task and a named maintainer accepts compatibility and security-update ownership. Any adapter,
package, public export, publication, or compatibility promise would also require a new
implementation contract, consequential architecture decision, and release-governance approval.
