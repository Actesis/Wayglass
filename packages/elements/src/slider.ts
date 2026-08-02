import { sliderShellStyles } from './form-control-styles.js';
import { singleControlErrors, WgFormControlShell } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgSliderTagName = 'wg-slider';

export class WgSlider extends WgFormControlShell {
  static override styles = sliderShellStyles;

  protected anatomyErrors(): readonly string[] {
    return singleControlErrors(
      this,
      'input[type="range"]',
      (element) => element instanceof HTMLInputElement && element.type === 'range',
    );
  }
}

export function defineWgSlider(registry: CustomElementRegistry = customElements): void {
  defineElement(wgSliderTagName, WgSlider, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-slider': WgSlider;
  }
}
