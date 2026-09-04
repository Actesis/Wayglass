# Phase 6B version and compatibility contract

**Status:** Proposed on September 4, 2026. This record applies ADR 0035 to the six v1 package
candidates. All packages remain private; this proposal creates no tag, registry package, workflow,
deployment, support claim, or publication authority.

## Candidate versions and relationships

| Release unit      | Candidate version | Relationship                                                            |
| ----------------- | ----------------: | ----------------------------------------------------------------------- |
| Foundation family |           `0.1.0` | Core, tokens, themes, and elements remain synchronized                  |
| `@wayglass/icons` |           `0.1.0` | Independently versioned optional runtime                                |
| `@wayglass/react` |           `0.1.0` | Independently versioned binding; peers on `@wayglass/elements` `^0.1.0` |

The matching initial numbers do not make icons or React members of the foundation lockstep. The
eventual approved tag names are `foundation-v0.1.0`, `icons-v0.1.0`, and `react-v0.1.0`; no tag is
created in Phase 6B.

Publish-time Wayglass relationships are exact:

- themes depends on tokens `^0.1.0`;
- elements depends on core and themes `^0.1.0`; and
- React peers on elements `^0.1.0` and React `>=19.0.0 <20`.

`^0.1.0` accepts only the initial contract's patch line. The React package's workspace-only elements
development dependency remains `workspace:*` for local linking and is excluded from the packed
manifest. Runtime dependency versions remain the exact tested `lit` `3.3.3` and `@lit/react`
`1.0.8`; widening them requires its own compatibility evidence.

## Runtime and compiler boundary

All six manifests declare Node `>=22.13.0 <27`. The repository has accepted minimum Node 22.13 Linux
evidence and current Node 26 macOS evidence. This engine range bounds package-manager,
module-loading, and supported tooling contexts; browsers do not interpret it, and the next support
disposition owns exact browser claims.

Wayglass declarations support TypeScript `>=5.9.0 <6.1.0`. TypeScript is not a runtime dependency or
peer requirement for JavaScript consumers, so the range is documented rather than injected into
package resolution. TypeScript 5.9.3 and the repository's 6.0.3 both check the six build declaration
surfaces; 5.9.3 also checks the complete elements source and React source/type-test configurations.
A behavior-neutral menu predicate annotation was simplified because TypeScript 5.9 already defines
the Popover API on `HTMLElement` and otherwise narrowed the runtime fallback branch to `never`.

## Side effects and packed scripts

| Package             | Declaration | Meaning                                                                 |
| ------------------- | ----------- | ----------------------------------------------------------------------- |
| Core, tokens, icons | `false`     | Unused modules are removable; imports do not register or mutate globals |
| React               | `false`     | Unused wrappers are removable; retained wrappers register on the client |
| Themes, elements    | `**/*.css`  | Only explicit CSS imports are bundler-visible effects                   |

Registration remains explicit for direct elements and icons. React wrappers retain their accepted
guarded client registration behavior. Importing a React wrapper solely to cause registration is not
a supported use; applications render its exported component. The declaration enables removal of an
unused wrapper rather than denying the retained wrapper's documented client behavior.

Repository source manifests keep `build`, `test`, `test:coverage`, and `typecheck` for local Turbo
orchestration. No script is a consumer command. The deterministic Phase 6C packed-manifest
projection must remove all `scripts` and `devDependencies`; it must add no `preinstall`, `install`,
`postinstall`, `prepare`, `prepack`, `postpack`, `publish`, or other lifecycle hook. Exact packed
manifest inspection remains required before candidate promotion.

## Validation and next gate

Validated locally on September 4, 2026:

- all 203 documentation/governance tests passed, including six new executable compatibility
  assertions and the updated completion/stewardship guards;
- TypeScript 5.9.3 checked all six build surfaces plus the complete elements source and React
  source/type-test configurations; TypeScript 6.0.3 checked every package source and React type
  test;
- an isolated install of the five required local tarballs with React/React DOM 19.0.0, matching 19.0
  types, and TypeScript 5.9.3 passed a strict typed React/element consumer and client-only Node
  import;
- all 66 focused package tests, all 58 private icon-pipeline tests, and all 42 menu cases across
  Chromium, Firefox, and WebKit passed;
- all six package builds, token artifact integrity, and icon artifact integrity passed;
- documentation TypeScript, focused ESLint, Prettier, the production documentation build, and
  `git diff --check` passed.

Minimum-version downloads and consumer installation used an isolated temporary npm cache and
directory. No registry package, user-level cache, tag, workflow, or publication state changed. The
focused browser run used a temporary local-server configuration that was removed after validation.

Owner acceptance closes corrections 6, 7, 8, and 9 and advances Phase 6B to the support-claim
disposition. Packed-manifest transformation and clean installed-candidate verification remain Phase
6C evidence; acceptance does not publish, tag, deploy, or establish browser or assistive-technology
support.

## Project-owner decision

Pending review.
