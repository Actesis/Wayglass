import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';
import { defineWgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgElbow } from '@wayglass/elements/elbow';
import { defineWgMetric } from '@wayglass/elements/metric';
import { defineWgPanel } from '@wayglass/elements/panel';
import { defineWgRail } from '@wayglass/elements/rail';
import { defineWgStatusIndicator } from '@wayglass/elements/status-indicator';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgValueTile } from '@wayglass/elements/value-tile';
import { html } from 'lit';

import '../../../examples/shared/operations-overview.css';

defineWgThemeProvider();
defineWgCanvas();
defineWgRail();
defineWgElbow();
defineWgPanel();
defineWgButton();
defineWgStatusIndicator();
defineWgBooleanValue();
defineWgMetric();
defineWgValueTile();

export type OperationsOverviewWidth = 'phone' | 'desktop' | 'wall';
export type OperationsOverviewTheme = 'wayglass-dark' | 'wayglass-light';
export type OperationsFunctionValue = 'access' | 'communications' | 'processing';
export type OperationsFunctionHeading = 'elbow' | 'plain';

interface OperationsFunctionMetadata {
  readonly value: OperationsFunctionValue;
  readonly label: string;
  readonly selectorSummary: string;
}

export interface OperationsFunctionFixture extends OperationsFunctionMetadata {
  readonly render: (
    width: OperationsOverviewWidth,
    idPrefix: string,
    heading: OperationsFunctionHeading,
  ) => ReturnType<typeof html>;
}

const accessMetadata = {
  value: 'access',
  label: 'Access',
  selectorSummary: 'Positive · Confirmed',
} as const satisfies OperationsFunctionMetadata;

const communicationsMetadata = {
  value: 'communications',
  label: 'Communications',
  selectorSummary: 'Caution · Data stale · Retry available',
} as const satisfies OperationsFunctionMetadata;

const processingMetadata = {
  value: 'processing',
  label: 'Processing',
  selectorSummary: 'Critical · Pause pending',
} as const satisfies OperationsFunctionMetadata;

export interface OperationsOverviewOptions {
  readonly width: OperationsOverviewWidth;
  readonly theme: OperationsOverviewTheme;
}

function signalSize(width: OperationsOverviewWidth) {
  return width === 'wall' ? 'prominent' : 'compact';
}

function booleanPresentation(width: OperationsOverviewWidth) {
  return width === 'wall' ? 'field' : 'rail';
}

function functionHeading(
  label: string,
  headingId: string,
  presentation: OperationsFunctionHeading,
) {
  return presentation === 'elbow'
    ? html`
        <wg-elbow weight="strong">
          <h2 id=${headingId}>${label}</h2>
        </wg-elbow>
      `
    : html`<h2 id=${headingId}>${label}</h2>`;
}

function accessFunction(
  width: OperationsOverviewWidth,
  idPrefix: string,
  heading: OperationsFunctionHeading,
) {
  const headingId = `${idPrefix}-${accessMetadata.value}-heading`;

  return html`
    <section
      class="wg-overview-function"
      data-function=${accessMetadata.value}
      aria-labelledby=${headingId}
    >
      ${functionHeading(accessMetadata.label, headingId, heading)}
      <div class="wg-overview-function__body">
        <wg-rail weight="strong"></wg-rail>
        <div class="wg-overview-function__sections">
          <wg-panel purpose="information">
            <h3 slot="heading">Policy context</h3>
            <p>Operator verification follows the current access policy.</p>
            <dl class="wg-overview-facts">
              <div>
                <dt>Policy profile</dt>
                <dd>Standard operations</dd>
              </div>
            </dl>
          </wg-panel>
          <wg-value-tile label="Access verification">
            <h3 slot="heading">Operator verification</h3>
            <wg-status-indicator
              slot="status"
              label="Access verification"
              condition="positive"
              size=${signalSize(width)}
            ></wg-status-indicator>
            <wg-boolean-value
              slot="value"
              label="Operator"
              asserted
              asserted-label="Verified"
              not-asserted-label="Unverified"
              presentation=${booleanPresentation(width)}
            ></wg-boolean-value>
            <p>Identity and policy checks agree.</p>
            <span slot="metadata">Confirmed moments ago</span>
          </wg-value-tile>
        </div>
      </div>
    </section>
  `;
}

