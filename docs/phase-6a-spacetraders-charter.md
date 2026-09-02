# Phase 6A SpaceTraders application battle-test charter

**Status:** Proposed on September 2, 2026. This charter is based on the current application
specification and implementation-architecture drafts in the local `SpaceTraders-Wayglass` planning
directory. It does not authorize changes to that directory, creation of its repository, live
credentials, Cloudflare resources, package publication, deployment, or application integration.

## Nomination

| Field                    | Proposed record                                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application              | **SpaceTraders Client**, a new full-featured web client for [SpaceTraders](https://spacetraders.io)                                                                                |
| Consumer purpose         | Provide a first-class graphical way to play SpaceTraders while pressure-testing Wayglass with real operational workflows                                                           |
| Relationship to Wayglass | Independently owned consumer and evidence source; not a Wayglass example, workspace package, fixture authority, or product demo                                                    |
| Application owner        | Project owner, acting separately in the consumer repository                                                                                                                        |
| Wayglass owner           | Wayglass project owner and maintainer                                                                                                                                              |
| Current source           | `/Users/matthoag/dev/SpaceTraders-Wayglass`, currently a planning directory containing `SPEC.md` and `ARCHITECTURE.md`, not a Git repository                                       |
| Excluded source          | `/Users/matthoag/dev/SpaceTraders`, the existing native SwiftUI client; it is not the nominated Phase 6 consumer                                                                   |
| Repository               | Not yet created or accepted. A separate private repository is recommended; its local path and GitHub remote must be recorded before integration                                    |
| Proposed stack           | TypeScript, React, Vite, Wayglass React bindings, React Router, a query/cache layer, a generated SpaceTraders API client, and application-owned domain services                    |
| Rendering model          | Client-rendered application. Server rendering and hydration are outside the initial proof                                                                                          |
| Proposed runtime         | Cloudflare Worker/BFF with application-owned D1, Durable Object, Queue, WebSocket, authentication, credential, and deployment adapters; subject to the architecture decision below |

The application statement is:

> SpaceTraders is a first-class game interface built with Wayglass. Wayglass is a general-purpose
> operational design system tested by SpaceTraders. Neither project exists merely to demonstrate the
> other.

## Users and operational questions

The initial user is a player controlling one SpaceTraders agent. The proof must help that player
answer, without consulting raw API responses:

1. What is the agent's current position, capacity, credit, contract, and fleet situation?
2. Which ship is ready, in transit, cooling down, unavailable, or in need of attention?
3. What information is confirmed, pending, stale, unavailable, or inferred?
4. Which action is currently possible, what will it affect, and what consequence might it have?
5. Was an issued command accepted, is its effect still pending, and what state was ultimately
   confirmed?
6. Did authentication fail, did the universe reset, was the request rate-limited, or did another
   recoverable failure occur?

SpaceTraders identifiers and game state may be used in the consumer. Wayglass issues, fixtures,
screenshots, and documentation use sanitized synthetic equivalents unless the owner explicitly
accepts a specific non-sensitive artifact.

## First battle-test workflow

Phase 6B and the first Phase 6C slice should implement only this complete task loop:

```text
Authenticate
  -> Command Center
  -> Fleet
  -> Ship Detail
  -> Navigate
  -> In transit
  -> Arrival
```

This is intentionally narrower than the consumer's full product specification. It exercises the
application boundary and most Wayglass semantics before broader gameplay creates noise.

The slice must cover:

- an overview with agent, fleet, contract, attention, and recent-activity summaries;
- a focused Fleet function with stable ship selection and unmistakable functional separation;
- ship identity, metrics, Boolean values, condition, knowledge, activity, freshness, confidence, and
  temporal state without collapsing those axes;
- a contextual navigation form with validation and consequence-appropriate confirmation;
- request acceptance, pending travel, durable activity, arrival, failure, retry, and confirmed
  effect;
- initial loading, retained refresh, empty, stale, partial, unavailable, invalid-token,
  rate-limited, reset, offline, and recovered scenarios;
- dense fixtures for 1, 10, 50, and 100 ships, without pretending synthetic scale is live-system
  evidence;
- identifying media only when it helps recognition or investigation, with equivalent textual
  identity and instructions; and
- icon-free state recognition. Icons may reinforce navigation or domain identity but cannot own
  essential meaning.

Later accepted slices may cover contract fulfillment and market intelligence. They do not enter the
initial integration merely because the consumer drafts describe them.

## Ownership and architecture boundary

The consumer owns:

- SpaceTraders transport types, generated API client, domain models, derived state, routing, query
  cache, persistence, authentication, authorization, rate-limit policy, command policy, scheduling,
  activity records, alert rules, error normalization, analytics, and business consequences;
- Cloudflare Workers, Access, D1, Durable Objects, Queues, WebSockets, secrets, environments,
  migrations, logs, traces, deployment, and incident response if that architecture is accepted;
- the one authoritative copy of remote state and the translation from SpaceTraders facts into
  Wayglass properties; and
- all product-specific components such as ship summaries, waypoint opportunities, contract
  deliverables, flight-mode selection, and trade calculations.

Wayglass owns only its public domain-neutral packages, components, tokens, themes, typed React
adaptation, semantics, accessibility behavior, and documented compatibility. Wayglass must never
import SpaceTraders code or gain game nouns, transport schemas, commands, alert policy, credential
logic, or Cloudflare runtime behavior.

The consumer should mechanically restrict `@wayglass/*` imports to its presentation layer. Domain,
application, generated-client, and infrastructure modules must not depend on Wayglass. Replacing
Wayglass must leave consumer data and domain behavior intact.

## Transport and credential architecture decision

The consumer drafts currently conflict:

- `SPEC.md` section 24 proposes direct browser-to-SpaceTraders communication where supported, with
  optional local token persistence; and
- `ARCHITECTURE.md` sections 11, 16, and 19 route authenticated calls through an application
  Worker/BFF and per-agent session boundary, encrypt stored tokens, and avoid returning them to the
  browser.

**Recommendation:** accept the Worker/BFF boundary for this application. It better matches the
draft's multi-device persistence, background transitions, Durable Object coordination, WebSocket
updates, rate-limit handling, and credential-containment goals. It also centralizes materially
sensitive behavior in an application-owned security boundary. This is an application architecture
decision, not a Wayglass requirement.

Before implementation, the application owner must either:

1. revise the consumer specification so the Worker/BFF model is authoritative and document why
   ordinary manual gameplay now requires that backend; or
2. narrow the first slice to direct client communication and explicitly defer the incompatible
   Cloudflare, persistence, background, and credential claims.

The accepted choice needs its own consumer-repository ADR. Current Cloudflare documentation and
service behavior must be checked when that ADR is implemented; this charter does not freeze provider
details from the drafts.

## Privacy, credentials, and evidence

- No SpaceTraders token, Cloudflare credential, Access assertion, encryption key, secret binding,
  authorization header, credential ciphertext, private endpoint, or identifying player data enters
  Wayglass source, history, logs, screenshots, issues, or build artifacts.
- Automated tests use deterministic application-owned fakes. Ordinary automated tests never use a
  production credential or the live SpaceTraders service.
- Representative live tests, if separately approved, use a dedicated account or token with the
  smallest practical consequence and record no secret value.
- Consumer logs redact secrets and sensitive headers before persistence or transmission. Diagnostic
  exports require an explicit sanitization review.
- Wayglass evidence records environment, fixture identity, source revision, result, limitation, and
  whether evidence was automated, simulated, observed locally, or observed against a live service.
- Removing a local checkout or test environment must remove its stored credential material through
  an application-owned procedure. Wayglass never performs or verifies credential deletion.

## Initial Wayglass package set

Phase 6B should pack and inspect the smallest complete foundation and React graph:

| Package              | Reason                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| `@wayglass/tokens`   | Authored semantic variables and generated token artifacts               |
| `@wayglass/core`     | Framework-neutral behavior required by elements                         |
| `@wayglass/themes`   | Accepted theme semantics and theme delivery                             |
| `@wayglass/elements` | Production Custom Elements, styles, and explicit registration contracts |
| `@wayglass/react`    | Thin typed bindings for the nominated React client                      |

The consumer installs each required packed artifact, including transitive private packages, from one
Wayglass commit and records its hash. It should import component-level React entry points where
practical and must prove that direct element imports remain side-effect free.

`@wayglass/icons` is deferred from the first install. It may be added when a concrete domain task
benefits from reinforcement after icon-free state recognition is proven. `@wayglass/testing`, token
tooling, icon tooling, Home Assistant work, examples, provider code, and all other private artifacts
are excluded unless a later charter revision provides a specific reason and removal plan.

## Devices, browsers, and accessibility target

Proposed initial evidence scope:

- physical or representative phone, tablet, desktop, and large-display compositions, with desktop as
  the primary command environment and the large display treated as a passive-awareness mode;
- current stable Chromium, Firefox, and Safari where available;
- keyboard, pointer, and touch interaction appropriate to each device;
- 200% text, zoom, RTL mechanics, forced colors, grayscale, reduced motion, and visible focus;
- VoiceOver with Safari and NVDA with Firefox for representative desktop tasks; and
- iOS VoiceOver for the nominated phone workflow if mobile assistive-technology support is proposed
  for v1.

Automated emulation supports diagnosis but does not become physical-device or assistive-technology
evidence. Exact hardware, operating-system, browser, and assistive-technology versions must be
recorded in the baseline before a compatibility claim is made.

## Baseline and measurement plan

Before the first Wayglass artifact is installed, the consumer branch records:

- clean install, typecheck, tests, production build, startup, and representative route behavior;
- dependency graph, JavaScript and CSS output sizes, route chunks, initial request count, and build
  time using one documented environment and repeated method;
- cold and warm startup plus representative interaction and update timings;
- memory and DOM-node observations for 1, 10, 50, and 100-ship deterministic fixtures;
- keyboard, semantics, focus, overflow, text enlargement, responsive, and reduced-motion behavior of
  the pre-integration shell; and
- maintenance facts: required configuration, local adapters, warnings, workarounds, and removal
  steps.

If the repository begins as an empty shell, the baseline is that committed shell plus its first
application-owned vertical-slice skeleton; it must not compare a working Wayglass screen with no
equivalent task. Thresholds are established from observed results and user impact, not invented in
advance. Phase 6C compares like-for-like revisions and records material regressions or improvements.

## Rollback and removal

Integration occurs on an isolated consumer branch or worktree. Application domain state, storage
schemas, generated clients, ports, routes, and command behavior remain presentation-independent.

A successful removal proof must:

1. remove all `@wayglass/*` packages, CSS imports, registration, wrappers, and Wayglass-specific
   presentation modules;
2. restore a minimal native or application-local presentation for the nominated task;
3. pass the consumer's domain, application, API, storage, and command tests unchanged;
4. preserve user-owned data and credential records without migration through Wayglass; and
5. leave no runtime import, custom element, token, build plugin, or global side effect behind.

The integration may be reverted without deleting application data. Package removal is not a
credential-deletion mechanism.

## Finding classification

The consumer maintains `docs/wayglass-findings.md`. Every finding records an ID, date, workflow,
Wayglass package or component, observed behavior, fixture and environment, classification,
workaround, owner, linked issue or pull request, resolution, and v1 impact.

Use these classes:

1. **Wayglass defect:** documented public behavior fails; fix in Wayglass with regression evidence.
2. **Missing domain-neutral contract:** repeated general operational need is not expressible through
   composition; propose a separate contract before adding API.
3. **Wayglass ergonomics, theme, token, or documentation pressure:** capability exists but is hard
   to use or adapt; correct the smallest responsible public surface.
4. **Application composition or policy:** Wayglass can express the need, or the meaning belongs to
   SpaceTraders; fix only in the consumer.
5. **Provider or platform behavior:** SpaceTraders, browser, framework, or Cloudflare behavior owns
   the result; do not disguise it as a Wayglass state model.
6. **Unsupported request:** defer or reject with the missing evidence recorded.

No finding becomes a public Wayglass feature solely because this consumer needs it.

## Acceptance checklist

Phase 6A passes `P6-E01` only after the owners record all of the following:

- [x] nominated application and explicit exclusion of the older SwiftUI client;
- [x] purpose, owner roles, proposed stack, rendering model, workflows, privacy boundary, package
      candidates, measurement method, rollback, and finding classes;
- [ ] exact private consumer repository, local access path, GitHub remote, and default branch;
- [ ] accepted direct-browser or Worker/BFF architecture and a reconciled consumer ADR;
- [ ] exact initial hardware, operating-system, browser, and assistive-technology environments;
- [ ] live-test account and credential policy, or an explicit decision that the first slice remains
      entirely mocked;
- [ ] committed pre-integration baseline in the consumer repository; and
- [ ] project-owner and application-owner acceptance of the completed charter.

Until every unchecked item is resolved, Phase 6A may refine documentation but must not modify the
consumer, install Wayglass artifacts there, create provider resources, or handle credentials.

## Decisions requested from the project and application owner

1. Confirm that `/Users/matthoag/dev/SpaceTraders-Wayglass` should become the separate private
   consumer repository, and provide or approve its GitHub repository name when it is created.
2. Accept the recommended Worker/BFF architecture and authorize reconciliation of the two consumer
   drafts, or select the narrower direct-browser alternative.
3. Confirm whether the first integration may use a dedicated live SpaceTraders account after the
   deterministic mocked slice passes, with credentials remaining application-owned.
4. Confirm the available physical devices and assistive-technology environments for the initial
   evidence matrix.
