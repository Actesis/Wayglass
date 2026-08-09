type Knowledge = 'confirmed' | 'inferred' | 'stale' | 'unknown' | 'conflicting' | 'unavailable';

interface TelemetrySample {
  readonly observedAt: number;
  readonly value: number | null;
  readonly knowledge?: Knowledge;
}

interface TelemetryWindow {
  readonly start: number;
  readonly end: number;
}

const knowledgeStates: readonly Knowledge[] = [
  'confirmed',
  'inferred',
  'stale',
  'unknown',
  'conflicting',
  'unavailable',
];

const namespace = 'http://www.w3.org/2000/svg';

function svgElement<K extends keyof SVGElementTagNameMap>(name: K): SVGElementTagNameMap[K] {
  return document.createElementNS(namespace, name);
}

function knowledgeOf(sample: TelemetrySample): Knowledge {
  return knowledgeStates.includes(sample.knowledge ?? 'confirmed')
    ? (sample.knowledge ?? 'confirmed')
    : 'confirmed';
}

export class WgTelemetryProof extends HTMLElement {
  #samples: readonly TelemetrySample[] = [];
  #windowStart = Number.NaN;
  #windowEnd = Number.NaN;
  #scaleMinimum = Number.NaN;
  #scaleMaximum = Number.NaN;
  #renderPending = false;
  #diagnostic = '';

  renderCount = 0;
  lastRenderDuration = 0;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: block;
          min-inline-size: 0;
          color: var(--proof-text, #e8edf6);
          font-family: system-ui, sans-serif;
        }

