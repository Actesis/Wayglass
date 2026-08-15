# Phase 5 exploration: [track name]

> Copy this file for one exploration. Replace every bracketed prompt, delete instructional text, and
> link evidence rather than pasting opaque summaries. The normative requirements are in the
> [ecosystem-exploration record](../ecosystem-exploration-record.md).

## Record control

| Field              | Value                                            |
| ------------------ | ------------------------------------------------ |
| Record ID          | `[stable-id]`                                    |
| Roadmap track      | `[Phase 5B–5F or separately approved track]`     |
| Lifecycle state    | `proposed`                                       |
| Revision           | `1`                                              |
| Owner              | `[accountable person or role]`                   |
| Evidence reviewers | `[names or roles]`                               |
| Created            | `[YYYY-MM-DD]`                                   |
| Last reviewed      | `[YYYY-MM-DD]`                                   |
| Target decision    | `[date or objective trigger]`                    |
| Related records    | `[roadmap, ADRs, contracts, and prior evidence]` |

### Decision question

[Ask one neutral question that a defined disposition can answer.]

### Revision history

| Revision | Date     | Change           | Evidence still valid | Approval |
| -------- | -------- | ---------------- | -------------------- | -------- |
| 1        | `[date]` | Initial proposal | None                 | Pending  |

## User, task, and consequence

- **Credible user or maintainer:** [Who experiences or owns the problem?]
- **Complete task:** [What outcome are they trying to reach?]
- **Observed evidence:** [What real or representative evidence establishes the need?]
- **Current path:** [How is the task completed today?]
- **Gap and consequence:** [What fails, costs too much, or remains inaccessible?]
- **Current truth and policy owners:** [Who owns data, authorization, lifecycle, and confirmed
  result?]
- **Domain context:** [Which nouns and rules must not be generalized?]

## Boundary and artifact hypothesis

- **Provisional tier:** [One ADR 0031 tier.]
- **Proposed Wayglass ownership:** [Smallest possible responsibility.]
- **Application ownership:** [Records, policy, routes, persistence, labels, or workflows retained.]
- **External ownership:** [Provider, framework, platform, or design-tool responsibility retained.]
- **Consumers and support environment:** [Who imports or uses it, where, and at which versions?]
- **Potential public surface:** [Package, exports, generated artifact, guidance, or none.]
- **Dependency direction and isolation:** [How non-consumers remain unaffected.]
- **Registration and global behavior:** [Explicit registration and side-effect boundaries.]
- **Version and compatibility unit:** [Foundation family, independent artifact, or not applicable.]
- **Non-goals:** [Specific adjacent capabilities excluded.]
- **Removal path:** [How the proof disappears cleanly if not accepted.]

## Gap analysis and comparison baseline

### Existing options

| Approach                                                                | Capability and task fit | Accessibility | Security and privacy | Performance and dependency cost | Maintenance and compatibility | Why it may be sufficient |
| ----------------------------------------------------------------------- | ----------------------- | ------------- | -------------------- | ------------------------------- | ----------------------------- | ------------------------ |
| Do nothing                                                              | [result]                | [result]      | [result]             | [result]                        | [result]                      | [analysis]               |
| Guidance or application composition                                     | [result]                | [result]      | [result]             | [result]                        | [result]                      | [analysis]               |
| Platform, direct Custom Elements, provider SDK, or current Wayglass API | [result]                | [result]      | [result]             | [result]                        | [result]                      | [analysis]               |
| Candidate proof                                                         | [hypothesis]            | [hypothesis]  | [hypothesis]         | [hypothesis]                    | [hypothesis]                  | [expected advantage]     |

### Gap statement

[State the capability absent from adequate existing options and why Wayglass may be the right
owner.]

## Dependency proposal

Use one row per proposed dependency. Write “none” and explain the platform approach when applicable.

