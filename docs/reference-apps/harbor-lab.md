# Harbor Lab reference application

**Status:** Phase 4D foundation, production composition, task investigation, and consequential
workflow accepted on August 13, 2026. The accepted validation matrix remains ahead.

Harbor Lab is the private AI-agent-supervision application defined by the accepted
[Phase 4 reference-application contract](./phase-4-reference-applications.md). It tests whether an
engineering lead can determine which synthetic automated work may continue and which task needs a
human decision without confusing agent activity with trustworthy outcome.

## Foundation boundary

The initial application foundation provides:

- a private `@wayglass/example-agent-supervision` React/Vite workspace;
- typed overview, focused-function, and `HL-317` task routes using URL, History, and `popstate`;
- application-owned task, agent, evidence, tool-record, approval, merge, and retention truth;
- deterministic shared and Harbor-specific scenario presets;
- independent agent availability, agent activity, task condition, evidence knowledge, confidence,
  human attention, requested approval, and confirmed merge state;
- a narrow merge-approval port with an injected clock and scheduler; and
- unit tests for routing, maximum bounds, retained truth, request identity, pause guarantees, retry
  identity, and deterministic effects.

The foundation proves that the application consumes production Wayglass packages. It is not the
finished supervision workspace. Later slices add task and tool investigation, explicit merge
approval, recovery, and the complete responsive, accessibility, performance, and supported-browser
validation.

## Supervision composition

The first production composition provides:

- a simultaneous overview with strongly separated Work intake, Execution, Review and approval, and
  Outcome and recovery functions;
- one dominant human-decision answer that identifies `HL-317`, stale test evidence, and confirmed
  not-merged truth without treating worker activity as outcome;
- focused function routes whose folder-like selector band retains concise peer summaries;
- a persistent path to the `HL-317` decision while intake, execution, or recovery is selected;
- scalar, status, and task-summary projections derived from the same application-owned records; and
- loading, retained-refresh, partial, unavailable, stale, light, dark, compact, comfortable, phone,
  desktop, and RTL-compatible foundations without duplicate interactive trees.

These choices remain application policy. Wayglass does not own agents, tasks, evidence, confidence,
attention, attempts, approvals, repositories, or confirmed external results. The production
application routes are canonical and are not duplicated as whole-app Storybook stories.

## Task investigation

The `HL-317` route now provides a stable investigation surface before any consequential control is
introduced. It includes:

- proposed repository, target branch, and revision scope beside confirmed task and merge truth;
- application-owned evidence source, observation time, fixed freshness policy, calculated age,
  knowledge, and confidence without presenting confidence as correctness;
- current attempt and previous-attempt identity beside assigned-worker availability and activity;
- a newest-first `wg-event-log` projection of retained task and tool records with stable record IDs,
  source, task, attempt, condition, and knowledge context; and
- deterministic current, stale, refreshed, unavailable-worker, meaningful-update, maximum, and
  loading foundations without making ordinary tool records live announcements.

The app owns the fixed validation clock, five-minute evidence-age policy, retention window, record
ordering, and task filtering. The event log is a production Wayglass component; its records do not
become a public task, tool, agent, or evidence schema.

## Consequential workflow

The `HL-317` investigation now completes its awareness, decision, action, and confirmation loop:

- a scoped native confirmation names the repository, target branch, proposed revision, evidence age
  and confidence, five-minute approval lifetime, one-attempt effect, failure behavior, and lack of
  automatic reversal after a confirmed merge;
- the closed dialog emits intent while Harbor Lab owns requested approval, expiry, authorization,
  pending state, adapter outcome, confirmed target result, and one deliberate announcement;
- granted approval is a Boolean value independent of merge success, so merge failure retains
  `Granted` beside confirmed `Not merged` truth;
- denial and timeout leave the target branch unchanged and expose a fresh decision path;
- retry creates a new linked attempt, retains the failed attempt and tool history, invalidates the
  prior approval, and claims no current evidence or execution result; and
- pause and cancellation controls state only that a request was recorded and that an active tool
  step may finish. They never present `paused`, `cancelled`, or `stopped` without adapter
  confirmation.

The deterministic merge port remains app-local and synthetic. Confirmation is not authorization or
audit evidence, and no real repository, identity provider, agent runtime, or execution service is
connected.

## Application ownership

Harbor Lab owns agent protocols, task and attempt identity, repositories, revisions, evidence,
confidence, tools, request timing, authorization, outcomes, retention, announcements, and audit
meaning. “Agent finished” never means “change merged” or “result correct.” Approval pending, denied,
or timed out never changes the target branch. A failed merge retains the granted decision and the
unchanged confirmed branch result as separate truths.

Pause wording claims only that a request was recorded and that an active tool step may finish. Retry
creates a visibly linked new attempt instead of overwriting the failed attempt.

No model provider, prompt editor, autonomous planner, agent protocol, tool registry, code executor,
real repository integration, public agent schema, service connection, persistence, deployment, or
new dependency is part of this foundation.

## Local use

Run `pnpm example:agent-supervision`, then open the local Vite URL. Human-readable paths include
`/`, `/functions/review-approval`, and `/tasks/HL-317`. Query parameters may select `scenario`,
`theme`, `density`, `dir`, and `fixture` without replacing route identity.

## Next slices

1. Complete the accepted responsive, visual, accessibility, performance, and supported-browser
   record.
