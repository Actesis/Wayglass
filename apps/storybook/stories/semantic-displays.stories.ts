import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgMetric } from '@wayglass/elements/metric';
import { defineWgStatusIndicator } from '@wayglass/elements/status-indicator';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgValueTile } from '@wayglass/elements/value-tile';
import type { Condition, Knowledge } from '@wayglass/core';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import './semantic-displays.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgButton();
defineWgStatusIndicator();
defineWgBooleanValue();
defineWgMetric();
defineWgValueTile();

const meta = {
  title: 'Components/Semantic Displays',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const conditions: readonly Condition[] = [
  'neutral',
  'informational',
  'positive',
  'caution',
  'critical',
];

const knowledgeStates: readonly Knowledge[] = [
  'confirmed',
  'inferred',
  'stale',
  'unknown',
  'conflicting',
  'unavailable',
];

function referenceComposition(width: 'phone' | 'desktop' | 'wall') {
  const prominent = width === 'wall';

  return html`
    <div class="wg-semantic-viewport wg-semantic-viewport--${width}">
      <wg-theme-provider theme="wayglass-dark" density="compact">
        <wg-canvas width="full">
          <header slot="header" class="wg-semantic-header">
            <p>Phase 1 semantic fixture</p>
            <h1>Operations Overview</h1>
            <p>Domain value, condition, knowledge, and activity remain independent.</p>
          </header>
          <main class="wg-semantic-grid">
            <wg-value-tile emphasis=${prominent ? 'prominent' : 'standard'}>
              <h2 slot="heading">Access verification</h2>
              <wg-status-indicator
                slot="status"
                label="Access"
                condition="positive"
                size=${prominent ? 'prominent' : 'compact'}
              ></wg-status-indicator>
              <wg-boolean-value
                slot="value"
                label="Operator verification"
                asserted
                asserted-label="Verified"
                not-asserted-label="Unverified"
                presentation=${prominent ? 'field' : 'rail'}
              ></wg-boolean-value>
              <p>Verification follows the current access policy.</p>
              <span slot="metadata">Confirmed moments ago</span>
            </wg-value-tile>

            <wg-value-tile emphasis=${prominent ? 'prominent' : 'standard'}>
              <h2 slot="heading">Communications primary link</h2>
              <wg-status-indicator
                slot="status"
                label="Primary link"
                condition="caution"
                knowledge="stale"
                size=${prominent ? 'prominent' : 'compact'}
              ></wg-status-indicator>
              <wg-metric
                slot="value"
                label="Last reported latency"
                value="184"
                unit="ms"
                condition="caution"
                knowledge="stale"
                size=${prominent ? 'prominent' : 'compact'}
              ></wg-metric>
              <p>The link remains connected; its latest measurement is stale.</p>
              <span slot="metadata">Last confirmed 3 minutes ago</span>
              <wg-button slot="actions">Retry Communications primary link</wg-button>
            </wg-value-tile>

            <wg-value-tile emphasis=${prominent ? 'prominent' : 'standard'} busy>
              <h2 slot="heading">Processing intake</h2>
              <wg-status-indicator
                slot="status"
                label="Processing intake"
                condition="critical"
                activity="pending"
                size=${prominent ? 'prominent' : 'compact'}
              ></wg-status-indicator>
              <wg-boolean-value
                slot="value"
                label="Intake gate"
                asserted
                asserted-label="Open"
                not-asserted-label="Closed"
                presentation=${prominent ? 'field' : 'rail'}
              ></wg-boolean-value>
              <p>The gate remains confirmed open while a pause request is pending.</p>
              <span slot="metadata">Requested state: Closed</span>
              <wg-button slot="actions" pending>Pause Processing intake</wg-button>
              <span slot="progress">Pause request in progress</span>
            </wg-value-tile>
          </main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export const ReferenceCombinations: Story = {
  render: () => referenceComposition('desktop'),
};

export const Phone: Story = {
  render: () => referenceComposition('phone'),
};

export const WallPanel: Story = {
  render: () => referenceComposition('wall'),
};

export const StatusAxes: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="comfortable">
      <wg-canvas width="full">
        <header slot="header" class="wg-semantic-header">
          <h1>Status axes</h1>
          <p>Condition, knowledge, and activity change independently.</p>
        </header>
        <main class="wg-semantic-catalog">
          <section aria-labelledby="condition-heading">
            <h2 id="condition-heading">Condition</h2>
            <div class="wg-semantic-list">
              ${conditions.map(
                (condition) => html`
                  <wg-status-indicator
                    label="Primary service"
                    condition=${condition}
                  ></wg-status-indicator>
                `,
              )}
            </div>
          </section>
          <section aria-labelledby="knowledge-heading">
            <h2 id="knowledge-heading">Knowledge</h2>
            <div class="wg-semantic-list">
              ${knowledgeStates.map(
                (knowledge) => html`
                  <wg-status-indicator
                    label="Telemetry source"
                    condition="positive"
                    knowledge=${knowledge}
                  ></wg-status-indicator>
                `,
              )}
            </div>
          </section>
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading">Activity</h2>
            <div class="wg-semantic-list">
              <wg-status-indicator
                label="Routing update"
                condition="positive"
              ></wg-status-indicator>
              <wg-status-indicator
                label="Routing update"
                condition="positive"
                activity="pending"
              ></wg-status-indicator>
            </div>
          </section>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const BooleanValues: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="compact">
      <wg-canvas width="full">
        <header slot="header" class="wg-semantic-header">
          <h1>Boolean values</h1>
          <p>Lit and unlit value roles carry no health meaning.</p>
        </header>
        <main class="wg-boolean-catalog">
          <wg-boolean-value
            label="Exterior lighting"
            asserted
            asserted-label="On"
            not-asserted-label="Off"
          ></wg-boolean-value>
          <wg-boolean-value
            label="Exterior lighting"
            asserted-label="On"
            not-asserted-label="Off"
          ></wg-boolean-value>
          <wg-boolean-value
            label="Account email"
            asserted
            asserted-label="Verified"
            not-asserted-label="Unverified"
            knowledge="stale"
          ></wg-boolean-value>
          <wg-boolean-value
            label="Entry"
            asserted-label="Open"
            not-asserted-label="Closed"
            knowledge="unavailable"
          ></wg-boolean-value>
          <wg-boolean-value
            label="Remote confirmation"
            asserted-label="Confirmed"
            not-asserted-label="Not confirmed"
            loading
          ></wg-boolean-value>
          <wg-boolean-value
            label="Processing intake"
            asserted
            asserted-label="Open"
            not-asserted-label="Closed"
            presentation="field"
          ></wg-boolean-value>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const Metrics: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="compact">
      <wg-canvas width="full">
        <header slot="header" class="wg-semantic-header">
          <h1>Metrics</h1>
          <p>Quantitative values retain units and independent known state.</p>
        </header>
        <main class="wg-metric-catalog">
          <wg-metric label="Queue depth" value="28" unit="items"></wg-metric>
          <wg-metric
            label="Primary-link latency"
            value="184"
            unit="ms"
            condition="caution"
            knowledge="stale"
          ></wg-metric>
          <wg-metric label="Error rate" value="12.4" unit="%" condition="critical"></wg-metric>
          <wg-metric
            label="Requested capacity"
            value="64"
            unit="workers"
            activity="pending"
          ></wg-metric>
          <wg-metric label="Remote throughput" unit="MB/s" knowledge="unavailable"></wg-metric>
          <wg-metric label="Current utilization" unit="%" loading></wg-metric>
          <wg-metric
            label="Wall-panel throughput"
            value="2,480"
            unit="events/min"
            size="prominent"
          ></wg-metric>
        </main>
      </wg-canvas>
    </wg-theme-provider>
  `,
};
