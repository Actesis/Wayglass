# Repository release protections

The publication-disabled quality workflow runs on main pull requests and pushes, without secrets,
OIDC, credential persistence, restored caches, or publishing commands. Its unique check name is
`Wayglass quality`. GitHub Actions application ID `15368` must be verified against the observed
check run before protection is applied.

The reproducible desired API payloads live under `.github/release-protection/`:

- `main.json`: require a pull request, up-to-date passing quality check, and resolved conversations;
  enforce for administrators and prohibit force pushes and deletion.
- `tag-creation.json`: only repository administrators (role ID 5) may create foundation, icons, or
  React release tags. This permission is not publication approval.
- `tag-immutability.json`: prohibit updating/deleting those tags without an explicit ruleset change;
  no bypass actor is configured, including for administrators.

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
