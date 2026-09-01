# External-state integrations

**Status:** Accepted application-author guidance from the Phase 5E Home Assistant exploration on
August 31, 2026. This guide defines semantic and ownership practices. It is not a Wayglass adapter,
package API, transport, credential design, or provider compatibility claim.

Operational interfaces often consume state and commands from an external provider. The integration
is safest when provider vocabulary stops at an application-owned boundary and the application gives
Wayglass components domain-neutral truth.

## Keep the state axes separate

An external value does not answer every application question.

| Input or event                                          | Application projection              | What it does not establish                                  |
| ------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------- |
| Provider value such as `on`, `off`, `open`, or a number | Reported value                      | Good or bad condition, desired state, or user intent        |
| Provider `unknown`                                      | Unknown knowledge                   | Boolean false or an error condition                         |
| Provider `unavailable`                                  | Unavailable knowledge               | The last value becoming false or unsafe                     |
| Connection loss after a confirmed value                 | Retained value with stale knowledge | A new value or confirmed failure                            |
| Command accepted by the provider                        | Request acknowledged                | The requested effect occurred                               |
| Later ordered matching provider state                   | Provider effect confirmed           | The application goal or physical-world outcome is satisfied |
| Application rules and evidence                          | Condition and domain meaning        | Provider protocol status                                    |

This follows Wayglass's separation of condition, knowledge, and activity. A value may be confirmed
without being desirable, stale without being false, or unavailable without proving a fault.

## Application-owned boundary

Treat the provider adapter as an input port to the application rather than a component data model.
The application should own records conceptually like this:

```ts
interface ExternalProjection<Value, Attributes = unknown> {
  sourceId: string;
  reportedValue: Value | null;
  attributes: Attributes;
  knowledge: 'confirmed' | 'stale' | 'unavailable' | 'unknown';
  lastChanged: string | null;
  lastUpdated: string | null;
  request: {
    id: string;
    requestedValue: Value;
    phase: 'pending' | 'acknowledged' | 'confirmed' | 'failed' | 'timed-out';
  } | null;
}
```

This is illustrative application-local TypeScript, not a Wayglass export. Applications may need
different fields, vocabularies, histories, or provenance. Keep condition, labels, formatted text,
units, permissions, and desired-state policy outside this provider projection.

## Ingestion sequence

1. Allowlist the exact external identities the application selected. Do not discover a domain model
   merely because the provider exposes more records.
2. Validate the envelope at the provider boundary. Reject malformed identities, timestamps, value
   shapes, and unexpected command correlations with stable diagnostics.
3. Apply the initial snapshot without inferring condition.
4. Order updates by the provider's relevant update timestamp. Ignore duplicates and updates older
   than the retained record.
5. Map missing provider values to knowledge. Preserve a previously confirmed value when connection
   knowledge becomes stale.
6. Project the application record into Wayglass components using existing condition, knowledge,
   activity, and control semantics.

Do not place provider identifiers, authentication outcomes, transport errors, or service names in
core component properties. Visible explanations may name the provider when that context helps the
user understand freshness, availability, or recovery.

## Controlled requests

Keep requested, acknowledged, and confirmed truth distinct:

1. Record the user's requested value and a correlation identity without changing the last confirmed
   provider value.
2. Treat a successful command result as acknowledgement that the provider accepted execution.
3. Treat provider rejection or local timeout as request failure while retaining the previous
   confirmed value.
4. Confirm provider effect only after a later, ordered, matching state update.
5. Let application policy decide whether the provider effect satisfies the user's goal.

If a connection drops after a mutating request may have been delivered, do not replay the mutation
automatically. Reconnect, refresh state, and require policy or a fresh user decision. Automatic
retry is appropriate only when the operation is known to be idempotent and the application
explicitly owns that guarantee.

## Home Assistant recipe

This recipe is intentionally provider-specific and application-owned. It is shaped from the official
Home Assistant REST and WebSocket developer documentation reviewed for Phase 5E. It covers only a
snapshot, `state_changed` subscription, and one reversible light service family. It is not a
complete wire-message parser or compatibility promise.

### Select and translate