function communicationsFunction(
  width: OperationsOverviewWidth,
  idPrefix: string,
  heading: OperationsFunctionHeading,
) {
  const headingId = `${idPrefix}-${communicationsMetadata.value}-heading`;

  return html`
    <section
      class="wg-overview-function"
      data-function=${communicationsMetadata.value}
      aria-labelledby=${headingId}
    >
      ${functionHeading(communicationsMetadata.label, headingId, heading)}
      <div class="wg-overview-function__body">
        <wg-rail weight="strong"></wg-rail>
        <div class="wg-overview-function__sections">
          <wg-value-tile label="Communications primary link">
            <h3 slot="heading">Primary link</h3>
            <wg-status-indicator
              slot="status"
              label="Primary link"
              condition="caution"
              knowledge="stale"
              size=${signalSize(width)}
            ></wg-status-indicator>
            <wg-boolean-value
              slot="value"
              label="Connection"
              asserted
              asserted-label="Connected"
              not-asserted-label="Disconnected"
              knowledge="stale"
              presentation=${booleanPresentation(width)}
            ></wg-boolean-value>
            <div class="wg-overview-supporting-value">
              <wg-metric
                label="Last reported latency"
                value="184"
                unit="ms"
                condition="caution"
                knowledge="stale"
                size=${signalSize(width)}
              ></wg-metric>
              <p>The link remains connected; its latest measurement is stale.</p>
            </div>
            <span slot="metadata">Last confirmed 3 minutes ago</span>
          </wg-value-tile>
          <wg-panel purpose="control">
            <h3 slot="heading">Connection recovery</h3>
            <p>Request a fresh handshake without changing the confirmed link value.</p>
            <wg-button id="overview-communications-retry" slot="actions" appearance="secondary">
              Retry Communications primary link
            </wg-button>
          </wg-panel>
        </div>
      </div>
    </section>
  `;
}

function processingFunction(
  width: OperationsOverviewWidth,
  idPrefix: string,
  heading: OperationsFunctionHeading,
) {
  const headingId = `${idPrefix}-${processingMetadata.value}-heading`;

  return html`
    <section
      class="wg-overview-function"
      data-function=${processingMetadata.value}
      aria-labelledby=${headingId}
    >
      ${functionHeading(processingMetadata.label, headingId, heading)}
      <div class="wg-overview-function__body">
        <wg-rail weight="strong"></wg-rail>
        <div class="wg-overview-function__sections">
          <wg-panel purpose="information">
            <h3 slot="heading">Intake policy</h3>
            <p>Queued work is preserved while intake changes are requested.</p>
          </wg-panel>
          <wg-value-tile label="Processing intake">
            <h3 slot="heading">Intake gate</h3>
            <wg-status-indicator
              slot="status"
              label="Processing intake"
              condition="critical"
              activity="pending"
              size=${signalSize(width)}
            ></wg-status-indicator>
            <wg-boolean-value
              slot="value"
              label="Confirmed gate"
              asserted
              asserted-label="Open"
              not-asserted-label="Closed"
              presentation=${booleanPresentation(width)}
            ></wg-boolean-value>
            <div class="wg-overview-supporting-value">
              <wg-metric
                label="Queue depth"
                value="28"
                unit="items"
                condition="critical"
                activity="pending"
                size=${signalSize(width)}
              ></wg-metric>
              <p>The gate remains confirmed open while a pause request is pending.</p>
            </div>
            <span slot="metadata">Confirmed state: Open</span>
          </wg-value-tile>
          <wg-panel purpose="control" busy>
            <h3 slot="heading">Intake control</h3>
            <p>Requested state: Closed. Confirmed state remains Open until acknowledged.</p>
            <wg-button id="overview-processing-pause" slot="actions" pending>
              Pause Processing intake
              <span slot="pending-label">Pause request pending</span>
            </wg-button>
            <span slot="progress">Waiting for Processing intake confirmation</span>
          </wg-panel>
        </div>
      </div>
    </section>
  `;
}

export const operationsFunctions: readonly OperationsFunctionFixture[] = [
  {
    ...accessMetadata,
    render: accessFunction,
  },
  {
    ...communicationsMetadata,
    render: communicationsFunction,
  },
  {
    ...processingMetadata,
    render: processingFunction,
  },
];

