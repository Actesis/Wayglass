# Initial npm collision probe

This unwired read-only probe checks a single reviewed name using npm identity readback, a
package-filtered [staged listing](https://api-docs.npmjs.com/#tag/Stage), and both public and
authenticated package metadata. It requires the documented empty listing shape (`total: 0` and an
empty `items` array), as used by the
[pinned CLI](https://github.com/npm/cli/blob/1c66798c9def37e12509ccebb5b08cddf247c2e8/lib/commands/stage/list.js).
Any visible package, including a placeholder, blocks initial bootstrap. Identity mismatch,
pagination, redirect, permission errors, and ambiguous response shapes also stop the probe.

A package metadata 404 is recorded only as **not visible**. The stage listing is limited to what the
authenticated account can see. Neither observation proves that a name is globally absent or that the
credential can create it. The evidence deliberately leaves `authoritativeAbsenceVerified` and
`packageCreationAllowed` false. A future wrapper must establish independent scope authority and
visibility before admitting an upload; this module cannot satisfy the adapter's creation gate by
itself.

Requests are bounded GETs to the fixed npm registry. The public request does not carry a token. No
credentials are created, no registry state is changed, and the tests use simulated responses.
Durable journal retention and workflow wiring remain separate.
