# Wayglass Technical Specification

**Document status:** Draft v0.2  
**Project naming status:** Wayglass is the confirmed project and product name.
**Normative language:** “MUST,” “MUST NOT,” “SHOULD,” “SHOULD NOT,” and “MAY” indicate requirement strength.

## 1. Purpose

This specification defines the technical architecture, implementation requirements, component contracts, quality gates, and initial roadmap for the Wayglass design language.

Implementations MUST follow:

1. `VISION.md`
2. `DESIGN_PRINCIPLES.md`
3. this specification

Wayglass is a design language and implementation ecosystem for high-awareness interfaces. The implementation MUST preserve the concepts of known state, situational awareness, calm operation, stable layouts, semantic visual language, responsive composition, and accessibility.

## 2. Product Goals

Wayglass MUST provide:

- a framework-neutral component foundation;
- standards-based Web Components;
- first-class React bindings;
- reusable design tokens;
- theme support;
- responsive layouts from phone to wall display;
- accessible controls and data displays;
- patterns for state, telemetry, alerts, and control;
- documentation suitable for humans and AI coding agents;
- production-quality testing and release discipline.

## 3. Non-Goals

The initial project will not attempt to:

- reproduce LCARS or any other fictional interface;
- provide a complete application framework;
- replace routing, data fetching, state management, or form libraries;
- provide every possible enterprise component in the first release;
- optimize for arbitrary visual customization that weakens the design language;
- require React or any other framework;
- ship franchise-specific names, assets, sounds, or iconography;
- use WebGL or canvas for standard interface components;
- make animation essential to understanding.

## 4. Target Platforms

The core implementation MUST support current stable versions of:

- Chromium-based browsers;
- Safari;
- Firefox;
- Chromium-based embedded web views where standards support is sufficient.

The project SHOULD support:

- desktop browsers;
- mobile browsers;
- installed Progressive Web Apps;
- touch panels and kiosks;
- Home Assistant dashboards;
- Electron and Tauri applications;
- server-rendered applications with safe client hydration.

Support policy MUST be documented and reviewed for each major release.

## 5. Technical Architecture

### 5.1 Language

All production packages MUST use TypeScript with strict compiler settings.