export function getOperationsFunction(value: string) {
  return operationsFunctions.find((functionFixture) => functionFixture.value === value);
}

export function renderOperationsFunction(
  functionFixture: OperationsFunctionFixture,
  width: OperationsOverviewWidth,
  idPrefix = 'overview',
  heading: OperationsFunctionHeading = 'elbow',
) {
  return functionFixture.render(width, idPrefix, heading);
}

export function renderOperationsOverview({ width, theme }: OperationsOverviewOptions) {
  return html`
    <div class="wg-overview-viewport wg-overview-viewport--${width}" data-overview-width=${width}>
      <wg-theme-provider theme=${theme} density=${width === 'wall' ? 'comfortable' : 'compact'}>
        <wg-canvas width="full">
          <header slot="header" class="wg-overview-header">
            <p class="wg-overview-eyebrow">Operational awareness</p>
            <h1>Operations Overview</h1>
            <p>
              Three functions remain simultaneously visible with independent values, condition,
              knowledge, and activity.
            </p>
          </header>
          <main class="wg-overview-functions">
            ${operationsFunctions.map((functionFixture) =>
              renderOperationsFunction(functionFixture, width, 'overview'),
            )}
          </main>
          <footer slot="footer" class="wg-overview-footer">
            <span>Local fixture</span>
            <span>Last screen update: moments ago</span>
          </footer>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}

export function renderOperationsStateCoverage(theme: OperationsOverviewTheme) {
  return html`
    <div class="wg-overview-state-viewport">
      <wg-theme-provider theme=${theme} density="compact">
        <wg-canvas width="full">
          <header slot="header" class="wg-overview-header">
            <p class="wg-overview-eyebrow">Required state coverage</p>
            <h1>Operations edge states</h1>
            <p>Domain value remains independent from health, knowledge, and request outcome.</p>
          </header>
          <main class="wg-overview-state-grid">
            <wg-value-tile label="Positive not asserted">
              <h2 slot="heading">Standby route</h2>
              <wg-status-indicator
                slot="status"
                label="Standby route"
                condition="positive"
              ></wg-status-indicator>
              <wg-boolean-value
                slot="value"
                label="Route role"
                asserted-label="Active"
                not-asserted-label="Standby"
              ></wg-boolean-value>
              <p>Standby is the expected healthy value for this route.</p>
            </wg-value-tile>
            <wg-value-tile label="Unavailable retained value">
              <h2 slot="heading">Remote approval</h2>
              <wg-status-indicator
                slot="status"
                label="Remote approval"
                knowledge="unavailable"
              ></wg-status-indicator>
              <wg-boolean-value
                slot="value"
                label="Last known approval"
                asserted
                asserted-label="Approved"
                not-asserted-label="Not approved"
                knowledge="unavailable"
              ></wg-boolean-value>
              <p>The last known value remains visible and explicitly unavailable.</p>
            </wg-value-tile>
            <wg-value-tile label="Loading before known value" busy>
              <h2 slot="heading">Capacity allocation</h2>
              <wg-status-indicator
                slot="status"
                label="Capacity allocation"
                activity="pending"
              ></wg-status-indicator>
              <wg-metric slot="value" label="Allocated workers" unit="workers" loading></wg-metric>
              <p>No placeholder number is presented as confirmed.</p>
              <span slot="progress">Loading capacity allocation</span>
            </wg-value-tile>
            <wg-value-tile label="Rejected request">
              <h2 slot="heading">Archive route</h2>
              <wg-status-indicator
                slot="status"
                label="Archive route"
                condition="caution"
              ></wg-status-indicator>
              <wg-boolean-value
                slot="value"
                label="Confirmed route"
                asserted
                asserted-label="Connected"
                not-asserted-label="Disconnected"
              ></wg-boolean-value>
              <p>Disconnect request rejected. Confirmed value remains Connected.</p>
              <wg-button slot="actions" appearance="secondary">
                Review Archive route rejection
              </wg-button>
            </wg-value-tile>
          </main>
        </wg-canvas>
      </wg-theme-provider>
    </div>
  `;
}
