import { html } from 'lit';

import { WayglassElement } from './wayglass-element.js';

export abstract class WgFormControlShell extends WayglassElement {
  #lastDiagnostic = '';

  protected abstract anatomyErrors(): readonly string[];

  protected override render() {
    return html`<div part="container"><slot @slotchange=${this.#validateAnatomy}></slot></div>`;
  }

  #validateAnatomy = (): void => {
    const diagnostic = this.anatomyErrors().join('\n');
    if (diagnostic === this.#lastDiagnostic) return;

    this.#lastDiagnostic = diagnostic;
    if (diagnostic) console.warn(`[${this.localName}] Invalid authoring:\n${diagnostic}`);
  };
}

export function directElementChildren(host: Element): Element[] {
  return Array.from(host.children);
}

export function singleControlErrors(
  host: Element,
  description: string,
  accepts: (element: Element) => boolean,
): string[] {
  const controls = directElementChildren(host).filter(accepts);
  if (controls.length === 1) return [];
  return [`Expected exactly one direct ${description}; found ${controls.length}.`];
}

export function choiceControlErrors(host: Element, type: 'checkbox' | 'radio'): string[] {
  const children = directElementChildren(host);
  const inputs = children.filter(
    (element): element is HTMLInputElement =>
      element instanceof HTMLInputElement && element.type === type,
  );
  const labels = children.filter(
    (element): element is HTMLLabelElement => element instanceof HTMLLabelElement,
  );
  const errors: string[] = [];

  if (inputs.length !== 1)
    errors.push(`Expected exactly one direct input[type="${type}"]; found ${inputs.length}.`);
  if (labels.length !== 1)
    errors.push(`Expected exactly one direct native label; found ${labels.length}.`);
  if (inputs.length === 1 && labels.length === 1 && labels[0]?.control !== inputs[0]) {
    errors.push('The direct native label must be explicitly associated with the direct input.');
  }

  return errors;
}
