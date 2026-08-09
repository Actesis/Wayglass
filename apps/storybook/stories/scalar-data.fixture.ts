import type { Activity, Condition, Knowledge } from '@wayglass/core';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgKeyValue } from '@wayglass/elements/key-value';
import { defineWgMetricGroup } from '@wayglass/elements/metric-group';
import { defineWgMetric } from '@wayglass/elements/metric';
import { defineWgTrendIndicator, type TrendDirection } from '@wayglass/elements/trend-indicator';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { html } from 'lit';

import './scalar-data.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgButton();
defineWgMetric();
defineWgMetricGroup();
defineWgKeyValue();
defineWgTrendIndicator();

export type ScalarDataWidth = 'phone' | 'desktop' | 'wall';
export type ScalarDataTheme = 'wayglass-dark' | 'wayglass-light';
export type ScalarDataDensity = 'compact' | 'comfortable';

export interface ScalarDataOptions {
  readonly width: ScalarDataWidth;
  readonly theme: ScalarDataTheme;
  readonly density: ScalarDataDensity;
}

interface MetricFixture {
  readonly label: string;
  readonly value?: string;
  readonly unit?: string;
  readonly direction?: TrendDirection;
  readonly comparison?: string;
  readonly condition?: Condition;
  readonly trendCondition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
}

interface KeyValueFixture {
  readonly label: string;
  readonly value: string;
  readonly condition?: Condition;
  readonly knowledge?: Knowledge;
  readonly activity?: Activity;
}

const envelopeMetrics: readonly MetricFixture[] = [
  {
    label: 'Signed variance',
    value: '−18.6',
    unit: 'ms',
    direction: 'falling',
    comparison: '4.2 ms from the previous interval',
  },
  {
    label: 'Zero result',
    value: '0',
    unit: 'items',
  },
  {
    label: 'Decimal ratio',
    value: '0.0047',
    direction: 'rising',
    comparison: '0.0008 over the previous hour',
  },
  {
    label: 'Large count',
    value: '9,876,543',
    unit: 'events',
    direction: 'mixed',
    comparison: 'Across the current interval',
  },
  {
    label: 'Localized decimal',
    value: '1.234,56',
    unit: 'kW',
    direction: 'rising',
    comparison: '2,4% gegenüber der Vorstunde',
  },
  {
    label: 'Arabic-formatted count',
    value: '١٬٢٨٤',
    unit: 'سجل',
    direction: 'steady',
    comparison: 'خلال آخر خمس قراءات',
  },
  {
    label: 'Narrow-space grouping',
    value: '12 345,7',
    unit: 'm³/h',
    direction: 'falling',
    comparison: '0,7% depuis l’heure précédente',
  },
  {
    label: 'Unitless score',
    value: '84.2',
    direction: 'none',
    comparison: 'No comparable baseline is available',
  },
  {
    label: 'Confirmed rising',
    value: '42',
    unit: 'tasks',
    direction: 'rising',
    comparison: '12% over the previous hour',
    condition: 'neutral',
  },
  {
    label: 'Positive falling',
    value: '3',
    unit: 'failures',
    direction: 'falling',
    comparison: 'Six fewer than the previous hour',
    trendCondition: 'positive',
  },
  {
    label: 'Caution steady',
    value: '91',
    unit: '%',
    direction: 'steady',
    comparison: 'Inside the application-owned steady range',
    condition: 'caution',
  },
  {
    label: 'Critical mixed',
    value: '17',
    unit: 'alerts',
    direction: 'mixed',
    comparison: 'Movement varied across the interval',
    condition: 'critical',
  },
  {
    label: 'Inferred comparison',
    value: '6.8',
    unit: 's',
    direction: 'falling',
    comparison: 'Estimated from partial observations',
    knowledge: 'inferred',
  },
  {
    label: 'Stale comparison',
    value: '184',
    unit: 'ms',
    direction: 'rising',
    comparison: 'Last comparison is three minutes old',
    knowledge: 'stale',
  },
  {
    label: 'Unknown direction',
    value: '27',
    unit: 'items',
    direction: 'none',
    comparison: 'Direction cannot be established',
    knowledge: 'unknown',
  },
  {
    label: 'Pending recalculation',
    value: '72',
    unit: '%',
    direction: 'steady',
    comparison: 'Previous completed comparison',
    activity: 'pending',
  },
] as const;

const envelopeKeyValues: readonly KeyValueFixture[] = [
  { label: 'Active policy', value: 'Standard review' },
  { label: 'Reference', value: 'WG-OPS-2026-08-08-000184' },
  { label: 'Assigned group', value: 'Regional coordination — western interval' },
  { label: 'Last confirmed', value: '12:24 PM local time', knowledge: 'stale' },
  { label: 'Source confidence', value: 'Multiple records disagree', knowledge: 'conflicting' },
  { label: 'Remote owner', value: 'Unavailable', knowledge: 'unavailable' },
  { label: 'Review state', value: 'Awaiting acknowledgement', activity: 'pending' },
  { label: 'Disposition', value: 'Manual inspection required', condition: 'caution' },
] as const;

