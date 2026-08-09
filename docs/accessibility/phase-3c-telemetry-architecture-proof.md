# Phase 3C telemetry architecture proof

**Status:** Completed on August 9, 2026. This record accepts
[ADR 0025](../architecture/adr/0025-telemetry-rendering-and-accessible-equivalence.md) and resolves
the open architecture questions in the [telemetry-strip contract](../data/telemetry-strip.md). It
validates a disposable rendering model, not the future production component.

## Result

A normalized internal SVG can render the accepted compact telemetry envelope without a chart
dependency, resize observer, second semantic owner, or component-owned downsampling. The SVG remains
hidden and non-focusable while required light-DOM heading, current context, native time labels,
summary, and detail remain visible before and after upgrade.

The proof renders 240 irregular observations as at most one aggregated path per knowledge state.
Explicit `null` samples break the path and receive gap marks. Distinct stroke patterns preserve
confirmed, inferred, stale, unknown, conflicting, and unavailable knowledge when color collapses.
Point marks are limited to non-confirmed run boundaries and explicit gap boundaries; marking every
sample would add visual noise without adding accessible information.

## Evidence

| Obligation                | Evidence                                                                                                                                             | Result    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Client-only fallback      | Required heading, current context, two native `time` elements, summary, and detail control remain visible before registration; no graphic exists     | Pass      |
| Accessible ownership      | One named group after upgrade; internal SVG is `aria-hidden` and non-focusable; no graphic role, live region, status, or alert                       | Pass      |
| Data envelope             | 240 irregular samples, a repeated timestamp, four finite knowledge runs, six explicit gap samples, and exact window/scale boundaries                 | Pass      |
| Responsive geometry       | Normalized viewBox retains identical path data from 320 CSS pixels through wall width with no rerender, observer, or page overflow                   | Pass      |
| Non-color meaning         | Six distinct dash patterns plus boundary/gap geometry remain under grayscale and forced colors                                                       | Pass      |
| Update stability          | One batched redraw replaces 240 samples by the next animation frame without focus loss, events, announcements, or a 100-millisecond synchronous task | Pass      |
| Neutral failure           | Invalid input removes only calculated geometry, emits a deduplicated development warning, and preserves authored readable content                    | Pass      |
| Browser and accessibility | Ten definitions in Chromium, Firefox, and WebKit, including dark and light Axe scans                                                                 | 30 passed |

The automated fixture is `tests/browser/telemetry-architecture.spec.ts`. Its production-independent
element and page remain under `tests/browser/telemetry-architecture/` so the reasoning can be
reproduced without creating a premature public API.

## Visual review

Dark desktop, dark 320-pixel phone, and light grayscale compositions were inspected in the local
browser. The line remained recognizable, explicit gaps remained visible, time labels stayed at
logical ends, and authored text reflowed without truncation. At phone width, per-sample marks would
have competed with the line; boundary-only marks kept state changes visible without resembling an
interactive chart.

Forced-color behavior is covered in the supported browser matrix by system-color and pattern
assertions. Representative VoiceOver/Safari and NVDA/Firefox review remains a production-component
validation gate; this disposable proof is not presented as assistive-technology certification.

## Reproduce

```bash
pnpm exec playwright test tests/browser/telemetry-architecture.spec.ts
```

## Accepted implementation constraints

- Use a normalized, non-semantic internal SVG and no `ResizeObserver` for baseline sizing.
- Aggregate geometry by knowledge state instead of creating one path or semantic node per sample.
- Split at every explicit gap and never interpolate missing values.
- Use non-color line patterns plus marks only at non-confirmed run and gap boundaries.
- Keep the visible authored summary as the overview equivalent and provide a separate native detail
  path when exact values matter.
- Preserve silent, batched replacement and the ADR 0024 240-sample performance envelope.

Token locking and production implementation may refine dimensions, stroke weights, surfaces, and
spacing, but they must not reverse these constraints without a superseding decision and equivalent
browser evidence.
