import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgElbow } from '@wayglass/elements/elbow';
import { defineWgPanel } from '@wayglass/elements/panel';
import { defineWgRail } from '@wayglass/elements/rail';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import './structural-primitives.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgRail();
defineWgElbow();
defineWgPanel();
defineWgButton();

const meta = {
  title: 'Components/Structural Primitives',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface FunctionFixture {
  readonly id: string;
  readonly name: string;
  readonly information: string;
  readonly monitor: string;
  readonly action: string;
}

const functionFixtures: readonly FunctionFixture[] = [
  {
    id: 'access',
    name: 'Access',
    information: 'Operator verification follows the current access policy.',
    monitor: 'Verification state will be supplied by the semantic display layer.',
    action: 'Review Access policy',
  },
  {
    id: 'communications',
    name: 'Communications',
    information: 'The primary link is the preferred operational route.',
    monitor: 'Link condition and freshness remain independently visible.',
    action: 'Retry Communications primary link',
  },
  {
    id: 'processing',
    name: 'Processing',
    information: 'Intake policy preserves queued work during pauses.',
    monitor: 'Queue depth and intake value remain stable during requests.',
    action: 'Pause Processing intake',
  },
];

function functionZone(fixture: FunctionFixture) {
  const headingId = `${fixture.id}-function`;

  return html`
    <section class="wg-function-zone" aria-labelledby=${headingId}>
      <wg-elbow weight="strong">
        <h2 id=${headingId}>${fixture.name}</h2>
      </wg-elbow>
      <div class="wg-function-zone__body">
        <wg-rail weight="strong"></wg-rail>
        <div class="wg-function-zone__sections">
          <wg-panel purpose="information">
            <h3 slot="heading">Context</h3>
            <p>${fixture.information}</p>
          </wg-panel>
          <wg-panel purpose="monitor" emphasis="strong">
            <h3 slot="heading">Current state</h3>
            <p>${fixture.monitor}</p>
          </wg-panel>
          <wg-panel purpose="control">
            <h3 slot="heading">Available action</h3>
            <p>The request remains distinct from confirmed system state.</p>
            <wg-button slot="actions" appearance="secondary">${fixture.action}</wg-button>
          </wg-panel>
        </div>
      </div>
    </section>
  `;
}

function operationsStructure(width: 'phone' | 'desktop' | 'wall') {
  return html`
    <div class="wg-structure-viewport wg-structure-viewport--${width}">
      <wg-theme-provider theme="wayglass-dark" density="compact">
        <wg-canvas width="full">
          <header slot="header" class="wg-structure-header">
            <p class="wg-structure-eyebrow">Phase 1 structure fixture</p>
            <h1>Operations Overview</h1>
            <p>
              Three functions retain obvious ownership while section purpose remains local and
              independent.
            </p>
          </header>
          <main class="wg-function-grid">${functionFixtures.map(functionZone)}</main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export const MultipleFunctions: Story = {
  render: () => operationsStructure('desktop'),
};

export const PhoneRecomposition: Story = {
  render: () => operationsStructure('phone'),
};

export const WallPanel: Story = {
  render: () => operationsStructure('wall'),
};

export const PrimitiveVariants: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-light" density="comfortable">
      <wg-canvas width="full">
        <header slot="header" class="wg-structure-header">
          <p class="wg-structure-eyebrow">Production elements</p>
          <h1>Structural and action variants</h1>
        </header>
        <div class="wg-primitive-catalog">
          <section aria-labelledby="rails-heading">
            <h2 id="rails-heading">Rails</h2>
            <div class="wg-rail-catalog">
              <wg-rail></wg-rail>
              <wg-rail weight="strong"></wg-rail>
              <wg-rail orientation="inline"></wg-rail>
              <wg-rail orientation="inline" weight="strong"></wg-rail>
            </div>
          </section>
          <section aria-labelledby="elbows-heading">
            <h2 id="elbows-heading">Elbows</h2>
            <div class="wg-elbow-catalog">
              <wg-elbow><span>Start placement</span></wg-elbow>
              <wg-elbow placement="end" weight="strong">
                <span>End placement</span>
              </wg-elbow>
            </div>
          </section>
          <section aria-labelledby="panels-heading">
            <h2 id="panels-heading">Section purposes</h2>
            <div class="wg-panel-catalog">
              <wg-panel purpose="information">
                <h3 slot="heading">Information</h3>
                <p>Neutral context without implied health or action.</p>
              </wg-panel>
              <wg-panel purpose="monitor">
                <h3 slot="heading">Monitor</h3>
                <p>Current state belongs to semantic display components.</p>
              </wg-panel>
              <wg-panel purpose="control">
                <h3 slot="heading">Control</h3>
                <p>Action association uses action color, not condition color.</p>
              </wg-panel>
            </div>
          </section>
          <section aria-labelledby="buttons-heading">
            <h2 id="buttons-heading">Actions</h2>
            <div class="wg-button-catalog">
              <wg-button appearance="primary">Apply routing change</wg-button>
              <wg-button appearance="secondary">Review configuration</wg-button>
              <wg-button appearance="critical">Remove processing route</wg-button>
              <wg-button pending>
                Retry Communications link
                <span slot="pending-label">Retrying</span>
              </wg-button>
              <wg-button disabled>Unavailable action</wg-button>
            </div>
          </section>
        </div>
      </wg-canvas>
    </wg-theme-provider>
  `,
};

export const BusyPanel: Story = {
  render: () => html`
    <wg-theme-provider theme="wayglass-dark" density="compact">
      <wg-canvas>
        <wg-panel purpose="control" busy label="Communications recovery">
          <h2 slot="heading">Communications recovery</h2>
          <p>The previous link state remains visible while the request is pending.</p>
          <wg-button slot="actions" pending>Retry primary link</wg-button>
          <span slot="progress">Retry request in progress</span>
        </wg-panel>
      </wg-canvas>
    </wg-theme-provider>
  `,
};
