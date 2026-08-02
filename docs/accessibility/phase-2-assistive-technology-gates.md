# Phase 2 representative assistive-technology gates

**Status:** Phase 2 closeout disposition recorded on August 2, 2026. Completed local reviews are
retained as evidence; the remaining platform-specific reviews are explicit public-release or
support-claim gates.

Automated role queries, accessibility-tree assertions, Axe, and keyboard tests establish important
semantic and interaction evidence, but they do not establish spoken output, virtual-cursor context,
announcement timing, or platform-specific focus recovery. Phase 2 does not claim that they do.

## Disposition policy

- **Complete** means the named representative pairing was exercised and its result is recorded in
  the linked validation record.
- **Carried — public release** means Phase 2 implementation may close, but Wayglass must not make a
  public release containing the affected component until the named review passes or the supported
  scope explicitly excludes that component or pairing.
- **Carried — support claim** means the review is required before claiming support for that platform
  or interaction, even when it is not part of the initial public-release baseline.
- A failure reopens the affected component. Semantic-host, focus, or announcement defects require a
  correction and rerun; an architectural blocker also revisits the governing ADR.
- Consumer applications repeat representative review with their real content, navigation, state
  transitions, and supported platform matrix. Library acceptance is not product certification.

## Gate ledger

| Surface                      | Completed evidence                                                                                  | Carried gate                                                                                                       | Release or support impact                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Tabs                         | VoiceOver with Safari on macOS: naming, selection, disabled skipping, panel entry, and return focus | NVDA with Firefox on Windows                                                                                       | Required before public release                                                                                           |
| Core controls                | VoiceOver with Safari on macOS: switch and custom radio-host semantics and operation                | NVDA with Firefox on Windows                                                                                       | Required before public release                                                                                           |
| Menus and commands           | Cross-engine accessibility trees, keyboard interaction, and Axe                                     | VoiceOver with Safari on macOS; NVDA with Firefox on Windows                                                       | Both required before public release                                                                                      |
| Form foundation and controls | Native ownership, relationships, constraint behavior, and cross-engine accessibility trees          | VoiceOver with Safari on macOS; NVDA with Firefox on Windows; real-profile autofill and password-manager fill/save | All required before public release; the Phase 2D-D checks are consolidated into the complete Phase 2D-E form composition |
| Persistent feedback          | Cross-engine semantics, transition behavior, and Axe                                                | VoiceOver with Safari on macOS; NVDA with Firefox on Windows                                                       | Both required before public release                                                                                      |
| Transient feedback           | Cross-engine live-region, queue, focus-independence, and Axe evidence                               | VoiceOver with Safari on macOS; NVDA with Firefox on Windows                                                       | Both required before public release                                                                                      |
| Confirmation                 | Cross-engine native-dialog semantics, focus containment and recovery, and Axe                       | VoiceOver with Safari on macOS; NVDA with Firefox on Windows, using vanilla and React entry points                 | Both required before public release                                                                                      |
| Mobile interaction           | Responsive, touch-target, and native-control browser evidence                                       | VoiceOver with iOS Safari; native software-keyboard and autofill behavior                                          | Required before claiming mobile assistive-technology support                                                             |

The detailed procedures remain in the linked validation records:

- [tabs](./phase-2a-tabs-validation.md) and [core controls](./phase-2d-core-controls-validation.md)
  for completed representative evidence;
- [menus and commands](./phase-2d-menu-command-validation.md);
- [form foundation](./phase-2d-form-foundation-validation.md) and
  [form controls](./phase-2d-form-controls-validation.md);
- [persistent feedback](./phase-2e-persistent-feedback-validation.md),
  [transient feedback](./phase-2e-transient-feedback-validation.md), and
  [confirmation](./phase-2e-confirmation-dialog-validation.md).

## Evidence required to close a carried gate

Each manual record must name the date, operating system, browser, assistive-technology or password-
manager version, production-backed fixture, input method, expected result, observed result, and any
issue or corrective pull request. Record pass, fail, or blocked for every procedure in the detailed
validation record; do not replace the procedure with a general impression.

The public-release review should batch related surfaces into one VoiceOver/Safari session and one
NVDA/Firefox session while preserving per-surface results. Autofill and password-manager review uses
a disposable production-like profile and non-sensitive test credentials. A carried gate closes only
when its evidence is committed to the repository and the affected focused and full validation suites
still pass after any correction.
