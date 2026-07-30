# Phase 2C media-content validation

Status: complete as of July 30, 2026.

This record covers `wg-media`, its fallback stylesheet and media tokens, the typed React wrapper,
and production-backed Storybook compositions using consumer-authored native images, pictures,
figures, captions, alternatives, and inspection actions.

The accessibility target is WCAG 2.2 AA.

## Evidence matrix

| Requirement               | Evidence                                                                                                                                                                    | Result |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Native ownership          | Direct images and pictures retain their native sources, alternatives, dimensions, request attributes, and lifecycle events; the component emits no translated events        | Pass   |
| Progressive enhancement   | The module is side-effect free; native media and surrounding content remain visible before registration; fallback CSS prevents false loading or unavailable claims          | Pass   |
| Native semantics          | Images, pictures, figures, captions, links, and buttons retain native semantics without duplicate image roles, component roles, or incidental focus stops                   | Pass   |
| Useful alternatives       | Informative images expose contextual alternatives; decorative imagery uses an empty alternative and is absent from the accessible image set                                 | Pass   |
| Stable geometry           | Auto, square, landscape, portrait, and wide aspects reserve expected geometry; unknown intrinsic loading and unavailable states retain a useful minimum size                | Pass   |
| Deliberate fit            | Contain preserves the complete image by default; cover remains explicit and clips within the presentation viewport without stretching                                       | Pass   |
| Resource states           | Loading can retain prior pixels with explicit pending text; unavailable presentation replaces broken pixels while identity, verification, instructions, and actions persist | Pass   |
| Inspection                | Full-size inspection remains an application-authored, labeled native link in ordinary keyboard and focus order                                                              | Pass   |
| Responsive behavior       | Media reflows without page overflow at a 320 CSS-pixel, 400%-zoom-equivalent width; production stories cover phone and wide desktop compositions                            | Pass   |
| Theme and forced colors   | Dark and light Axe scans report no violations; neutral boundaries and useful unavailable text remain visible in forced colors                                               | Pass   |
| Framework parity          | Side-effect-free vanilla exports and the typed React wrapper use the same production element class and closed presentation vocabulary                                       | Pass   |
| Supported browser engines | The complete 16-case media suite runs in Chromium, Firefox, and WebKit                                                                                                      | Pass   |

## Automated and visual review record

The media-specific Playwright matrix executes 48 cases across Chromium, Firefox, and WebKit. It
verifies:

- explicit registration, visible pre-upgrade light-DOM content, and fallback stylesheet behavior;
- invalid-value normalization without added semantics;
- native image, picture, figure, caption, alternative, inspection, and lifecycle-event ownership;
- all accepted aspect and fit values, loading with retained pixels, unavailable presentation, and
  useful geometry when intrinsic dimensions are not yet known;
- 400% zoom-equivalent reflow with no horizontal page overflow;
- dark, light, and forced-colors accessibility behavior.

The production Storybook build includes an HVAC identification photograph, filter-access diagram,
decorative image, retained/loading image, and unavailable identity image. Desktop and phone visual
review confirmed stable framing, readable captions and fallback copy, uncropped instructional
imagery, deliberate cover treatment, discoverable inspection, and persistent maintenance or
verification information when pixels are loading or absent.

The complete 363-case browser regression suite passes across Chromium, Firefox, and WebKit,
including the Phase 1 overview, structural and semantic components, framework examples, tabs,
Function Deck, and the earlier Phase 2C foundation and layout primitives.

Product integrations must still review their final alternatives, localization, privacy and request
policy, source authorization, responsive source sizes, and supported assistive-technology pairs.

## Reproduce

```bash
pnpm check
pnpm exec playwright test tests/browser/media.spec.ts
pnpm test:browser
```

The browser commands build the required packages and execute the media matrix or complete repository
suite in Chromium, Firefox, and WebKit.
