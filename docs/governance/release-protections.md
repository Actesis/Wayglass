# Repository release protections

The publication-disabled quality workflow runs on main pull requests and pushes, without secrets,
OIDC, credential persistence, restored caches, or publishing commands. Its unique check name is
`Wayglass quality`. GitHub Actions application ID `15368` must be verified against the observed
check run before protection is applied.

`Wayglass quality` aggregates the workflow's jobs: `Repository checks` runs `pnpm check`, and
`Browser tests` runs the Playwright suite once per engine (Chromium, Firefox, WebKit) on a macOS
runner, the suite's recorded reference environment. The aggregate job runs even when another job
fails and passes only when every job passed, because GitHub treats a skipped required check as
passing. Branch protection and the release staging gate therefore keep exactly one required check
while it covers the browser suite. Add new quality jobs to that aggregate rather than as separate
required checks, which the staging gate would reject. In CI, Playwright retries a failed test once
and reports it as flaky; local runs do not retry.

The reproducible desired API payloads live under `.github/release-protection/`:

- `main.json`: require a pull request, up-to-date passing quality check, and resolved conversations;
  enforce for administrators and prohibit force pushes and deletion.
- `tag-creation.json`: only repository administrators (role ID 5) may create foundation, icons, or
  React release tags. This permission is not publication approval.
- `tag-immutability.json`: prohibit updating/deleting those tags without an explicit ruleset change;
  no bypass actor is configured, including for administrators.

Repository auto-merge was enabled on November 22, 2026. It is a per-pull-request choice that only
someone with write access can make, and GitHub cancels it if someone without write access pushes to
the pull request. The same day, fork pull-request workflows were set to require approval for all
external contributors (`all_external_contributors`), so no outside code runs in Actions without the
owner's approval. Fork workflows receive a read-only token and no secrets.

Zero mandatory GitHub approving reviews is deliberate for the initial single-maintainer workflow:
the author cannot approve their own PR. Owner review/merge authorization remains explicit in the
collaboration, but this is not a technically enforced independent-review control. Add another
maintainer and revise the policy before claiming one. A future protected publishing environment and
approved-source verification are separate gates; these rules do not by themselves prove that a newly
created tag points at an approved source commit.

Apply main protection only after the actual PR check has passed. Read current settings first; do not
overwrite unrelated protection or duplicate existing rulesets. After application, read back every
setting and retain its ID. No settings at the organization level are changed. No release tags are
created by this work. Reversing these settings requires an explicit recorded owner decision; do not
silently bypass them to merge or publish.

## Applied state on November 7, 2026

The corrected [hosted quality run](https://github.com/Actesis/Wayglass/actions/runs/42391469907)
passed on PR #297. The initial run failed because shallow checkout omitted the frozen historical
source required by a test; `fetch-depth: 0` corrected the setup, with a regression assertion. The
observed check provider was `github-actions`, application ID `15368`.

Main protection was then applied and read back with the settings above. Release-tag creation ruleset
`26763551` and immutable-tag ruleset `26763552` are active and were independently read back. The
server normalizes the tag-update rule by omitting its false fetch/merge parameter. No release tag,
publishing environment, npm credential, or package was created. PR #297 remains subject to the newly
required quality check; no administrator bypass is used to merge it.