function renderTrend(metric: MetricFixture) {
  return metric.direction
    ? html`
        <wg-trend-indicator
          slot="trend"
          direction=${metric.direction}
          label=${metric.comparison ?? 'No comparison supplied'}
          condition=${metric.trendCondition ?? 'neutral'}
          knowledge=${metric.knowledge ?? 'confirmed'}
          activity=${metric.activity ?? 'idle'}
        ></wg-trend-indicator>
      `
    : undefined;
}

function renderMetric(metric: MetricFixture, id?: string) {
  return html`
    <wg-metric
      id=${id ?? ''}
      label=${metric.label}
      value=${metric.value ?? ''}
      unit=${metric.unit ?? ''}
      condition=${metric.condition ?? 'neutral'}
      knowledge=${metric.knowledge ?? 'confirmed'}
      activity=${metric.activity ?? 'idle'}
    >
      ${renderTrend(metric)}
    </wg-metric>
  `;
}

function renderKeyValue(value: KeyValueFixture, id?: string) {
  return html`
    <wg-key-value
      id=${id ?? ''}
      label=${value.label}
      value=${value.value}
      condition=${value.condition ?? 'neutral'}
      knowledge=${value.knowledge ?? 'confirmed'}
      activity=${value.activity ?? 'idle'}
    ></wg-key-value>
  `;
}

export function renderScalarDataWorkspace(options: ScalarDataOptions) {
  return html`
    <div
      class="wg-scalar-viewport wg-scalar-viewport--${options.width}"
      data-scalar-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-scalar-header">
            <p>Operational Activity · Scalar summary</p>
            <h1>Current operating interval</h1>
            <p>Values, comparisons, condition, knowledge, and activity remain independent.</p>
          </header>
          <main class="wg-scalar-workspace">
            <wg-metric-group label="Processing interval">
              <p slot="description">Confirmed readings from the current 15-minute interval.</p>
              ${renderMetric({ label: 'Completed', value: '1,284', unit: 'tasks', direction: 'rising', comparison: '12% over the previous hour' })}
              ${renderMetric({ label: 'Median duration', value: '4.8', unit: 's', direction: 'falling', comparison: '0.6 s from the previous interval', trendCondition: 'positive' })}
              ${renderMetric({ label: 'Queue depth', value: '42', unit: 'items', direction: 'steady', comparison: 'Inside the expected variation' })}
              ${renderMetric({ label: 'Rejected', value: '3', unit: 'tasks', direction: 'mixed', comparison: 'Varied across recent observations', condition: 'caution' })}
            </wg-metric-group>

            <wg-metric-group label="Assignment context">
              <p slot="description">Human-readable references retain native text semantics.</p>
              ${renderKeyValue({ label: 'Active policy', value: 'Standard review' })}
              <wg-key-value label="Last confirmed">
                <time slot="value" datetime="2026-08-08T19:24:00Z">12:24 PM local time</time>
              </wg-key-value>
              <wg-key-value label="Reference">
                <code slot="value">WG-OPS-000184</code>
              </wg-key-value>
              ${renderKeyValue({ label: 'Remote owner', value: 'Unavailable', knowledge: 'unavailable' })}
            </wg-metric-group>

            <wg-metric-group label="Transfer observations" busy>
              <p slot="description">Confirmed values remain readable during background refresh.</p>
              <wg-button id="scalar-review-action" slot="actions"
                >Review transfer observations</wg-button
              >
              ${renderMetric({ label: 'Throughput', value: '2,480', unit: 'events/min', direction: 'rising', comparison: '8% over the previous interval', activity: 'pending' })}
              ${renderMetric({ label: 'Latency', value: '184', unit: 'ms', direction: 'rising', comparison: 'Last comparison is three minutes old', condition: 'caution', knowledge: 'stale' })}
              ${renderKeyValue({ label: 'Route', value: 'West relay / secondary path' })}
              ${renderKeyValue({ label: 'Recalculation', value: 'Previous value retained', activity: 'pending' })}
            </wg-metric-group>
          </main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderScalarDataEnvelope(options: ScalarDataOptions) {
  return html`
    <div
      class="wg-scalar-viewport wg-scalar-viewport--${options.width}"
      data-scalar-width=${options.width}
    >
      <wg-theme-provider theme=${options.theme} density=${options.density}>
        <wg-canvas width="full">
          <header slot="header" class="wg-scalar-header">
            <p>Phase 3B validation envelope</p>
            <h1>Twenty-four scalar values</h1>
            <p>DOM order is the visual and reading order. No state is aggregated by the group.</p>
          </header>
          <main>
            <wg-metric-group id="scalar-envelope" label="Reference scalar envelope">
              <p slot="description">Sixteen metrics and eight key values in stable source order.</p>
              <button id="scalar-envelope-action" slot="actions" type="button">
                Review envelope
              </button>
              ${envelopeMetrics.map((metric, index) => renderMetric(metric, `scalar-${String(index + 1).padStart(2, '0')}`))}
              ${envelopeKeyValues.map((value, index) => renderKeyValue(value, `scalar-${String(index + 17).padStart(2, '0')}`))}
            </wg-metric-group>
          </main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}
