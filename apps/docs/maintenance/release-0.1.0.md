# Wayglass 0.1.0 release notes

Wayglass 0.1.0 is the first public npm release for integration and feedback. It is pre-1.0 software
released under Apache-2.0. Both npm tags, `latest` and `next`, resolve to 0.1.0 for the six
published packages:

| Package                                                                  | Role                                                                        |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [`@wayglass/core`](https://www.npmjs.com/package/@wayglass/core)         | Framework-neutral state semantics and utilities                             |
| [`@wayglass/tokens`](https://www.npmjs.com/package/@wayglass/tokens)     | Design token CSS, JSON, and TypeScript exports                              |
| [`@wayglass/themes`](https://www.npmjs.com/package/@wayglass/themes)     | Official themes and density roles                                           |
| [`@wayglass/elements`](https://www.npmjs.com/package/@wayglass/elements) | Custom Elements for layout, controls, feedback, operational data, and media |
| [`@wayglass/icons`](https://www.npmjs.com/package/@wayglass/icons)       | Optional icons                                                              |
| [`@wayglass/react`](https://www.npmjs.com/package/@wayglass/react)       | React 19 bindings                                                           |

The public tarballs matched the approved artifacts byte for byte. npm verified registry signatures
and provenance attestations for all six, and a clean unversioned install selected 0.1.0 for each.
That install check does not replace browser or assistive-technology validation. See the
[support policy](/maintenance/support) for the scope of that evidence.

Start with [installation](/guides/installation) or explore
[Storybook](https://wayglass.hoagsoftworks.com/storybook/). Examples, reference applications,
private tooling, and ecosystem prototypes are not npm release units. The planned SpaceTraders
consumer is a separate project, not a tested integration in this release.

For feedback, include a minimal reproduction and the exact package, browser, and runtime versions.
See the [security policy](/maintenance/security) for private vulnerability reporting.
