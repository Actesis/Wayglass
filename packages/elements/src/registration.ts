export function defineElement(
  name: `${string}-${string}`,
  constructor: CustomElementConstructor,
  registry: CustomElementRegistry = customElements,
): void {
  const existingConstructor = registry.get(name);

  if (existingConstructor && existingConstructor !== constructor) {
    throw new Error(`Custom Element "${name}" is already registered with another constructor.`);
  }

  if (!existingConstructor) {
    registry.define(name, constructor);
  }
}
