# ADR 0001: Use Lit as the Custom Element foundation

- Status: accepted
- Date: 2026-07-27

## Context

Wayglass requires standards-based Custom Elements, framework-neutral public APIs, explicit
registration, small runtime cost, and maintainable reactive rendering. Native `HTMLElement` provides
maximum control but would require Wayglass to maintain rendering, reflection, and update
infrastructure. Compiler-oriented systems introduce a larger build abstraction.

## Decision

Production elements will extend Lit's `LitElement`. Element classes and registration functions will
be exported separately. Importing a component module must not register the element. Decorators are
not required for registration or public reactive properties.

## Consequences

Lit is a production dependency of `@wayglass/elements`, but it does not become part of the public
component model. Consumers receive standards-based elements. Full server rendering remains separate
from this decision.

## Alternatives considered

- Native `HTMLElement`: rejected because of recurring rendering and reactivity infrastructure.
- FASTElement: capable, but its MVVM conventions provide no necessary advantage for Wayglass.
- Stencil: rejected because its compiler and generated-output model add more abstraction than the
  initial library requires.
