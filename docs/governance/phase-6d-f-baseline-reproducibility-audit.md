# Phase 6D-F baseline reproducibility audit

**Status:** Accepted by the project owner on October 31, 2026. This audit corrects the artifact
identity admitted by the Phase 6D-F execution contract. It does not alter the accepted source
commit, public content, provider target, deployment sequence, or external authority.

## Reason for the audit

The Phase 6D-E rehearsal recorded bundle SHA-256
`36587495199bff85019af53f6a3ec72c65d5efcc29df211edc82feb76e28a122` and manifest-file SHA-256
`3996ac5e29cba52de7146f311a5b156be43873ea9f3b73d7e45e8603eed1c032`. A fresh Phase 6D-F rebuild of
the same accepted baseline source reproduced every recorded source, environment, file count, and
byte-count property but did not reproduce those two artifact hashes. Execution stopped before
Cloudflare authentication or any provider request.

The project owner authorized a three-build audit rather than accepting either artifact from a single
rebuild.

## Frozen source and environment

All three builds used the same accepted inputs:

| Input            | Exact value                                                        |
| ---------------- | ------------------------------------------------------------------ |
| Commit           | `aadb0bf82f64a5a4e2ef322aed636ce3d7e7ea74`                         |
| Tree             | `26951463fb82a8e98174e437ef780eca6fd83246`                         |
| Lockfile SHA-256 | `4d99210871dbe5b6bb69a43d67d16edab155e1db55c99cade231986ce2cb5d60` |
| Node             | `26.8.1`                                                           |
| pnpm             | `11.9.0`                                                           |
| Platform         | `darwin`; `arm64`                                                  |

The fresh checkout used the repository-local pnpm store, an exact cached pnpm `11.9.0` executable,
and a frozen offline installation. No registry resolution or dependency update was admitted.

## Independent build matrix

The audit created three separate output directories:

1. a complete baseline build in the original detached checkout;
2. a second site composition from that checkout; and
3. a new detached checkout with a frozen offline install, a forced uncached root Turbo build, and a
   new site composition.

The third build set `TURBO_FORCE=true`; all 14 workspace tasks bypassed the cache and zero tasks
were reported as cached. Each artifact independently passed the repository's site verifier.
Recursive file comparison found no difference among the three output directories, and the three
manifest files had the same file hash.

| Evidence                      | Exact result in all three builds                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| Bundle SHA-256                | `6edb7d6e4ebca328cfdc720b3af33ea41df9543724cdd1bbdf3b653a35a809fd` |
| Manifest-file SHA-256         | `72cef95a99cfc43617f228d3619ac3391041e719038c695a5b99c4b6cf112f22` |
| Documentation content SHA-256 | `464bc9b3167940946f17d4421dd05808e8b2e055b87a3e50a7b59a635efd5033` |
| Storybook content SHA-256     | `22fdbbdfdd629b5ec905fbc4cae54aa50f8d403692a2a9de1ac177064529fc12` |
| Documentation                 | 595 files; 28,173,080 bytes                                        |
| Storybook                     | 133 files; 9,226,992 bytes                                         |
| Surface total                 | 728 files; 37,400,072 bytes, plus the root manifest                |

## Disposition

The three byte-identical builds supersede the earlier bundle and manifest-file hashes **only as the
normative Phase 6D-F baseline admission identity**. The Phase 6D-E record retains its original
values as historical evidence; it is annotated rather than rewritten as if those values had never
been observed.

The accepted Phase 6D-F baseline is therefore the unchanged source commit and tree above with bundle
SHA-256 `6edb7d6e4ebca328cfdc720b3af33ea41df9543724cdd1bbdf3b653a35a809fd` and manifest-file SHA-256
`72cef95a99cfc43617f228d3619ac3391041e719038c695a5b99c4b6cf112f22`.

The audit made no Cloudflare request and changed no external state. The project owner's existing
all-at-once Phase 6D-F authorization applies to one new rehearsal from a fresh run root after this
correction is merged. A run must still stop if the frozen baseline fails either corrected hash or
any other accepted source, count, size, response, or configuration check.
