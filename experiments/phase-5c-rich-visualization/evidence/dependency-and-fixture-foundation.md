# Dependency and fixture foundation evidence

**Recorded:** 2026-08-25  
**Scope:** partial evidence for `P5C-E02`, `P5C-E08`, and `P5C-E09`  
**Disposition:** foundation accepted; the later dependency and isolation audit is complete

## Accepted dependency graph

The repository install matches the revision 2 pre-install screen: seven exact direct root
development dependencies resolve to 16 unique proof-related packages. The graph adds no lifecycle
hook. `uplot` has no dependency; the three direct D3 modules resolve seven unique runtime
transitives; and the three direct declaration packages resolve two declaration dependencies.

The 2026-08-25 `pnpm audit --audit-level low` report did not name any candidate package. It did name
six advisories in existing repository development-tool paths: three high and three moderate. Those
findings are not caused by or traversed through the Phase 5C candidates, but the repository-wide
audit is therefore not clean. The later
[`dependency-and-isolation-audit.md`](./dependency-and-isolation-audit.md) records installed and
packed size, production bundle gzip, parse/evaluation cost, removal boundaries, and a fresh dated
audit.

No candidate library is imported or executed by this slice. Foundation packages do not import the
experiment, and the experiment is not a workspace package or production export.

## Deterministic model and fixture

The private shared boundary validates the accepted ownership and maximum envelope before any
renderer-specific normalization:

- one fixed 24-hour window with 2,880 samples per series at 30-second intervals;
- four aligned series and 11,520 total points;
- stable identities, strictly increasing aligned timestamps, one shared application-authored scale,
  one threshold, one annotation, formatted values, and explicit gaps;
- all observation-knowledge values without deriving condition, activity, trend, or policy; and
- fail-fast errors for duplicate identity, ordering, alignment, bounds, scale, and gap violations.

The canonical serialized fixture SHA-256 is
`9975d323221772846d7b973adff1ee66bd9c52d07c75da891159d450c4c4db7a`. Tests pin the hash and the
authored answers: Review breaches first at 08:00 UTC, and all queues recover within 15 minutes of
the 14:00 UTC intervention.

## Reproduction

```sh
pnpm list uplot d3-array d3-scale d3-shape @types/d3-array @types/d3-scale @types/d3-shape --depth Infinity
pnpm audit --audit-level low
pnpm experiment:phase5c:check
```

The focused gate now performs strict typechecking and 28 deterministic proof tests, including the
retained model and fixture checks. The ordinary repository `check` includes that gate.
