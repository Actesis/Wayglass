# ADR 0014: Keep operational controls controlled by confirmed application state

- Status: accepted
- Date: 2026-07-31

## Context

Phase 2D introduces toggles and other controls that may request changes to remote, asynchronous, or
otherwise fallible systems. A user activation proves only that an intent was expressed. It does not
prove authorization, transport, acceptance, completion, or the resulting domain value.

Wayglass already separates domain value from condition, knowledge, and activity. Phase 1 fixtures
retain a confirmed value while a button request is pending. That behavior needs to become a reusable
control contract before a toggle makes checked presentation appear to be confirmed truth.

The same component set also contains local selection and form editing. Those interactions have
different sources of truth and must not inherit remote-request latency or failure semantics merely
because they are controls.

## Decision

Operational controls are controlled components. The application supplies the confirmed domain value,
optional requested value, request status, and target availability. User activation emits an intent
event containing the proposed and currently confirmed values. The component does not mutate the
confirmed value, start a request, infer success, or invent a timeout.

Use these independent concepts:

- confirmed domain value;
- optional requested domain value;
- request status of `idle`, `pending`, or `rejected`;
- target availability of `available` or `unavailable`;
- product-policy permission expressed through the component's disabled contract.

Pending operational controls preserve the confirmed semantic state, retain focus, expose the
requested value and activity in text, and suppress duplicate activation by default. Rejection
preserves confirmed truth and identifies the rejected request through associated feedback. Request
rejection is not constraint invalidity.

The initial Phase 2D controls provide no optimistic mode, request queue, cancellation protocol,
request identifier, retry scheduler, or conflict resolver. Applications own those behaviors and may
compose explicit actions around the component.

Local UI selection remains synchronous composition state. Tabs, segmented controls, and navigation
rails do not use the operational request lifecycle. Form controls own draft native values and
constraint validity; submission may begin a separate application request after native validation
succeeds.

The shared request-status and availability vocabulary may be implemented in `@wayglass/core`, but
domain-specific confirmed and requested values remain consumer-owned and do not become fields on
`KnownState`.

## Consequences

Toggle checked state remains trustworthy during slow, rejected, or unavailable operations. Remote
updates can arrive without being confused with local activation. Product applications must
explicitly connect request events to their transport and return confirmation or rejection state to
the component.

The API is more explicit than a self-toggling control and requires controlled properties. That
additional state is intentional because collapsing intent and truth would violate the Wayglass
semantic model.

Pending, rejection, and unavailable presentation require useful text and accessibility relationships
outside the value signal. Feedback components from Phase 2E may later standardize the presentation
without changing the request model.

## Alternatives considered

- **Toggle immediately and correct on failure:** rejected because it presents intent as confirmed
  truth, creates rollback motion, and becomes dangerous when failures or stale responses are common.
- **Add requested value to `KnownState`:** rejected because requested values are domain-specific and
  do not belong to condition, knowledge, or activity.
- **Use one `state` enum for every combination:** rejected because confirmed value, request status,
  availability, and permission vary independently and a combined enum would grow ambiguously.
- **Use tabs or segmented selection as an operational finite-value control:** rejected because local
  selection and remote domain mutation have different truth and failure models.
- **Generate request IDs inside components:** rejected because components do not own transport,
  persistence, cancellation, or response correlation.
