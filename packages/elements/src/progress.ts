import { css } from 'lit';

import { WgFormControlShell, singleControlErrors } from './form-control-shell.js';
import { defineElement } from './registration.js';

export const wgProgressTagName = 'wg-progress';

export class WgProgress extends WgFormControlShell {
  static override styles = css`
    :host {
      display: block;
      min-inline-size: 0;
      color: var(--wg-component-feedback-color-text);
      font-family: var(--wg-typography-family-body);
      line-height: var(--wg-typography-line-height-body);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='container'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-component-feedback-space-related);
    }

    slot::slotted(label) {
      color: var(--wg-component-feedback-color-text);
      font-size: var(--wg-typography-size-label);
      font-weight: var(--wg-typography-weight-medium);
    }

    slot::slotted(progress) {
      inline-size: 100%;
      max-inline-size: 100%;
      block-size: var(--wg-component-feedback-size-progress);
      accent-color: var(--wg-component-feedback-color-progress);
      color-scheme: light dark;
    }

    slot::slotted(output),
    slot::slotted(span),
    slot::slotted(p) {
      margin-block: 0;
      color: var(--wg-component-feedback-color-detail);
      font-size: var(--wg-typography-size-metadata);
      overflow-wrap: anywhere;
    }

    @media (forced-colors: active) {
      :host {
        color: CanvasText;
      }

      slot::slotted(progress) {
        accent-color: Highlight;
      }
    }
  `;

  protected override anatomyErrors(): readonly string[] {
    const errors = singleControlErrors(
      this,
      'native progress element',
      (element) => element instanceof HTMLProgressElement,
    );
    const progress = Array.from(this.children).find(
      (element): element is HTMLProgressElement => element instanceof HTMLProgressElement,
    );

    if (
      progress &&
      progress.labels.length === 0 &&
      !progress.hasAttribute('aria-label') &&
      !progress.hasAttribute('aria-labelledby')
    ) {
      errors.push('The native progress element needs an explicit accessible name.');
    }
    return errors;
  }
}

export function defineWgProgress(registry: CustomElementRegistry = customElements): void {
  defineElement(wgProgressTagName, WgProgress, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-progress': WgProgress;
  }
}
