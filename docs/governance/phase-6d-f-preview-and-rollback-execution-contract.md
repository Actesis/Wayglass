# Phase 6D-F preview and rollback execution contract

**Status:** Accepted by the project owner and merged in PR #274 on October 30, 2026. This record
authorizes the read-only verifier implementation described below, but no external mutation until the
project owner accepts its exact execution scope separately.

## Platform disposition

Phase 6D-F will retain the accepted immutable **Version URL** workflow. Cloudflare now distinguishes
Version URLs from branch-isolated **Previews**:

- [Version URLs](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/)
  identify one uploaded Worker version and are intended for inspecting that version before
  production deployment; and
- [Previews](https://developers.cloudflare.com/workers/previews/) are isolated, updating branch or
  pull-request environments and officially require Wrangler `4.135.0` or later.

Wayglass needs one attributable v1 delivery candidate, not an ongoing branch environment. The
audited and installed `wrangler@4.128.0` fully supports `wrangler versions upload`, immutable
Version URLs, version listing, deployment listing, version deployment, and rollback. Adopting
Previews would require a new dependency and supply-chain review without improving this
release-candidate proof, so it is deferred rather than introduced opportunistically.

Cloudflare renamed the earlier “preview URL” concept to “Version URL.” Existing Wayglass records
using the older term refer to the same immutable version-host workflow unless they explicitly say
Worker Preview.

## Exact target and isolation boundary

The only admitted Cloudflare target is the Worker named `wayglass-docs` in the already authenticated
project-owner account. The execution must stop before any write if a fresh preflight finds that the
name now exists unexpectedly, the authenticated account differs from the accepted account, or the
configuration contains a route, Custom Domain, binding, variable, secret, Worker script, or
unreviewed field.

The Worker may serve only through its Cloudflare-assigned `workers.dev` root and Version URLs during
Phase 6D-F. No route or custom hostname is attached. In particular, `wayglass.hoagsoftworks.com`
remains untouched. The public `workers.dev` surfaces are explicitly non-production and must send
`X-Robots-Tag` guidance that prevents indexing.

The existing local OAuth session may be used only after the project owner authorizes the exact
execution below. Phase 6D-F does not connect GitHub, create a Workers Builds integration, create or
read secrets, alter repository visibility, enable analytics or observability, or grant ongoing
automation.

## Two-version rollback requirement

Cloudflare rollback targets a previously deployed version and immediately creates a new active
deployment. A meaningful first rollback therefore cannot be proven with only the candidate upload.
The rehearsal needs two independently verified, non-production versions:

| Role      | Required source and identity                                                                                                                                                                                                                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline  | Rebuild corrected implementation merge `8d154458b7de3818db9338f47c1775102fe9e361`; independently verify the absolute-parent-reproduced bundle SHA-256 `1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7` and manifest-file SHA-256 `d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd`. |
| Candidate | Build the clean accepted `main` commit after this contract is merged; record its commit, tree, lockfile, bundle, manifest, surface counts, byte counts, and environment before upload.                                                                                                                                 |

Both artifacts contain only the already admitted VitePress and Storybook surfaces. The older
baseline is briefly active only to establish a real rollback target. Its unique Version URL remains
non-production evidence; it is not a supported documentation release.

The [baseline reproducibility audit](./phase-6d-f-baseline-reproducibility-audit.md) preserves the
Phase 6D-E and PR #281 hashes as historical evidence, withdraws their path-sensitive admission, and
freezes the corrected implementation merge only after a two-root byte-equality proof.

This two-version sequence clarifies the earlier Phase 6D plan's shorthand instruction to upload one
candidate and rehearse rollback. It does not widen the public content, provider, hostname, or
production scope.

## Fail-closed execution sequence

One active task must perform the sequence without interleaving unrelated Cloudflare work:

1. Re-run the complete local quality gate and the credential-free Wrangler rehearsal on the clean
   candidate source.
2. Confirm Wrangler is exactly `4.128.0`, verify the closed configuration, confirm the authenticated
   account without recording identifiers or credentials, and confirm `wayglass-docs` still has no
   deployment.
3. Rebuild the baseline in an owned temporary checkout: complete the frozen offline install, build
   its workspace package dependencies offline, build the site producers, and verify the expected
   bundle hash. Build the candidate into a separate owned temporary directory and independently
   verify both artifacts.
4. Create the previously absent Worker with one initial `wrangler deploy` of the verified baseline,
   exact asset-directory selection, a descriptive message, and strict remote-change checking.
   Cloudflare couples this first version creation to its 100% deployment; record the returned
   version ID, deployment ID, immutable Version URL, and `workers.dev` root.
5. Verify the baseline Version URL, confirm the deployment list names only that version at 100%, and
   compare the active-root manifest with the exact baseline artifact.
6. Upload the candidate with tag `phase-6d-f-candidate`, preview alias `phase-6d-f`, a descriptive
   message, and strict remote-change checking. Record its version ID, immutable Version URL, and
   aliased Version URL.
7. Run the complete edge and browser matrix against the immutable candidate Version URL before
   changing active traffic.
8. Deploy the candidate version at 100% to the `workers.dev` root and confirm its exact active
   version ID.
9. Roll back explicitly to the baseline version ID with a recorded reason. Confirm that the new
   deployment points 100% to the baseline and that its manifest matches the baseline artifact.
10. Restore the candidate by explicitly deploying its version ID at 100%. Re-run the root smoke
    check and confirm the deployment list points only to the candidate.
11. Remove only local temporary checkouts, artifacts, and sanitized transient logs. Retain both
    Cloudflare versions, the candidate alias, and the final candidate deployment until the project
    owner accepts or rejects the evidence.

Every mutable command names `wayglass-docs`, the exact version ID where applicable, a message, and a
non-interactive confirmation only after its immediately preceding read-only check passes. An
unexpected account, existing Worker, version, deployment, route, response, artifact hash, or
concurrent remote change stops the sequence. The operator does not delete, overwrite, retry around,
or “repair” unexpected remote state without new authority.

## Edge and browser acceptance matrix

The immutable candidate Version URL must prove:

- the exact public manifest and candidate bundle identity;
- documentation root and clean-file routes, Storybook manager and direct iframe, query-preserving
  canonical redirects, branded missing routes in both surfaces, and an unknown prefix;
- GET and HEAD status/body parity, observed rejected-POST behavior, MIME families, immutable and
  revalidation cache classes, security headers, and same-origin framing;
- `X-Robots-Tag` containing Cloudflare's documented `noindex` on the Version URL, with `nofollow`
  accepted when present and every other token rejected, plus Storybook's own non-indexing policy;
- exact MIME families after the one observed Static Assets normalization that removes the redundant
  `; charset=utf-8` parameter from UTF-8 text assets;
- the actual edge disposition of the two Phase 6D-E emulator differences: custom headers on
  canonical redirects and `Allow` on rejected POST;
- hydrated documentation and Storybook, a real direct story, same-origin runtime requests, enforced
  Content Security Policy, and the branded 404 at the accepted narrow and accessibility settings;
  and
- no external runtime request, analytics endpoint, cookie, form submission, credential, source map,
  private walkthrough, or example application.

The stable alias is convenience only. All acceptance evidence uses the immutable Version URL and
exact version ID. Cloudflare-generated cache and transport headers may be observed, but they are not
substituted for the repository-owned response contract.

## Evidence and redaction

The retained Phase 6D-F record may contain public Version URLs, Worker version and deployment IDs,
command versions, source and artifact hashes, HTTP evidence, timestamps, and sanitized command
results. It must not contain OAuth tokens, API tokens, authorization headers, account IDs, email
addresses, local absolute paths, raw environment dumps, or Cloudflare credential files.

If the execution fails after the first write, the evidence must state the last successful mutation,
the exact known active version, and the safe recovery choice. Cleanup or recovery that changes
Cloudflare remains a new explicit decision unless it is one of the already authorized steps above.

## Required execution authorization

Acceptance of this contract authorizes implementation of read-only edge-verification tooling and
preparation of the two clean artifacts. It does **not** authorize the Cloudflare execution itself.

Immediately before execution, the project owner must explicitly authorize all of these external
effects together:

- use of the existing Wrangler OAuth session;
- creation of `wayglass-docs` if the fresh preflight still finds no collision;
- initial Worker creation and baseline Static Assets deployment, plus the candidate Static Assets
  version upload and both public Version URLs;
- candidate deployment, rollback to baseline, and restoration of candidate on the public
  non-production `workers.dev` root; and
- retention of both versions and the final candidate deployment for owner review.

That authority still excludes the production hostname, DNS, routes, Custom Domains, GitHub or
Workers Builds connection, production-branch automation, repository visibility, secrets, analytics,
npm publication, and SpaceTraders work.

## Acceptance effect

Project-owner acceptance and merge of this proposal freeze the Phase 6D-F target, terminology,
two-version rollback method, verification matrix, stop conditions, retained state, redaction rules,
and external-action boundary. The next implementation slice may add only read-only remote verifier
and sanitized evidence-capture tooling. Actual upload and rollback remain blocked on the separate
execution authorization above.
