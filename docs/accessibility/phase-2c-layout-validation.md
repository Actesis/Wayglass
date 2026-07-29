# Phase 2C layout-primitives validation

Status: complete as of July 29, 2026.

This record covers `wg-frame`, `wg-stack`, `wg-cluster`, `wg-grid`, `wg-split`, and
`wg-scroll-region`; their semantic spacing, density, sizing, boundary, and responsive tokens; typed
React wrappers; and production-backed Storybook compositions.

The accessibility target is WCAG 2.2 AA.

## Evidence matrix

| Requirement                    | Evidence                                                                                                                                                    | Result |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Source and reading order       | Light-DOM content remains visible before upgrade; split regions stack in the same primary-then-secondary order used side by side                            | Pass   |
| Native semantics               | Frame, stack, cluster, grid, and split add no roles or focus stops; consumer headings, sections, links, and buttons retain their semantics                  | Pass   |
| Functional separation          | Multi-function Storybook composition combines visible native headings with neutral frame boundaries and function-level spacing                              | Pass   |
| Semantic spacing and density   | Related, section, and function roles resolve through compact and comfortable aliases without changing authored attributes                                   | Pass   |
| Container responsiveness       | Grid responds to item capacity; split changes at its own compact, standard, and wide inline-size thresholds rather than viewport classes                    | Pass   |
| Narrow reflow                  | Cluster wraps, grid becomes one column, split stacks, and a 320 CSS-pixel viewport retains all content without horizontal page overflow                     | Pass   |
| Logical direction              | Split places primary and secondary regions logically in right-to-left context while retaining DOM and keyboard order                                        | Pass   |
| Scroll accessibility           | Only overflow on the allowed axis adds a keyboard target; labeled overflow gains region semantics; missing labels never produce an invented accessible name | Pass   |
| Dynamic scroll content         | Overflow observation adds and removes focusability and semantics after content growth and shrinkage across all supported engines                            | Pass   |
| Theme and forced colors        | Dark and light Axe scans; neutral frame boundaries and token-backed scroll focus rings remain visible in forced colors                                      | Pass   |
| Framework parity               | Side-effect-free vanilla modules and typed React wrappers use the same production element classes and closed value vocabularies                             | Pass   |
| Supported browser engines      | The complete 13-case layout suite runs in Chromium, Firefox, and WebKit                                                                                     | Pass   |
| Automated accessibility review | Axe reports no violations in dark and light themes; forced-colors scans retain structural rules while OS-owned synthetic color contrast is excluded         | Pass   |

## Automated and visual review record

The layout-specific Playwright matrix executes 39 cases across Chromium, Firefox, and WebKit. It
verifies:

- explicit registration and visible pre-upgrade light-DOM content;
- invalid-value normalization with no incidental roles or focus stops;
- semantic spacing and compact/comfortable density;
- cluster wrapping, adaptive grid capacity, split thresholds, source order, and right-to-left
  placement;
- labeled, unlabeled, fitting, overflowing, and dynamically changing scroll regions;
- 400% zoom-equivalent reflow with no horizontal page overflow;
- dark, light, and forced-colors accessibility behavior.

Production Storybook compositions cover a multi-function overview and a primary/supporting work
region with bounded history. They demonstrate that layout primitives arrange consumer-authored
semantics: frames reinforce named function identity, function spacing separates peers, and
informational content remains visually distinct without acquiring operational condition meaning.
Visual review also confirmed equal-height peer function frames, readable compact wrapping, neutral
boundaries, primary/supporting emphasis, and a visibly constrained event history.

The complete 315-case browser regression suite passes across Chromium, Firefox, and WebKit,
including the Phase 1 overview, existing structural and semantic components, framework examples,
tabs, Function Deck, and the earlier Phase 2C foundation substrate.

The components add no keyboard interaction model beyond native scrolling. Product integrations must
still review final content, landmarks, localization, and supported assistive-technology pairs.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/layout.spec.ts
```

The browser command builds the required packages and executes the layout suite in Chromium, Firefox,
and WebKit.
