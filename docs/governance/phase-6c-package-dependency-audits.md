# Phase 6C-E2 package and dependency audit implementation

**Status:** Proposed for project-owner acceptance on September 7, 2026. This record covers the pure
package and production-dependency audit collectors, validators, and canonical serializers authorized
by the accepted Phase 6C-E plan. It does not unpack or run a retained candidate, read the workspace
as a substitute for packed bytes, contact npm or another registry, retrieve advisories, use
credentials, change package privacy, create a tag or release, deploy, or begin external-application
work.

## Packed-package evidence

The package collector consumes the exact projected manifest and unpacked `PackageFile` byte array
already produced by the accepted packing path. It reuses the existing package-file inspector, so a
second extraction path cannot disagree with the candidate assembler about what was packed. All six
release units must appear in their accepted order.

Each package record binds:

- exact name, version, private flag, manifest hash, file count, byte count, and inventory hash;
- the accepted exports, dependencies, peer dependencies, and side-effects contract;
- the packed `LICENSE` and `NOTICE` hashes, checked against the frozen source bytes;
- lifecycle-script and private-file absence established by manifest projection and file inspection;
  and
- every source-map path and source entry, with `sourcesContent` and absolute local, file, HTTP, or
  HTTPS sources rejected.

The validator independently checks the retained shape, six-package identity and order, fixed legal
document hashes, semantic dependency contract, sorted unique exports, and sorted unique source-map
findings. Unknown fields, changed legal bytes, an unprojected manifest field, a missing export,
authored source, unsafe path, private fixture, symlink, or unsafe source map fail closed.

## Production-dependency evidence

The dependency collector consumes an explicit resolved production graph. Each node supplies the
actual installed package's `package.json`, any package-root license or notice file bytes, and the
exact versions to which its declared production dependencies resolved. It does not infer a license,
dependency, or version from a package name, the workspace lockfile, or registry metadata.

The audit derives its external roots from the six accepted release-unit manifests. Every root and
edge uses an exact version; every edge must resolve to one retained node; duplicate nodes are
rejected; and a graph traversal proves every retained node is reachable from a production root. This
excludes disconnected development-only packages from the production evidence. Wayglass release units
remain in the package records and cannot be duplicated as external graph nodes.

Each dependency node records its exact name and version, package-manifest hash, declared license,
every hashed package-root license or notice file that exists, peer ranges, exact production edges,
and the names of recognized lifecycle scripts. A package that declares a license but omits a legal
file retains an empty `licenseFiles` array; that observable absence requires owner disposition and
is not replaced with registry metadata or repository bytes. A missing or empty manifest license
still fails closed. Lifecycle script bodies are neither retained nor executed by this pure audit.
Their presence remains explicit evidence for later disposition rather than being silently treated as
absence.

The retained validator recomputes the two accepted roots from release-unit contracts, validates
every node and edge, and independently traverses the graph. A literal
`allProductionNodesReachable: true` flag is necessary but never sufficient. Reordered or duplicate
roots, nodes, edges, legal files, or lifecycle findings fail canonical validation, as do missing
edge targets, unreachable nodes, malformed hashes, invalid retained legal-file evidence, absent
manifest license declarations, inexact versions, or unknown fields.

## Determinism and effect boundary

Package, dependency, and integrated-envelope serializers share one recursive canonical JSON
implementation: object keys sort bytewise, array order remains contractual, indentation is two
spaces, and the document has one final newline. Hashes always cover bytes supplied to the pure
collectors rather than reopening paths later.

These functions perform no filesystem access, package-manager command, subprocess, network request,
environment read, environment mutation, or process exit. Phase 6C-E4 remains responsible for
obtaining the exact packed-file arrays and resolved installed dependency graph through the effectful
candidate path and for hash-binding the resulting canonical sections into the E1 envelope.

## Validation

The release-candidate core passes 91 focused tests across 18 files. E2 fixtures cover all six
packages, frozen legal bytes, manifest drift, unsafe source maps, canonical key order, exact roots,
the seven-node reachable production graph, manifest and legal-file hashes, manifest-only declared
license evidence, lifecycle recording, missing license declarations, unresolved or missing
dependencies, duplicate nodes and edges, unreachable development-only nodes, and unknown retained
fields.

TypeScript, ESLint, formatting, documentation tests, the documentation build, and the complete
repository quality gate also pass.

## Deliberate limitations

- This stage records declared licenses and exact legal-file bytes; it does not infer legal
  compatibility or replace a license review.
- This stage records lifecycle hook names; later evidence must disposition any hook found.
- Current vulnerability or advisory conclusions require the separately authorized, dated E3 advisory
  snapshot. E2 performs no advisory lookup and makes no timeless security claim.
- The pure fixtures prove collector and verifier behavior, not an authoritative candidate run. The
  effectful E4 orchestrator and owner-reviewed E5 execution remain required.

## Acceptance effect

Acceptance completes Phase 6C-E2 and authorizes Phase 6C-E3 environment, quality-gate, provenance,
limitation, attempt-history, and advisory-input implementation only. It does not accept a candidate
or evidence bundle, authorize an advisory fetch, authorize the retained runner, contact a registry,
change release state, or begin a later Phase 6 stage.
