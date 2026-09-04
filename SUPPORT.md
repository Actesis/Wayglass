# Support policy

Wayglass support covers the public contracts, versions, environments, and limitations named by an
accepted release record. Source on `main`, examples, Storybook stories, experiments, and private
release candidates are evidence or guidance; they are not automatically supported releases.

After the repository is public, use [GitHub Issues](https://github.com/Actesis/Wayglass/issues) for
reproducible defects and bounded documentation problems. Include the package and exact version,
browser or runtime and version, minimal reproduction, expected and observed behavior, and relevant
accessibility or writing-mode conditions. Use the private process in the
[security policy](https://wayglass.hoagsoftworks.com/maintenance/security) for vulnerabilities.

Application architecture, domain logic, authorization, data transport, asset hosting, provider
behavior, and arbitrary third-party CSS are application-owned unless an accepted Wayglass contract
states otherwise. Publication does not imply universal browser, assistive-technology, device,
framework, or provider support. The release-specific support matrix is authoritative.

## Proposed initial `0.1.0` matrix

The private `0.1.0` candidates currently propose support for Node `>=22.13.0 <27`, TypeScript
`>=5.9.0 <6.1.0`, current stable Chromium, Firefox, and WebKit engine lines recorded at the release
freeze, and React `>=19.0.0 <20` for the client-rendered React binding. The exact package-specific
boundaries are defined in the
[Phase 6B support-claim disposition](https://wayglass.hoagsoftworks.com/governance/phase-6b-support-claim-disposition).

That proposal makes no broad desktop or mobile screen-reader claim. Completed macOS VoiceOver and
Safari results remain evidence for their exact tabs and core-control tasks only. Physical mobile
devices, embedded webviews, installed PWAs, Electron, Tauri, Home Assistant, low-power hardware,
real-profile autofill/password-manager workflows, and server-rendered component internals remain
unclaimed for v1.

This matrix is not active support while packages remain private. It becomes authoritative only if an
accepted release record adopts it after the final freeze and release-candidate evidence pass.
