import { isActivity, isCondition, isKnowledge } from '@wayglass/core';
import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { css, html, svg } from 'lit';

import { defineElement } from './registration.js';
import { activityLabels, conditionLabels, knowledgeLabels } from './state-presentation.js';
import { WayglassElement } from './wayglass-element.js';

export const wgTelemetryStripTagName = 'wg-telemetry-strip';

export interface TelemetrySample {
  readonly observedAt: number;
  readonly value: number | null;
  readonly knowledge?: Knowledge;
}

const knowledgeStates: readonly Knowledge[] = [
  'confirmed',
  'inferred',
  'stale',
  'unknown',
  'conflicting',
  'unavailable',
];

function sampleKnowledge(sample: TelemetrySample): Knowledge {
  return sample.knowledge ?? 'confirmed';
}

export class WgTelemetryStrip extends WayglassElement {
  static override properties = {
    label: { type: String, reflect: true },
    samples: { attribute: false },
    windowStart: { attribute: false },
    windowEnd: { attribute: false },
    scaleMinimum: { attribute: false },
    scaleMaximum: { attribute: false },
    condition: { type: String, reflect: true },
    knowledge: { type: String, reflect: true },
    activity: { type: String, reflect: true },
  };

  static override styles = css`
    :host {
      --wg-telemetry-strip-color-background: var(--wg-component-telemetry-strip-color-background);
      --wg-telemetry-strip-color-graphic-background: var(
        --wg-component-telemetry-strip-color-graphic-background
      );
      --wg-telemetry-strip-color-border: var(--wg-component-telemetry-strip-color-border);
      --wg-telemetry-strip-color-heading: var(--wg-component-telemetry-strip-color-heading);
      --wg-telemetry-strip-color-current: var(--wg-component-telemetry-strip-color-current);
      --wg-telemetry-strip-color-series: var(--wg-component-telemetry-strip-color-series);
      --wg-telemetry-strip-color-context: var(--wg-component-telemetry-strip-color-context);
      --wg-telemetry-strip-color-state: var(--wg-component-telemetry-strip-color-state);
      --wg-telemetry-strip-radius: var(--wg-component-telemetry-strip-radius);
      --wg-telemetry-strip-space: var(--wg-component-telemetry-strip-space);
      --wg-telemetry-strip-space-related: var(--wg-component-telemetry-strip-space-related);
      --wg-telemetry-strip-size-graphic-block: var(
        --wg-component-telemetry-strip-size-graphic-block
      );
      --wg-telemetry-strip-width-series: var(--wg-component-telemetry-strip-width-series);
      --_wg-telemetry-condition-color: var(--wg-telemetry-strip-color-state);

      display: block;
      min-inline-size: 0;
      color: var(--wg-color-semantic-text-primary);
      font-family: var(--wg-typography-family-body);
    }

    :host([condition='informational']) {
      --_wg-telemetry-condition-color: var(--wg-color-semantic-condition-informational);
    }
    :host([condition='positive']) {
      --_wg-telemetry-condition-color: var(--wg-color-semantic-condition-positive);
    }
    :host([condition='caution']) {
      --_wg-telemetry-condition-color: var(--wg-color-semantic-condition-caution);
    }
    :host([condition='critical']) {
      --_wg-telemetry-condition-color: var(--wg-color-semantic-condition-critical);
    }

    [part='base'] {
      display: grid;
      min-inline-size: 0;
      gap: var(--wg-telemetry-strip-space);
      padding: var(--wg-telemetry-strip-space);
      border: var(--wg-border-width-standard) solid var(--wg-telemetry-strip-color-border);
      border-radius: var(--wg-telemetry-strip-radius);
      background: var(--wg-telemetry-strip-color-background);
    }

    [part='header'] {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--wg-telemetry-strip-space-related) var(--wg-telemetry-strip-space);
    }

    [part='heading'],
    [part='current'],
    [part='summary'],
    [part='detail'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='heading'] {
      color: var(--wg-telemetry-strip-color-heading);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='current'] {
      color: var(--wg-telemetry-strip-color-current);
      font-size: var(--wg-typography-size-body);
      font-weight: var(--wg-typography-weight-emphasis);
    }

    [part='graphic'] {
      display: block;
      inline-size: 100%;
      block-size: var(--wg-telemetry-strip-size-graphic-block);
      overflow: hidden;
      background: var(--wg-telemetry-strip-color-graphic-background);
    }

    :host(:dir(rtl)) [part='graphic'] {
      transform: scaleX(-1);
    }

    [part='graphic'] path {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: var(--wg-telemetry-strip-width-series);
      vector-effect: non-scaling-stroke;
    }

    [part='graphic'] line,
    [part='graphic'] circle {
      fill: var(--wg-telemetry-strip-color-graphic-background);
      stroke: currentColor;
      stroke-width: var(--wg-telemetry-strip-width-series);
      vector-effect: non-scaling-stroke;
    }

    [part='graphic'] [data-knowledge='confirmed'] {
      color: var(--wg-telemetry-strip-color-series);
      stroke-dasharray: none;
    }
    [part='graphic'] [data-knowledge='inferred'] {
      color: var(--wg-color-semantic-knowledge-inferred);
      stroke-dasharray: 2 5;
    }
    [part='graphic'] [data-knowledge='stale'] {
      color: var(--wg-color-semantic-knowledge-stale);
      stroke-dasharray: 10 6;
    }
    [part='graphic'] [data-knowledge='unknown'] {
      color: var(--wg-color-semantic-knowledge-unknown);
      stroke-dasharray: 1 4 8 4;
    }
    [part='graphic'] [data-knowledge='conflicting'] {
      color: var(--wg-color-semantic-knowledge-conflicting);
      stroke-dasharray: 12 3 2 3;
    }
    [part='graphic'] [data-knowledge='unavailable'] {
      color: var(--wg-color-semantic-knowledge-unavailable);
      stroke-dasharray: 4 9;
    }

    [part='window'] {
      display: flex;
      justify-content: space-between;
      gap: var(--wg-telemetry-strip-space);
      color: var(--wg-telemetry-strip-color-context);
      font-size: var(--wg-typography-size-label);
    }

    [part='window-start'],
    [part='window-end'] {
      min-inline-size: 0;
      overflow-wrap: anywhere;
    }

    [part='window-end'] {
      text-align: end;
    }

    [part='summary'],
    [part='detail'] {
      color: var(--wg-telemetry-strip-color-context);
      font-size: var(--wg-typography-size-label);
      line-height: var(--wg-typography-line-height-body);
    }

    [part='state'] {
      display: flex;
      flex-wrap: wrap;
      gap: var(--wg-telemetry-strip-space-related) var(--wg-telemetry-strip-space);
      color: var(--wg-telemetry-strip-color-state);
      font-size: var(--wg-typography-size-label);
    }

    .condition {
      color: var(--_wg-telemetry-condition-color);
      font-weight: var(--wg-typography-weight-medium);
    }

    [hidden] {
      display: none;
    }

    ::slotted(*) {
      margin-block: 0;
      color: inherit;
      font: inherit;
    }

    @media (forced-colors: active) {
      [part='base'] {
        border-color: CanvasText;
        background: Canvas;
      }

      [part='graphic'] {
        color: CanvasText;
        background: Canvas;
        forced-color-adjust: auto;
      }

      [part='graphic'] [data-knowledge],
      [part='state'],
      [part='state'] * {
        color: CanvasText;
      }
    }
  `;