Required baseline:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true,
    "noImplicitOverride": true
  }
}
```

Exceptions require documented justification.

### 5.2 Component Foundation

The framework-neutral component layer MUST use standards-based Custom Elements.

Components SHOULD use:

- Shadow DOM where encapsulation improves reliability;
- slots for composition;
- attributes and properties with predictable reflection;
- native events or well-defined custom events;
- ARIA semantics and native HTML elements whenever possible.

The core MUST NOT depend on React, Vue, Angular, Svelte, or application-specific state libraries.

### 5.3 Rendering Library

A small rendering helper such as Lit MAY be used if it:

- keeps output standards-based;
- does not prevent direct Custom Element use;
- supports SSR strategy or safe client-only fallback;
- does not leak implementation details into the public API.

The choice MUST be recorded in an architecture decision record.

### 5.4 React Bindings

React bindings MUST:

- expose idiomatic React props;
- translate Custom Events to callback props;
- preserve TypeScript types;
- support refs;
- avoid duplicating component logic;
- remain thin wrappers over the Web Component implementation.

### 5.5 Styling

Styling MUST use CSS Custom Properties and cascade layers.

Recommended layers:

```css
@layer wayglass.reset;
@layer wayglass.tokens;
@layer wayglass.base;
@layer wayglass.components;
@layer wayglass.utilities;
@layer wayglass.overrides;
```

Component styles MUST consume semantic or component tokens. Hardcoded visual values are prohibited except for documented implementation constants that cannot reasonably be tokenized.

### 5.6 State Management

Components MUST separate presentation state from application state.

Components MAY manage local interaction state such as:

- open or closed;
- selected;
- focus-visible;
- pending;
- expanded;
- internal keyboard navigation.

Components MUST NOT own application-domain state unless the component is explicitly designed as a self-contained domain control.

Domain values MUST remain separate from condition, knowledge, and activity. Components MUST NOT
infer that a Boolean `false` value is a failure or that `true` is healthy.

Genuinely Boolean values MAY map to the shared presentation roles `asserted` and `not-asserted`.
Unknown MUST remain a knowledge state and MUST NOT be coerced to `false`.

## 6. Repository Structure

The project SHOULD use a monorepo.

```text
/
├── VISION.md
├── DESIGN_PRINCIPLES.md
├── SPEC.md
├── AGENTS.md
├── CONTRIBUTING.md
├── ROADMAP.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── elements/
│   ├── react/
│   ├── themes/
│   ├── icons/
│   ├── charts/
│   ├── home-assistant/
│   ├── testing/
│   └── eslint-config/
├── docs/
│   ├── foundations/
│   ├── components/
│   ├── patterns/
│   ├── accessibility/
│   ├── architecture/
│   └── examples/
├── examples/
│   ├── vanilla/
│   ├── react/
│   ├── operations-console/
│   └── smart-home/
└── tooling/
```

The initial implementation MAY defer files that are not yet needed, but package boundaries SHOULD be established early.

## 7. Package Responsibilities

### 7.1 `@wayglass/tokens`

Provides:

- source token definitions;
- generated CSS variables;
- JSON exports;
- TypeScript exports;
- optional platform transforms.

It MUST contain no component implementation.

### 7.2 `@wayglass/core`

Provides framework-neutral utilities:

- shared types;
- event helpers;
- focus management;
- ID generation;
- directionality helpers;
- resize and media-query utilities;
- accessibility helpers;
- base element behavior.

It MUST NOT contain React dependencies.

### 7.3 `@wayglass/elements`

Provides registered or registerable Custom Elements.

It SHOULD support:

- side-effect-free component imports;
- explicit registration;
- optional convenience registration bundles.

### 7.4 `@wayglass/react`

Provides typed React wrappers around `@wayglass/elements`.

### 7.5 `@wayglass/themes`

Provides official theme token sets and theme registration utilities.

### 7.6 `@wayglass/icons`

Provides a coherent icon system as SVG or Custom Elements.

Icons MUST support accessible labeling and decorative usage.

### 7.7 `@wayglass/charts`

Provides chart primitives optimized for operational awareness.

Charts MUST NOT be included in the first foundation milestone unless needed for the initial vertical slice.

### 7.8 `@wayglass/home-assistant`

Provides adapters and cards for Home Assistant.

This package MUST depend on generic Wayglass components rather than duplicate them.

### 7.9 `@wayglass/testing`

Provides shared test helpers for:

- element setup;
- keyboard interaction;
- accessibility assertions;
- visual fixture generation;
- event testing.

## 8. Design Token System

### 8.1 Token Layers

Wayglass MUST use at least four token layers.

#### Reference tokens

Raw palette and scale values.

Examples:

```text
color.blue.500
space.4
radius.3
duration.fast
```

#### Semantic tokens

Meaning-based roles independent of components.

Examples:

```text
color.surface.canvas
color.surface.panel
color.text.primary
color.text.muted
color.condition.positive
color.condition.caution
color.condition.critical
color.value.asserted
color.value.not-asserted
color.action.primary
```

#### Component tokens

Values scoped to a component.

Examples:

```text
button.background.default
panel.border.active
rail.width.standard
status-indicator.size.compact
```

#### State and mode tokens

Overrides for:

- hover;
- focus;
- selected;
- disabled;
- pending;
- compact density;
- comfortable density;
- dark mode;
- high contrast;
- reduced motion.

### 8.2 Required Token Categories

The initial token package MUST include:

- color;
- typography;
- spacing;
- sizing;
- density;
- shape;
- border;
- elevation;
- motion;
- opacity;
- z-index;
- breakpoints;
- touch targets;
- focus indicators;
- data visualization roles.
- Boolean value roles;
- condition, knowledge, and activity roles;
- functional zoning and section-purpose roles.

### 8.3 Naming

Token names MUST describe semantic purpose, not visual appearance, outside the reference layer.

Good:

```text
--wg-color-condition-critical
--wg-color-value-asserted
--wg-color-surface-elevated
--wg-space-control-inline
```

Avoid:

```text
--wg-red
--wg-purple-panel
--wg-big-gap
```

### 8.4 Prefix

All public CSS variables MUST use the `--wg-` prefix while Wayglass remains the project name.

All public Custom Elements MUST use the `wg-` prefix.

## 9. Theme Architecture

Themes MUST preserve semantic meaning.

An official theme MAY change:

- hues;
- contrast;
- surface brightness;
- typography;
- density;
- shape intensity;
- motion amplitude.

A theme MUST NOT redefine critical as positive, invert familiar interaction semantics, or remove necessary focus indicators.

Initial themes SHOULD include:

1. **Wayglass Dark** — primary operational theme.
2. **Wayglass Light** — bright environment and general application theme.
3. **Wayglass High Contrast** — enhanced boundary and text contrast.
4. **Wayglass Dim** — reduced luminance for dark rooms or wall panels.

Theme switching SHOULD work through an attribute or class on a containing element.

## 10. Color System

### 10.1 Semantic Roles

Required state roles:

- neutral;
- informational;
- positive;
- caution;
- critical;
- unavailable;
- stale;
- pending;
- unknown.

State MUST be communicated with text, geometry, or iconography in addition to color. Icons MUST NOT
be required for core semantic recognition.

Condition colors MUST NOT be assigned directly to domain values. Green, amber, and red are reserved
for normal or positive, cautionary, and critical condition or attention meaning.

### 10.2 Boolean Value Roles

Required Boolean value roles:

- asserted;
- not asserted.

Asserted values SHOULD be lit, filled, or otherwise emphasized. Not-asserted values SHOULD be
unlit, outlined, or subdued. Neither role carries health meaning.

Components MUST use domain labels such as `On`/`Off`, `Open`/`Closed`, or
`Verified`/`Unverified` when those terms are known. Icons MUST be optional reinforcement.

Supported visual scales SHOULD include:

- a compact value rail attached to a labeled field;
- a prominent value field for at-a-distance reading;
- supplementary value-text emphasis.

### 10.3 Decorative Color

Decorative color is discouraged.

Distinct accent colors MAY identify stable regions or domains when:

- their meaning remains consistent;
- the number of colors is constrained;
- contrast requirements are met;
- they do not compete with state colors.

### 10.4 Contrast

Text and interactive controls MUST meet WCAG 2.2 AA contrast requirements.

Non-text contrast MUST meet applicable accessibility requirements.

Automated contrast tests SHOULD run against all official theme token combinations.

## 11. Typography

The default type system SHOULD use widely available or openly licensed typefaces.

The system MUST define roles for:

- display;
- page title;
- section title;
- body;
- label;
- action;
- numeric value;
- unit;
- metadata;
- code or identifier.

Numeric values SHOULD support tabular numerals.

Typography MUST remain legible at distance for wall-panel use and at enlarged zoom levels.

## 12. Spacing and Density

Wayglass MUST support at least two density modes:

- **comfortable**
- **compact**

Density changes MUST not reduce interactive targets below accessibility requirements.

Spacing SHOULD follow a constrained scale. Arbitrary local spacing is prohibited.

High-density layouts MUST preserve clear grouping and visual rhythm.

## 13. Shape Language

The shape system MAY include:

- rails;
- elbows;
- capsules;
- segmented bands;
- framed panels;
- inset status regions;
- directional notches;
- rounded rectangular controls.

Each shape MUST have a documented structural or interactive purpose.

The system MUST avoid directly recreating distinctive franchise-specific layouts.

## 14. Layout System

### 14.1 Primitives

Initial layout primitives:

- `wg-canvas`
- `wg-frame`
- `wg-panel`
- `wg-stack`
- `wg-cluster`
- `wg-grid`
- `wg-split`
- `wg-rail`
- `wg-elbow`
- `wg-divider`
- `wg-scroll-region`

### 14.2 Functional Zoning

Multiple functions MAY appear on one screen. Each function MUST have an obvious identity and
boundary, and its scope, state, information, and actions MUST remain visually local.

Neutral boundaries, gutters, headings, and containment SHOULD separate functions. Condition colors
MUST NOT be used merely to distinguish neighboring functions. Consequential actions MUST repeat the
owning function and target scope.

Wayglass supports two complementary function-composition modes:

- **Overview:** multiple functions remain simultaneously visible for scanning, comparison, and
  cross-function awareness.
- **Focused deck:** selectors bring one peer function into a shared working surface for focused work
  or constrained space.

A focused deck MUST use established tabs semantics and keyboard behavior. Selection MUST be
communicated without color alone. Hidden functions with caution, critical, stale, unavailable, or
pending state MUST retain a concise labeled summary in their selector or in an equally persistent
summary surface. Critical state and its primary response MUST NOT become undiscoverable merely
because another function is selected.

Deck selection MUST preserve stable function order, focus behavior, and relevant per-function
context. Consequential actions inside the active surface MUST continue to repeat their owning
function and target.

Static structural headings such as `wg-elbow` MUST NOT expose hover, focus, selected, or tab
semantics. Folder-like selector geometry is reserved for an actual interactive selection pattern.
Information, monitor, and control section purposes SHOULD remain visible together when their
relationship supports understanding and action; they SHOULD NOT be turned into tabs merely to
reduce visible content.

### 14.3 Section Purpose

Sections MUST identify one of three purposes:

- information;
- monitor;
- control.

Informational sections MUST NOT imply operational condition or action. Monitor sections MAY present
applicable known-state signals. Control sections MUST expose explicit function and target scope,
feedback, and proportionate safeguards.

Function ownership and section purpose are independent.

### 14.4 Responsive Behavior

Components MUST be container-query compatible where practical.

Layouts MUST define behavior for:

- narrow phone;
- wide phone or small tablet;
- tablet;
- desktop;
- large desktop;
- wall display.

Responsive changes SHOULD recompose content rather than merely scale it.

Critical state and primary actions MUST remain available at every supported size.

### 14.5 Stable Layout

Live updates MUST avoid unnecessary layout shift.

Components that display changing values SHOULD reserve space or use tabular numerals where appropriate.

## 15. Component Model

### 15.1 Public API

Every component MUST define:

- element name;
- purpose;
- intended use;
- anti-use cases;
- attributes;
- properties;
- slots;
- parts;
- events;
- methods, if any;
- CSS custom properties;
- keyboard behavior;
- focus behavior;
- ARIA behavior;
- responsive behavior;
- loading, empty, error, stale, and disabled states;
- examples;
- tests.

### 15.2 Naming

Custom Elements MUST use lowercase kebab-case with the `wg-` prefix.

Events SHOULD use lowercase kebab-case names prefixed with `wg-` when collision is possible.

### 15.3 Properties and Attributes

Public properties MUST be typed.

Attribute reflection MUST be deliberate and documented.

Boolean attributes MUST follow native HTML semantics.

### 15.4 Events

Events MUST:

- be composed when consumers need to receive them across Shadow DOM;
- bubble when event delegation is useful;
- contain typed detail payloads;
- distinguish user intent from internal state updates;
- not fire duplicate notifications for the same action.

### 15.5 Slots and Parts

Slots SHOULD support content composition without exposing internal structure unnecessarily.

CSS Shadow Parts MAY be exposed for carefully selected customization points.

Public parts become API and require stability.

## 16. Initial Component Roadmap

### 16.1 Foundations

- tokens;
- theme provider;
- typography;
- icon;
- visually hidden content;
- focus ring;
- surface;
- divider.

### 16.2 Layout

- canvas;
- frame;
- panel;
- stack;
- cluster;
- grid;
- split;
- rail;
- elbow;
- scroll region.

### 16.3 Actions and Selection

- button;
- icon button;
- toggle;
- segmented control;
- tabs;
- navigation rail;
- menu;
- command item.

### 16.4 Forms

- text field;
- number field;
- select;
- checkbox;
- radio;
- slider;
- field label;
- field message;
- form group.

### 16.5 Feedback and State

- status indicator;
- Boolean value indicator;
- finite-value indicator;
- badge;
- alert;
- toast;
- progress;
- skeleton;
- empty state;
- offline state;
- stale-data marker;
- confirmation dialog.

### 16.6 Data and Operational Components

- metric;
- metric group;
- telemetry strip;
- trend indicator;
- timeline;
- event log;
- status list;
- value tile;
- key-value display;
- data table;
- filter bar;
- command bar.

### 16.7 Domain Components

- device tile;
- room summary;
- climate control;
- energy flow;
- agent status;
- task queue;
- system health card.

Domain components MUST be composed from generic primitives wherever possible.

## 17. Component Specification Template

Every component document MUST use this structure:

```markdown
# Component Name

