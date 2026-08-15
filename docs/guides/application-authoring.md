# Building a Wayglass application

**Status:** Accepted Phase 5A application-author guidance on August 15, 2026. This guide turns the
cross-domain evidence from Cedar House, Northline Cold Storage, and Harbor Lab into a reusable
method. It does not define an application schema, state library, router, adapter protocol, or
required screen layout.

Wayglass supplies semantic and visual primitives for operational awareness. The application still
owns its facts, policies, workflows, information architecture, and claims about the real system.

## Begin with the decision, not the dashboard

Name one primary user, operating context, and question the application must answer. Then describe a
complete task loop:

1. **Orient:** identify the application, current place, scope, and path back to broader context.
2. **Become aware:** show current facts, meaningful condition, uncertainty, and change.
3. **Investigate:** expose the evidence, history, source, and consequence needed for a decision.
4. **Act:** identify the function, target, permission, and requested effect.
5. **Confirm:** keep intent separate from the effect the external system actually confirms.
6. **Recover:** retain trustworthy facts when a request or source fails and offer an honest next
   step.
7. **Continue:** preserve identity, focus, selection, reading position, and useful history through
   updates.

Add a screen or component only when it serves that loop. Component coverage is not a user task.

## Keep one application truth and several projections

One application-owned record should supply every visible projection of the same fact. A summary,
detail, Boolean field, metric, table row, history item, control, and durable result may emphasize
different aspects, but they must not quietly disagree.

Derive views with selectors or equivalent pure transformations. Do not copy a confirmed value into
separate widget state simply because the value appears in several places. Stable record identifiers
must outlive sorting, filtering, routing, and ordinary updates.

Keep these axes independent:

| Axis       | Question it answers                                      | Example values                                                |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Value      | What is the domain value?                                | on/off, open/closed, 21 °C, approved/not approved             |
| Condition  | What is the authored health or attention interpretation? | neutral, informational, positive, caution, critical           |
| Knowledge  | How well is the state known?                             | confirmed, inferred, stale, unknown, conflicting, unavailable |
| Activity   | Is a requested action or transition underway?            | idle, pending                                                 |
| Trend      | How is a value changing?                                 | rising, falling, steady, mixed, none                          |
| Confidence | How strong is the evidence or inference?                 | high, medium, low, not assessed                               |
| Permission | May this user request the effect?                        | allowed, denied, unknown                                      |
| Request    | What is the lifecycle of the current intent?             | idle, pending, rejected                                       |
| Outcome    | What effect has been confirmed?                          | unchanged, partial, completed, failed                         |

Do not encode these combinations in one universal status enum. For example, “off” is a Boolean
value, not a failure; stale knowledge does not prove a critical condition; active work does not
prove success; high confidence does not grant permission.

Use the asserted/not-asserted Boolean presentation for quick recognition across on/off, open/closed,
verified/unverified, or applied/not-applied meanings. Supply explicit domain labels and accessible
state. The lit rail is a glanceable value signal, not condition color.

## Put external truth behind an application boundary

Adapters translate external observations and requests into the application's model. They do not
become the model.

A practical flow is:

```text
external source -> application adapter -> application reducer/store -> selectors -> Wayglass views
user intent     -> application policy  -> application request       -> adapter -> reconciliation
```

The application owns:

- record identities, source precedence, freshness, retention, and conflict rules;
- authorization, confirmation policy, request correlation, timeout, retry, and cancellation;
- optimistic behavior, if any, and how unconfirmed values are labeled;
- thresholds, units, condition meaning, confidence, and business language;
- routing, persistence, audit meaning, and notification policy; and
- the exact claim supported by a provider response.

Wayglass controls emit intent and present the state supplied to them. They do not invent request
identifiers, infer authorization, execute a transport, or turn a successful HTTP response into a
confirmed domain effect.

## Separate functions before arranging panels

Users need to know which function they are viewing or operating. Structural separation prevents an
action in one function from appearing to belong to another.

Choose between two proven compositions according to the task:

- **Simultaneous overview:** show several strongly separated functions when comparison and shared
  awareness matter.
- **Focused Function Deck:** keep peer function selectors visible while one function receives the
  space needed for investigation or control.

An application can use both at different routes or widths. Do not mount duplicate desktop and mobile
semantic trees and hide one with CSS. Recompose one content tree, or navigate to a focused route,
while preserving native reading and focus order.

Label section purpose independently of condition:

- **information** explains identity, instructions, context, or reference material;
- **monitor** presents changing state and evidence; and
- **control** allows a request or local selection.

Neutral structure identifies function boundaries. Reserve condition colors for authored health or
attention meaning; use the application accent for selection, navigation, or brand emphasis.

## Make consequential actions honest

