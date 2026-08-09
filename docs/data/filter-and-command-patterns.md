# Phase 3F filter and command pattern contracts

**Status:** Accepted for Phase 3F on August 9, 2026. This contract defines the boundary for
`wg-filter-bar` and `wg-command-bar`. Its required public tokens are locked, and the
framework-neutral elements are implemented. React bindings, reference stories, and the full
validation matrix remain in progress. It follows the accepted
[operational-data ownership contract](./operational-data.md),
[control-state contract](../controls/control-state.md),
[form-foundation contracts](../forms/form-foundation.md),
[menu and command contracts](../controls/menus-and-commands.md), and accepted
[ADR 0027](../architecture/adr/0027-filter-and-command-composition.md).

Filter and command bars both place controls near operational data, but they have different native
owners. A filter bar presents a consumer-authored native form whose draft values, submission, reset,
validation, and applied query remain application-owned. A command bar groups immediate commands
whose existing controls own activation and popup behavior. Wayglass provides stable composition
without turning either pattern into a query engine, command executor, or universal toolbar.

## Shared requirements

Both accepted elements:

- import without registration side effects and expose explicit registration functions;
- provide a visibly named, domain-neutral function-local boundary;
- preserve consumer-authored light DOM, native events, control identity, and framework keys;
- retain authored source and focus order at every viewport and writing direction;
- use inherited compact or comfortable density without shrinking interactive targets below the
  accepted minimum;
- wrap or stack visible content before introducing page-level horizontal overflow;
- keep primary or time-sensitive actions visible rather than moving them into an overflow menu;
- add no implicit live region, modal behavior, shortcut model, authorization, request state machine,
  or application result state;
- remain useful as authored content before client-only upgrade;
- provide typed React wrappers over the same framework-neutral elements; and
- remain coherent across accepted themes, directions, accessibility modes, container sizes, and
  display classes.

The elements may share private layout helpers only where semantics remain identical. They do not
share one public action-bar base class, child record type, or aggregate event.

## Filter model and ownership

`wg-filter-bar` contains exactly one direct consumer-authored native `<form>` in its default slot.
The form remains the complete owner of:

- control names, draft values, defaults, constraints, labels, descriptions, and disabled state;
- native input, change, invalid, submit, formdata, and reset events;
- successful-control data, submitter identity, constraint validation, and reset behavior; and
- optional `search` landmark semantics when the application deliberately authors `role="search"`.

The filter bar does not inspect controls, generate a filter schema, serialize values, infer dirty or
applied state, call `requestSubmit()`, prevent submission, intercept reset, or emit a replacement
filter event. Existing native controls, Wayglass form presentation, native submit/reset buttons,
segmented local selection, and application listeners retain their accepted behavior.

The initial reference pattern uses explicit application through native submission. This keeps draft
form values separate from the filters currently represented in the results. Immediate filtering on
native input or change is compatible when the application deliberately chooses it, updates the
durable applied summary and result context, and preserves the same focus and announcement rules.

### Submission, reset, and applied state

A submit event reports a valid draft and its native submitter; it does not prove that a remote query
completed or that results changed. The application may calculate local results immediately or begin
an asynchronous request. It owns duplicate suppression, cancellation, stale responses, persistence,
URL synchronization, failure, retry, and the transition from draft values to applied filters.

A native reset restores authored form defaults. It does not automatically apply those defaults,
clear application query state, update records, or erase server errors. Applications choose and label
one of these behaviors:

1. **Reset draft:** restore the controls, keep the current applied filters and results, and state
   that applying is still required.
2. **Reset and apply defaults:** handle the native reset, then deliberately update applied state and
   results after native defaults are restored.
3. **Clear filters immediately:** use a distinct native submitter or ordinary command whose visible
   name says “Clear filters”; do not disguise an application command as native reset.

The applied-filter summary describes committed application state, never merely the current draft. It
remains visible when controls collapse, wrap, or move within the bar. Useful wording identifies
values, not just a count: “3 filters applied: Caution, North intake, Last 24 hours.” A compact badge
may reinforce the count but is not the sole summary.

### Result context and announcements

The result collection remains outside the filter bar and keeps its own visible name, loading, empty,
partial, failure, and busy semantics. Its persistent context explains the outcome, for example “24
events, filtered from 500” or “No events match the applied filters.” The filter bar does not infer
context from collection length or mirror results into a private store.

Submitting, resetting, or changing a filter does not move focus to the result collection. The
application preserves the focused control or submitter unless a validation error requires the
accepted deliberate error-focus path. Record updates retain stable nodes and reading context under
ADR 0024.

Neither the applied summary nor result context is implicitly live. When a dynamic result warrants
speech, the application selects one bounded visible owner, normally the result context, and uses a
deliberate polite announcement. The form, bar, collection, empty state, and toast do not all
announce the same result. A pending query retains still-valid results and exposes activity
separately.

## Command model and ownership

