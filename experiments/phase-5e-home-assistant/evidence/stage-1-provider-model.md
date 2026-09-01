# Phase 5E Stage 1 provider-model evidence

- Date: 2026-08-30
- Scope: synthetic provider projection, immutable reducer, and request/effect separation
- External effects: none

## Result

Stage 1 establishes the smallest pure semantic boundary from the accepted charter. Four synthetic
bindings cover a light, contact binary sensor, climate entity, and scalar sensor. The model retains
provider strings and timestamps without assigning application condition, labels, units, desired
state, authorization, or domain success.

The closed validator accepts only the projected state and `state_changed` fields this stage uses. It
rejects unknown keys, malformed or duplicate identities, invalid or reversed timestamps, non-JSON
attributes, excessive attribute collections, mismatched event identities, and snapshots larger than
the chartered ceiling. Accepted data is copied and frozen.

The pure reducer demonstrates these distinctions:

- `off` remains an uninterpreted reported value for both the light and contact sensor;
- `unknown` and `unavailable` produce explicit knowledge with no reported Boolean value;
- disconnection preserves the last reported value while degrading confirmed knowledge to stale;
- reconnection alone does not fabricate confirmed knowledge;
- pending and acknowledged requests preserve the last confirmed provider value;
- provider failure and confirmation timeout retain prior truth; and
- only a newer matching provider state update confirms the requested provider effect.

Unselected, duplicate, and out-of-order updates do not replace selected newer state. This stage does
not model the authentication handshake, command wire envelope, reconnect scheduler, retry/backoff,
or live provider. Those remain in the accepted later stages.

## Validation

The proof TypeScript check and all 21 focused tests across three files pass. Boundary tests confirm
that the proof has no package manifest, dependency, credential read, network client, Custom Element
registration, or unapproved import and that the ordinary root gate invokes the proof.

The complete `pnpm check` repository gate passes, including the documentation build, lint, tests,
type checks, formatting, and the new Phase 5E proof gate. `git diff --check` also passes.

## Claims not supported

Stage 1 does not establish complete Home Assistant message compatibility, authentication, live
connectivity, physical-device truth, command delivery, reconnect behavior, provider-version support,
browser token safety, a production adapter, package status, or publication readiness.
