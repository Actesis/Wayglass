# Wayglass ecosystem-exploration record

**Status:** Accepted for Phase 5A on August 15, 2026. This contract defines how a Phase 5
exploration is proposed, bounded, evidenced, and dispositioned. It does not authorize an
implementation, dependency, package, credential, deployment, publication, or support claim.

The [canonical record template](./templates/phase-5-exploration-template.md) implements this
contract. Every Phase 5B–5F track starts from a copy of that template and links its evidence rather
than replacing required fields with an informal plan.

## Purpose

An exploration exists to answer a decision, not to justify a predetermined artifact. Its record must
make it possible for a reviewer to determine:

- whose concrete task is not adequately served;
- whether the gap belongs to Wayglass, an application, a provider, a platform, or another tool;
- what the smallest credible proof can establish;
- which costs and risks would become permanent if the result were retained; and
- why the evidence supports acceptance, guidance only, deferral, revision, or rejection.

Passing tests proves that a candidate works within the tested envelope. It does not prove that the
candidate belongs in Wayglass.

## Record lifecycle

Each record carries one lifecycle state and a dated history of transitions.

| State               | Meaning                                                                                              | Permitted work                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `proposed`          | The task, gap, owner, and proof are being reviewed.                                                  | Read-only research and edits to the record.                          |
| `charter-accepted`  | Scope, safeguards, criteria, location, and evidence plan are accepted.                               | The explicitly bounded private proof and its validation.             |
| `evidence-complete` | Planned evidence and deviations are recorded.                                                        | Review and disposition; no scope expansion.                          |
| `revised`           | Material assumptions, scope, tier, dependency, or proof design changed, closing the current charter. | No further proof work until a new revision is proposed and accepted. |
| `dispositioned`     | An accept-artifact, guidance-only, defer, or reject outcome and its consequences are accepted.       | Only the follow-up named by that outcome.                            |

`charter-accepted` authorizes only the proof described by the record. It does not approve a public
API or create a presumption that implementation should continue.

## Required record sections

### Identity and decision

The header names:

- track and stable record identifier;
- lifecycle state and revision;
- accountable owner and evidence reviewers;
- creation, last-review, and target-decision dates;
- related roadmap milestone, ADRs, contracts, and prior evidence; and
- one decision question that can be answered by a defined disposition.

The decision question must be neutral. Prefer “What, if anything, should Wayglass own?” over “How
should Wayglass ship this package?”

### User, task, and consequence

Name a credible user or maintainer, the complete task, the current path, and the consequence of the
gap. Separate observed evidence from a hypothetical need. Record the domain context without
generalizing its nouns into a Wayglass schema.

The record identifies who owns the source of truth, policy, authorization, data lifecycle, and
confirmed result today. A task is not a Wayglass gap merely because several applications contain
similarly shaped code.

### Boundary and artifact hypothesis

Name one provisional tier from
[ADR 0031](../architecture/adr/0031-ecosystem-artifact-architecture.md), the proposed owner,
consumers, support environment, and non-goals. State:

- what Wayglass might own;
- what remains application-, provider-, platform-, framework-, or designer-owned;
- allowed dependency direction and public surfaces that might change;
- whether runtime behavior remains framework-neutral;
- registration, global-state, package, and versioning implications; and
- the removal path if the hypothesis fails.

Repository placement follows the ADR. A private prototype does not enter a production package or
production barrel before package status is accepted.

### Gap analysis and comparison baseline

Describe why the web platform, current Wayglass packages, ordinary application composition, direct
Custom Element use, provider SDK, or established tool is insufficient. Every exploration compares
the smallest credible alternatives, including doing nothing and publishing guidance only.

For each candidate approach, record capability, accessibility, security, privacy, performance,
maintenance, compatibility, dependency, and removal tradeoffs. A preference, popularity ranking,
code-size reduction, or successful spike is not a platform-gap analysis.

### Dependency record

Before installing or importing a new dependency, the charter records:

- exact package and intended version policy;
- runtime, development, peer, optional, or proof-only placement;
- the missing platform or existing-dependency capability;
- license and notice obligations;
- maintainer and release health, security history, and update owner;
- installed, packed, bundled, type-surface, and browser or runtime cost;
- network, telemetry, install-script, global-state, and transitive behavior; and
- replacement or removal strategy.

Dependency approval is scoped to the accepted proof. Promotion requires the dependency analysis to
be repeated against the proposed permanent artifact.

### Bounded proof

The proof plan specifies:

- the single question and minimum implementation needed to answer it;
- exact private location, inputs, fixtures, and environment;
- comparison baseline and measurement method;
- data envelope, devices, browsers, assistive technology, frameworks, providers, or design tools;
- credentials, privacy, network, and external-side-effect policy;
- artifacts to retain as evidence and artifacts to remove afterward;
- time or complexity bound and early-stop conditions; and
- quality gates that remain mandatory while the proof is private.

Synthetic deterministic evidence is preferred. Live credentials, external mutations, public
deployment, personal data, analytics, or package publication require separate explicit approval.

