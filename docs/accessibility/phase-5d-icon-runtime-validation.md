# Phase 5D icon-runtime validation

**Status:** Stage 4B completed on August 30, 2026. The private `@wayglass/icons` runtime migration
now has supported-browser, automated accessibility, production Storybook, visual, and packed-output
evidence. Stage 5 repository-validation integration remains next. This record does not publish the
package or make a public compatibility or assistive-technology support claim.

This evidence validates the accepted
[`@wayglass/icons` runtime reconciliation](../governance/icon-runtime-contract-reconciliation.md)
and Stage 4 of the
[icon-tooling implementation contract](../governance/icon-tooling-implementation-contract.md).

## Result

| Area                          | Evidence                                                                                                                                                                       | Result |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Entry points and registration | Root and `/icon` imports resolve to one implementation, have no registration side effect, and tolerate repeated explicit registration                                          | Pass   |
| Catalog and rendering         | `close`, `menu`, `more`, and `refresh` render their authenticated geometry at compact, standard, and prominent sizes with the public `svg` part                                | Pass   |
| Accessible use                | Decorative icons remain hidden; a non-empty label exposes one non-focusable image; missing and unknown names render nothing; Axe reports no violations in either theme         | Pass   |
| Presentation                  | Semantic sizing, public color and size hooks, invalid-value normalization, reviewed logical mirroring, forced colors, reduced motion, and 200% text at 320 CSS pixels pass     | Pass   |
| Interaction boundary          | The host and internal SVG remain outside sequential focus, no slot is exposed, and owning native controls retain their names                                                   | Pass   |
| Production visual evidence    | Dark runtime fixture and light production Storybook story were reviewed in the in-app Chromium browser with complete catalog, readable hierarchy, and zero horizontal overflow | Pass   |
| Packed output                 | The 10,350-byte private tarball contains only compiled runtime/types/maps, `package.json`, and `LICENSE`; no tooling, fixture, manifest, or review output is present           | Pass   |

## Automated browser record

The focused icon suite schedules eight cases in each supported engine. All 24 cases pass in
Chromium, Firefox, and WebKit. It covers both public entry points, duplicate-safe registration,
every generated glyph and semantic size, decorative and labeled semantics, missing and unknown
names, runtime mutation, logical-direction resolution with reviewed synthetic metadata, styling
hooks, normalization, inertness, both themes, forced colors, reduced motion, narrow reflow, and Axe.

The full repository matrix scheduled 1,518 cases. It completed with 1,469 passes, 48 expected
engine-specific skips, and one pre-existing Chromium foundations Axe case whose execution context
was destroyed during the parallel run. That exact case passed immediately in a one-worker isolated
rerun. The focused Stage 4B matrix itself passed without retry. This is recorded as a transient
parallel harness failure, not concealed as a fully clean aggregate run.

## Visual review

The implementing Codex agent reviewed the local production fixture and built Storybook output in the
in-app Chromium browser on August 30, 2026 at its available 1280 by 720 viewport.

- The dark fixture displayed all four names in all three sizes, explicit accessible-use boundaries,
  direction samples, the custom styling hook, invalid-value normalization, and the inert focus-order
  example. It rendered 23 icon hosts, 21 SVGs, and exactly two intentionally empty missing/unknown
  hosts, with no page overflow or runtime error.
- The light Storybook story displayed four evenly separated catalog cards and four accessible-use
  examples. Meaning remained in text or the owning native control rather than icon recognition.
- The only console message was Lit's expected development-mode warning from the local Vite fixture.

The generated static review index remains the source/output-integrity review artifact. The Storybook
stories are production-runtime documentation and are not an alternate icon authority.

## Packed-output evidence

`pnpm --filter @wayglass/icons pack` produced `wayglass-icons-0.0.0.tgz` with these retained facts:

- byte count: `10350`;
- SHA-256: `d085d3db3b843876207b1e6c8afd8487a792127249a112583a86373db4b7afcb`;
- entries: `dist/index`, `dist/icon`, `dist/runtime`, and `dist/generated/catalog` JavaScript,
  declarations, and source maps, plus `package.json` and `LICENSE`; and
- absent: `tooling/`, tests, experiments, source/output manifests, review HTML, and Storybook files.

The package remains private at `0.0.0`; this tarball is local validation evidence and was not
published.

## Manual gates carried forward

VoiceOver with Safari on macOS and NVDA with Firefox on Windows were not performed in this local
agent session. Automated semantics and Axe do not replace those release gates. A future public
support claim must record assistive-technology, operating-system and browser versions, package
commit, input method, expected and observed results, reviewer, date, and corrective work.

## Reproduce

```bash
pnpm --filter @wayglass/icons build
pnpm --filter @wayglass/storybook typecheck
pnpm storybook:build
pnpm exec playwright test tests/browser/icons.spec.ts
pnpm test:browser
pnpm exec playwright test tests/browser/foundations.spec.ts --project=chromium --grep "wayglass-light theme" --workers=1
pnpm --filter @wayglass/icons pack --pack-destination <temporary-directory>
```
