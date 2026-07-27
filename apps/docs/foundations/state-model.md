# Semantic model

Wayglass separates domain value, known state, and section purpose.

## Domain value

A domain value answers a domain question such as `on`/`off`, `open`/`closed`, or
`verified`/`unverified`. Genuinely Boolean values map to `asserted` and `not-asserted`; neither role
implies health. Richer finite values must not be flattened into a Boolean.

## Known state

| Axis      | Question                           | Values                                                        |
| --------- | ---------------------------------- | ------------------------------------------------------------- |
| Condition | What is the interpreted condition? | neutral, informational, positive, caution, critical           |
| Knowledge | How well is it known?              | confirmed, inferred, stale, unknown, conflicting, unavailable |
| Activity  | Is a transition underway?          | idle, pending                                                 |

Color may reinforce these meanings but must never be the only way they are communicated.

Domain value is not a fourth known-state axis. A lamp may be off with a positive condition, or last
known as on with stale knowledge.

## Section purpose

| Purpose     | Responsibility                                         |
| ----------- | ------------------------------------------------------ |
| Information | Explain or provide reference and contextual content    |
| Monitor     | Present current or changing state                      |
| Control     | Offer actions that can change a system or domain value |

Function ownership and section purpose remain independent.
