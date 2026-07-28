import '@wayglass/tokens/tokens.css';
import '@wayglass/themes/themes.css';
import '../../shared/operations-overview.css';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  WgBooleanValue,
  WgButton,
  WgCanvas,
  WgElbow,
  WgMetric,
  WgPanel,
  WgRail,
  WgStatusIndicator,
  WgThemeProvider,
  WgValueTile,
} from '@wayglass/react';

function FunctionZone({
  children,
  slug,
  name,
}: {
  readonly children: React.ReactNode;
  readonly slug: string;
  readonly name: string;
}) {
  return (
    <section
      className="wg-overview-function"
      data-function={slug}
      aria-labelledby={`react-${slug}-heading`}
    >
      <WgElbow weight="strong">
        <h2 id={`react-${slug}-heading`}>{name}</h2>
      </WgElbow>
      <div className="wg-overview-function__body">
        <WgRail weight="strong" />
        <div className="wg-overview-function__sections">{children}</div>
      </div>
    </section>
  );
}

function App() {
  const [retryPending, setRetryPending] = useState(false);

  return (
    <div className="wg-overview-viewport wg-overview-viewport--responsive" data-example="react">
      <WgThemeProvider theme="system" density="compact">
        <WgCanvas width="full">
          <header slot="header" className="wg-overview-header">
            <p className="wg-overview-eyebrow">Typed React wrappers</p>
            <h1>Operations Overview</h1>
            <p>Production Custom Elements composed through the typed React package.</p>
          </header>
          <main className="wg-overview-functions">
            <FunctionZone slug="access" name="Access">
              <WgPanel purpose="information">
                <h3 slot="heading">Policy context</h3>
                <p>Operator verification follows the current access policy.</p>
                <dl className="wg-overview-facts">
                  <div>
                    <dt>Policy profile</dt>
                    <dd>Standard operations</dd>
                  </div>
                </dl>
              </WgPanel>
              <WgValueTile label="Operator verification">
                <h3 slot="heading">Operator verification</h3>
                <WgStatusIndicator slot="status" label="Access verification" condition="positive" />
                <WgBooleanValue
                  slot="value"
                  label="Operator"
                  asserted
                  assertedLabel="Verified"
                  notAssertedLabel="Unverified"
                />
                <p>Identity and policy checks agree.</p>
              </WgValueTile>
            </FunctionZone>
            <FunctionZone slug="communications" name="Communications">
              <WgValueTile label="Primary link">
                <h3 slot="heading">Primary link</h3>
                <WgStatusIndicator
                  slot="status"
                  label="Primary link"
                  condition="caution"
                  knowledge="stale"
                />
                <div slot="value" className="wg-overview-supporting-value">
                  <WgBooleanValue
                    label="Connection"
                    asserted
                    assertedLabel="Connected"
                    notAssertedLabel="Disconnected"
                    knowledge="stale"
                  />
                  <WgMetric
                    label="Last reported latency"
                    value="184"
                    unit="ms"
                    condition="caution"
                    knowledge="stale"
                  />
                </div>
                <p>The link remains connected; its latest measurement is stale.</p>
              </WgValueTile>
              <WgPanel purpose="control" busy={retryPending}>
                <h3 slot="heading">Connection recovery</h3>
                <p>Request a fresh handshake without changing the confirmed link value.</p>
                <WgButton
                  slot="actions"
                  appearance="secondary"
                  pending={retryPending}
                  onClick={() => setRetryPending(true)}
                >
                  Retry Communications primary link
                  <span slot="pending-label">Retry request pending</span>
                </WgButton>
                <span slot="progress" role="status">
                  {retryPending ? 'Retry requested; confirmed state remains Connected.' : ''}
                </span>
              </WgPanel>
            </FunctionZone>
            <FunctionZone slug="processing" name="Processing">
              <WgPanel purpose="information">
                <h3 slot="heading">Intake policy</h3>
                <p>Queued work is preserved while intake changes are requested.</p>
              </WgPanel>
              <WgValueTile label="Intake gate">
                <h3 slot="heading">Intake gate</h3>
                <WgStatusIndicator
                  slot="status"
                  label="Processing intake"
                  condition="critical"
                  activity="pending"
                />
                <div slot="value" className="wg-overview-supporting-value">
                  <WgBooleanValue
                    label="Confirmed gate"
                    asserted
                    assertedLabel="Open"
                    notAssertedLabel="Closed"
                  />
                  <WgMetric
                    label="Queue depth"
                    value="28"
                    unit="items"
                    condition="critical"
                    activity="pending"
                  />
                </div>
                <p>The confirmed gate remains open while a pause request is pending.</p>
              </WgValueTile>
              <WgPanel purpose="control" busy>
                <h3 slot="heading">Intake control</h3>
                <p>Requested state: Closed. Confirmed state remains Open until acknowledged.</p>
                <WgButton slot="actions" appearance="secondary" pending>
                  Pause Processing intake
                  <span slot="pending-label">Pause request pending</span>
                </WgButton>
                <span slot="feedback">Waiting for Processing intake confirmation</span>
              </WgPanel>
            </FunctionZone>
          </main>
          <footer slot="footer" className="wg-overview-footer">
            <span>React integration example</span>
            <span>Theme follows the operating system</span>
          </footer>
        </WgCanvas>
      </WgThemeProvider>
    </div>
  );
}

const root = document.querySelector('#root');

if (!root) {
  throw new Error('React example root was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
