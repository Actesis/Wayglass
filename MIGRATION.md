# Migration guidance

Wayglass has no prior public release, so the initial release has no consumer migration path.

Every later release with a consumer-visible change must document:

- affected packages and exact previous and new version ranges;
- changed imports, names, attributes, properties, events, slots, parts, tokens, themes, or behavior;
- whether the change is compatible, deprecated, or breaking under the accepted SemVer policy;
- ordered before-and-after examples and any temporary compatibility path;
- accessibility, state-model, styling, and framework-binding implications; and
- the release where a deprecated path may be removed.

Migration guidance cannot silently redefine condition, knowledge, activity, domain value, or
requested-versus-confirmed state. Safety or security removals that cannot offer a deprecation period
must state the reason and the immediate consumer action.
