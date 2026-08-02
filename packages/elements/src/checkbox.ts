import { choiceShellStyles } from './form-control-styles.js';
import { choiceControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgCheckboxTagName = 'wg-checkbox';

export class WgCheckbox extends WgFormControlShell {
  static override styles = choiceShellStyles;

  protected anatomyErrors(): readonly string[] {
    return choiceControlErrors(this, 'checkbox');
  }
}

export function defineWgCheckbox(registry: CustomElementRegistry = customElements): void {
  defineElement(wgCheckboxTagName, WgCheckbox, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-checkbox': WgCheckbox;
  }
}
