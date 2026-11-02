# Phase 6D-F preview and rollback execution result

**Status:** Successful authorized rehearsal completed on November 2, 2026. The exact verified
candidate is restored as the sole 100% deployment on the non-production `workers.dev` root. Owner
disposition of this retained review state remains pending.

## Accepted candidate

The executed candidate was built from clean merged `main` and independently verified before any
provider mutation:

| Identity             | Accepted value                                                     |
| -------------------- | ------------------------------------------------------------------ |
| Source commit        | `a5425e20db840cc9e9011a8bc6e5b82bfa1149a7`                         |
| Source tree          | `5512bfbdc5f590822267dc088277286f4d2ee0a5`                         |
| Lockfile SHA-256     | `cb922a536e63011c675e4c920ca59187d9bce58ad10007914220ebc3952e4e74` |
| Bundle SHA-256       | `71a1a660785498f13d35d59e0b8f0005d0ded68e59cec793c8b3e3e532a3f206` |
| Manifest SHA-256     | `8eac6809641461384f24ce2294b7738900fdcb3a02c7272b634f8ff876eff49e` |
| Candidate version    | `3406e39e-16d7-42e1-b213-e9d4631bd758`                             |
| Immutable review URL | `https://3406e39e-wayglass-docs.matt-70d.workers.dev/`             |
| Preview alias        | `https://phase-6d-f-wayglass-docs.matt-70d.workers.dev/`           |

The local full repository gate passed. The candidate artifact then passed independent manifest
verification, the deterministic response oracle, the closed Wrangler configuration rehearsal, and
Wrangler version pin `4.128.0` before upload.

## Execution sequence and evidence

Fresh provider reads found the four expected retained versions and the original baseline as the sole
100% deployment. The authorized execution then completed without an unexpected-state repair or
automatic retry:

1. uploaded the candidate as retained version five and rebound only the approved `phase-6d-f` alias
   and `phase-6d-f-candidate` tag;
2. proved the immutable candidate with 30 edge response comparisons across 15 routes and both `GET`
   and `HEAD`;
3. proved the same immutable candidate in Chromium `151.0.7922.34`;
4. deployed the candidate at 100%;
5. rolled back to exact baseline version `2f9fbd5e-7fa5-4703-b6c0-2f4c43356c5d` at 100% and
   byte-compared the public-root manifest with the independently rebuilt baseline;
6. restored candidate version `3406e39e-16d7-42e1-b213-e9d4631bd758` at 100% and byte-compared the
   public-root manifest with the exact accepted candidate; and
7. repeated all 30 immutable edge comparisons after restoration.

The browser evidence records zero Axe violations for the hydrated documentation page and selected
direct Storybook story. It also records an enforced CSP, the production canonical documentation URL,
hydrated Storybook manager, a frame-free direct story, narrow forced-colors recovery behavior,
visible keyboard focus, no horizontal overflow, 93 same-origin runtime requests, zero external
runtime requests, and zero cookies.

The successful deployment history entries are:

| Step                  | Deployment ID                          | Sole version at 100%                   |
| --------------------- | -------------------------------------- | -------------------------------------- |
| Candidate deployment  | `71618f95-1a6e-44cf-9324-d7e640cfd4f3` | `3406e39e-16d7-42e1-b213-e9d4631bd758` |
| Baseline rollback     | `ecd8631b-233e-40b9-b4fc-ceb954189df5` | `2f9fbd5e-7fa5-4703-b6c0-2f4c43356c5d` |
| Candidate restoration | `69485669-e9d1-44a6-afc9-486b81ef665a` | `3406e39e-16d7-42e1-b213-e9d4631bd758` |

## Retained provider state

The `wayglass-docs` Worker, five immutable versions, preview alias, candidate tag, deployment
history, and restored candidate deployment are retained for owner review. The public non-production
root currently serves the exact accepted candidate at 100%:

`https://wayglass-docs.matt-70d.workers.dev/`

The retained inactive versions are the verified rollback baseline plus the three earlier candidates
that failed closed before deployment. No version was deleted or overwritten.

## Isolation and privacy disposition

The execution did not attach `wayglass.hoagsoftworks.com`, change DNS, create a route or Custom
Domain, connect GitHub or Workers Builds, change repository visibility, add a binding, variable, or
secret, enable analytics, publish npm packages, make a public-release claim, or perform SpaceTraders
work.

Only the sanitized edge and browser projections were used to prepare this result. Raw Wrangler logs,
account identifiers, email addresses, authorization material, local paths, environment dumps,
response bodies, browser traces, screenshots, DOM, accessibility dumps, and credential files remain
outside the repository.

## Disposition boundary

This successful rehearsal proves the accepted Cloudflare Static Assets artifact, immutable preview,
accessibility gate, candidate deployment, exact rollback, and explicit restoration path. It does not
authorize production-hostname attachment, automated deployment, npm publication, repository
visibility changes, deletion of retained versions, or general release. Each remains a separate owner
decision.
