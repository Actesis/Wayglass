import { fieldShellStyles } from './form-control-styles.js';
import { singleControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgTextFieldTagName = 'wg-text-field';
const textInputTypes = new Set(['text', 'search', 'email', 'tel', 'url', 'password']);

export class WgTextField extends WgFormControlShell {
  static override styles = fieldShellStyles;

  protected anatomyErrors(): readonly string[] {
    return singleControlErrors(this, 'text-like input or textarea', (element) =>
      element instanceof HTMLTextAreaElement
        ? true
        : element instanceof HTMLInputElement && textInputTypes.has(element.type),
    );
  }
}

export function defineWgTextField(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTextFieldTagName, WgTextField, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-text-field': WgTextField;
  }
}
