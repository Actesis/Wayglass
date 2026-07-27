# Semantic model

Wayglass separates domain value, known state, and section purpose.

## Domain value

A domain value answers a domain question such as `on`/`off`, `open`/`closed`, or
`verified`/`unverified`. Domain packages own these values and their human-readable labels.

Genuinely Boolean values map to the shared visual roles `asserted` and `not-asserted`. These roles
carry no health meaning. Richer finite values must not be flattened into a Boolean.

## Known state

Known state answers three independent questions:

1. **Condition:** What is the system's interpreted condition?
2. **Knowledge:** How well does the system know that condition?
3. **Activity:** Is an action or transition still underway?

| Axis      | Values                                                        |
| --------- | ------------------------------------------------------------- |
| Condition | neutral, informational, positive, caution, critical           |
| Knowledge | confirmed, inferred, stale, unknown, conflicting, unavailable |
| Activity  | idle, pending                                                 |

A critical condition may also be stale. A positive condition may still have a pending requested
change. Interfaces must communicate applicable axes using labels or iconography in addition to
color.

Domain value is not a fourth known-state axis. A lamp may be off with a positive condition, or last
known as on with stale knowledge.

## Section purpose

Sections declare one of three purposes:

| Purpose     | Responsibility                                         |
| ----------- | ------------------------------------------------------ |
| Information | Explain or provide reference and contextual content    |
| Monitor     | Present current or changing state                      |
| Control     | Offer actions that can change a system or domain value |

Function ownership and section purpose remain independent.
