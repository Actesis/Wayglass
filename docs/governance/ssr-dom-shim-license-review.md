# SSR DOM shim license evidence for initial release

Status: bounded disposition explicitly accepted by the project owner on November 7, 2026. This
record is not a legal opinion or a claim that the upstream package contains a missing file.

The exact installed `@lit-labs/ssr-dom-shim@1.6.0` declares `BSD-3-Clause` but has no package-root
license/notice file. Its JavaScript entry point retains a Google copyright and BSD SPDX header. The
audit must continue recording `licenseFiles: []` rather than inventing embedded license bytes.

Read-only npm version metadata identifies source `gitHead`
`20afabd3c5bfd49fdcdf1b8518e05c7f99a46db6` in `lit/lit`, directory `packages/labs/ssr-dom-shim`. Its
registry integrity is
`sha512-VHb0ALPMTlgKjM6yIxxoQNnpKyUKLD04VzeQdsiXkMqkvYlAHxq9glGLmgbb889/1GsohSOAjvQYoiBppXFqrQ==`.
The
[package manifest at that exact source commit](https://github.com/lit/lit/blob/20afabd3c5bfd49fdcdf1b8518e05c7f99a46db6/packages/labs/ssr-dom-shim/package.json)
also identifies version 1.6.0 and BSD-3-Clause. The
[upstream repository license at that commit](https://github.com/lit/lit/blob/20afabd3c5bfd49fdcdf1b8518e05c7f99a46db6/LICENSE)
provides the full BSD terms. These are source references, not replacement contents for the npm
artifact. The recorded production graph and frozen versions remain unchanged.

## Accepted bounded disposition

Retain the existing exact dependency and evidence, documenting that it is installed separately by
the consumer and not bundled into Wayglass tarballs. Keep the source-linked attribution visible in
release documentation. Do not claim the artifact is complete merely from its SPDX declaration.
Before any future redistribution or bundling of this dependency, review the full BSD notices and
distribution obligations and include required materials through a reviewed change. Any dependency
update/refreeze still requires renewed validation.

The owner explicitly accepted the missing-file limitation and the above treatment after a direct
approval request; this is not inferred from a general merge or passing tests. Acceptance closes this
bounded initial-release compliance disposition, not legal certification, broader redistribution
approval, or npm publication authority. No package/source license, notice, dependency version, or
audit collector is changed by this evidence record.
