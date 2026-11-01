# Phase 6D-F baseline reproducibility audit

**Status:** Corrected acceptance candidate prepared on October 31, 2026. This audit supersedes the
Phase 6D-F admission disposition recorded in PR #281 after a stronger preflight disproved its
checkout-path-independence claim. It preserves every earlier observation as history. No Cloudflare
request has been made and no external state has changed.

## Why the earlier admission is withdrawn

Phase 6D-E observed bundle SHA-256
`36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122` and manifest-file SHA-256
`3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032` for source commit
`aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74`.

PR #281 recorded three later builds as bundle
`6edb7d6e4ebca328cfdc720b3af33ea41df9543724cdd1bbdf3b653a35a809fd` and manifest file
`72cef95a99cfc43617f228d3619ac3391041e719038c695a5b99c4b6cf112f22`. Those builds were repeatable
inside the retained rehearsal layout, including its shared random run-root ancestry, but they did
not vary the absolute checkout parent strongly enough. A fresh checkout beneath a genuinely
independent parent produced bundle
`445281a9508f7581265a106a90b7347eaff8d76e86e19854ef6da97cefef903a` and manifest file
`8cd8a88cf9f55c952e81c63d3e2d926d0ef2d1c888886416d07439b5ffd08c01`.

The only differing producer files were Storybook manager entry bundles. Storybook 10.5.5 generated
local identifiers from absolute module identities. A first correction covered addon
`manager-bundle.js` files; the exact merge-commit proof then exposed the same condition in the
shared `common-manager-bundle.js`. ADR 0038 records the final closed producer-output normalization.

Therefore none of the Phase 6D-E, PR #281, or intermediate correction hashes is an admissible Phase
6D-F rollback baseline. They remain historical diagnostic evidence only.

## Corrected frozen baseline

The rollback baseline advances to the merge commit containing the complete normalization and its
regression coverage:

| Input            | Exact value                                                        |
| ---------------- | ------------------------------------------------------------------ |
| Commit           | `8d154458b7de3818db9338f47c1775102fe9e361`                         |
| Tree             | `74090e9b3c2394c15780a4605735a442fb8495bb`                         |
| Lockfile SHA-256 | `cb922a536e63011c675e4c920ca59187d9bce58ad10007914220ebc3952e4e74` |
| Node             | `26.8.1`                                                           |
| pnpm             | `11.9.0`                                                           |
| Platform         | `darwin`; `arm64`                                                  |

The candidate remains the clean `main` merge commit that accepts this corrected audit. Baseline and
candidate are intentionally distinct: the baseline is the proved implementation merge above; the
candidate adds only this governance correction and is captured exactly after merge.

## Independent absolute-parent proof

Two complete builds used the exact corrected baseline commit and environment above:

1. the clean saved-project checkout; and
2. a new detached checkout under a separately created canonical operating-system temporary parent,
   with an exact cached pnpm `11.9.0` executable, frozen offline installation from the
   repository-local store, and root workspace build before `site:build`.

Both `site:build` executions independently rebuilt the documentation and Storybook producers,
normalized every admitted Storybook manager entry, composed the closed two-surface artifact, and
passed the site verifier. Recursive comparison reported no differing file. Both manifests and all
750 artifact files were byte-identical.

| Evidence                      | Exact result in both builds                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| Bundle SHA-256                | `1701653b00fe6b701fa62053fdd97ce170891b1d09d8ae45c54b06d0b1d61fb7` |
| Manifest-file SHA-256         | `d02ef91db33635b83031f1cefbce35651a7590e4187a233cc6bb7eb423d8bebd` |
| Documentation content SHA-256 | `bd6c38693571222c1b69834dc62258735bd0d747cff7d016fd9edfba3d94fea7` |
| Storybook content SHA-256     | `71d1e7aa373473be65077af8eeafbbc4919102a853a25fdeef2432a7d47be960` |
| Documentation                 | 616 files; 30,122,084 bytes                                        |
| Storybook                     | 133 files; 9,190,027 bytes                                         |
| Surface total                 | 749 files; 39,312,111 bytes, plus the root manifest                |
| Complete artifact             | 750 files; 39,480,622 bytes                                        |

The proof also has automated coverage: equivalent Storybook manager entries beneath distinct
absolute repository parents must normalize to identical bytes and compose to identical manifests,
inventories, and bundle hashes. The real two-checkout proof remains an execution-admission gate.

## Corrected disposition

The exact commit, tree, lockfile, environment, counts, sizes, bundle, and manifest-file identities
above are the only accepted Phase 6D-F rollback-baseline admission values. Any mismatch stops the
run before account access.

The former PR #281 disposition is expressly superseded rather than rewritten. Its three-build
results remain evidence of the defect's repeatability inside one path family, not evidence of
path-independent reproducibility.

The failed preflights, diagnosis, implementation, and this audit made no Cloudflare request and
changed no external state. The previously authorized external scope is not widened: one fresh run
must still pass every local gate before OAuth account access, and all provider mutations remain
limited to the accepted non-production two-version rehearsal.