  declare label: string;
  declare samples: readonly TelemetrySample[];
  declare windowStart: number;
  declare windowEnd: number;
  declare scaleMinimum: number;
  declare scaleMaximum: number;
  declare condition: Condition;
  declare knowledge: Knowledge;
  declare activity: Activity;

  #lastDiagnostic = '';

  constructor() {
    super();
    this.label = '';
    this.samples = [];
    this.windowStart = 0;
    this.windowEnd = 1;
    this.scaleMinimum = 0;
    this.scaleMaximum = 1;
    this.condition = 'neutral';
    this.knowledge = 'confirmed';
    this.activity = 'idle';
  }

  override attributeChangedCallback(name: string, previous: string | null, value: string | null) {
    const defaults = { condition: 'neutral', knowledge: 'confirmed', activity: 'idle' } as const;
    const invalid =
      (name === 'condition' && !isCondition(value)) ||
      (name === 'knowledge' && !isKnowledge(value)) ||
      (name === 'activity' && !isActivity(value));
    if (invalid) {
      const fallback = defaults[name as keyof typeof defaults];
      if (fallback && value !== fallback) this.setAttribute(name, fallback);
      return;
    }
    super.attributeChangedCallback(name, previous, value);
  }

  protected override updated(): void {
    const diagnostic = this.#validate();
    if (diagnostic && diagnostic !== this.#lastDiagnostic) {
      console.warn(`[wg-telemetry-strip] ${diagnostic}`);
    }
    this.#lastDiagnostic = diagnostic ?? '';
  }

  protected override render() {
    const diagnostic = this.#validate();
    const paths = diagnostic ? [] : this.#renderGeometry();
    const hasCurrent = this.#hasNamedSlot('current');
    const hasDetail = this.#hasNamedSlot('detail');
    const hasState =
      this.condition !== 'neutral' || this.knowledge !== 'confirmed' || this.activity !== 'idle';

    return html`
      <section part="base" role="group" aria-label=${this.label.trim() || 'Telemetry history'}>
        <header part="header">
          <div part="heading">
            <slot name="heading" @slotchange=${this.#handleSlotChange}>${this.label}</slot>
          </div>
          <div part="current" ?hidden=${!hasCurrent}>
            <slot name="current" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </header>
        <svg
          part="graphic"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          ${paths}
        </svg>
        <div part="window">
          <div part="window-start">
            <slot name="window-start" @slotchange=${this.#handleSlotChange}></slot>
          </div>
          <div part="window-end">
            <slot name="window-end" @slotchange=${this.#handleSlotChange}></slot>
          </div>
        </div>
        <div part="summary"><slot name="summary" @slotchange=${this.#handleSlotChange}></slot></div>
        <div part="state" ?hidden=${!hasState}>
          <span class="condition" ?hidden=${this.condition === 'neutral'}
            >${conditionLabels[this.condition]}</span
          >
          <span
            class="knowledge"
            data-knowledge=${this.knowledge}
            ?hidden=${this.knowledge === 'confirmed'}
            >${knowledgeLabels[this.knowledge]}</span
          >
          <span class="activity" ?hidden=${this.activity === 'idle'}
            >${activityLabels[this.activity]}</span
          >
        </div>
        <div part="detail" ?hidden=${!hasDetail}>
          <slot name="detail" @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </section>
    `;
  }

