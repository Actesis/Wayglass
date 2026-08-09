import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const eventLogChronologies = ['ascending', 'descending'] as const;
export type EventLogChronology = (typeof eventLogChronologies)[number];

export function isEventLogChronology(value: unknown): value is EventLogChronology {
  return eventLogChronologies.some((chronology) => chronology === value);
}

export const wgEventLogTagName = 'wg-event-log';

export class WgEventLog extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    chronology: { type: String, reflect: true },
    chronologyLabel: { type: String, attribute: 'chronology-label', reflect: true },
    busy: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-event-log-color-background: var(--wg-component-event-log-color-background);
      --wg-event-log-color-border: var(--wg-component-event-log-color-border);
      --wg-event-log-color-heading: var(--wg-component-event-log-color-heading);
      --wg-event-log-color-context: var(--wg-component-event-log-color-context);
      --wg-event-log-radius: var(--wg-component-event-log-radius);
      --wg-event-log-space: var(--wg-component-event-log-space);
      --wg-event-log-space-record: var(--wg-component-event-log-space-record);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-event-log;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-event-log-space);
      padding: var(--wg-event-log-space);
      border: var(--wg-border-semantic-section) solid var(--wg-event-log-color-border);
      border-radius: var(--wg-event-log-radius);
      background: var(--wg-event-log-color-background);
    }

    [part='header'] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      gap: var(--wg-event-log-space-record) var(--wg-event-log-space);
    }

    [part='heading'],
    [part='chronology'],
    [part='description'],
    [part='status'],
    [part='actions'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-event-log-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='chronology'],
    [part='description'],
    [part='status'] {
      color: var(--wg-event-log-color-context);
      font-size: var(--wg-typography-size-label);
    }

    [part='chronology'] {
      grid-column: 1;
      font-weight: var(--wg-typography-weight-medium);
    }

    [part='description'] {
      grid-column: 1;
    }

    [part='actions'] {
      grid-column: 2;
      grid-row: 1 / span 3;
    }

    [part='list'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-event-log-space-record);
    }

    [part='list'] > slot {
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

    @container wg-event-log (inline-size < 36rem) {
      [part='header'] {
        grid-template-columns: minmax(0, 1fr);
      }

      [part='chronology'],
      [part='description'],
      [part='actions'] {
        grid-column: 1;
        grid-row: auto;
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
  declare chronology: EventLogChronology;
  declare chronologyLabel: string;
  declare busy: boolean;

  #lastDiagnostic = '';

  constructor() {
    super();
    this.label = '';
    this.chronology = 'ascending';
    this.chronologyLabel = '';
    this.busy = false;
  }

  override attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    if (name === 'chronology' && !isEventLogChronology(value)) {
      if (value !== 'ascending') this.setAttribute('chronology', 'ascending');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override updated(): void {
    const diagnostic = this.#validateChildren();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-event-log] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const heading = this.#namedSlotText('heading') || this.label.trim();
    const hasDescription = this.#hasNamedSlot('description');
    const hasActions = this.#hasNamedSlot('actions');
    const hasStatus = this.#hasNamedSlot('status');

    return html`
      <section part="base">
        <header part="header">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="chronology">${this.chronologyLabel}</div>
          <div part="description" ?hidden=${!hasDescription}>
            <slot name="description" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="actions" ?hidden=${!hasActions}>
            <slot name="actions" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <div part="status" ?hidden=${!hasStatus}>
          <slot name="status" @slotchange=${this.#handleSlotChange}></slot>
        </div>
        <div
          part="list"
          role="list"
          aria-label=${heading || 'Unlabelled event log'}
          aria-busy=${this.busy ? 'true' : nothing}
        >
          <slot @slotchange=${this.#handleSlotChange}></slot>
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

  #validateChildren(): string | undefined {
    const unsupported = Array.from(this.children).filter(
      (child) => !child.hasAttribute('slot') && child.localName !== 'wg-event-record',
    );
    if (unsupported.length === 0) return undefined;

    const names = [...new Set(unsupported.map((child) => child.localName))].join(', ');
    return `Default content should contain direct wg-event-record children; preserving unsupported: ${names}.`;
  }
}

export function defineWgEventLog(registry: CustomElementRegistry = customElements): void {
  defineElement(wgEventLogTagName, WgEventLog, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-event-log': WgEventLog;
  }
}