## Purpose
## When to Use
## When Not to Use
## Anatomy
## Variants
## States
## Behavior
## Keyboard Interaction
## Accessibility
## Responsive Behavior
## Content Guidance
## API
### Attributes
### Properties
### Slots
### Events
### Methods
### CSS Custom Properties
### CSS Parts
## Examples
## Testing Requirements
## Open Questions
```

## 18. Accessibility Requirements

Wayglass MUST target WCAG 2.2 AA.

Every interactive component MUST support:

- complete keyboard operation;
- visible focus;
- logical focus order;
- correct semantic role;
- accessible name;
- accessible state;
- high zoom;
- screen reader use;
- reduced motion;
- pointer and touch input.

Minimum target size SHOULD be 44 by 44 CSS pixels. Smaller visual controls MAY use larger invisible hit areas when spacing and semantics remain clear.

Components MUST be tested at 200% zoom.

Focus MUST never become trapped except in intentional modal contexts, and modal focus MUST be correctly restored.

No essential information may depend solely on:

- color;
- animation;
- sound;
- hover;
- spatial position.

## 19. Motion System

Motion tokens MUST define:

- duration;
- easing;
- distance;
- opacity transition;
- emphasis level.

Suggested categories:

- instant;
- fast;
- standard;
- deliberate.

Motion SHOULD:

- explain state change;
- preserve spatial context;
- connect cause and effect;
- indicate progress.

Motion MUST NOT:

- loop without operational meaning;
- block interaction unnecessarily;
- cause significant vestibular discomfort;
- hide essential state;
- ignore `prefers-reduced-motion`.

Reduced-motion mode MUST remove or replace nonessential movement.

## 20. Content and Voice

Wayglass content MUST be:

- concise;
- direct;
- specific;
- calm;
- factual;
- action-oriented when appropriate.

Error messages SHOULD contain:

1. what happened;
2. what remains true or safe;
3. what the user can do next.

Avoid unexplained jargon and implementation leakage.

## 21. Home Automation Requirements

Home automation is a first-class reference domain.

The design system MUST support:

- device state;
- availability;
- last-updated time;
- room grouping;
- favorite controls;
- scenes;
- climate;
- lighting;
- security;
- energy;
- media;
- cameras and sensors;
- offline and stale entities.

Domain adapters MUST distinguish between:

- confirmed device state;
- requested state;
- transitional state;
- unavailable state;
- stale state;
- unknown state.

Controls MUST not imply success before the underlying system confirms the change unless optimistic behavior is clearly communicated.

## 22. Performance Requirements

The project SHOULD establish and enforce budgets.

Initial targets:

- individual primitive components: minimal JavaScript and CSS;
- no mandatory global runtime beyond the selected rendering helper;
- tree-shakeable imports;
- lazy loading for heavy charts and domain modules;
- no layout thrashing during live updates;
- no unnecessary observers per instance;
- no animation implemented with expensive layout properties.

Performance benchmarks SHOULD include:

- initial render;
- interaction latency;
- repeated live updates;
- 100+ component instances;
- low-power tablet behavior.

## 23. Security Requirements

Components MUST avoid unsafe HTML injection.

Public APIs that accept markup MUST document sanitization expectations.

The design system MUST NOT:

- embed secrets;
- log sensitive application data;
- execute arbitrary strings;
- create insecure default links;
- bypass browser security boundaries.

Dependencies MUST be reviewed for provenance, maintenance, and known vulnerabilities.

## 24. Testing Strategy

### 24.1 Unit Tests

Required for:

- state logic;
- property reflection;
- event payloads;
- keyboard behavior;
- utilities;
- token generation.

### 24.2 Component Tests

Required for:

- rendering;
- slots;
- focus behavior;
- disabled behavior;
- interaction;
- responsive fixtures;
- error and empty states.

### 24.3 Accessibility Tests

Automated accessibility checks MUST run for representative states.

Manual checks MUST cover:

- keyboard-only operation;
- screen-reader behavior;
- 200% zoom;
- reduced motion;
- high contrast;
- touch target usability.

### 24.4 Visual Regression Tests

Official themes, densities, responsive sizes, and component states SHOULD have visual regression coverage.

### 24.5 Browser Tests

Critical components MUST be tested in supported browser engines.

## 25. Documentation Requirements

Documentation MUST include:

- installation;
- architecture;
- tokens;
- themes;
- accessibility;
- component API;
- usage guidance;
- examples;
- anti-patterns;
- migration notes;
- release notes.

Each component MUST include interactive examples for:

- default;
- variants;
- keyboard use;
- disabled;
- loading or pending;
- empty or unavailable;
- error;
- responsive behavior;
- official themes.

Documentation examples MUST use production packages, not separate demonstration implementations.

## 26. Versioning and Releases

Packages SHOULD use semantic versioning.

Breaking changes include:

- removing or renaming public attributes, properties, events, slots, parts, or tokens;
- changing event semantics;
- changing default keyboard behavior;
- changing semantic token meaning;
- changing component registration behavior.

Deprecations SHOULD include:

- migration guidance;
- a documented removal version when feasible;
- runtime or development warnings when appropriate.

## 27. Governance

Significant changes require a written proposal or architecture decision record.

Required review areas:

- alignment with vision;
- design-principle compliance;
- accessibility;
- API consistency;
- implementation complexity;
- performance;
- migration impact;
- franchise and branding independence.

## 28. AI Agent Development Rules

AI coding agents working in the repository MUST follow these rules:

1. Read `VISION.md`, `DESIGN_PRINCIPLES.md`, and `SPEC.md` before implementation.
2. Do not invent product requirements when existing documents are silent; record assumptions.
3. Do not hardcode visual values outside approved token definitions.
4. Accessibility is a release requirement, not an enhancement.
5. Prefer native HTML semantics.
6. Prefer composition over inheritance.
7. Keep framework-neutral logic out of framework bindings.
8. Avoid duplicate component implementations.
9. Preserve semantic API naming.
10. Define all required states, including failure and stale-data states.
11. Implement keyboard behavior before declaring a component complete.
12. Add tests with every behavior change.
13. Add documentation with every public API change.
14. Preserve responsive behavior.
15. Respect reduced-motion preferences.
16. Avoid franchise-specific assets, terms, and recognizable copies.
17. Protect API stability.
18. Do not widen scope without an approved proposal.
19. Run formatting, linting, type checking, tests, accessibility checks, and builds.
20. Report incomplete work and failing checks honestly.
21. Do not suppress errors merely to pass automated checks.
22. Prefer maintainable, understandable code over clever abstractions.
23. Keep dependencies minimal and justified.
24. Add architecture decisions for consequential technology choices.
25. Leave the repository in a reproducible state.

## 29. Definition of Done

A feature is complete only when it:

- aligns with the project vision;
- satisfies the design principles;
- uses tokens correctly;
- defines all relevant states;
- is responsive;
- is keyboard operable;
- has correct semantics;
- meets accessibility requirements;
- includes unit or component tests;
- includes documentation;
- passes visual review;
- passes formatting;
- passes linting;
- passes type checking;
- passes automated tests;
- builds successfully;
- introduces no unexplained dependency or API inconsistency.

## 30. Phased Roadmap

### Phase 0: Repository Foundation

Deliver:

- monorepo;
- build tooling;
- linting and formatting;
- testing framework;
- documentation site;
- token compiler;
- contribution workflow;
- architecture decision process.
- accepted semantic and visual foundations.

### Phase 1: Vertical Slice

Deliver a small but complete application slice using:

- theme provider;
- tokens;
- canvas;
- rail;
- elbow;
- panel;
- button;
- status indicator;
- Boolean value indicator;
- metric;
- value tile.

The vertical slice MUST demonstrate:

- dark and light themes;
- responsive phone, desktop, and wall-panel layouts;
- keyboard navigation;
- screen-reader support;
- reduced motion;
- loading, normal, warning, critical, stale, and unavailable states;
- independent domain value, condition, knowledge, and activity combinations;
- multiple functional zones and information, monitor, and control sections;
- icon-free asserted and not-asserted values;
- vanilla Web Component use;
- React wrapper use.

### Phase 2: Core System

Deliver:

- foundation primitives;
- layout primitives;
- controls;
- tabs and the focused function-deck composition;
- forms;
- feedback;
- documentation and testing coverage.

### Phase 3: Operational Components

Deliver:

- metrics;
- telemetry;
- event log;
- timeline;
- status list;
- filter and command patterns;
- data tables.

### Phase 4: Reference Domains

Deliver:

- smart-home reference application;
- operations-console reference application;
- AI-agent supervision reference application.

### Phase 5: Ecosystem

Explore:

- chart package;
- Home Assistant integration;
- icon tooling;
- Figma libraries;
- design-token platform transforms;
- additional framework wrappers.

## 31. First Implementation Assignment

The first AI-agent assignment SHOULD be:

> Create the Wayglass monorepo foundation and implement the initial domain-neutral vertical slice.
> Build tokens, theme switching, `wg-canvas`, `wg-rail`, `wg-elbow`, `wg-panel`, `wg-button`,
> `wg-status-indicator`, `wg-boolean-value`, `wg-metric`, and `wg-value-tile`. Demonstrate multiple
> functional zones, mixed section purposes, independent value and known state, and icon-free Boolean
> recognition. Provide React bindings, documentation, tests, accessibility validation, and
> responsive examples for phone, desktop, and wall display. Use no franchise-specific assets or
> terminology.

Acceptance criteria:

- all packages build;
- examples run;
- tokens generate CSS and TypeScript exports;
- components register individually;
- React wrappers are typed;
- keyboard behavior is documented and tested;
- automated accessibility tests pass;
- reduced-motion behavior is demonstrated;
- visual fixtures cover all official themes and key states;
- no visual values are hardcoded outside token definitions;
- no unresolved TypeScript or lint errors remain.

## 32. Future Vision

Wayglass may eventually include:

- a formal design-token schema;
- production chart primitives;
- sound and haptic guidance;
- spatial computing patterns;
- multimodal command surfaces;
- AI-generated interface validation;
- design linting;
- automated known-state checks;
- Figma integration;
- application starter kits.

Future expansion MUST preserve the core promise:

> Wayglass turns complex systems into known states.