`wg-command-bar` groups existing immediate-command controls without becoming their interaction
coordinator. Primary commands use `wg-button` or another accepted visible command control. Secondary
commands may remain visible or be authored inside one existing flat `wg-menu`. Each child continues
to own its native click or typed `wg-command` event, disabled or pending presentation, menu focus
model, and confirmation handoff.

The command bar:

- does not emit a second aggregate command event;
- does not execute, authorize, confirm, queue, cancel, retry, or undo commands;
- does not add `role="toolbar"`, roving focus, arrow-key movement, shortcuts, or a command palette;
- does not clone, portal, reorder, hide, or automatically move commands into a menu; and
- does not infer primary, critical, destructive, or unavailable meaning from command labels or
  appearance.

The word “bar” describes visual composition, not the ARIA toolbar pattern. Controls remain ordinary
Tab stops in source-aligned order. The named command region supplies function context; consequential
control names still repeat the operation and target.

### Priority and overflow

Priority is explicit and stable:

- default-slot commands are the primary visible set and remain visible at every supported width;
- `secondary` commands remain visible but may wrap or stack after the primary set;
- `overflow` contains at most one explicitly authored `wg-menu` for commands that are secondary at
  every width; and
- `status` contains durable application-owned progress, rejection, unavailability, or recovery
  context outside any dismissed menu.

The application authors children in the same primary, secondary, overflow, then status sequence used
by the flattened composition. CSS may change rows and alignment but never semantic order. Wayglass
does not render one desktop command and a duplicate mobile menu item or migrate the same node across
owners during a container change. A command important enough to remain primary on phone must be
visible on phone; a menu is not a responsive hiding place for the only recovery path.

At narrow widths, the primary set wraps or stacks first, secondary controls follow, and the labeled
overflow trigger remains discoverable. Long action labels wrap. If the available width cannot
preserve a usable visible command set, the application reduces the authored set or uses a focused
function composition rather than adding an unlabeled horizontal command scroller.

### Pending, rejected, and unavailable commands

Activation reports intent only. While an application operation is pending, the originating visible
button may use its accepted pending state and retain focus. A command activated from a menu closes
normally; durable progress appears in the bar's status slot or owning function, and the item is
disabled on later opening when duplicate activation is unsafe.

Rejection identifies the command, target, what remains true, and an available retry or alternate
path. It does not reopen the menu, move focus, mark unrelated data invalid, or become only a toast.
Unavailable or unauthorized commands are disabled only when the application has made that decision,
and a useful visible reason remains near the bar or in the menu item's detail. Condition color does
not choose availability, confirmation, or modality.

Consequential commands continue to use the accepted proportional-friction policy. A direct button or
menu item may open `wg-confirmation-dialog`, but the command bar neither selects that tier nor owns
the dialog's focus and close lifecycle.

## `wg-filter-bar` API

### Purpose and anatomy

`wg-filter-bar` presents one visibly named filtering area containing a native form, optional
description, persistent applied-filter summary, and application-owned status. It is a layout and
semantic boundary, not a form-associated element or data controller.

Use it when several controls jointly narrow, group, or scope an operational result set. Do not use
it for record editing, site search without an authored search landmark, sorting alone, local view
selection without filtering, or a single control that is already clear in context.

### Attributes and properties

- `label: string`: required visible and accessible fallback heading.

The element has no `value`, `filters`, `schema`, `applied`, `dirty`, `busy`, `disabled`, or
`results` property. Those concepts belong to the authored form or application result owner.

### Slots

- `heading`: optional visible heading; overrides visible `label` while it remains the fallback;
- `description`: optional concise filtering scope or instruction;
- default: exactly one direct consumer-authored native `<form>`;
- `summary`: optional persistent application-authored applied-filter summary; and
- `status`: optional persistent pending, failure, unavailable, or recovery composition.

Events and methods: none. Native form and control events pass through unchanged.

### CSS custom properties

- `--wg-filter-bar-color-background`
- `--wg-filter-bar-color-border`
- `--wg-filter-bar-color-heading`
- `--wg-filter-bar-color-context`
- `--wg-filter-bar-radius`
- `--wg-filter-bar-space`
- `--wg-filter-bar-space-group`

### CSS parts

- `base`
- `header`
- `heading`
- `description`
- `content`
- `summary`
- `status`

## `wg-command-bar` API

### Purpose and anatomy

`wg-command-bar` presents one visibly named set of function-local immediate commands. It provides
stable priority regions, responsive layout, explicit overflow placement, and durable outcome context
without adding a composite keyboard model.

Use it when a function has several related actions whose priority and ownership must remain clear.
Do not use it for navigation, form submission and reset, persistent selection, a menu bar, command
palette, application-wide shortcut system, or arbitrary mixed content.

### Attributes and properties

- `label: string`: required visible and accessible fallback heading.

The element has no command registry, selected command, pending command, authorization, shortcut,
overflow calculation, or execution property.

### Slots

