# Known-state model

Operational state has three independent axes:

| Axis      | Question                           | Values                                                        |
| --------- | ---------------------------------- | ------------------------------------------------------------- |
| Condition | What is the interpreted condition? | neutral, informational, positive, caution, critical           |
| Knowledge | How well is it known?              | confirmed, inferred, stale, unknown, conflicting, unavailable |
| Activity  | Is a transition underway?          | idle, pending                                                 |

These axes must remain independent. For example, a critical condition may be based on stale
telemetry, while a positive condition may still have a requested action pending.

Color may reinforce these meanings but must never be the only way they are communicated.
