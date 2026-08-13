# Harbor Lab reference application

**Status:** Phase 4D application foundation active on August 13, 2026. Production composition, dense
task investigation, consequential approval controls, and the accepted validation matrix remain
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

The small orientation surface proves that the application consumes production Wayglass packages. It
is not the finished supervision workspace. Later slices add the multi-function overview and focused
composition, task and tool investigation, explicit merge approval, recovery, responsive behavior,
accessibility, performance, and supported-browser validation.

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

1. Compose the production overview and focused peer-function workspace from the shared Harbor Lab
   application truth.
2. Add stable task and tool investigation with evidence provenance, freshness, confidence, and
   bounded updates.
3. Integrate the consequential merge-approval lifecycle, precise pause/cancel guarantees, linked
   retry, recovery, and durable feedback.
4. Complete the accepted responsive, visual, accessibility, performance, and supported-browser
   record.
