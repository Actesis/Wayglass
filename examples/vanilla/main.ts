import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';

import { defineWgBooleanValue } from '@wayglass/elements/boolean-value';
import { defineWgButton } from '@wayglass/elements/button';
import type { WgButton } from '@wayglass/elements/button';
import { defineWgCanvas } from '@wayglass/elements/canvas';
import { defineWgElbow } from '@wayglass/elements/elbow';
import { defineWgMetric } from '@wayglass/elements/metric';
import { defineWgPanel } from '@wayglass/elements/panel';
import { defineWgRail } from '@wayglass/elements/rail';
import { defineWgStatusIndicator } from '@wayglass/elements/status-indicator';
import { defineWgThemeProvider } from '@wayglass/elements/theme-provider';
import { defineWgValueTile } from '@wayglass/elements/value-tile';

import '../shared/operations-overview.css';

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

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Vanilla example root was not found.');
}

app.innerHTML = `
  <div class="wg-overview-viewport wg-overview-viewport--responsive" data-example="vanilla">
    <wg-theme-provider theme="system" density="compact">
      <wg-canvas width="full">
        <header slot="header" class="wg-overview-header">
          <p class="wg-overview-eyebrow">Vanilla Custom Elements</p>
          <h1>Operations Overview</h1>
          <p>Production elements registered individually and composed with platform markup.</p>
        </header>
        <main class="wg-overview-functions">
          <section class="wg-overview-function" data-function="access" aria-labelledby="vanilla-access">
            <wg-elbow weight="strong"><h2 id="vanilla-access">Access</h2></wg-elbow>
            <div class="wg-overview-function__body">
              <wg-rail weight="strong"></wg-rail>
              <div class="wg-overview-function__sections">
                <wg-panel purpose="information">
                  <h3 slot="heading">Policy context</h3>
                  <p>Operator verification follows the current access policy.</p>
                  <dl class="wg-overview-facts"><div><dt>Policy profile</dt><dd>Standard operations</dd></div></dl>
                </wg-panel>
                <wg-value-tile label="Operator verification">
                  <h3 slot="heading">Operator verification</h3>
                  <wg-status-indicator slot="status" label="Access verification" condition="positive"></wg-status-indicator>
                  <wg-boolean-value slot="value" label="Operator" asserted asserted-label="Verified" not-asserted-label="Unverified"></wg-boolean-value>
                  <p>Identity and policy checks agree.</p>
                </wg-value-tile>
              </div>
            </div>
          </section>
          <section class="wg-overview-function" data-function="communications" aria-labelledby="vanilla-communications">
            <wg-elbow weight="strong"><h2 id="vanilla-communications">Communications</h2></wg-elbow>
            <div class="wg-overview-function__body">
              <wg-rail weight="strong"></wg-rail>
              <div class="wg-overview-function__sections">
                <wg-value-tile label="Primary link">
                  <h3 slot="heading">Primary link</h3>
                  <wg-status-indicator slot="status" label="Primary link" condition="caution" knowledge="stale"></wg-status-indicator>
                  <div slot="value" class="wg-overview-supporting-value">
                    <wg-boolean-value label="Connection" asserted asserted-label="Connected" not-asserted-label="Disconnected" knowledge="stale"></wg-boolean-value>
                    <wg-metric label="Last reported latency" value="184" unit="ms" condition="caution" knowledge="stale"></wg-metric>
                  </div>
                  <p>The link remains connected; its latest measurement is stale.</p>
                </wg-value-tile>
                <wg-panel id="vanilla-recovery" purpose="control">
                  <h3 slot="heading">Connection recovery</h3>
                  <p>Request a fresh handshake without changing the confirmed link value.</p>
                  <wg-button id="vanilla-retry" slot="actions" appearance="secondary">
                    Retry Communications primary link
                    <span slot="pending-label">Retry request pending</span>
                  </wg-button>
                  <span id="vanilla-retry-status" slot="progress" role="status"></span>
                </wg-panel>
              </div>
            </div>
          </section>
          <section class="wg-overview-function" data-function="processing" aria-labelledby="vanilla-processing">
            <wg-elbow weight="strong"><h2 id="vanilla-processing">Processing</h2></wg-elbow>
            <div class="wg-overview-function__body">
              <wg-rail weight="strong"></wg-rail>
              <div class="wg-overview-function__sections">
                <wg-panel purpose="information">
                  <h3 slot="heading">Intake policy</h3>
                  <p>Queued work is preserved while intake changes are requested.</p>
                </wg-panel>
                <wg-value-tile label="Intake gate">
                  <h3 slot="heading">Intake gate</h3>
                  <wg-status-indicator slot="status" label="Processing intake" condition="critical" activity="pending"></wg-status-indicator>
                  <div slot="value" class="wg-overview-supporting-value">
                    <wg-boolean-value label="Confirmed gate" asserted asserted-label="Open" not-asserted-label="Closed"></wg-boolean-value>
                    <wg-metric label="Queue depth" value="28" unit="items" condition="critical" activity="pending"></wg-metric>
                  </div>
                  <p>The confirmed gate remains open while a pause request is pending.</p>
                </wg-value-tile>
                <wg-panel purpose="control" busy>
                  <h3 slot="heading">Intake control</h3>
                  <p>Requested state: Closed. Confirmed state remains Open until acknowledged.</p>
                  <wg-button slot="actions" appearance="secondary" pending>
                    Pause Processing intake
                    <span slot="pending-label">Pause request pending</span>
                  </wg-button>
                  <span slot="feedback">Waiting for Processing intake confirmation</span>
                </wg-panel>
              </div>
            </div>
          </section>
        </main>
        <footer slot="footer" class="wg-overview-footer">
          <span>Vanilla integration example</span>
          <span>Theme follows the operating system</span>
        </footer>
      </wg-canvas>
    </wg-theme-provider>
  </div>
`;

const retryButton = document.querySelector<WgButton>('#vanilla-retry');
const recoveryPanel = document.querySelector<HTMLElement & { busy: boolean }>('#vanilla-recovery');
const retryStatus = document.querySelector<HTMLElement>('#vanilla-retry-status');

retryButton?.addEventListener('click', () => {
  retryButton.pending = true;
  if (recoveryPanel) {
    recoveryPanel.busy = true;
  }
  if (retryStatus) {
    retryStatus.textContent = 'Retry requested; confirmed state remains Connected.';
  }
});
