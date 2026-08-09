import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import {
  defineWgTelemetryStrip,
  type TelemetrySample,
  type WgTelemetryStrip,
} from '@wayglass/elements/telemetry-strip';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import './telemetry-data.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgTelemetryStrip();
defineWgButton();

export type TelemetryDataWidth = 'phone' | 'desktop' | 'wall';
export type TelemetryDataTheme = 'wayglass-dark' | 'wayglass-light';
export type TelemetryDataDensity = 'compact' | 'comfortable';

export interface TelemetryDataOptions {
  readonly width: TelemetryDataWidth;
  readonly theme: TelemetryDataTheme;
  readonly density: TelemetryDataDensity;
}

interface TelemetryFixture {
  readonly id: string;
  readonly label: string;
  readonly current: string;
  readonly summary: string;
  readonly samples: readonly TelemetrySample[];
  readonly condition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
  readonly action?: boolean;
}

const windowStart = Date.parse('2026-08-09T18:00:00Z');
const windowEnd = Date.parse('2026-08-09T19:00:00Z');

function samples(
  values: readonly (number | null)[],
  knowledge: Knowledge | readonly (Knowledge | undefined)[] = 'confirmed',
): readonly TelemetrySample[] {
  return values.map((value, index) => {
    const sampleKnowledge = typeof knowledge === 'string' ? knowledge : knowledge[index];
    const sample = {
      observedAt:
        windowStart + Math.round((index / (values.length - 1)) * (windowEnd - windowStart)),
      value,
    };
    return sampleKnowledge ? { ...sample, knowledge: sampleKnowledge } : sample;
  });
}

const telemetryFixtures: readonly TelemetryFixture[] = [
  {
    id: 'telemetry-steady',
    label: 'Processing throughput',
    current: 'Latest confirmed observation: 62 tasks per minute',
    summary:
      'Throughput remained between 58 and 64 tasks per minute throughout the hour, with no gaps.',
    samples: samples([60, 61, 59, 62, 63, 61, 60, 64, 63, 62, 61, 62]),
  },
  {
    id: 'telemetry-changing',
    label: 'Queue depth',
    current: 'Latest confirmed observation: 38 records',
    summary:
      'Queue depth climbed from 22 to 71 records, then recovered to 38. Four observations are inferred.',
    samples: samples(
      [22, 25, 31, 44, 58, 67, 71, 69, 62, 55, 49, 43, 38],
      [
        'confirmed',
        'confirmed',
        'confirmed',
        'confirmed',
        'inferred',
        'inferred',
        'inferred',
        'inferred',
        'confirmed',
        'confirmed',
        'confirmed',
        'confirmed',
        'confirmed',
      ],
    ),
    condition: 'caution',
  },
  {
    id: 'telemetry-sparse',
    label: 'Remote observations',
    current: 'Latest confirmed observation: 46%',
    summary:
      'Five observations are available across the hour. Three explicit gaps separate the confirmed readings.',
    samples: samples(
      [42, null, 45, null, 44, 48, null, 46],
      [
        'confirmed',
        'unknown',
        'confirmed',
        'unknown',
        'confirmed',
        'confirmed',
        'unknown',
        'confirmed',
      ],
    ),
  },
  {
    id: 'telemetry-stale',
    label: 'Response duration',
    current: 'Last known observation: 54 milliseconds',
    summary:
      'The retained history varied between 41 and 58 milliseconds. No observation has arrived in 12 minutes.',
    samples: samples([44, 46, 41, 48, 52, 50, 55, 58, 54], 'stale'),
    knowledge: 'stale',
  },
  {
    id: 'telemetry-unavailable',
    label: 'External capacity',
    current: 'No current observation',
    summary:
      'The source supplied no numeric observations during this hour. Four authored unavailable gaps are shown.',
    samples: samples([null, null, null, null], 'unavailable'),
    knowledge: 'unavailable',
  },
  {
    id: 'telemetry-updating',
    label: 'Transfer rate',
    current: 'Latest confirmed observation: 74%',
    summary:
      'Transfer rate varied between 61% and 78%. The confirmed history remains visible during background refresh.',
    samples: samples([61, 64, 68, 72, 70, 75, 78, 76, 74]),
    activity: 'pending',
    action: true,
  },
] as const;

