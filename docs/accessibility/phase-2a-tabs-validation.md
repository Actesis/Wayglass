# Phase 2A tabs validation

Status: automated validation complete as of July 29, 2026; representative screen-reader review
pending.

This record covers the generic tabs compound elements, their framework-neutral interaction model,
the typed React wrappers, and the production-backed stories and examples. The accessibility target
is WCAG 2.2 AA.

## Evidence matrix

| Requirement                     | Evidence                                                                                                                                                             | Result  |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Names, roles, and relationships | Named `tablist`, `tab`, and `tabpanel` role assertions; reciprocal `aria-controls` and `aria-labelledby`; one exposed selected panel                                 | Pass    |
| Keyboard behavior               | Automatic and manual activation; horizontal, vertical, left-to-right, and right-to-left navigation; wrapping; Home, End, Enter, and Space                            | Pass    |
| Focus                           | Roving tab stop, visible focus, tab-to-panel order, stable programmatic updates, and deterministic focus recovery after removal                                      | Pass    |
| Pointer and touch               | Pointer selection emits one composed change event, preserves focus, and every selector is at least 44 by 44 CSS pixels                                               | Pass    |
| Dynamic selection               | Added, removed, disabled, reordered, invalid, duplicate, and unmatched entries retain deterministic selection and focus behavior                                     | Pass    |
| Dark and light themes           | Automated Axe checks pass in both themes                                                                                                                             | Pass    |
| Reduced motion                  | The reduced-motion media query removes nonessential tab transition duration in all supported engines                                                                 | Pass    |
| Forced colors                   | Selected and focused states retain system-color treatment, borders, text relationships, and an Axe-clean role graph                                                  | Pass    |
| 200% zoom and reflow            | At a 320 CSS-pixel viewport, equivalent to a 640-pixel display at 200% zoom, the fixture has no horizontal page overflow and keyboard selection remains discoverable | Pass    |
| Framework parity                | Vanilla Custom Element and typed React examples use the same production elements and selection events                                                                | Pass    |
| Supported browser engines       | The complete Playwright suite runs in Chromium, Firefox, and WebKit                                                                                                  | Pass    |
| Assistive technology            | Real screen-reader walkthrough required by ADR 0009                                                                                                                  | Pending |

## Automated review record

The tabs-specific Playwright cases run in Chromium, Firefox, and WebKit. Together they verify:

- one named role graph with reciprocal tab-panel relationships;
- one roving tab stop and one exposed panel;
- keyboard, pointer, and programmatic selection without conflating focus and selection;
- stable selection during remote content updates and deterministic fallback after structural
  mutation;
- visible focus, minimum target size, reduced motion, forced colors, dark and light themes, and 200%
  zoom reflow;
- no automated Axe violations in either theme or the forced-colors fixture.

Browser role queries and Axe checks inspect the platform accessibility representation, but they do
not prove how a screen reader announces or operates the custom-element hosts.

## Representative assistive-technology review

The local Phase 2A acceptance session must exercise VoiceOver with Safari on macOS. It should
confirm:

1. the tab list name, tab position, selected state, disabled state, and summary text are announced;
2. Control-Option navigation and the documented unmodified keyboard commands do not conflict;
3. Left and Right Arrow, Home, End, Enter, and Space behave as documented in automatic and manual
   activation modes;
4. selection exposes the associated panel with an intelligible name;
5. moving into the panel, returning to the selected tab, and removing the selected pair preserve a
   predictable reading and focus position.

NVDA with Firefox on Windows is the second compatibility pairing required before a public release.
VoiceOver with iOS Safari is recommended before claiming mobile assistive-technology support.

If the local VoiceOver session exposes an unresolved semantic-host interoperability problem, ADR
0009 returns to proposed status and the native light-DOM alternative must be evaluated before the
Function Deck work begins.

## Reproduce automated checks

```bash
pnpm check
pnpm test:browser
```

The browser command builds the packages and executes the suite in Chromium, Firefox, and WebKit.
