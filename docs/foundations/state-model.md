# Known-state model

Wayglass represents operational state through three independent questions:

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

Domain packages may add domain facts, but they must map those facts to these shared meanings rather
than redefining the axes.