const telemetryStressFixtures: readonly TelemetryFixture[] = Array.from(
  { length: 12 },
  (_, fixtureIndex) => {
    const values = Array.from({ length: 120 }, (_, sampleIndex) => {
      if ((sampleIndex + fixtureIndex * 3) % 37 === 0) return null;
      return 48 + Math.sin((sampleIndex + fixtureIndex * 5) / 11) * 18 + fixtureIndex;
    });
    const latest = values.findLast((value) => value !== null) ?? 0;
    return {
      id: `telemetry-reference-${String(fixtureIndex + 1).padStart(2, '0')}`,
      label: `Reference stream ${String(fixtureIndex + 1).padStart(2, '0')}`,
      current: `Latest confirmed observation: ${Math.round(latest)}`,
      summary:
        'One hundred twenty application-owned samples exercise bounded rendering and explicit gaps.',
      samples: samples(
        values,
        values.map((value) => (value === null ? 'unknown' : 'confirmed')),
      ),
      action: fixtureIndex === 0,
    } satisfies TelemetryFixture;
  },
);

function nextLiveSamples(): readonly TelemetrySample[] {
  return samples([63, 66, 71, 74, 72, 77, 81, 79, 76]);
}

function applyNextLiveBatch(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const strip = button.closest<WgTelemetryStrip>('wg-telemetry-strip');
  if (!strip) return;
  strip.samples = nextLiveSamples();
  const current = strip.querySelector<HTMLElement>('[slot="current"]');
  const summary = strip.querySelector<HTMLElement>('[slot="summary"]');
  if (current) current.textContent = 'Latest confirmed observation: 76%';
  if (summary) {
    summary.textContent =
      'Transfer rate varied between 63% and 81%. The next application-owned batch replaced the history.';
  }
}

function renderTelemetry(fixture: TelemetryFixture) {
  return html`
    <wg-telemetry-strip
      id=${fixture.id}
      label=${fixture.label}
      condition=${fixture.condition ?? 'neutral'}
      knowledge=${fixture.knowledge ?? 'confirmed'}
      activity=${fixture.activity ?? 'idle'}
      .samples=${fixture.samples}
      .windowStart=${windowStart}
      .windowEnd=${windowEnd}
      .scaleMinimum=${0}
      .scaleMaximum=${100}
    >
      <h2 slot="heading">${fixture.label}</h2>
      <p slot="current">${fixture.current}</p>
      <time slot="window-start" datetime="2026-08-09T18:00:00Z">11:00 AM</time>
      <time slot="window-end" datetime="2026-08-09T19:00:00Z">12:00 PM</time>
      <p slot="summary">${fixture.summary}</p>
      ${
        fixture.action
          ? html`<wg-button slot="detail" appearance="secondary" @click=${applyNextLiveBatch}>
              Apply next authored sample batch
            </wg-button>`
          : undefined
      }
    </wg-telemetry-strip>
  `;
}

function renderTelemetryPage(
  options: TelemetryDataOptions,
  fixtures: readonly TelemetryFixture[],
  title: string,
  description: string,
) {
  return html`
    <div
      class="wg-telemetry-viewport wg-telemetry-viewport--${options.width}"
      data-telemetry-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-telemetry-header">
            <p>Operational Activity · Compact history</p>
            <h1>${title}</h1>
            <p>${description}</p>
          </header>
          <main class="wg-telemetry-workspace">${fixtures.map(renderTelemetry)}</main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderTelemetryWorkspace(options: TelemetryDataOptions) {
  return renderTelemetryPage(
    options,
    [telemetryFixtures[0]!, telemetryFixtures[1]!, telemetryFixtures[5]!],
    'Recent operating history',
    'Readable summaries remain the source of meaning; compact paths support recognition at a glance.',
  );
}

export function renderTelemetryEnvelope(options: TelemetryDataOptions) {
  return renderTelemetryPage(
    options,
    telemetryFixtures,
    'Telemetry validation envelope',
    'Steady, changing, sparse, stale, unavailable, and updating histories share one bounded contract.',
  );
}

export function renderTelemetryStress(options: TelemetryDataOptions) {
  return renderTelemetryPage(
    options,
    telemetryStressFixtures,
    'Telemetry load envelope',
    'Twelve simultaneous strips retain 120 supplied samples each without component-owned downsampling.',
  );
}
