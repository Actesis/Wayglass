# Phase 5E exploration: Home Assistant integration boundary

## Record control

| Field              | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record ID          | `P5E-HOME-ASSISTANT-001`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Roadmap track      | Phase 5E — Home Assistant integration proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Lifecycle state    | `charter-accepted`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Revision           | `1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Owner              | Wayglass maintainers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Evidence reviewers | Project owner and a Wayglass maintainer                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Created            | 2026-08-30                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Last reviewed      | 2026-08-30                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Target decision    | Evidence-complete and disposition review after the four bounded proof stages                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Related records    | [Phase 5 roadmap](../../phase-5.md), [ecosystem-exploration contract](../ecosystem-exploration-record.md), [ADR 0031](../../architecture/adr/0031-ecosystem-artifact-architecture.md), [Phase 5 validation plan](../../accessibility/phase-5-validation-plan.md), [application-validation boundary](../application-validation-boundary.md), [Cedar House brief](../../reference-apps/cedar-house.md), and [controlled operational requests](../../architecture/adr/0014-controlled-operational-requests.md) |

### Decision question

What, if anything, should Wayglass own between Home Assistant's provider-specific state and command
protocol and an application's existing Wayglass state and control model?

### Revision history

| Revision | Date       | Change                                                       | Evidence still valid | Approval      |
| -------- | ---------- | ------------------------------------------------------------ | -------------------- | ------------- |
| 1        | 2026-08-30 | Credential-free, fixture-driven integration charter accepted | None                 | Project owner |

## User, task, and consequence

- **Credible user or maintainer:** a maintainer of a user-owned Wayglass household application who
  already operates Home Assistant and wants Home Assistant to supply selected live state and accept
  bounded commands without making it the application's UI framework or domain model.
- **Complete task:** connect a deliberately small configured entity set, understand current and
  stale/unavailable state, request one reversible change, distinguish acknowledgement from confirmed
  provider state, survive connection loss, and remove the integration without changing the Wayglass
  application model.
- **Observed evidence:** Cedar House already demonstrates household state, pending requests, partial
  failure, stale knowledge, and recovery from deterministic application-owned fixtures. The Phase 5
  roadmap separately identifies a Home Assistant proof as the external-state test of the ecosystem
  integration tier. No current package connects those two boundaries.
- **Current path:** an application author directly consumes Home Assistant REST or WebSocket data,
  owns credential and connection behavior, selects entities, translates provider strings and
  attributes, correlates service calls with later state changes, and then feeds application-owned
  models into Wayglass components.
- **Gap and consequence:** repeating that boundary can conflate `off` with failure, service-call
  acknowledgement with confirmed effect, disconnection with a false value, or Home Assistant entity
  vocabulary with a universal Wayglass schema. It can also expose a broad token to browser code or
  make reconnection behavior application-specific and untested.
- **Current truth and policy owners:** Home Assistant owns its API envelopes, authentication, event
  stream, service execution, entity registry, and provider-reported state. The consuming application
  owns selected entities, labels, domain interpretation, condition, desired state, command
  authorization, optimistic policy, persistence, routes, and the meaning of success. A device or
  upstream integration may remain the physical-world truth owner beyond Home Assistant.
- **Domain context:** `entity_id`, domains, attributes, services, areas, devices, automations, and
  Home Assistant availability strings are provider vocabulary. They must not become core Wayglass
  component properties or a universal device schema.

## Current provider contract basis

Revision 1 is based on the official Home Assistant developer documentation reviewed on 2026-08-30
and rechecked for Stage 2 on 2026-08-31:

- the [WebSocket API](https://developers.home-assistant.io/docs/api/websocket/) uses
  `/api/websocket`, an explicit `auth_required`/`auth`/`auth_ok` or `auth_invalid` handshake,
  command IDs, result messages, `subscribe_events`, `state_changed` events, and service-action
  commands;
- the [REST API](https://developers.home-assistant.io/docs/api/rest/) uses JSON and bearer
  authentication, exposes state snapshots under `/api/states`, and invokes real device behavior
  through `/api/services/<domain>/<service>` rather than by writing a state representation; and
- Home Assistant documents its maintained JavaScript WebSocket library as an available provider
  client, but using that library does not answer the Wayglass ownership or semantic-mapping
  question.

The fixture proof models only the documented messages needed for the bounded task. It does not claim
complete API coverage. Provider documentation is rechecked before a live smoke or permanent
implementation proposal.

## Boundary and artifact hypothesis

- **Provisional tier:** integration under ADR 0031.
- **Proposed Wayglass ownership:** at most, a framework-neutral and provider-specific translation
  boundary for authentication-independent state envelopes, connection knowledge, ordered updates,
  request correlation, and provider acknowledgement. It may offer application-supplied bindings or
  guidance, but it cannot decide household meaning or condition.
- **Application ownership:** Home Assistant origin selection; entity allowlist; human labels;
  entity-to-domain mapping; units and formatting; condition; desired values; command eligibility;
  authorization; optimistic policy; confirmation timeout; persistence; dashboards; rooms; scenes;
  automation; and recovery UX.
- **External ownership:** Home Assistant owns API compatibility, authentication, permissions,
  entity/service availability, event ordering guarantees it documents, and provider-reported
  results. Browsers and the deployment runtime own WebSocket/HTTP behavior and TLS.
- **Consumers and support environment:** revision 1 has only a private Node-based deterministic
  proof on repository minimum/current Node and pnpm. A later live smoke would name an exact Home
  Assistant version, installation type, network context, token class, permission boundary, and
  synthetic or user-approved entity set.
- **Potential public surface:** none. A successful disposition may propose an optional adapter
  package, an example integration, a starter recipe, guidance only, or no retained artifact. It does
  not pre-approve `@wayglass/home-assistant`.
- **Dependency direction and isolation:** the proof imports public framework-neutral Wayglass state
  types only when necessary. Core packages, reference applications, and unrelated consumers do not
  import provider code. No provider transport or credential enters a browser bundle.
- **Registration and global behavior:** the proof defines no Custom Element, performs no import-time
  connection, installs no global listener, and mutates no application or provider state on import.
- **Version and compatibility unit:** a retained integration would version independently from the
  synchronized foundation family and declare compatible Wayglass and Home Assistant ranges based on
  evidence. Revision 1 establishes no range.
- **Non-goals:** a Home Assistant dashboard framework, Lovelace card, add-on, custom integration,
  entity registry, device/area/room abstraction, automation builder, discovery client, universal
  smart-home schema, account flow, OAuth client, token manager, remote-access service, history
  database, camera/media proxy, optimistic-control policy, production package, deployment, or
  publication.
- **Removal path:** delete the private proof, fixtures, root proof commands, and generated evidence;
  retain the charter and disposition. No production package, export, lockfile, or reference-app
  dependency changes in revision 1.

## Gap analysis and comparison baseline

### Existing options

| Approach                                             | Capability and task fit                                                          | Accessibility                                                           | Security and privacy                                                         | Performance and dependency cost                                               | Maintenance and compatibility                                           | Why it may be sufficient                                             |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Do nothing                                           | Every application owns its complete provider boundary                            | Existing UI remains accessible if mapping is correct                    | Credential, origin, logging, and reconnect policy are repeated               | No Wayglass code or dependency                                                | No shared compatibility promise, but no integration surface to maintain | Sufficient if only one application needs the connection              |
| Publish application guidance and fixtures            | Documents state-axis mapping, confirmation, redaction, and failure behavior      | Can require known-state and recovery behavior without new UI            | Adds no runtime credential owner                                             | Documentation and test-fixture cost only                                      | Provider changes require guidance review, not package releases          | Sufficient if translation is mostly application policy               |
| Application-owned direct REST/WebSocket client       | Completes snapshots, event streaming, and service calls with platform APIs       | UI consumes application truth through existing components               | Application owns token and exact network boundary                            | No provider-library dependency; connection code is application cost           | Each application owns protocol compatibility and retries                | Sufficient if the provider protocol surface stays very small         |
| Official Home Assistant JavaScript WebSocket library | Reuses provider-maintained connection and protocol behavior                      | Does not itself define Wayglass semantics or UI accessibility           | Credential storage and browser/server placement remain application decisions | Exact installed, bundled, transitive, and runtime cost would require evidence | Upstream tracks Home Assistant protocol changes                         | May be sufficient transport if a later charter revision justifies it |
| Private dependency-free translation proof            | Tests the semantic boundary independently of a live connection or client library | Can prove nonvisual application-state equivalence with no new component | Uses synthetic public-shaped fixtures and no credential/network              | Small proof-only type/test surface                                            | Wayglass must maintain any retained mapping contract                    | Useful only if it identifies reusable semantics beyond guidance      |

### Gap statement

Home Assistant and the web platform provide transport and provider data, while existing Wayglass
packages provide state and presentation semantics. Neither boundary decides how to preserve reported
value, knowledge, activity, request, and confirmed effect without importing Home Assistant
vocabulary into core. The proof asks whether that seam contains reusable integration behavior or is
better left as an application recipe.

## Dependency proposal

Revision 1 authorizes no new dependency. The fixture proof uses TypeScript, Node, and existing
repository test tools. The official Home Assistant JavaScript WebSocket library is a comparison
candidate only; installing or importing it requires a charter revision with an exact-version
dependency record.

| Field                                             | Finding                                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Package and version policy                        | None in revision 1                                                                                                        |
| Placement                                         | Not applicable                                                                                                            |
| Missing existing capability                       | The proof first tests whether pure provider-message translation and existing tools answer the decision                    |
| License and notices                               | Repository Apache-2.0 applies to proof source; fixtures are original minimal records shaped from public API documentation |
| Health, security, and update owner                | Wayglass maintainers own the proof; no upstream runtime is installed                                                      |
| Installed, packed, bundled, and type cost         | Zero dependency and lockfile delta; measure proof source and any retained output                                          |
| Runtime and browser implications                  | Node-only proof; no browser transport or support claim                                                                    |
| Network, telemetry, scripts, globals, transitives | No live network, telemetry, install script, global mutation, or transitive graph                                          |
| Replacement and removal                           | Delete the private proof and commands; retain charter evidence                                                            |
| Proof-only approval                               | Accepted by the project owner on 2026-08-30 for revision 1 only                                                           |

## Bounded proof

- **Single proof question:** can a small provider-specific translation boundary preserve selected
  Home Assistant state, connection knowledge, request acknowledgement, and confirmed provider effect
  more safely than ad hoc application mapping without becoming a universal device schema or
  credential-bearing client?
- **Minimum implementation:** immutable provider-message types and validation; a pure reducer over
  an initial state snapshot and ordered `state_changed` fixtures; a transport-neutral request
  lifecycle; application-supplied bindings for exactly four synthetic entities; stable diagnostics;
  and a fake port that can authenticate, disconnect, reconnect, acknowledge, fail, reorder,
  duplicate, and confirm fixture messages.
- **Private location:** `experiments/phase-5e-home-assistant/`; no workspace package, production
  barrel, reference-app import, browser route, deployment, or documentation claim of live support.
- **Inputs and deterministic fixtures:** versioned, repository-authored JSON/TypeScript fixtures
  shaped from the documented API for one light, one contact binary sensor, one climate entity, and
  one scalar sensor. Cases include valid, partial, unknown, unavailable, stale, malformed,
  unauthorized, disconnected, recovered, duplicated, out-of-order, request-acknowledged,
  request-failed, request-timed-out, and later-confirmed messages.
- **Semantic mapping:** provider `state` is a reported value, not condition. `unknown` and
  `unavailable` map to knowledge, not Boolean false. Connection loss preserves the last confirmed
  value while degrading knowledge. A service-call result acknowledges provider execution; only a
  later matching state update may confirm the provider-reported effect. The application still owns
  whether that effect satisfies its goal.
- **Comparison and measurements:** implement the same four-entity task as direct application-owned
  fixture mapping and through the candidate boundary; compare repeated decisions, files, lines,
  diagnostics, failure behavior, retained application policy, and complete removal. Measure a
  100-entity snapshot plus 1,000 ordered and adverse update messages over 50 warm runs.
- **Test envelope:** repository minimum Node 22.13 and current Node, supported pnpm, macOS and one
  available Linux environment, four primary entities, the 100/1,000 capacity fixture, and no live
  provider. Existing Wayglass browser and accessibility suites remain regression gates because the
  proof adds no visual or interactive runtime.
- **External effects:** none. No DNS, HTTP, WebSocket, credential, personal data, device command,
  provider account, analytics, storage, screenshot, browser bundle, deployment, or external mutation
  is allowed in ordinary proof work.
- **Retained evidence:** charter revisions, provider-contract inventory, mapping table, fixture
  manifest, adverse diagnostics, request/confirmation traces, reconnect results, performance raw
  data, comparison record, dependency and bundle audit, cleanup plan, deviations, limitations, and
  disposition.
- **Cleanup targets:** private source, fixtures, commands, generated traces, caches, logs, profiles,
  and any proof artifact not accepted by disposition.
- **Bound:** four primary entities; snapshot, state-change subscription, one reversible light
  `turn_on`/`turn_off` service family, one connection; no discovery, registries, history, templates,
  automations, media, cameras, areas, devices, dashboards, or production UI.
- **Quality gates:** proof typecheck/tests; deterministic and adverse fixture checks; secret,
  network, bundle, import, dependency, and log scans; minimum/current Node; capacity measurements;
  clean removal simulation; `pnpm check`; docs build; `git diff --check`; and unchanged production
  browser regression coverage.

### Staged proof plan

1. **Provider model:** implement the closed projected state/event contract, four synthetic bindings,
   immutable reducer, ordering, connection knowledge, and request/acknowledgement/effect separation.
2. **Fake port:** add the bounded authentication and command envelopes, deterministic transport,
   unauthorized/disconnect/reconnect behavior, cancellation, retry/backoff, deduplication, and safe
   logging evidence.
3. **Scale and isolation:** run the fixed capacity/performance matrix, minimum/current runtime,
   dependency/bundle/secret scans, comparison baseline, and executable removal simulation.
4. **Disposition:** complete every evidence row, record adverse findings and limitations, clean up
   rejected surfaces, and seek an accept-artifact, guidance-only, defer, revise, or reject decision.

**Stage 1 result:** Implemented on August 30, 2026. The private proof now validates and freezes the
projected provider state and `state_changed` fields used by the charter, applies the exact four
synthetic bindings through one pure reducer, rejects malformed and duplicate identities and unsafe
attribute envelopes, ignores unselected/duplicate/out-of-order updates, preserves reported values
through disconnection as stale knowledge, and separates request, acknowledgement, failure, timeout,
and later matching provider-effect confirmation. It adds no package, dependency, lockfile change,
network, credential, browser surface, production import, or public API. The retained
[Stage 1 provider-model evidence](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5e-home-assistant/evidence/stage-1-provider-model.md)
records the exact boundary and unsupported claims.

**Stage 2 result:** Implemented on August 31, 2026. The proof now adds closed
authentication-outcome, command, result, and event envelopes plus a deterministic fake port. It
requires the documented authentication order, bootstraps snapshot and state subscription before
becoming ready, blocks after an unauthorized outcome, separates light command acknowledgement from
later matching state, deduplicates bounded request/result/event identities, and preserves truth
through failure, cancellation, disconnection, and out-of-order input. Reconnect uses logical
100/200/400 millisecond backoff and never replays a mutating command. Bounded logs retain stable
codes but omit provider values, entity identities, versions, and messages. The proof still contains
no credential-bearing message, network, timer, random source, dependency, package, production
import, or public API. The retained
[Stage 2 fake-port evidence](https://github.com/Actesis/Wayglass/blob/main/experiments/phase-5e-home-assistant/evidence/stage-2-fake-port.md)
records the safety decisions and unsupported claims. Stage 3 scale-and-isolation work is the next
authorized implementation boundary.

## Criteria fixed before work

### Success

1. One immutable reducer completes the four-entity snapshot/update task and preserves provider
   value, last-changed/updated timestamps, connection knowledge, and source identity without
   changing application-owned condition, labels, policy, or confirmed domain meaning.
2. Unknown, unavailable, stale, disconnected, malformed, duplicate, out-of-order, and recovered
   cases produce stable explicit results; none is coerced to a normal Boolean value or silently
   overwrites newer confirmed provider state.
3. A reversible light request enters pending without rewriting the last confirmed value; provider
   acknowledgement remains distinct; failure or timeout retains prior truth; and only a later
   matching ordered state update produces provider-effect confirmation.
4. The proof uses no credential or network, adds no dependency or lockfile entry, enters no browser
   or production bundle, performs no import-time effect, and can be removed without changing a core,
   icon-absent, or reference-application consumer.
5. The 100-entity/1,000-message fixture completes with a median below 100 milliseconds and less than
   32 MiB retained heap growth across 50 warm runs on the named current maintainer environment; raw
   results, variance, and limitations are retained.
6. The comparison identifies fewer repeated semantic decisions or safer failure behavior than the
   direct application baseline. Otherwise guidance or an example—not an adapter artifact—is the
   passing outcome.

Meeting these criteria starts disposition review. It does not approve a package, dependency, live
connection, Home Assistant compatibility range, deployment, credential, or publication.

### Stop early

1. Stop if useful reuse requires a universal device/room/entity schema, application condition
   inference, provider-specific properties in core components, or optimistic state presented as
   confirmed.
2. Stop if the proof needs a credential, live network, provider mutation, browser token, new
   dependency, production package, or public export without an accepted charter revision.
3. Stop if documented Home Assistant messages cannot represent acknowledgement and later state
   confirmation as separate events inside the fixed bound.
4. Stop if malformed or out-of-order provider input can corrupt newer application truth without a
   bounded validation strategy.

### Reject

1. Reject an adapter artifact if ordinary application composition or direct provider-library use
   completes the task with equal semantic safety and lower shared maintenance.
2. Reject if the candidate owns domain policy, hides provider uncertainty, requires broad
   credentials, leaks tokens or private entity data, or cannot be isolated from unrelated consumers.
3. Reject a package if no named independent consumer exists beyond the proof or no maintainer owns
   provider compatibility and security updates.

### Defer

| Missing evidence or prerequisite                                                    | Owner                | Decision impact                                              | Objective review trigger                                                                   | Earliest review                      |
| ----------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| Exact live Home Assistant environment, version, installation type, and network path | Project owner        | Blocks provider compatibility claim, not the synthetic proof | A user-controlled instance is nominated                                                    | After synthetic evidence is complete |
| Dedicated least-privilege credential and revocation plan                            | Environment owner    | Blocks any live authentication                               | Written live-smoke approval names token owner, storage, permissions, logging, and deletion | With nominated instance              |
| Approved live entity and mutation set                                               | Project owner        | Blocks live command testing                                  | Read-only entities and any reversible service action are explicitly listed                 | With live-smoke approval             |
| Named independent integration consumer and maintainer                               | Wayglass maintainers | Blocks a public adapter package                              | A second real application and compatibility owner commit to the task                       | Before implementation contract       |

### Revise charter when

Revise before adding a dependency, live network, credential, browser transport, OAuth flow, REST
client, WebSocket client, provider mutation, registry/discovery endpoint, history, camera/media
data, personal entity data, production package, public export, deployment, or broader compatibility
claim. Changing the four-entity task, performance envelope, tier, owner, comparison baseline, or
success threshold also requires revision.

## Evidence plan and results

| Evidence ID | Category                        | Environment and versions                                      | Fixture or data                                                                                | Method and expected result                                                                                  | Actual result and artifact                                                    | Reviewer and date                   | Limitation                                    | Decision impact                      |
| ----------- | ------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------ |
| `P5E-E01`   | Provider contract and inventory | Official Home Assistant developer docs as reviewed 2026-08-30 | Minimal auth, snapshot, subscription, event, service, and result envelopes                     | Account for every used field and explicitly exclude the rest                                                | Stages 1–2 projected contract recorded; completeness remains pending          | Project owner and maintainer        | Documentation is not a live provider          | Controls proof vocabulary            |
| `P5E-E02`   | Semantic mapping and ownership  | Node 22.13 and current Node                                   | Four primary entity fixtures                                                                   | Preserve value, knowledge, activity, request, and provider effect without condition inference               | Stages 1–2 pass on the current Node environment; minimum Node remains pending | Project owner and maintainer        | Synthetic entities only                       | Controls artifact fit                |
| `P5E-E03`   | Request and confirmation        | Node 22.13 and current Node                                   | Acknowledged, failed, timed-out, mismatched, and confirmed light requests                      | Acknowledgement never changes confirmed value; later ordered event may confirm                              | Stage 2 fake-port traces pass; minimum Node remains pending                   | Project owner and maintainer        | One reversible service family                 | Controls safety claim                |
| `P5E-E04`   | Failure, ordering, and recovery | Node 22.13 and current Node                                   | Unauthorized, malformed, partial, duplicate, out-of-order, disconnected, and recovered streams | Stable diagnostics; retain newer and last-confirmed truth; bounded reconnect model                          | Stage 2 adverse and reconnect tests pass; runtime matrix remains pending      | Maintainer                          | Fake port, no real network                    | Controls robustness claim            |
| `P5E-E05`   | Security and privacy            | Repository and built outputs                                  | Source, fixtures, logs, environment access, browser bundles                                    | Zero secret/network requirement; no token, private entity, endpoint, or provider code in production bundles | Stage 2 source/log boundary passes; complete Stage 3 scans remain pending     | Project owner and maintainer        | Static/dynamic local inspection only          | Blocks unsafe retention              |
| `P5E-E06`   | Isolation and removal           | Clean fixture consumer and repository                         | Core, reference-app, and proof imports plus removal manifest                                   | No dependency/export/registration delta; complete proof removal leaves production unchanged                 | Pending                                                                       | Maintainer                          | Workspace evidence only                       | Controls tier and cleanup            |
| `P5E-E07`   | Capacity and performance        | Named current maintainer environment                          | 100 entities and 1,000 messages, 50 warm runs                                                  | Median below 100 ms and retained heap growth below 32 MiB with semantics intact                             | Pending                                                                       | Maintainer                          | Not provider/network latency                  | Controls proportionality             |
| `P5E-E08`   | Accessibility and UI regression | Existing supported-browser suite                              | Unchanged production components and Cedar House known-state cases                              | No new visual surface; existing keyboard, Axe, zoom, forced-color, and state tests remain green             | Pending                                                                       | Maintainer                          | Does not establish live integration usability | Blocks regression                    |
| `P5E-E09`   | Comparison and maintenance      | Current application-owned baseline versus proof               | Same four-entity add/change/remove task                                                        | Record decisions, lines, diagnostics, policy leakage, version owner, and removal cost                       | Pending                                                                       | Project owner and maintainer        | One provider and synthetic home               | Controls disposition                 |
| `P5E-E10`   | Live provider smoke             | Separately approved exact environment                         | Approved read-only set and optional reversible command                                         | Verify documented messages, redaction, disconnect/recovery, and cleanup                                     | Deferred; no environment or credential approved                               | Project owner and environment owner | Required before provider compatibility claim  | Does not block mock-only disposition |

### Evidence category omissions

- No new component, token, theme, Custom Element, or public API is proposed, so revision 1 adds no
  component-specific keyboard, responsive, localization, or visual-regression surface. Existing
  application regressions still run.
- Package packing, peer ranges, publication, provenance, and clean external install are omitted
  until a disposition proposes a permanent package.
- Browser transport and live provider timing are omitted because revision 1 forbids network and
  credentials. The live-smoke gate controls those claims.

### Deviations and adverse evidence

None yet. Record every message shape, semantic case, threshold, or environment that differs from
this revision before interpreting results.

### Claims not supported

Revision 1 cannot establish live Home Assistant compatibility, physical-device truth, complete API
coverage, remote access, browser-safe token handling, OAuth, add-on or Lovelace compatibility,
registry or discovery support, universal entity semantics, production reliability, a public package,
or publication readiness.

## Disposition

- **Outcome:** pending evidence.
- **Decision date and approver:** pending.
- **Reasoning:** pending.
- **Retained ownership and boundaries:** pending.
- **Known limitations:** pending.
- **Follow-up authorized:** the four private proof stages fixed above; no live connection,
  dependency, production artifact, or public surface.
- **Remaining approvals and gates:** charter approval; then evidence-complete and disposition
  review; separate live environment/credential approval; separate implementation and release
  governance if an artifact is accepted.
- **Cleanup completed:** not applicable while proposed.

Acceptance as an artifact candidate would not authorize publication or permanent implementation.
