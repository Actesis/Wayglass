import { css, html } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const wgCommandBarTagName = 'wg-command-bar';

export class WgCommandBar extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-command-bar-color-background: var(--wg-component-command-bar-color-background);
      --wg-command-bar-color-border: var(--wg-component-command-bar-color-border);
      --wg-command-bar-color-heading: var(--wg-component-command-bar-color-heading);
      --wg-command-bar-color-context: var(--wg-component-command-bar-color-context);
      --wg-command-bar-radius: var(--wg-component-command-bar-radius);
      --wg-command-bar-space: var(--wg-component-command-bar-space);
      --wg-command-bar-space-group: var(--wg-component-command-bar-space-group);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-command-bar;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-command-bar-space);
      padding: var(--wg-command-bar-space);
      border: var(--wg-border-semantic-section) solid var(--wg-command-bar-color-border);
      border-radius: var(--wg-command-bar-radius);
      background: var(--wg-command-bar-color-background);
    }

    [part='header'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-command-bar-space-group);
    }

    [part='heading'],
    [part='description'],
    [part='primary'],
    [part='secondary'],
    [part='overflow'],
    [part='status'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-command-bar-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='description'],
    [part='status'] {
      color: var(--wg-command-bar-color-context);
      font-size: var(--wg-typography-size-body);
    }

    .commands,
    [part='primary'],
    [part='secondary'],
    [part='overflow'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--wg-command-bar-space-group);
    }

    .commands {
      min-inline-size: 0;
    }

    [part='primary'] > slot,
    [part='secondary'] > slot,
    [part='overflow'] > slot {
      display: contents;
    }

    [hidden] {
      display: none;
    }

    slot[name='heading']::slotted(*),
    slot[name='description']::slotted(*),
    slot[name='status']::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    .unsupported {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-command-bar-space-group);
    }

    /* Private mechanical threshold: stack before authored command labels create overflow. */
    @container wg-command-bar (inline-size < 36rem) {
      [part='base'] {
        gap: var(--wg-command-bar-space-group);
      }

      .commands,
      [part='primary'],
      [part='secondary'],
      [part='overflow'] {
        display: grid;
        align-items: stretch;
      }
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
      }
    }
  `;

  declare label: string;

  #lastDiagnostic = '';

  constructor() {
    super();
    this.label = '';
  }

  protected override updated(): void {
    const diagnostic = this.#validateAnatomy();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-command-bar] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const heading = this.#namedSlotText('heading') || this.label.trim();
    const hasDescription = this.#hasNamedSlot('description');
    const hasPrimary = this.#hasDefaultContent();
    const hasSecondary = this.#hasNamedSlot('secondary');
    const hasOverflow = this.#hasNamedSlot('overflow');
    const hasStatus = this.#hasNamedSlot('status');
    const unknownSlots = this.#unknownSlots();

    return html`
      <section part="base" aria-label=${heading || 'Unlabelled command area'}>
        <header part="header">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div class="commands" ?hidden=${!hasPrimary && !hasSecondary && !hasOverflow}>
          <div part="primary" ?hidden=${!hasPrimary}>
            <slot @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="secondary" ?hidden=${!hasSecondary}>
            <slot name="secondary" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="overflow" ?hidden=${!hasOverflow}>
            <slot name="overflow" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </div>
        <div part="status" ?hidden=${!hasStatus}>
          <slot name="status" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div class="unsupported" ?hidden=${unknownSlots.length === 0}>
          ${unknownSlots.map(
            (name) => html`<slot name=${name} @slotchange=${this.#handleSlotChange}></slot>`,
          )}
        </div>
      </section>
    `;
  }

  readonly #handleSlotChange = (): void => this.requestUpdate();

  #namedSlotText(name: string): string {
    return Array.from(this.children)
      .filter((child) => child.getAttribute('slot') === name)
      .map((child) => child.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
  }

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }

  #hasDefaultContent(): boolean {
    return Array.from(this.childNodes).some(
      (node) =>
        (node.nodeType === Node.ELEMENT_NODE && !(node as Element).hasAttribute('slot')) ||
        (node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())),
    );
  }

  #unknownSlots(): string[] {
    return [
      ...new Set(
        Array.from(this.children)
          .map((child) => child.getAttribute('slot'))
          .filter(
            (slot): slot is string =>
              slot !== null &&
              !['heading', 'description', 'secondary', 'overflow', 'status'].includes(slot),
          ),
      ),
    ];
  }

  #validateAnatomy(): string | undefined {
    const children = Array.from(this.children);
    const overflow = children.filter((child) => child.getAttribute('slot') === 'overflow');
    const unknownSlots = this.#unknownSlots();
    const problems: string[] = [];

    if (!this.label.trim()) problems.push('a non-empty label attribute is required');
    if (overflow.length > 1 || overflow.some((child) => child.localName !== 'wg-menu')) {
      problems.push('overflow must contain at most one direct wg-menu');
    }
    if (unknownSlots.length > 0) {
      problems.push(`unsupported named slots are preserved: ${unknownSlots.join(', ')}`);
    }

    return problems.length > 0 ? `${problems.join('; ')}.` : undefined;
  }
}

export function defineWgCommandBar(registry: CustomElementRegistry = customElements): void {
  defineElement(wgCommandBarTagName, WgCommandBar, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-command-bar': WgCommandBar;
  }
}
