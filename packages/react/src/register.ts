export type ElementDefinition = (registry?: CustomElementRegistry) => void;

export function registerElement(defineElement: ElementDefinition): void {
  if (typeof globalThis.customElements !== 'undefined') {
    defineElement(globalThis.customElements);
  }
}
