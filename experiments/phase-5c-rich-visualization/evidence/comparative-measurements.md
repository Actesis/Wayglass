# Phase 5C comparative measurements

**Recorded:** 2026-08-27  
**Environment:** Mac mini Mac16,10, Apple M4 10-core, 16 GB; macOS 26.5.2 arm64; Node 26.4.0; pnpm
11.9.0; Playwright 1.62.0; Chromium 151.0.7922.34  
**Revision:** Phase 5C comparative-measurement worktree based on `516a665`  
**Disposition:** desktop measurement budgets pass; `P5C-E07`, `P5C-E08`, and `P5C-E10` remain
partial

The three adapters consumed the same frozen 4-series, 2,880-sample-per-series fixture without
downsampling. Measurements ran from a minified ES2022 Vite production build at a 1,000 CSS-pixel
adapter width. Timing used five warm-ups followed by 30 measured runs. The resource check performed
60 fixed-envelope replacement updates per adapter, destroyed every adapter, forced garbage
collection, and inspected the remaining DOM and scheduled resources.

## Results

| Adapter         | Production JS raw | Production JS gzip | Construction median / p95 / max | Inspection median / p95 / max | Replacement median / p95 / max |
| --------------- | ----------------: | -----------------: | ------------------------------: | ----------------------------: | -----------------------------: |
| Native SVG      |          11,336 B |            3,719 B |              4.1 / 4.8 / 5.0 ms |            0.0 / 0.1 / 0.2 ms |             3.9 / 6.5 / 6.5 ms |
| uPlot Canvas    |          89,757 B |           29,886 B |              0.3 / 0.4 / 0.6 ms |            0.0 / 0.1 / 0.1 ms |             0.5 / 0.6 / 0.6 ms |
| D3-assisted SVG |          43,049 B |           13,815 B |              5.9 / 6.5 / 6.5 ms |            0.0 / 0.1 / 0.1 ms |             6.1 / 7.3 / 8.9 ms |

All results pass the precommitted maximum-fixture budgets: construction and replacement medians
under 50 ms, no measured synchronous task at or above 100 ms, inspection median under 50 ms, and
candidate-specific JavaScript under 40 KiB gzip.

After forced collection, heap grew from 3,951,712 B to 4,144,392 B, a retained ratio of `1.048759`
against the `1.25` ceiling. No `.p5c-adapter` nodes, active `ResizeObserver` instances, or pending
animation frames remained after teardown.

## Interpretation

uPlot is the fastest candidate in this fixture but carries the largest JavaScript cost and adds a
Canvas, resize observer, and animation-frame lifecycle. The native renderer has the smallest bundle
and the second-fastest construction and replacement results, at the cost of owning its coordinate
and path calculations. The D3-assisted renderer is larger and slower than the native renderer here
without changing the shared observable output or semantic inspection. D3 therefore needs a clear
maintenance or calculation-safety advantage in the later review to justify its dependency cost.

Fixed-envelope replacement preserves the proof identity, window, scale, series order and IDs, point
count, and point IDs. Within that envelope, values, formatted values, labels, thresholds, and
annotations can change while the persistent inspector, selected state, and focused native control
remain in place. Shape-changing input fails visibly with `P5C_REPLACEMENT_SHAPE`; this proof does
not silently remount and hide focus loss.

## Reproduction and limitations

Run the retained production measurement with:

```sh
pnpm exec playwright test --config playwright.phase5c-performance.config.ts
```

The exact samples and byte counts are retained in
[`raw/comparative-measurements-2026-08-27.json`](./raw/comparative-measurements-2026-08-27.json).

These timings cover one named desktop and Chromium. They do not establish a supported-browser timing
claim, 4x CPU-throttled result, physical low-power-tablet result, touch or responsive adaptation, or
manual assistive-technology evidence. Forced-collection heap and explicit DOM, observer, and
animation-frame tracking are resource proxies; browser JavaScript does not expose an enumeration of
every event listener. Dependency license, advisory, transitive, parse, maintenance, and
complete-removal review also remains separate.
