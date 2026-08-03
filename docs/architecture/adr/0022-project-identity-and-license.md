# ADR 0022: Confirm the Wayglass project identity and Apache-2.0 license

- Status: accepted
- Date: 2026-08-02

## Context

ADR 0006 kept Wayglass, `@wayglass/*`, `wg-`, and `--wg-` provisional while the project had no npm
scope or selected software license. Phase 2 is complete, the `wayglass` npm organization has been
registered, and the project needs a stable identity before release governance begins.

The project also needs a permissive license suitable for open and proprietary consumer applications.
MIT minimizes downstream paperwork, while Apache License 2.0 adds explicit contributor patent
grants, contribution terms, modification notices, and a clear statement that the software license
grants no trademark rights.

## Decision

Confirm **Wayglass** as the project and product name. Confirm `@wayglass` as the public npm scope
and retain `wg-` for Custom Elements and `--wg-` for public CSS custom properties. The canonical
planned documentation origin is `https://wayglass.hoagsoftworks.com`.

License the repository under the Apache License, Version 2.0, identified in package metadata as
`Apache-2.0`. Attribute the work to Wayglass contributors. The license permits open and proprietary
use while retaining its patent, notice, modification, warranty, liability, and trademark terms.

The license and scope decision does not publish a package. Workspace packages remain private until
versioning, package contents, provenance, release automation, and the carried public-release gates
are approved.

## Consequences

The project no longer treats its code identifiers as rename placeholders. Documentation, package
metadata, contribution guidance, and future release tooling use Wayglass and `@wayglass`
consistently. A later brand refresh would be a migration rather than completion of a provisional
decision.

Distributions include the repository `LICENSE` and `NOTICE` files and preserve notices as required
by Apache-2.0. The license does not itself grant rights to use Wayglass trademarks beyond customary
description of the work.

The planned documentation hostname records the canonical destination without selecting a hosting or
deployment provider.

## Alternatives considered

- **MIT:** rejected because its shorter notice does not provide Apache-2.0's explicit contributor
  patent grant and patent-litigation termination.
- **MPL-2.0:** rejected because file-level copyleft adds obligations that are not needed to preserve
  Wayglass's application-neutral architecture.
- **GPL or LGPL:** rejected because reciprocal library or application obligations would add friction
  for proprietary operational applications.
- **Keep naming and licensing provisional:** rejected because the name, npm organization, and
  license have now been explicitly selected.
