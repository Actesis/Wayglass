# Foundation 0.1.1 release proposal

Status: proposed. Merging this proposal sets the foundation manifests to 0.1.1 and accepts the
release plan below. Publishing still needs the owner's approval at each staged step, as the
[npm release workflow](https://github.com/Actesis/Wayglass/blob/main/docs/governance/npm-release-workflow.md)
describes. Nothing here is on npm until those approvals happen.

## Identity

- **Release unit and exact package versions:** foundation family. `@wayglass/tokens`,
  `@wayglass/core`, `@wayglass/themes`, and `@wayglass/elements` all move from 0.1.0 to 0.1.1.
  `@wayglass/icons` and `@wayglass/react` stay at 0.1.0.
- **Release commit and protected tag:** the merge commit of this proposal on `main`, recorded by the
  workflow run; tag `foundation-v0.1.1`.
- **npm dist-tag and release date:** `latest`; the date is set when the owner approves the staged
  versions. Afterwards the owner also moves `next` to 0.1.1, so both tags agree as they did for
  0.1.0.
- **Approver:** the project owner.
- **Stability label:** pre-1.0 feedback release, the same as 0.1.0.

## Consumer impact

- **Added:** none.
- **Changed:** a consumer-authored grid or flex container with a `1fr` or `auto` track now sees the
  real minimum width of Wayglass content inside it, where it previously saw a one-letter minimum.
  Wayglass layout primitives already handle this.
- **Fixed:** words no longer break mid-letter in data tables and other content-sized layouts
  ([#339](https://github.com/Actesis/Wayglass/pull/339)). In detail:
  - Every `overflow-wrap: anywhere` in `@wayglass/elements` is now `break-word`.
  - Data-table columns stay at least one word wide, and the table scrolls inside its
    `wg-scroll-region` when it cannot fit, as `data-table.md` documents.
  - `wg-button`, `wg-status-indicator`, `wg-badge`, `wg-metric`, `wg-stale-data-marker`, and the
    `wg-menu` trigger keep whole words in table cells. Each still breaks a single word longer than a
    narrow container.
  - Below 36rem, `wg-command-bar`'s stacked commands shrink to the bar's width.
  - A `wg-button` label can stay on one line in a table through its `label` part.
- **Deprecated:** none.
- **Removed:** none.
- **Migration guidance:** none required. If a data table sits directly in an application's own `1fr`
  grid track, make the track `minmax(0, 1fr)`, or give the item `min-inline-size: 0`, so the table
  scrolls in its region instead of widening the page.
- **Known limitations:** unchanged from 0.1.0.
  - The browser suite's reference environment is macOS. On Linux, the token font stack falls back to
    wider fonts, and some layouts at 320 CSS pixels and 200% text overflow; that is tracked
    separately.
  - Human assistive-technology coverage is as recorded for 0.1.0.

## Why a patch

Release governance allows a pre-1.0 patch to "fix compatible defects and documentation without
intentionally breaking public contracts". This release makes documented behavior true: tables scroll
rather than squeeze, and button labels wrap only between words. It removes and renames no public
attribute, property, event, slot, part, or token. The one observable change (the minimum width a
consumer's own grid sees) follows from fixing the defect, and it has a one-line remedy, so a minor
version would overstate it.

## Compatibility and support

- **Supported ranges:** unchanged from 0.1.0 (Node `>=22.13.0 <27`; browsers and assistive
  technology as recorded in the
  [support policy](https://wayglass.hoagsoftworks.com/maintenance/support)).
- **Dependency and peer ranges:** unchanged. `@wayglass/themes` depends on `@wayglass/tokens`
  `^0.1.0`, `@wayglass/elements` on `@wayglass/core` and `@wayglass/themes` `^0.1.0`, and
  `@wayglass/react` on `@wayglass/elements` `^0.1.0`. Every range admits 0.1.1, so existing React
  installs pick up the fix with a normal update.
- **Documentation:** the installation guide, the React guide, and the documentation home page keep
  naming 0.1.0 until 0.1.1 is on npm. Updating them is a post-publication step below, so the
  documentation never presents an unpublished version as installable.

## Artifact evidence

- **Public-surface diff:** no export, element, attribute, event, slot, part, or token changes.
  `@wayglass/elements` changes component styles only; the other three packages change only their
  version.
- **Tarballs and hashes:** produced by the workflow's prepare job from the merged commit and listed
  in its run summary and `SHA256SUMS`. A local dry run of the same tool on this branch packed and
  installed all four tarballs. The workflow's hashes are the authoritative ones.
- **Audits:** the prepare job verifies each tarball:
  - the packed manifest exactly equals the public projection, which is private `false`, with no
    `scripts` or `devDependencies`;
  - every file falls under the manifest's `files`;
  - the readme, license, and notice are present;
  - every export target exists;
  - the four tarballs install together in a clean consumer.

  No dependency changes from 0.1.0.

- **Validation:**
  - [#339](https://github.com/Actesis/Wayglass/pull/339) ran `pnpm check` and the full browser suite
    in Chromium, Firefox, and WebKit; its new content-wrapping suite covers the fix.
  - The workflow refuses to run unless the required `Wayglass quality` check passed on the release
    commit. That check includes the browser suite once
    [#340](https://github.com/Actesis/Wayglass/pull/340) is merged.
- **Provenance:** npm provenance from trusted publishing, generated by the stage job of
  `npm-release.yml`.

## Publication and recovery

- **Prerequisites:**
  - [#341](https://github.com/Actesis/Wayglass/pull/341) (the release workflow) is merged.
  - [#340](https://github.com/Actesis/Wayglass/pull/340) (browser tests in CI) is merged first, so
    the quality gate covers the browser suite.
  - Each foundation package has a trusted publisher on npmjs.com for `Actesis/Wayglass`,
    `npm-release.yml`, and environment `npm-release`.
- **Path:** dispatch `npm-release.yml` with unit `foundation`, version `0.1.1`, and dist-tag
  `latest`. Approve the `npm-release` environment, then approve the staged versions on npmjs.com
  with two-factor authentication. Approval and staging both run in the order `tokens`, `core`,
  `themes`, `elements`.
- **Maintainers and 2FA:** the owner, with `auth-and-writes` two-factor authentication as verified
  for 0.1.0. Recheck account access before dispatching.
- **Partial failure:**
  - Never approve a partial foundation set. Reject or discard the staged versions, fix the cause on
    `main`, and dispatch again.
  - If a published 0.1.1 is wrong, release 0.1.2 and deprecate 0.1.1 rather than unpublishing.
- **After publication:**
  1. Tag the release commit `foundation-v0.1.1` and push the tag.
  2. Move `next` to 0.1.1 for the four packages.
  3. Verify a clean registry install and provenance.
  4. Replace "pending publication" in `CHANGELOG.md` with the date.
  5. Add 0.1.1 release notes to the documentation site, and update the installation guide, the React
     guide, and the home page to 0.1.1.
- **Announcement:** none beyond the changelog and release notes, unless the owner decides otherwise.
