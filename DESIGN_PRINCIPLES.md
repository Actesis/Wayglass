# Wayglass Design Principles

> Beauty is a consequence of clarity.

This document is the decision-making framework for Wayglass. It applies to visual design, interaction design, content, components, layouts, motion, accessibility, documentation, and implementation.

A design that follows the technical specification but violates these principles is not a successful Wayglass design.

## 1. Create a Known State

The primary purpose of every screen, component, and interaction is to reduce uncertainty.

A user should be able to determine:

- what the system is doing;
- whether it is healthy;
- what changed;
- what requires attention;
- which actions are possible;
- whether an action succeeded;
- what is still pending or unknown.

State must never depend on color alone. Use combinations of labels, icons, position, shape, and text.

### Test

After any interaction, can the user confidently explain the new state?

## 2. Information First

Hide complexity when appropriate. Never hide understanding.

Information density is not inherently bad. Unstructured density is.

Wayglass may present many values, controls, and signals at once when:

- the hierarchy is clear;
- related information is grouped;
- priority is visible;
- scanning patterns are predictable;
- secondary detail can be progressively disclosed.

Do not remove information merely to create empty space. Do not add information merely because it is available.

Every section has a purpose:

- information explains or provides reference and context;
- monitor presents current or changing state;
- control offers actions that can change a system.

Function ownership and section purpose are independent. Informational sections must not be styled as
healthy or actionable merely because they are present.

### Test

Does every visible item help the user understand, decide, or act?

## 3. Increase Situational Awareness

Every screen should help the user understand the broader situation, not only isolated values.

Where relevant, show:

- current state;
- expected or desired state;
- recent change;
- trend or direction;
- cause;
- consequence;
- confidence;
- freshness;
- available response.

A number without context is often insufficient. “72” is less useful than “72°F, holding at target, updated 20 seconds ago.”

### Test

Can the user distinguish normal state from meaningful change?

## 4. Make Action a Natural Continuation of Understanding

Information without a clear path to action creates frustration.

Controls should appear where the user encounters the state they affect. The relationship between a state and its available actions should be visually and semantically obvious.

Destructive, irreversible, safety-sensitive, or high-impact actions require proportionate friction.

### Test

When the user recognizes a condition, is the appropriate next action easy to find?

## 5. Be Calm by Default

Attention is a scarce resource.

Routine states should be quiet. Exceptional states should become prominent in proportion to their importance.

Avoid:

- constant animation;
- decorative pulsing;
- excessive saturated color;
- multiple simultaneous focal points;
- alerts for normal operation;
- unnecessary confirmation messages.

Critical emphasis is effective only when the rest of the interface is composed.

### Test

If everything appears urgent, how would the user identify what actually matters?

## 6. Preserve Composure

The interface should remain spatially stable while the system changes.

Avoid unexpected:

- layout shifts;
- panel resizing;
- moving controls;
- resorting of live data;
- disappearing actions;
- content replacement without transition or explanation.

Stable placement supports muscle memory and makes change easier to detect.

When live data changes, preserve the user's reading position and interaction context.

### Test

Can the user build reliable spatial memory?

## 7. Use Shape as Structure

Wayglass may use distinctive rails, elbows, segments, frames, and rounded geometry. These shapes must communicate structure rather than serve as ornament.

Shapes may express:

- hierarchy;
- containment;
- grouping;
- navigation;
- continuity;
- direction;
- system boundaries;
- interaction affordance.

Decorative shapes that do not communicate meaning should be removed.

Use shape and space to create obvious functional zones. Each function's identity, scope,
information, state, and actions must remain visually local to it. Internal dividers organize a
function; stronger neutral boundaries and gutters separate different functions.

Do not use an unlabeled colored rail as a generic function boundary. A value rail must remain
attached to the labeled value it represents.

### Test

Would removing the shape make the structure less understandable?

## 8. Use Color Semantically

Color reinforces meaning. It does not create meaning by itself.

Color roles should describe intent rather than hue:

- surface;
- text;
- action;
- selected;
- informational;
- positive;
- caution;
- critical;
- unavailable;
- stale;
- uncertain.

Themes may change hues while preserving semantic roles.

Do not assign arbitrary colors to unrelated panels merely for variety. Do not force users to memorize a large palette.

Domain value is not condition. `On`/`Off`, `Open`/`Closed`, and `Verified`/`Unverified` describe
values, not health. Genuinely Boolean values may share asserted and not-asserted visual roles:
asserted is lit or filled; not asserted is unlit, outlined, or subdued. Neither role means good or
bad.

Reserve green, amber, and red for condition or attention meaning. Blue may reinforce action,
selection, information, pending activity, or an asserted value, but it does not mean healthy.

Icons may reinforce value or condition but must never be required for the visual language to work.

### Test

Does the interface still make sense in grayscale or to a user with color-vision deficiency?

## 9. Let Typography Carry Hierarchy

Typography is information architecture.

Use type to distinguish:

- page and region identity;
- system state;
- labels;
- values;
- units;
- metadata;
- supporting explanation;
- available action.

Values and labels should remain visually associated. Units should never be ambiguous. Long text should not compete with high-priority state.

Avoid decorative typefaces and excessive font variation.

### Test

Can a user scan the page and understand its hierarchy before reading every word?

## 10. Make Motion Explain

Motion exists to explain relationships, changes, navigation, and cause-and-effect.

Appropriate uses include:

- showing where content came from or went;
- connecting an action to a state change;
- revealing hierarchy;
- indicating progress;
- drawing attention to a newly changed value.

