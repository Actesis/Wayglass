# Initial npm advisory snapshot approval

Status: explicitly approved by the project owner on November 7, 2026, including zero findings and
the `WG_RC_ADVISORY_MEDIA_TYPE` warning. This is advisory-input approval, not publication approval.

The single authorized capture ran using clean tooling commit
`09d46844e5919396b2994511e6a33aae3ba923bc` against frozen package source
`ce400e89930a047c6af1c6992c64cfe422a1eeee`. The existing capture command rebuilt and audited that
source offline, then made one credential-free request to the fixed npm bulk-advisory endpoint. It
did not retry, follow redirects, publish, or change the accepted package source.

The [retained canonical snapshot](./evidence/initial-npm-advisory-2026-11-07.json) has SHA-256
`85541ecda62c2eec096bef4d60b13dceddab71c8f70fe8264a9361922c47df6f`. Its bytes were independently
rehashed after capture and preserved unchanged. It binds the seven-node production dependency audit
`45178532da0e24286d7e4fa9a4ed4cd6cef630d31e7341c3e6817d705ce3178f` and frozen lockfile
`bdb6b4e916bd5fa2330fc3dd3f272814c6940ec04dab78b437b7007be386a525`.

The provider response hash is `44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`. No
raw provider response, credentials, or machine paths are retained here. The normalized result
contains zero findings. The provider did not advertise JSON, but exact decoded bytes passed strict
JSON and schema validation; the owner accepted that warning rather than suppressing it.

Capture time is `2026-11-07T16:04:23Z`; validity ends `2026-11-08T16:04:23Z` (November 8 at 10:04:23
AM CST). Approval does not extend freshness. After expiry, this record remains historical evidence;
a new capture requires separate authorization and review before a fresh security claim. Zero
findings means no findings returned for this exact graph and capture, not a vulnerability-free
guarantee or an audit of development dependencies.

The legal/compliance disposition, npm account and 2FA verification, branch/release protections,
hosted consumer graph evidence, publishable-artifact validation, and explicit publication approval
remain open. Read-only GitHub checks on November 7 found no classic protection or effective rules on
main and no repository rulesets; no protection settings were changed.