A consequential confirmation describes the target, scope, requested effect, important limitation,
and current confirmed state. The application decides when that friction is proportional.

For every controlled request:

1. Render the last confirmed value.
2. Emit or handle an intent without claiming the target value is already true.
3. Show pending activity separately from the confirmed value.
4. Reconcile the authoritative result into application truth.
5. On failure, preserve the confirmed value and name what failed.
6. On partial completion, preserve per-target results and expose the unresolved scope.
7. Make retry, cancellation, undo, or escalation promises only when the application can honor them.

A routine reversible request may need little friction. A consequential request may need a dialog.
Both use the same honest requested-versus-confirmed boundary.

## Preserve useful truth through uncertainty

Loading and failure are not reasons to erase everything the application knows.

- **Initial loading:** no retained value exists; do not show a placeholder as a real value.
- **Retained refresh:** keep the last confirmed value visible and label refresh activity separately.
- **Stale:** keep the value with age or freshness context.
- **Partial:** keep usable sources while naming missing sources and affected scope.
- **Unavailable:** explain which source or function cannot currently provide trustworthy content.
- **Request failure:** keep confirmed domain truth and expose recovery without fabricating a value.
- **Recovery:** present current confirmed data without erasing relevant failure or attempt history.

Use one deliberate announcement owner for a dynamic result and keep the same result durably visible.
Ordinary record updates, repeated status rows, media progress, and every changing metric should not
be live regions.

## Preserve context in dense and changing content

Native lists, tables, timelines, and contained scroll regions are often sufficient. The application
owns ordering, filtering, sorting, grouping, paging, retention, and the meaning of new records.

During updates:

- key retained records by stable identity;
- do not force focus, scroll, or follow-latest behavior;
- keep filters, sorting, authored selection, disclosures, and route-return context;
- place inserted records according to the application's chronology and priority rules;
- define a continuation target when focused authored content is removed; and
- keep critical response paths discoverable while another function is selected.

Add virtualization or a data-grid dependency only after a representative deployment demonstrates
that native composition fails a measured task or performance envelope.

## Treat media as identifying or supporting evidence

An image may help someone recognize an asset, inspect a detail, or connect instructions to the
physical object. It must not become the only source of status, instructions, or evidence meaning.

The application owns media URLs, authorization, alternative text, metadata, transformations,
storage, privacy, and evidentiary claims. Preserve the asset identity and workflow while media is
loading or unavailable. A focused viewer owns inspection interaction and focus return; the
application still owns why the image matters.

## Adapt the brand without changing semantics

Applications may substantially adapt typography, density, shape, neutral surfaces, topology, and
accent. Preserve semantic token roles, state text, focus visibility, contrast, logical layout, and
the independence of condition, knowledge, activity, and value.

Review at phone, desktop, and wall-display sizes where those contexts are supported. Include long
content, 200% text, RTL mechanics, forced colors, grayscale, reduced motion, keyboard operation, and
touch targets. At-a-distance review should reveal the dominant answer and next response without
turning every informational section into a status display.

## Build deterministic validation into the application

Use typed scenarios that fix records, identifiers, time, scheduler behavior, adapter results, and
route. At minimum exercise steady, initial loading, retained refresh, stale, partial, unavailable,
permission denied, request pending, request failed, recovered, and meaningful-update states when
they credibly apply.

Use production builds for complete workflow, responsive, visual, accessibility, and performance
review. Maximum fixtures should be large enough to expose coordination cost without pretending to be
a universal package limit. Record the environment and measure meaningful construction and mutations
while also asserting the committed semantics, focus, and overflow.

The [validation-recipe boundary](../governance/application-validation-boundary.md) explains which
practices remain guidance, which harnesses remain application-owned, and when a narrow helper may be
considered for `@wayglass/testing`.

## Application readiness checklist

Before calling a workflow production-ready, confirm that:

- one user question and complete task loop organize the experience;
- one application truth supplies every projection of the same fact;
- value, condition, knowledge, activity, trend, confidence, permission, request, and outcome remain
  independent;
- information, monitoring, and control functions are visually and semantically distinct;
- external state enters through an application-owned adapter and reconciliation boundary;
- failed or partial work retains trustworthy truth and provides an honest recovery path;
- dynamic results have one durable visible owner and at most one announcement owner;
- record identity, focus, selection, reading position, and route context survive meaningful updates;
- media, icons, and color are never the only path to meaning;
- brand and responsive changes preserve one semantic tree and Wayglass token roles; and
- deterministic scenarios, supported browsers, production visual review, and applicable manual
  assistive-technology gates cover the real task.

Passing this checklist does not create a public support or integration claim. Such claims require
the exact evidence, environments, and release scope named by Wayglass release governance.