Configure an allowlist that maps Home Assistant `entity_id` values to application keys. For example,
an application might select one light, contact sensor, climate entity, and scalar sensor. The
application key should remain stable even if presentation labels or routes change.

For each selected state:

- retain `entity_id` only as provider source identity;
- treat `state` as an uninterpreted reported value;
- retain only application-needed attributes after runtime validation;
- use `last_updated` for update ordering and retain `last_changed` as provider-reported change
  context; and
- map literal `unknown` and `unavailable` to knowledge rather than ordinary values.

An application may map a contact sensor's reported `on` to visible “Open” text, but that mapping is
domain presentation. It must not turn `on` into warning condition without an application rule.

### Bootstrap and subscribe

After the deployment-owned authentication succeeds:

1. obtain the current state snapshot with the documented state command or REST state endpoint;
2. subscribe to `state_changed` events;
3. validate and apply only selected entities; and
4. consider the integration ready only after both snapshot and subscription succeed.

On reconnect, repeat snapshot and subscription bootstrap. Do not replay a mutating service call.
Preserve the last confirmed application projection as stale until refreshed evidence arrives.

### Request one light change

For a selected light, the application may issue the documented light `turn_on` or `turn_off` service
action through its deployment-owned transport. Correlate the provider result with the pending local
request.

- A successful result moves the local request from pending to acknowledged.
- An error result moves it to failed and preserves the confirmed light value.
- A later ordered `state_changed` event with the requested value moves it to confirmed.
- A later mismatched value remains provider truth and does not confirm the request.
- A timeout or disconnect preserves the previous value and records uncertainty or failure according
  to application policy.

Do not serialize an access token into Wayglass state, component properties, browser logs, fixtures,
URLs, screenshots, or error text. Transport placement, token storage, permissions, TLS, remote
access, revocation, and logging belong to the deployment. Direct browser access requires an explicit
security review because browser code and storage can expose credentials.

## UI projection

Use existing Wayglass semantics after the application has translated provider state:

- show the reported value independently from condition;
- show unknown, unavailable, or stale knowledge without replacing the last useful value when that
  value is still relevant;
- show pending or acknowledged activity without presenting the requested value as confirmed;
- provide durable failure and recovery context instead of relying only on a transient toast; and
- keep consequential retry or override actions explicit and application-authorized.

No Home Assistant-specific component is required. The same application-owned record can feed value,
status, temporal, control, and feedback components according to their documented contracts.

## Validation recipe

Use synthetic fixtures by default. Cover at least:

- valid and partial snapshots;
- unknown, unavailable, stale, disconnected, and recovered knowledge;
- duplicate, older, malformed, removed, and recreated records;
- acknowledged, rejected, timed-out, mismatched, and later-confirmed requests;
- disconnect after possible command delivery with no automatic mutation replay;
- redacted diagnostics containing no token, endpoint, private identity, or provider message text;
- production-source and built-output scans for provider-code leakage; and
- exact removal without changing core packages or application models.

Name the provider and runtime versions for compatibility evidence. A fake port proves application
semantics, not network behavior, authentication safety, provider availability, or physical-device
truth.

## When shared runtime code may be justified

Consider a private adapter candidate only when two independently implemented applications need the
same complete task and a named maintainer accepts provider compatibility and security-update
ownership. The proposal must also define exact provider versions, transport placement, credential
and revocation boundaries, error redaction, removal, and a same-task comparison showing that shared
runtime ownership reduces meaningful maintenance cost.

A live smoke alone is insufficient. Package creation, public exports, publication, or support claims
still require a separate exploration or implementation contract, architecture decision, and release
governance.

## Related records

- [Known-state model](../architecture/adr/0005-known-state-model.md)
- [Controlled operational requests](../architecture/adr/0014-controlled-operational-requests.md)
- [Operational-data ownership](../architecture/adr/0024-operational-data-ownership-and-updates.md)
- [Ecosystem artifact architecture](../architecture/adr/0031-ecosystem-artifact-architecture.md)
- [Phase 5E Home Assistant exploration](../governance/explorations/phase-5e-home-assistant.md)