| Field                                             | Finding                                         |
| ------------------------------------------------- | ----------------------------------------------- |
| Package and version policy                        | `[name, range, and lock behavior]`              |
| Placement                                         | `[runtime, dev, peer, optional, or proof-only]` |
| Missing existing capability                       | `[specific gap]`                                |
| License and notices                               | `[finding]`                                     |
| Health, security, and update owner                | `[finding and owner]`                           |
| Installed, packed, bundled, and type cost         | `[measurement plan or result]`                  |
| Runtime and browser implications                  | `[finding]`                                     |
| Network, telemetry, scripts, globals, transitives | `[finding]`                                     |
| Replacement and removal                           | `[plan]`                                        |
| Proof-only approval                               | `[pending, accepted, or rejected with record]`  |

## Bounded proof

- **Single proof question:** [What one uncertainty will the proof resolve?]
- **Minimum implementation:** [What must exist—and no more?]
- **Private location:** [Temporary or example-owned path; no production barrel exports.]
- **Inputs and deterministic fixtures:** [Data and provenance.]
- **Comparison and measurements:** [Baseline, method, repetitions, and thresholds.]
- **Test envelope:** [Data size, browsers, devices, AT, frameworks, providers, or design tools.]
- **External effects:** [Network, credentials, mutations, privacy, analytics, and explicit
  approvals.]
- **Retained evidence:** [Records kept after disposition.]
- **Cleanup targets:** [Prototype, dependency, output, configuration, or authority removed.]
- **Bound:** [Time, complexity, or implementation ceiling.]
- **Quality gates:** [Repository and proof-specific commands and reviews.]

## Criteria fixed before work

### Success

1. [Observable task and ownership threshold.]
2. [Semantic and accessibility threshold.]
3. [Performance, dependency, security, and maintenance threshold.]
4. [Evidence that the candidate improves on the comparison baseline.]

Meeting these criteria starts disposition review; it does not approve an artifact.

### Stop early

1. [Condition showing continued work cannot change the decision.]
2. [Risk or boundary violation requiring cleanup or new authority.]

### Reject

1. [Evidence that ownership belongs elsewhere or composition is sufficient.]
2. [Essential quality, cost, compatibility, or maintenance failure.]

### Defer

| Missing evidence or prerequisite | Owner   | Decision impact | Objective review trigger | Earliest review     |
| -------------------------------- | ------- | --------------- | ------------------------ | ------------------- |
| [item]                           | [owner] | [impact]        | [trigger]                | [date or milestone] |

### Revise charter when

[List material changes to user, task, tier, dependency, data, authority, surface, proof, or
criteria.]

## Evidence plan and results

Select applicable Phase 5 validation-plan categories and justify omissions.

| Evidence ID | Category   | Environment and versions | Fixture or data | Method and expected result | Actual result and artifact | Reviewer and date | Limitation    | Decision impact |
| ----------- | ---------- | ------------------------ | --------------- | -------------------------- | -------------------------- | ----------------- | ------------- | --------------- |
| `[id]`      | [category] | [exact environment]      | [input]         | [method and threshold]     | Pending                    | [reviewer/date]   | [known limit] | Pending         |

### Deviations and adverse evidence

[Record deviations from the accepted proof and evidence that contradicts the preferred outcome.]

### Claims not supported

[List conclusions this evidence cannot justify.]

## Disposition

- **Outcome:** `[accept artifact candidate | accept guidance only | defer | revise | reject]`
- **Decision date and approver:** `[date and person or role]`
- **Reasoning:** [Connect actual evidence to the precommitted criteria and comparison baseline.]
- **Retained ownership and boundaries:** [What Wayglass and others own after this decision.]
- **Known limitations:** [Exact unsupported conditions.]
- **Follow-up authorized:** [Separate contract, ADR, documentation scope, review trigger, or none.]
- **Remaining approvals and gates:** [Dependencies, support, release, deployment, credentials, etc.]
- **Cleanup completed:** [Removed paths, dependencies, exports, credentials, outputs, and checks.]

Acceptance as an artifact candidate does not authorize publication or permanent implementation.