- `heading`: optional visible heading; overrides visible `label` while it remains the fallback;
- `description`: optional concise scope or instruction;
- default: primary commands that remain visible at every supported width;
- `secondary`: optional lower-priority commands that also remain visible;
- `overflow`: optional one explicitly authored `wg-menu` containing secondary commands; and
- `status`: optional durable pending, rejected, unavailable, or recovery composition.

Events and methods: none. Native click and existing typed command events bubble unchanged.

### CSS custom properties

- `--wg-command-bar-color-background`
- `--wg-command-bar-color-border`
- `--wg-command-bar-color-heading`
- `--wg-command-bar-color-context`
- `--wg-command-bar-radius`
- `--wg-command-bar-space`
- `--wg-command-bar-space-group`

### CSS parts

- `base`
- `header`
- `heading`
- `description`
- `primary`
- `secondary`
- `overflow`
- `status`

## Responsive and accessibility behavior

Both bars are container-query compatible and use logical properties. Desktop and wall layouts may
keep related groups on one line when space permits. Phone and 200%-text layouts stack groups in the
documented flattened order. Direction changes logical alignment, never command priority, form
sequence, or focus order.

Each bar exposes one named region derived from its visible heading or `label` fallback. It adds no
focus stop. The filter bar's native form and the command bar's existing controls keep their own
semantics. Native fieldsets and legends group related filters. A command bar is not a toolbar, and
arrow keys retain the behavior of the focused control or open menu.

Primary controls and overflow triggers retain accepted touch targets. Long labels, applied values,
identifiers, errors, and status text wrap without truncation. Forced colors preserve visible
boundaries and focus. Grayscale retains labels and grouping. Reduced motion removes nonessential
layout or pending transitions without hiding state.

Unsupported anatomy produces one stable development diagnostic while preserving authored content.
The components do not repair a missing form, move controls between slots, invent labels, or disable
content.

## Reference compositions and validation

Phase 3F fixtures compose the bars with existing status lists, event logs, and later the Phase 3G
table. They exercise complexity through the existing collection envelopes rather than inventing a
new data-volume limit for the bars.

Required filter cases include:

- explicit field labels and fieldset/legend groups;
- default, long, localized-looking, invalid, disabled, and unavailable control content;
- valid submission with submitter identity and successful-control form data;
- reset-draft and reset-and-apply compositions with honest applied summaries;
- no filters, one filter, several applied values, no matching results, retained results during
  pending work, request rejection, and recovery;
- stable focus and records during local and asynchronous result updates; and
- one deliberate result announcement owner with no duplicate live regions.

Required command cases include:

- primary, secondary, overflow-menu, pending, rejected, unavailable, consequential, and recovery
  commands;
- ordinary Tab order plus the accepted menu keyboard model without a second arrow-key layer;
- stable focus while status and result data update;
- visible target scope and a discoverable primary response at narrow widths; and
- no duplicated responsive commands or aggregate activation event.

Both families require side-effect-free import, useful fallback, public API and diagnostic coverage,
typed React parity, dark and light themes, compact and comfortable density, 320 CSS pixels, 200%
text, RTL, forced colors, grayscale, reduced motion, touch, Axe scans, and Chromium, Firefox, and
WebKit. Representative VoiceOver/Safari and NVDA/Firefox review remains a public-release gate.

## Deferred and excluded behavior

The following remain application-owned or separately deferred:

- filter definitions, query languages, parsing, serialization, URL or storage persistence, saved
  views, suggestions, autocomplete, and advanced multi-select controls;
- result calculation, data fetching, debouncing, caching, cancellation, paging, sorting, grouping,
  retention, and virtualization;
- command registration, discovery, authorization, execution, request correlation, undo, retry
  policy, keyboard shortcuts, analytics, and durable history;
- automatic responsive command migration, hidden duplicate controls, generic overflow measurement,
  horizontally scrolling action strips, and adaptive priority inference;
- generic toolbars, checked or radio menus, nested menus, menubars, context menus, command palettes,
  and arbitrary popup content; and
- automatic result announcements, focus movement, confirmation selection, or modal coordination.

These are compatible later capabilities only after deployment evidence proves a reusable contract.
The accepted slots allow application composition without implying future package ownership.

## Resolved contract decisions

1. Filter and command bars remain separate composition elements because their native owners differ.
2. A filter bar wraps one consumer-authored native form and never replaces native submit, reset,
   validation, successful-control, or event behavior.
3. Draft controls, applied filters, result context, and query activity remain distinct
   application-owned states.
4. A command bar groups existing controls without adding toolbar roles, arrow-key navigation,
   aggregate events, execution, or authorization.
5. Primary commands remain visible; overflow is explicitly authored and stable rather than
   calculated or populated by responsive DOM migration.
6. Result and command outcomes remain durable, function-local, stationary, and quiet unless the
   application selects one deliberate announcement owner.
7. Public tokens are locked only for the named surfaces, boundaries, text roles, radius, and
   density-aware spacing; implementation, stories, and validation proceed in later reviewable
   slices.
