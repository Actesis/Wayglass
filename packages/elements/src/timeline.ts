import { css, html, nothing } from 'lit';

import { defineElement } from './registration.js';
import { WayglassElement } from './wayglass-element.js';

export const timelineChronologies = ['ascending', 'descending'] as const;
export type TimelineChronology = (typeof timelineChronologies)[number];

export function isTimelineChronology(value: unknown): value is TimelineChronology {
  return timelineChronologies.some((chronology) => chronology === value);
}

export const wgTimelineTagName = 'wg-timeline';

export class WgTimeline extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    chronology: { type: String, reflect: true },
    chronologyLabel: { type: String, attribute: 'chronology-label', reflect: true },
    busy: { type: Boolean, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-timeline-color-background: var(--wg-component-timeline-color-background);
      --wg-timeline-color-border: var(--wg-component-timeline-color-border);
      --wg-timeline-color-heading: var(--wg-component-timeline-color-heading);
      --wg-timeline-color-context: var(--wg-component-timeline-color-context);
      --wg-timeline-radius: var(--wg-component-timeline-radius);
      --wg-timeline-space: var(--wg-component-timeline-space);
      --wg-timeline-space-item: var(--wg-component-timeline-space-item);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
      container-name: wg-timeline;
      container-type: inline-size;
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      box-sizing: border-box;
      gap: var(--wg-timeline-space);
      padding: var(--wg-timeline-space);
      border: var(--wg-border-semantic-section) solid var(--wg-timeline-color-border);
      border-radius: var(--wg-timeline-radius);
      background: var(--wg-timeline-color-background);
    }

    [part='header'] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      min-inline-size: 0;
      gap: var(--wg-timeline-space-item) var(--wg-timeline-space);
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
      color: var(--wg-timeline-color-heading);
      font-size: var(--wg-typography-size-section);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='chronology'],
    [part='description'],
    [part='status'] {
      color: var(--wg-timeline-color-context);
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
      --_wg-timeline-item-gap: var(--wg-timeline-space-item);

      display: grid;
      min-inline-size: 0;
      gap: var(--wg-timeline-space-item);
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

    @container wg-timeline (inline-size < 36rem) {
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
  declare chronology: TimelineChronology;
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
    if (name === 'chronology' && !isTimelineChronology(value)) {
      if (value !== 'ascending') this.setAttribute('chronology', 'ascending');
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override updated(): void {
    const diagnostic = this.#validateChildren();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-timeline] ${diagnostic}`);
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
          aria-label=${heading || 'Unlabelled timeline'}
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
      (child) => !child.hasAttribute('slot') && child.localName !== 'wg-timeline-item',
    );
    if (unsupported.length === 0) return undefined;

    const names = [...new Set(unsupported.map((child) => child.localName))].join(', ');
    return `Default content should contain direct wg-timeline-item children; preserving unsupported: ${names}.`;
  }
}

export function defineWgTimeline(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTimelineTagName, WgTimeline, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-timeline': WgTimeline;
  }
}
