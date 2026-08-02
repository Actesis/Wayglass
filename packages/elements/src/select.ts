import { fieldShellStyles } from './form-control-styles.js';
import { singleControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgSelectTagName = 'wg-select';

export class WgSelect extends WgFormControlShell {
  static override styles = fieldShellStyles;

  protected anatomyErrors(): readonly string[] {
    return singleControlErrors(
      this,
      'native select',
      (element) => element instanceof HTMLSelectElement,
    );
  }
}

export function defineWgSelect(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSelectTagName, WgSelect, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-select': WgSelect;
  }
}
