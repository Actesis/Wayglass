# Phase 5E Stage 4 proposed disposition

- Date: 2026-08-31
- Record: `P5E-HOME-ASSISTANT-001`, revision 2
- Status: evidence complete; proposal awaits project-owner approval
- Proposed outcome: accept guidance only

## Recommendation

Accept the reusable integration semantics as Wayglass guidance and an application-owned example
pattern. Do not accept a Home Assistant adapter, transport, package, public API, production export,
credential boundary, or compatibility claim.

The guidance should preserve six demonstrated rules:

1. Provider state is reported value, not application condition.
2. `unknown` and `unavailable` are knowledge states, not Boolean false or failure condition.
3. Connection loss retains the last confirmed value while making its knowledge stale.
4. A service result acknowledges provider execution; only a later ordered matching state update can
   confirm provider-reported effect.
5. An ambiguous disconnected mutation is not retried automatically because the provider may have
   executed it.
6. Entity selection, labels, formatting, condition, desired meaning, authorization, optimistic
   policy, persistence, and confirmation timeout remain application-owned.

An eventual recipe may use Home Assistant vocabulary because it is provider-specific guidance. It
must feed an application-owned model and must not introduce that vocabulary into core Wayglass
components or a universal state schema.

## Evidence-to-outcome reasoning

The proof demonstrates genuine reusable safety behavior. Forty-one focused tests preserve ordering,
knowledge, recovery, request acknowledgement, and later effect confirmation on Node 22.13/Linux and
the current maintainer environment. The candidate rejects malformed timestamps that the direct path
accepts, and it centralizes eight repeated entity-selection sites into four binding records. The
capacity, browser-regression, dependency, bundle, secret, endpoint, and removal gates all pass.

The contrary evidence controls artifact ownership. For the same four-entity task, direct application
code and tests contain 257 nonblank lines; the candidate boundary and tests contain 977. There is
one synthetic consumer, no independent maintainer, no live provider evidence, no credential design,
no version range, and no evidence that a second application would adopt the same provider-specific
runtime contract. Home Assistant or its maintained client can own transport, while the application
can implement the small selected mapping. Promoting the candidate now would make Wayglass
responsible for a compatibility and security surface before reuse is demonstrated.

The result therefore passes the charter without accepting code. Criterion 6 explicitly permits
guidance or an example when the comparison identifies safer failure behavior but does not justify an
adapter. Guidance captures the durable semantic rules at substantially lower permanent cost.

## Alternatives considered

| Outcome                   | Finding                                                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accept artifact candidate | Not recommended. Safety behavior passes, but one synthetic consumer, 3.8-times the direct surface, and no compatibility owner do not justify permanent provider code.            |
| Accept guidance only      | Recommended. The semantic and failure rules are reusable while transport, credentials, mapping, and policy remain application concerns.                                          |
| Defer                     | Not recommended for the mock-only ownership question. A live smoke could support compatibility claims but would not establish a second consumer or reduce the ownership surface. |
| Revise                    | Not needed. The accepted proof answered its decision question without crossing a stop condition.                                                                                 |
| Reject                    | Too strong. The proof found reusable safety guidance and a credible application recipe even though it did not justify an adapter.                                                |

## Proposed retained ownership and boundaries

- Wayglass owns guidance for keeping reported value, knowledge, activity, request acknowledgement,
  and provider effect separate at an integration boundary.
- A consuming application owns entity selection, domain mapping, labels, units, condition, desired
  state, authorization, optimistic behavior, timeouts, persistence, routes, and user experience.
- Home Assistant owns its envelopes, authentication, permissions, registry, service execution, event
  stream, and provider compatibility.
- The deployment owns credential storage, origin and TLS policy, network access, logging, and token
  revocation.
- A device or upstream integration may remain the physical-world truth owner beyond Home Assistant.

## Proposed follow-up and cleanup

If the project owner accepts this disposition:

1. Record `accept guidance only`, the approval date, boundaries, limitations, and triggers in the
   charter and move it to `dispositioned`.
2. Publish a domain-neutral external-state integration guide plus a bounded Home Assistant recipe
   using synthetic data and an application-owned model.
3. Retain the charter, Stage 1–4 evidence, raw measurements, and the first failed-run deviation as
   historical decision evidence.
4. Remove the executable candidate source, fake port, direct baseline, capacity and audit scripts,
   tests, TypeScript/Vitest configuration, removal manifest, and all six root proof commands. The
   cleanup must leave production packages, reference applications, lockfile, and browser bundles
   unchanged.
5. Keep live-provider work deferred. Do not request or create a credential merely to strengthen the
   guidance-only outcome.

The cleanup should be a separate reviewed change so approval of this recommendation is explicit and
the retained evidence can document exactly what was removed.

## Reconsideration triggers

Reconsider a private adapter candidate only when all of these are true:

- a second named real application needs the same complete integration task;
- a named maintainer accepts provider compatibility and security-update ownership;
- an exact Home Assistant version range and transport placement are proposed;
- credential storage, permissions, redaction, revocation, and network boundaries are approved; and
- the repeated application code is measured against this direct baseline and still favors shared
  runtime ownership.

A live smoke alone is not a reconsideration trigger. Package creation, public exports, publication,
or compatibility support would still require a new implementation contract, consequential ADR, and
release governance.

## Claims still unsupported

This proposal does not support live Home Assistant compatibility, complete message acceptance,
browser-safe credentials, OAuth, remote access, service idempotence, physical-device truth,
production reliability, a provider version range, a Wayglass adapter, a public package, or
publication readiness.