  readonly #handleSlotChange = (): void => this.requestUpdate();

  #hasNamedSlot(name: string): boolean {
    return Array.from(this.children).some((child) => child.getAttribute('slot') === name);
  }

  #renderGeometry() {
    const pathData = new Map<Knowledge, string[]>();
    const boundaryIndexes = new Set<number>();
    const xFor = (sample: TelemetrySample) =>
      ((sample.observedAt - this.windowStart) / (this.windowEnd - this.windowStart)) * 1000;
    const yFor = (sample: TelemetrySample) =>
      94 - ((sample.value! - this.scaleMinimum) / (this.scaleMaximum - this.scaleMinimum)) * 88;

    for (let index = 1; index < this.samples.length; index += 1) {
      const previous = this.samples[index - 1]!;
      const current = this.samples[index]!;
      if (previous.value === null || current.value === null) continue;
      const knowledge = sampleKnowledge(current);
      const commands = pathData.get(knowledge) ?? [];
      commands.push(
        `M ${xFor(previous).toFixed(3)} ${yFor(previous).toFixed(3)} L ${xFor(current).toFixed(3)} ${yFor(current).toFixed(3)}`,
      );
      pathData.set(knowledge, commands);
      if (knowledge !== sampleKnowledge(previous)) {
        boundaryIndexes.add(index - 1);
        boundaryIndexes.add(index);
      }
    }

    const geometry = knowledgeStates.flatMap((knowledge) => {
      const commands = pathData.get(knowledge);
      return commands?.length
        ? [
            svg`<path
              data-knowledge=${knowledge}
              data-segments=${String(commands.length)}
              d=${commands.join(' ')}
            ></path>`,
          ]
        : [];
    });

    this.samples.forEach((sample, index) => {
      const knowledge = sampleKnowledge(sample);
      if (sample.value === null) {
        const x = xFor(sample).toFixed(3);
        geometry.push(svg`<line
          data-gap
          data-knowledge=${knowledge}
          x1=${x}
          x2=${x}
          y1="38"
          y2="62"
        ></line>`);
      } else if (boundaryIndexes.has(index) && knowledge !== 'confirmed') {
        geometry.push(svg`<circle
          data-boundary
          data-knowledge=${knowledge}
          cx=${xFor(sample).toFixed(3)}
          cy=${yFor(sample).toFixed(3)}
          r="3"
        ></circle>`);
      }
    });

    return geometry;
  }

  #validate(): string | null {
    if (!Array.isArray(this.samples)) return 'samples must be an array';
    if (this.samples.length > 240) return 'samples must contain no more than 240 observations';
    if (
      !Number.isFinite(this.windowStart) ||
      !Number.isFinite(this.windowEnd) ||
      this.windowEnd <= this.windowStart
    ) {
      return 'time window must contain increasing finite bounds';
    }
    if (
      !Number.isFinite(this.scaleMinimum) ||
      !Number.isFinite(this.scaleMaximum) ||
      this.scaleMaximum <= this.scaleMinimum
    ) {
      return 'scale must contain increasing finite bounds';
    }

    let previousTime = this.windowStart;
    for (const sample of this.samples) {
      if (
        typeof sample !== 'object' ||
        sample === null ||
        !Number.isFinite(sample.observedAt) ||
        sample.observedAt < previousTime ||
        sample.observedAt < this.windowStart ||
        sample.observedAt > this.windowEnd
      ) {
        return 'samples must use nondecreasing finite times inside the window';
      }
      if (
        sample.value !== null &&
        (!Number.isFinite(sample.value) ||
          sample.value < this.scaleMinimum ||
          sample.value > this.scaleMaximum)
      ) {
        return 'sample values must be null or finite numbers inside the scale';
      }
      if (sample.knowledge !== undefined && !knowledgeStates.includes(sample.knowledge)) {
        return 'sample knowledge must use the shared vocabulary';
      }
      previousTime = sample.observedAt;
    }
    return null;
  }
}

export function defineWgTelemetryStrip(registry: CustomElementRegistry = customElements): void {
  defineElement(wgTelemetryStripTagName, WgTelemetryStrip, registry);
}

declare global {
  interface HTMLElementTagNameMap {
    'wg-telemetry-strip': WgTelemetryStrip;
  }
}