        [part='base'] {
          display: grid;
          min-inline-size: 0;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--proof-border, #52627a);
          border-radius: 0.75rem;
          background: var(--proof-surface, #17202d);
        }

        [part='header'] {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem 1rem;
        }

        [part='heading'],
        [part='current'],
        [part='summary'],
        [part='detail'] {
          min-inline-size: 0;
        }

        [part='graphic'] {
          display: block;
          inline-size: 100%;
          block-size: 7rem;
          overflow: hidden;
          color: var(--proof-series, #72a7ff);
          background: var(--proof-graphic, #0d1520);
        }

        [part='graphic'] path {
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 2.5;
          vector-effect: non-scaling-stroke;
        }

        [part='graphic'] [data-knowledge='confirmed'] {
          stroke-dasharray: none;
        }

        [part='graphic'] [data-knowledge='inferred'] {
          stroke-dasharray: 2 5;
        }

        [part='graphic'] [data-knowledge='stale'] {
          stroke-dasharray: 10 6;
        }

        [part='graphic'] [data-knowledge='unknown'] {
          stroke-dasharray: 1 4 8 4;
        }

        [part='graphic'] [data-knowledge='conflicting'] {
          stroke-dasharray: 12 3 2 3;
        }

        [part='graphic'] [data-knowledge='unavailable'] {
          stroke-dasharray: 4 9;
        }

        [part='graphic'] line,
        [part='graphic'] circle {
          fill: var(--proof-graphic, #0d1520);
          stroke: currentColor;
          stroke-width: 2;
          vector-effect: non-scaling-stroke;
        }

        [part='window'] {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          color: var(--proof-secondary, #aebbd0);
          font-size: 0.875rem;
        }

        [part='window-end'] {
          text-align: end;
        }

        [part='summary'] {
          color: var(--proof-secondary, #aebbd0);
          line-height: 1.5;
        }

        ::slotted(*) {
          margin-block: 0;
          color: inherit;
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

          [part='window'],
          [part='summary'] {
            color: CanvasText;
          }
        }
      </style>
      <section part="base" role="group">
        <header part="header">
          <div part="heading"><slot name="heading"></slot></div>
          <div part="current"><slot name="current"></slot></div>
        </header>
        <svg
          part="graphic"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        ></svg>
        <div part="window">
          <div part="window-start"><slot name="window-start"></slot></div>
          <div part="window-end"><slot name="window-end"></slot></div>
        </div>
        <div part="summary"><slot name="summary"></slot></div>
        <div part="detail"><slot name="detail"></slot></div>
      </section>
    `;
  }

  connectedCallback(): void {
    const group = this.shadowRoot?.querySelector('[role="group"]');
    group?.setAttribute('aria-label', this.getAttribute('label')?.trim() || 'Telemetry history');
    this.#scheduleRender();
  }

  set samples(value: readonly TelemetrySample[]) {
    this.#samples = Array.isArray(value) ? value : [];
    this.#scheduleRender();
  }

  get samples(): readonly TelemetrySample[] {
    return this.#samples;
  }

  set windowStart(value: number) {
    this.#windowStart = value;
    this.#scheduleRender();
  }

  set windowEnd(value: number) {
    this.#windowEnd = value;
    this.#scheduleRender();
  }

  set scaleMinimum(value: number) {
    this.#scaleMinimum = value;
    this.#scheduleRender();
  }

  set scaleMaximum(value: number) {
    this.#scaleMaximum = value;
    this.#scheduleRender();
  }

  #scheduleRender(): void {
    if (!this.isConnected || this.#renderPending) return;
    this.#renderPending = true;
    queueMicrotask(() => {
      this.#renderPending = false;
      this.#render();
    });
  }

  #render(): void {
    const started = performance.now();
    const svg = this.shadowRoot?.querySelector<SVGSVGElement>('svg');
    if (!svg) return;
    svg.replaceChildren();

    const diagnostic = this.#validate();
    this.toggleAttribute('data-valid', diagnostic === null);
    if (diagnostic) {
      if (diagnostic !== this.#diagnostic) console.warn(`[telemetry-proof] ${diagnostic}`);
      this.#diagnostic = diagnostic;
      this.renderCount += 1;
      this.lastRenderDuration = performance.now() - started;
      return;
    }
    this.#diagnostic = '';

    const pathData = new Map<Knowledge, string[]>();
    const boundaryIndexes = new Set<number>();
    const xFor = (sample: TelemetrySample) =>
      ((sample.observedAt - this.#windowStart) / (this.#windowEnd - this.#windowStart)) * 1000;
    const yFor = (sample: TelemetrySample) =>
      94 - ((sample.value! - this.#scaleMinimum) / (this.#scaleMaximum - this.#scaleMinimum)) * 88;

    for (let index = 1; index < this.#samples.length; index += 1) {
      const previous = this.#samples[index - 1]!;
      const current = this.#samples[index]!;
      if (previous.value === null || current.value === null) continue;
      const knowledge = knowledgeOf(current);
      const commands = pathData.get(knowledge) ?? [];
      commands.push(
        `M ${xFor(previous).toFixed(3)} ${yFor(previous).toFixed(3)} L ${xFor(current).toFixed(3)} ${yFor(current).toFixed(3)}`,
      );
      pathData.set(knowledge, commands);
      if (knowledge !== knowledgeOf(previous)) {
        boundaryIndexes.add(index - 1);
        boundaryIndexes.add(index);
      }
    }

    for (const knowledge of knowledgeStates) {
      const commands = pathData.get(knowledge);
      if (!commands?.length) continue;
      const path = svgElement('path');
      path.dataset.knowledge = knowledge;
      path.dataset.segments = String(commands.length);
      path.setAttribute('d', commands.join(' '));
      svg.append(path);
    }

    this.#samples.forEach((sample, index) => {
      const knowledge = knowledgeOf(sample);
      if (sample.value === null) {
        const gap = svgElement('line');
        const x = xFor(sample).toFixed(3);
        gap.dataset.gap = '';
        gap.dataset.knowledge = knowledge;
        gap.setAttribute('x1', x);
        gap.setAttribute('x2', x);
        gap.setAttribute('y1', '38');
        gap.setAttribute('y2', '62');
        svg.append(gap);
        return;
      }
      if (!boundaryIndexes.has(index) || knowledge === 'confirmed') return;
      const point = svgElement('circle');
      point.dataset.boundary = '';
      point.dataset.knowledge = knowledge;
      point.setAttribute('cx', xFor(sample).toFixed(3));
      point.setAttribute('cy', yFor(sample).toFixed(3));
      point.setAttribute('r', '3');
      svg.append(point);
    });

    this.renderCount += 1;
    this.lastRenderDuration = performance.now() - started;
  }

  #validate(): string | null {
    if (
      !Number.isFinite(this.#windowStart) ||
      !Number.isFinite(this.#windowEnd) ||
      this.#windowEnd <= this.#windowStart
    ) {
      return 'time window must contain increasing finite bounds';
    }
    if (
      !Number.isFinite(this.#scaleMinimum) ||
      !Number.isFinite(this.#scaleMaximum) ||
      this.#scaleMaximum <= this.#scaleMinimum
    ) {
      return 'scale must contain increasing finite bounds';
    }
    let previousTime = this.#windowStart;
    for (const sample of this.#samples) {
      if (
        !Number.isFinite(sample.observedAt) ||
        sample.observedAt < previousTime ||
        sample.observedAt < this.#windowStart ||
        sample.observedAt > this.#windowEnd
      ) {
        return 'samples must use nondecreasing finite times inside the window';
      }
      if (
        sample.value !== null &&
        (!Number.isFinite(sample.value) ||
          sample.value < this.#scaleMinimum ||
          sample.value > this.#scaleMaximum)
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

export function defineTelemetryProof(): void {
  if (!customElements.get('wg-telemetry-proof')) {
    customElements.define('wg-telemetry-proof', WgTelemetryProof);
  }
}

export function createTelemetrySamples(offset = 0): {
  readonly samples: readonly TelemetrySample[];
  readonly window: TelemetryWindow;
} {
  const start = Date.parse('2026-08-09T18:00:00Z');
  const end = Date.parse('2026-08-09T19:00:00Z');
  const samples: TelemetrySample[] = [];
  for (let index = 0; index < 240; index += 1) {
    const progress = index / 239;
    const observedAt =
      index === 111
        ? samples[110]!.observedAt
        : start + Math.round(progress ** 1.08 * (end - start));
    let knowledge: Knowledge = 'confirmed';
    if (index >= 40 && index < 70) knowledge = 'inferred';
    if (index >= 70 && index < 100) knowledge = 'stale';
    if (index >= 100 && index < 130) knowledge = 'conflicting';
    if (index === 145 || index === 146) knowledge = 'unknown';
    if (index === 185 || index === 186 || index === 187) knowledge = 'unavailable';
    const gap = knowledge === 'unknown' || knowledge === 'unavailable' || index === 25;
    samples.push({
      observedAt,
      value: gap ? null : 22 + Math.sin((index + offset) / 12) * 7 + ((index + offset) % 9) / 3,
      knowledge,
    });
  }
  return { samples, window: { start, end } };
}

declare global {
  interface Window {
    defineTelemetryProof: typeof defineTelemetryProof;
    createTelemetrySamples: typeof createTelemetrySamples;
  }
}

window.defineTelemetryProof = defineTelemetryProof;
window.createTelemetrySamples = createTelemetrySamples;

const fixtureParameters = new URLSearchParams(window.location.search);
if (fixtureParameters.get('upgrade') === 'true') {
  defineTelemetryProof();
  const proof = document.querySelector('wg-telemetry-proof') as WgTelemetryProof;
  const fixture = createTelemetrySamples();
  proof.windowStart = fixture.window.start;
  proof.windowEnd = fixture.window.end;
  proof.scaleMinimum = 0;
  proof.scaleMaximum = 40;
  proof.samples = fixture.samples;
  document.body.dataset.theme = fixtureParameters.get('theme') === 'light' ? 'light' : 'dark';
  if (fixtureParameters.get('grayscale') === 'true') document.body.dataset.grayscale = '';
}