Motion should never exist solely to make the interface feel futuristic.

Respect reduced-motion preferences. No essential understanding may depend on animation.

### Test

What does the motion teach the user?

## 11. Write for Humans

Use concise, direct, domain-appropriate language.

Prefer:

- “Front door unlocked”
- “Connection lost”
- “Updated 3 minutes ago”
- “Turn off all downstairs lights”

Avoid:

- internal entity IDs;
- unexplained abbreviations;
- raw error codes without interpretation;
- anthropomorphic AI claims;
- vague messages such as “Something went wrong.”

When technical detail is useful, disclose it progressively.

### Test

Could the intended user understand the message without knowing the implementation?

## 12. Show Confidence and Uncertainty Honestly

Complex systems do not always know the truth with certainty.

Wayglass should distinguish among:

- confirmed state;
- inferred state;
- stale state;
- pending state;
- unavailable state;
- conflicting state;
- unknown state.

Do not present estimates, predictions, or delayed telemetry as confirmed facts.

### Test

Does the interface accurately communicate how much the system knows?

## 13. Design for Touch, Keyboard, Pointer, and Assistive Technology

Wayglass is input-agnostic.

Every essential function must work with:

- keyboard;
- touch;
- pointer;
- screen reader;
- zoom and text enlargement;
- reduced motion;
- high-contrast preferences where supported.

Focus must be visible. Hit targets must be large enough. Reading and interaction order must remain logical.

Accessibility is not a compatibility layer added after visual design. It is part of the design.

### Test

Could this component be fully operated without a mouse and understood without sight?

## 14. Preserve the Product Across Viewports

A Wayglass application should feel like the same application on:

- phone;
- tablet;
- desktop;
- kiosk;
- wall panel.

Responsive design is not shrinking the desktop layout. It is preserving priority, relationships, and available actions while reorganizing space.

Never hide critical state solely because the screen is smaller. Recompose, summarize, or disclose it progressively.

### Test

Does the smaller layout preserve the same decisions and awareness?

## 15. Prefer Progressive Disclosure to Hidden Navigation

Present the most important state and actions first. Reveal detail without forcing users to lose context.

Appropriate disclosure patterns include:

- expandable regions;
- details panels;
- contextual drawers;
- drill-down routes with preserved origin;
- tooltips for supplemental, nonessential explanation.

Do not hide primary actions in overflow menus merely to simplify appearance.

### Test

Can the user get more detail without becoming disoriented?

## 16. Design for Failure and Recovery

Failure states are part of the primary experience.

Components must define behavior for:

- loading;
- empty data;
- stale data;
- partial data;
- offline operation;
- permission failure;
- validation failure;
- service failure;
- recovery;
- retry;
- destructive-action reversal when feasible.

Errors should explain what happened, what remains safe, and what the user can do.

### Test

When the system fails, does the interface remain calm, honest, and useful?

## 17. Avoid False Futurism

Wayglass is inspired by optimistic human-centered computing, not by surface-level science-fiction styling.

Avoid:

- neon cyberpunk conventions;
- excessive glow;
- arbitrary technical labels;
- fake telemetry;
- decorative grids;
- militaristic language;
- animated scanning effects;
- imitation of recognizable fictional interfaces;
- novelty at the expense of comprehension.

The interface should feel forward-looking because it is coherent, capable, and humane.

### Test

Would this design still be strong without its futuristic styling?

## 18. Build Systems, Not Exceptions

New patterns should extend the language rather than create local inventions.

Before creating a new component or token:

1. Determine whether an existing primitive can solve the need.
2. Identify the reusable semantic concept.
3. Define responsive, accessibility, and failure behavior.
4. Document when the new pattern should and should not be used.

One-off solutions accumulate into inconsistency.

### Test

Will another product team understand when to reuse this pattern?

## 19. Wayglass Personality

Wayglass is:

- clear;
- calm;
- confident;
- technical;
- human;
- purposeful;
- stable;
- optimistic;
- precise.

Wayglass is not:

- flashy;
- cute;
- chaotic;
- hostile;
- militaristic;
- cold;
- decorative;
- nostalgic;
- over-minimal;
- over-animated.

## 20. Design Review Questions

Before approving any component, page, or flow, answer:

1. What state does this communicate?
2. What uncertainty does it remove?
3. What action does it support?
4. What is the primary focal point?
5. What happens when data is missing, stale, or wrong?
6. Does it remain understandable without color?
7. Can it be operated with a keyboard?
8. Does it support a screen reader?
9. Does it remain useful at 200% zoom?
10. Does it work on phone, desktop, and wall display?
11. Does motion explain something?
12. Is any element present only for decoration?
13. Is the language understandable to the intended user?
14. Would a new user understand the most important state within five seconds?
15. Does this feel like an instrument rather than a themed dashboard?
16. Are different functions unmistakably separated?
17. Is a domain value being confused with condition?
18. Does the section look informational, monitored, or controllable for the right reason?

## 21. Anti-Goals

Wayglass must never become:

- a clone of an existing fictional interface;
- a retro nostalgia project;
- a decorative theme;
- a disconnected collection of components;
- an animation showcase;
- a glassmorphism framework;
- a high-density excuse for poor hierarchy;
- a low-density excuse for hiding information;
- an inaccessible visual experiment;
- a framework-specific dead end;
- a design system whose examples are better than its production components.

## 22. The Design Promise

Every Wayglass interface should leave users feeling:

> “I understand what is happening, and I know what I can do.”

When people stop noticing the interface and begin understanding their systems, Wayglass has succeeded.
