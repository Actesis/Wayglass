# Phase 5C maintenance and candidate comparison

**Recorded:** 2026-08-27  
**Scope:** comparative maintenance portion of `P5C-E01` and success criteria 4–5  
**Disposition:** comparison complete; native SVG/HTML is the sole provisional artifact candidate,
while named assistive-technology evidence still blocks final disposition

## Comparable ownership

All three renderers consume the same validated application input and must preserve the same native
HTML inspector, visibility controls, exact table alternative, failure rules, focus behavior, and
semantic ownership. A dependency can replace drawing calculations; it cannot own Wayglass meaning or
remove the accessible interaction contract.

The retained test counts nonblank physical lines in the current proof boundary. This is an inventory
measure, not a quality score. It makes differences inspectable and prevents later evidence from
silently describing a different source surface.

| Owned surface            | Files                                                                | Nonblank physical lines |
| ------------------------ | -------------------------------------------------------------------- | ----------------------: |
| Shared by every renderer | model validation, selection, inspector, and proof styling            |                     783 |
| Native renderer          | shared SVG renderer/geometry boundary plus native geometry and entry |                     358 |
| uPlot renderer           | Canvas adapter, overlays, normalization, and entry                   |                     342 |
| D3 renderer              | shared SVG renderer/geometry boundary plus D3 geometry and entry     |                     349 |

The complete owned path is therefore 1,141 lines for native, 1,125 for uPlot, and 1,132 for D3—a
maximum difference of 16 lines, or about 1.4% of the native path. None of the dependencies produces
a materially smaller Wayglass-owned implementation. The dominant 783-line semantic and interaction
surface is intentionally common because moving it into generated SVG or Canvas would create a
second, less reliable owner.

## Candidate tradeoffs

### Native SVG and HTML

The native path owns straightforward numeric scaling, SVG paths, marks, and one explicitly removed
pointer listener. It has no resize observer, animation frame, timer, external runtime, declaration
alignment, advisory triage, or upstream API compatibility obligation. Its 5,247-byte gzip production
entry is smallest. It is slower than uPlot at this fixture but remains far below every accepted
construction, replacement, inspection, and resource budget.

The cost is real: Wayglass would own coordinate conversion, gap segmentation, pattern rendering,
pointer conversion, SVG/browser behavior, and all regression tests. The proof already caught an SVG
screen-coordinate error, overlapping hit strokes, and an empty-area pointer-event gap. Those are
arguments for shared tested code rather than asking every application to repeat the implementation.

### uPlot Canvas

uPlot is the fastest renderer and has one external runtime package with built-in declarations. Its
owned source is only 16 lines smaller than native because Wayglass still implements semantic
overlays, forced-color palette selection, exact cursor mapping, native controls, and HTML
equivalence. It additionally owns a `ResizeObserver`, cancellable animation-frame schedule, Canvas
pointer listener, uPlot instance lifecycle, and compatibility with an upstream imperative API. The
proof already found and corrected a resize-observer loop warning.

The maximum fixture does not need uPlot's performance advantage: native remains comfortably within
budget without downsampling. Canvas also cannot replace the native exact/equivalence surface.
Adopting uPlot would therefore exchange local SVG calculation ownership for external lifecycle and
update ownership without materially reducing Wayglass code or improving task completion.

### D3-assisted SVG

D3 preserves the same DOM and lifecycle advantages as native SVG, but reduces the renderer inventory
by only nine nonblank lines. It adds 10 runtime packages and five declaration packages, 1,308,215
registry-unpacked bytes across the D3 runtime/declaration graph, 2,468 KiB installed allocation, and
an additional runtime/declaration compatibility boundary. Its production entry is 15,347 bytes gzip
and its measured construction/replacement behavior is slower than native in this proof.

The narrow use of `pairs`, linear scales, and line generation is readable, but it does not remove
the Wayglass-owned segmentation, knowledge marks, semantic interaction, or SVG rendering. No
calculation-safety defect was found uniquely prevented by D3. The dependency burden is therefore
disproportionate to the nine-line inventory reduction.

## Provisional recommendation

Carry only native SVG/HTML into the named VoiceOver/Safari and NVDA/Firefox task review. At final
disposition:

1. reject uPlot and D3 as Phase 5C artifact candidates for this bounded form;
2. if named assistive-technology evidence passes, consider the native contract as a narrow optional
   runtime artifact candidate—not a foundation component, chart grammar, or package approval; and
3. prefer tested shared code over guidance-only application composition because the repeated
   interaction, focus, failure, exact-equivalence, and browser-correction surface is substantial.

This is not final acceptance. One synthetic task and no independent application consumer are not
enough to justify package status or a stable public API. An actual consumer remains the objective
trigger for that later decision. The dependency-backed adapters and exact versions stay in the
private proof until the same revision completes assistive-technology review, after which final
cleanup can retain evidence while removing rejected executable candidates.

## Maintainer obligations if native proceeds

The identifiable Wayglass maintainer would own the validated input boundary; SVG geometry and
screen-coordinate conversion; keyboard, pointer, touch, focus, visibility, and replacement behavior;
native exact inspection and table equivalence; semantic-token and non-color adaptation; supported
browser regression; named assistive-technology testing; failure diagnostics; capacity budgets; and
removal without changing foundation consumers. Applications continue to own data acquisition,
formatting, units, scale, thresholds, annotations, knowledge values, policy, conclusions, and user-
facing error presentation.

## Reproduction and limitations

```sh
pnpm experiment:phase5c:check
pnpm exec vitest run --root experiments/phase-5c-rich-visualization --config vitest.config.ts test/maintenance-surface.test.ts --reporter=verbose --disableConsoleIntercept
```

Line inventory does not measure cognitive complexity, defect density, upstream quality, or future
change frequency. The recommendation combines that inventory with retained task, adverse-input,
browser, bundle, performance, resource, dependency, maintenance, and isolation evidence. Manual
screen-reader results and owner disposition remain separate.
