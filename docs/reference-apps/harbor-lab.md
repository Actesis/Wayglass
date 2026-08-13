# Harbor Lab reference application

**Status:** Phase 4D foundation and production composition accepted on August 13, 2026. Dense task
and tool investigation, consequential approval controls, and the accepted validation matrix remain
ahead.

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

1. Add stable task and tool investigation with evidence provenance, freshness, confidence, and
   bounded updates.
2. Integrate the consequential merge-approval lifecycle, precise pause/cancel guarantees, linked
   retry, recovery, and durable feedback.
3. Complete the accepted responsive, visual, accessibility, performance, and supported-browser
   record.
