# Phase 6B transient-feedback contract audit

**Status:** Accepted by the project owner on September 3, 2026. This record reconciles `wg-toast`
and `wg-toast-region` against their implementation, architecture decision, documentation, React
bindings, stories, and browser evidence. It changes no package version, privacy, registry, or
deployment state.

## Scope

The audit covers application and coordinator ownership; fields and defaults; closed vocabularies;
slots; CSS parts and custom properties; queue bounds and ordering; deduplication; announcements;
timing and pausing; dismissal and focus behavior; explicit registration; and React adaptation.

Persistent outcomes, modal decisions, notification history, operating-system delivery, cross-tab
coordination, application analytics, and domain-specific outcome state remain outside this family.

## Result

The implementation remains aligned with ADR 0020 and the feedback-state contract. Applications own
durable outcomes, wording, condition, announcement priority, deduplication identity, and action side
effects. One framework-neutral region owns only temporary presentation: admission, ordering,
visibility, announcement delivery, remaining lifetime, and dismissal.

One CSS-part mismatch was corrected in the authoritative document: `wg-toast-region` renders
`stack`, `polite-announcer`, and `assertive-announcer`; it has no `base` part. The document now also
records the eight element-level `wg-toast` styling hooks and that the region exposes no
element-specific CSS custom properties in v1.

One coordinator defect was corrected. An identical assertive replacement was announced again even
when the older toast was already assertive. Replacement delivery now follows the accepted rule:
announce when normalized text changes or when priority becomes assertive, while suppressing an
unchanged assertive-to-assertive replacement. A focused cross-browser regression freezes that edge.

The region's public `dismiss` overload now exposes only the application-authored `programmatic`
reason. Coordinator-owned timeout, close-control, and replacement reasons remain present in emitted
dismissal details but cannot be forged through the public TypeScript method contract.

## Frozen contract

- Toast owns reflected `toastId`, `open`, `condition`, `announcement`, `dedupeKey`, `dismissible`,
  and `closeLabel`, plus a clamped `duration` property. Defaults remain closed/neutral/polite, 8
  seconds, dismissible, and otherwise empty. An interactive action without an explicitly authored
  duration selects manual lifetime.
- Toast exposes default message, `detail`, `actions`, and `icon` slots; seven CSS parts; eight
  element-level CSS custom properties; and `close('programmatic')`.
- Region owns logical placement, a 1-through-5 visible bound defaulting to 3, and explicit pause. It
  exposes one direct-child slot, three CSS parts, `dismiss`, `dismissAll`, `pause`, and `resume`,
  and no element-specific CSS custom properties.
- Condition, announcement priority, placement, and dismissal reason remain closed vocabularies.
  `wg-toast-dismiss` bubbles and composes with typed toast ID and timeout, close, programmatic, or
  replaced reason.
- Queue admission remains FIFO with at most 50 admitted open records. Explicit deduplication
  replaces in place. Timers begin on visibility and preserve remaining time across hover, focus,
  document visibility, and explicit pause.
- Visible toasts remain outside live regions. The region copies message and detail text only into
  private polite or assertive announcers. Opening never moves focus; explicit close follows the
  accepted stack-entry focus-return rules.
- Both modules remain side-effect free. React registers the production classes, maps only the typed
  dismissal event, and adds no queue or timing behavior.

## Validation

The field-level documentation suite passes all 116 checks. ESLint, documentation and React
typechecks, the production documentation build, and all 17 React tests pass. The focused transient
feedback browser matrix passes all 54 cases across Chromium, Firefox, and WebKit, including the new
assertive replacement regression, both themes, Axe scans, reduced motion, focus and timing behavior,
and 320 CSS-pixel reflow.

## Remaining release evidence

VoiceOver/Safari and NVDA with Firefox on Windows remain open pre-public-release evidence items for
spoken timing, duplicate suppression, assertive interruption, virtual-cursor access, and retained
context. The Windows item remains consistent with the existing deferred Windows-access decision;
this audit makes no unsupported screen-reader claim.

## Project-owner decision

On September 3, 2026, the project owner accepted the transient-feedback contract audit and directed
its merge and continuation to modal-feedback reconciliation. This freezes the listed contract for
v1; later changes require explicit compatibility review. It does not authorize package publication.
