# Restricted initial npm staging transport

This implementation adds the upload port for review. No workflow or CLI invokes it. Tests run
fictional local child processes with fictional credentials; nothing is uploaded or signed.

## Credential and provenance separation

The wrapper must provide a verified installation of npm 11.21.2, an authorized stage-only bootstrap
token, and a separately verified signed bundle for the exact tarball. The child reports its version
before the token callback is invoked. A version string is not installer-integrity verification.
Token syntax is not proof of token scope, which remains an independent execution gate.

The transport does not forward caller arguments or inherit the parent environment. It copies only a
reviewed archive into a private per-upload directory, supplies an isolated home, prefix, cache, user
config and empty global config, then invokes the pinned CLI through the current Node executable
without a shell. Only the staging child receives the token; the scoped config contains an
environment reference, never the token itself. Debug logs are disabled. The child has a two-minute
deadline and a 2 MiB per-stream output bound. Failure is sanitized and never retried; only
transport-owned scratch is removed. The adapter's journal and reviewed archives remain.

The pinned CLI's
[OIDC helper](https://github.com/npm/cli/blob/1c66798c9def37e12509ccebb5b08cddf247c2e8/lib/utils/oidc.js)
can select a different npm credential on successful exchange when given GitHub OIDC variables. This
transport does not pass those variables. Instead it fixes `--provenance=false` and requires
`--provenance-file` together: the former disables automatic generation, not attachment of the
supplied bundle. The pinned
[publisher](https://github.com/npm/cli/blob/1c66798c9def37e12509ccebb5b08cddf247c2e8/workspaces/libnpmpublish/lib/publish.js)
verifies and attaches the bundle, including its single subject name and SHA-512. A future
credential-isolated signing step must also verify the signer and exact production invocation, record
the original build relationship accurately, and retain the bundle for independent review. Bundle
presence in these tests is not proof of signature validity.

## Remaining execution gates

Live observation, independently verified durable journal retention, signing, reviewed wrapper
wiring, and exact owner execution approval are still required. The retained build bytes remain
unchanged. The November 8 advisory is expired; implementation does not renew or replace it. Neither
credential creation nor npm staging is authorized by merging this change.
