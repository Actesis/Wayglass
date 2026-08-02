import { fieldShellStyles } from './form-control-styles.js';
import { singleControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgNumberFieldTagName = 'wg-number-field';

export class WgNumberField extends WgFormControlShell {
  static override styles = fieldShellStyles;

  protected anatomyErrors(): readonly string[] {
    return singleControlErrors(
      this,
      'input[type="number"]',
      (element) => element instanceof HTMLInputElement && element.type === 'number',
    );
  }
}

export function defineWgNumberField(registry: CustomElementRegistry = customElements): void {
  defineElement(wgNumberFieldTagName, WgNumberField, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-number-field': WgNumberField;
  }
}