### Evidence plan

Evidence is proportional to the provisional tier and risk. The record selects applicable rows from
the Phase 5 validation plan and states why each omitted category does not apply. At minimum it
covers:

- task completion and comparison-baseline results;
- semantic and ownership preservation;
- accessibility and non-visual equivalence where meaning or interaction is visual;
- performance, memory, bundle, dependency, and failure behavior;
- browser, runtime, framework, provider, or design-tool compatibility;
- security, privacy, credentials, network, and generated-output integrity;
- deterministic tests, production visual review, documentation, and cleanup; and
- exact limitations and claims the evidence cannot support.

An evidence entry names the environment and versions, fixture or data set, method, expected result,
actual result, artifact link, reviewer, date, limitation, and disposition impact. “Pass” without
those fields is not reusable evidence.

## Criteria fixed before proof work

Criteria must be observable and must distinguish technical feasibility from project fit.

### Success criteria

Success requires all named thresholds, including evidence that Wayglass ownership is better than the
comparison baseline. Criteria include the smallest acceptable task envelope, semantic and
accessibility behavior, cost limits, maintenance ownership, and safe failure or removal behavior.

Meeting success criteria permits a disposition review. It does not automatically accept an artifact
or publication.

### Stop criteria

Stop the proof early when continuing cannot change the decision within the accepted bounds. Typical
conditions include semantic inversion, inaccessible essential meaning, provider or framework
behavior that cannot be isolated, unacceptable dependency or bundle cost, credential or privacy
risk, missing maintainer ownership, or a platform solution that makes the candidate unnecessary.

Record the evidence obtained before cleanup; do not expand scope to rescue a preferred result.

### Rejection criteria

Reject when evidence shows that the capability:

- belongs to an application, provider, platform, framework, or design tool;
- duplicates adequate composition or direct use;
- requires a universal domain schema or conflates Wayglass state axes;
- cannot meet essential accessibility, security, privacy, or compatibility requirements;
- introduces cost or maintenance disproportionate to the task; or
- has no credible owner or removal path.

Rejection is useful evidence. It records what was learned and prevents the same unsupported premise
from returning under a different package name.

### Deferral criteria

Defer only when named external evidence, consumer demand, platform capability, maintainer capacity,
provider access, or prerequisite architecture could materially change the decision. The record must
name the blocker, owner, release impact, review trigger, and earliest useful review point.

“Later,” incomplete work, or lack of enthusiasm is not a deferral criterion.

### Revision triggers

Return the record to `revised` before work continues if the user, task, tier, package boundary,
dependency class, credential use, data sensitivity, public surface, deployment, comparison baseline,
success threshold, or proof location changes materially. The revision history explains the change
and identifies evidence that remains valid.

Small implementation discoveries may be logged without revision only when they stay inside the
accepted ownership, risk, and evidence envelope.

## Disposition outcomes

Exactly one disposition is accepted for an evidence-complete exploration. `Revise` ends the current
charter and returns the record lifecycle to `revised`; the other outcomes move it to
`dispositioned`.

| Outcome                       | Required conclusion                                                                            | Permitted follow-up                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Accept artifact candidate** | Names tier, owner, proposed surface, dependencies, evidence, limitations, and remaining gates. | A separate implementation contract and consequential ADR; still private.     |
| **Accept guidance only**      | Explains why the task is reusable but code or design ownership is not.                         | Documentation or example work within the named scope.                        |
| **Defer**                     | Names the unresolved evidence, owner, impact, and objective review trigger.                    | No implementation until the trigger occurs and the charter is reviewed.      |
| **Revise**                    | Shows why the current question or proof cannot support a decision.                             | A new charter revision; existing proof authority ends.                       |
| **Reject**                    | Records the failed premise, retained learning, cleanup, and conditions required to reconsider. | No continued implementation; reconsideration starts a new or revised record. |

An accepted artifact candidate is not release approval. It remains subject to architecture,
implementation, tier-specific validation, support, compatibility, package-content, and
[release-governance](./release-governance.md) gates.

## Evidence integrity and cleanup

- Preserve results that contradict the preferred outcome alongside favorable results.
- Identify inference separately from measured or observed evidence.
- Link immutable or reproducible artifacts; do not rely on screenshots alone where structured output
  exists.
- Record deviations and missing evidence instead of silently narrowing the claim afterward.
- Remove rejected prototypes, unused dependencies, generated outputs, credentials, public exports,
  and temporary automation unless the disposition names a continuing private evidence purpose.
- Confirm cleanup with repository status, dependency, export, registration, secret, and build
  checks.

The final record remains in the repository even when its prototype is removed.

## Approval boundaries

The exploration owner may prepare and run only an accepted, repository-local, private proof. The
record separately identifies approvals required for new dependencies, live credentials, external
mutations, provider access, public deployment, repository visibility, package creation, publication,
telemetry, personal data, design-tool sharing, or support claims.

No lifecycle state in this contract supersedes those approval boundaries.
