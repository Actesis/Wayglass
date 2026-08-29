# Phase 5D-A runtime compatibility and isolation

- Evidence: `P5D-A-E03`
- Environment: Node 26.4.0, Vite 8.1.5, TypeScript 6.0.3, Vitest 4.1.10, current Chromium, Firefox,
  and WebKit through Playwright 1.62.0
- Date: 2026-08-29
- Disposition: automated pass for the private candidate boundary

## Runtime comparison

The proof now includes a pure runtime adapter over the generated structured catalog. It converts the
reviewed path commands and circles to immutable SVG descriptors without creating DOM nodes. The
current production names retain equivalent view-box geometry for `close`, `menu`, `more`, and
`refresh`. The synthetic `arrow-inline-start` remains proof-only. Direction is explicit: only a
record declared `mirrors-in-rtl` receives an RTL transform. Every descriptor remains decorative and
unfocusable so an owning control or nearby text retains accessible-name authority.

This comparison does not migrate `@wayglass/icons` or resolve the previously recorded contract
drift. It demonstrates that generated structured data can preserve the current geometry and carry
direction metadata across a narrow runtime boundary.

## Isolation results

Vite builds run in memory and inspect their actual module graphs. The candidate graph contains only
the private adapter and generated catalog. It contains no generator, validator, third-party module,
custom-element registration, browser-global assignment, network API, or filesystem behavior. A
separate clean build of `packages/core/src/index.ts` contains neither `@wayglass/icons` nor any
Phase 5D proof module, demonstrating that an icon-absent consumer pays no icon or tooling bundle
cost.

Repository scans additionally verify that the experiment is not a pnpm workspace package, has no
manifest of its own, appears in no production package manifest or executable source graph, and adds
no `@wayglass/icons` export. The production package therefore retains its existing independent
version, dependency, explicit-registration, and removal boundaries.

The same source module imports and returns equivalent descriptors in the repository's current
Chromium, Firefox, and WebKit projects. Those direct-import checks also confirm that no `wg-icon`
registration or named browser global appears before or after import. The generated candidate thus
adds no capability beyond the browser floor already required by Wayglass.

## Limitations

This is private-candidate evidence, not a production migration, public package contract, historical-
browser claim, or correction of the existing icon contract. Source-level geometry equivalence is
asserted for the current four glyphs; cross-browser visual review remains in `P5D-A-E04`. Complete
security, dependency-history, and removal evidence remains assigned to `P5D-A-E08`.
