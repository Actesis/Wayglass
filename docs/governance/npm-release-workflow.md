# Releasing a version to npm

Status: proposed with [ADR 0039](../architecture/adr/0039-reusable-staged-npm-releases.md). This
describes how a release after 0.1.0 reaches npm. It authorizes no release by itself: each release
still needs its own accepted proposal under the
[release-governance contract](./release-governance.md).

The workflow is `.github/workflows/npm-release.yml` (**npm release (staged, owner-approved)**). It
prepares one release unit from `main`, stages it on npm, and stops. Nothing becomes installable
until the owner approves each staged version.

| Unit         | Packages, in staging order                                                     | Tag                     |
| ------------ | ------------------------------------------------------------------------------ | ----------------------- |
| `foundation` | `@wayglass/tokens`, `@wayglass/core`, `@wayglass/themes`, `@wayglass/elements` | `foundation-v<version>` |
| `icons`      | `@wayglass/icons`                                                              | `icons-v<version>`      |
| `react`      | `@wayglass/react`                                                              | `react-v<version>`      |

## One-time setup (owner)

For each package that will be released this way, add a trusted publisher on npmjs.com (package
**Settings → Trusted publishing → GitHub Actions**):

- organization or user: `Actesis`;
- repository: `Wayglass`;
- workflow filename: `npm-release.yml`;
- environment: `npm-release`.

Until a package has this entry, staging that package fails before anything is uploaded. The
`npm-release` environment already requires owner approval and allows only `main`.

## Releasing

1. **Merge the release change.** A reviewed pull request sets every manifest in the unit to the new
   version, turns `Unreleased` in `CHANGELOG.md` into the dated release entry, and adds release
   notes. It must pass `Wayglass quality` like any other change.
2. **Dispatch the workflow** from `main` in Actions, choosing the unit, the exact version, and the
   dist-tag (`latest` for a stable release, `next` for a preview). From the command line:

   ```sh
   gh workflow run npm-release.yml --ref main -f unit=foundation -f version=0.1.1 -f dist-tag=latest
   ```

3. **Prepare runs without approval.**
   - It confirms that `Wayglass quality` passed on that exact commit, and that neither the tag nor
     any npm version exists yet.
   - It builds, packs, and verifies each tarball, then installs the set in a clean consumer.
   - It retains the tarballs, `release-plan.json`, and `SHA256SUMS` for 30 days. The run summary
     lists the hashes.
4. **Approve the `npm-release` deployment** in the run once the summary looks right. The stage job
   then:
   - verifies every hash and the plan against the run;
   - stages each package in dependency order with provenance, using npm's trusted-publishing
     identity for this workflow. It runs no repository code.
5. **Approve each staged version** on npmjs.com with two-factor authentication.
   - Before approving, compare each staged tarball's SHA-256 with the run summary.
   - Approve in staging order.
6. **Finish by hand.**
   - Create and push the release tag at the released commit: `git tag foundation-v0.1.1 <commit>`,
     then `git push origin foundation-v0.1.1`. Only administrators may create release tags.
   - If both `latest` and `next` should point at the new version, move the other tag, for example
     `npm dist-tag add @wayglass/core@0.1.1 next` for each package.
   - Verify a clean install from the registry before announcing the release.

## When something fails

- **Prepare fails.** Nothing has been staged. Fix the cause on `main` through a pull request and
  dispatch again.
- **Staging stops partway.** Earlier packages are staged, not published. Reject or discard them on
  npmjs.com, fix the cause, and dispatch again. Never approve a partial foundation set.
- **A published version is wrong.** Do not unpublish. Release a corrective patch and, if needed,
  deprecate the faulty version, as the release-governance contract describes.

The
[0.1.0 tooling and workflows](https://github.com/Actesis/Wayglass/blob/main/docs/governance/initial-npm-release.md)
remain the record of the first release. They are not used for later releases.
