import { choiceShellStyles } from './form-control-styles.js';
import { choiceControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgRadioTagName = 'wg-radio';

export class WgRadio extends WgFormControlShell {
  static override styles = choiceShellStyles;

  protected anatomyErrors(): readonly string[] {
    return choiceControlErrors(this, 'radio');
  }
}

export function defineWgRadio(registry: CustomElementRegistry = customElements): void {
  defineElement(wgRadioTagName, WgRadio, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-radio': WgRadio;
  }
}
