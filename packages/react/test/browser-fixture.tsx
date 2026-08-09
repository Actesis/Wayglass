import {
  WgButton,
  WgConfirmationDialog,
  WgIconButton,
  WgKeyValue,
  WgMetric,
  WgMetricGroup,
  WgNavigationRail,
  WgSegment,
  WgSegmentedControl,
  WgStatusEntry,
  WgStatusList,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgTelemetryStrip,
  WgThemeProvider,
  WgTrendIndicator,
  WgToggle,
  WgValueTile,
} from '../src/index.js';
import type { WgConfirmationDialog as WgConfirmationDialogElement } from '@wayglass/elements/confirmation-dialog';
import type { TelemetrySample } from '@wayglass/elements/telemetry-strip';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const telemetrySamples = [
  { observedAt: 0, value: 12 },
  { observedAt: 1, value: 16, knowledge: 'inferred' },
  { observedAt: 2, value: null, knowledge: 'unavailable' },
  { observedAt: 3, value: 14 },
] as const satisfies readonly TelemetrySample[];

function ReactFixture() {
  const [theme, setTheme] = useState<'wayglass-dark' | 'wayglass-light'>('wayglass-dark');
  const [activationCount, setActivationCount] = useState(0);
  const [selectedView, setSelectedView] = useState('overview');
  const [density, setDensity] = useState('compact');
  const confirmationRef = useRef<WgConfirmationDialogElement>(null);

  return (
    <WgThemeProvider
      theme={theme}
      density="compact"
      onWgThemeChange={(event) => {
        document.documentElement.dataset.resolvedTheme = event.detail.resolvedTheme;
      }}
    >
      <main>
        <button id="switch-theme" type="button" onClick={() => setTheme('wayglass-light')}>
          Use light theme
        </button>
        <WgValueTile label="React connection overview">
          <h1 slot="heading">React connection overview</h1>
          <WgMetric
            id="react-metric"
            slot="value"
            label="Latency"
            value="184"
            unit="ms"
            condition="caution"
            knowledge="stale"
          />
          <WgButton
            id="react-button"
            ref={(element) => {
              document.documentElement.dataset.refTag = element?.localName ?? '';
            }}
            onClick={() => setActivationCount((count) => count + 1)}
          >
            Retry React connection
          </WgButton>
          <span id="activation-count">{activationCount}</span>
        </WgValueTile>
        <WgMetricGroup id="react-metric-group" label="React scalar data">
          <p slot="description">React preserves the production light-DOM composition.</p>
          <WgMetric id="react-trended-metric" label="Completed" value="1,284" unit="tasks">
            <WgTrendIndicator slot="trend" direction="rising" label="12% over the previous hour" />
          </WgMetric>
          <WgKeyValue id="react-key-value" label="Active policy" value="Standard review" />
        </WgMetricGroup>
        <WgTelemetryStrip
          id="react-telemetry"
          ref={(element) => {
            document.documentElement.dataset.telemetryRefTag = element?.localName ?? '';
          }}
          label="React queue depth"
          samples={telemetrySamples}
          windowStart={0}
          windowEnd={3}
          scaleMinimum={0}
          scaleMaximum={20}
          activity="pending"
        >
          <h2 slot="heading">React queue depth</h2>
          <span slot="current">Latest observation: 14 records</span>
          <time slot="window-start" dateTime="2026-08-09T18:00:00Z">
            11:00
          </time>
          <time slot="window-end" dateTime="2026-08-09T19:00:00Z">
            12:00
          </time>
          <p slot="summary">One unavailable observation occurs in the React-authored history.</p>
        </WgTelemetryStrip>
        <WgStatusList id="react-status-list" label="React delivery sources" busy>
          <h2 slot="heading">React delivery sources</h2>
          <p slot="status">Refreshing retained React entries.</p>
          <WgStatusEntry
            id="react-status-entry"
            label="React North source"
            condition="caution"
            knowledge="stale"
            activity="pending"
          >
            <span slot="description">The last confirmed React route remains active.</span>
            <button slot="actions" type="button">
              Inspect React North source
            </button>
          </WgStatusEntry>
        </WgStatusList>
        <WgTabs
          id="react-tabs"
          ref={(element) => {
            document.documentElement.dataset.tabsRefTag = element?.localName ?? '';
          }}
          value={selectedView}
          data-selected-view={selectedView}
          activation="automatic"
          orientation="horizontal"
          onWgTabChange={(event) => {
            document.documentElement.dataset.tabChange = JSON.stringify(event.detail);
            setSelectedView(event.detail.value);
          }}
        >
          <WgTabList aria-label="React account views">
            <WgTab value="overview">Overview</WgTab>
            <WgTab value="security">Security</WgTab>
          </WgTabList>
          <WgTabPanel value="overview">React overview content</WgTabPanel>
          <WgTabPanel value="security">React security content</WgTabPanel>
        </WgTabs>
        <WgToggle
          id="react-toggle"
          label="React notifications"
          asserted
          assertedLabel="On"
          notAssertedLabel="Off"
          onWgToggleRequest={(event) => {
            document.documentElement.dataset.toggleRequest = JSON.stringify(event.detail);
          }}
        />
        <WgSegmentedControl
          id="react-segments"
          value={density}
          aria-label="React density"
          onWgSegmentChange={(event) => {
            document.documentElement.dataset.segmentChange = JSON.stringify(event.detail);
            setDensity(event.detail.value);
          }}
        >
          <WgSegment value="compact">Compact</WgSegment>
          <WgSegment value="comfortable">Comfortable</WgSegment>
        </WgSegmentedControl>
        <WgIconButton label="Refresh React preview" />
        <nav aria-label="React account">
          <WgNavigationRail orientation="horizontal">
            <a href="#overview" aria-current="page">
              Overview
            </a>
            <a href="#settings">Settings</a>
          </WgNavigationRail>
        </nav>
        <button
          id="react-confirmation-trigger"
          type="button"
          onClick={(event) => confirmationRef.current?.show({ invoker: event.currentTarget })}
        >
          Disconnect React source
        </button>
        <WgConfirmationDialog
          id="react-confirmation"
          ref={confirmationRef}
          dialogId="react-disconnect-source"
          actionLabel="Disconnect React records"
          cancelLabel="Keep React connected"
          actionAppearance="critical"
          onWgConfirmationClose={(event) => {
            document.documentElement.dataset.confirmationClose = JSON.stringify(event.detail);
          }}
          onWgConfirmationAction={(event) => {
            document.documentElement.dataset.confirmationAction = JSON.stringify(event.detail);
          }}
        >
          <h2 slot="heading">Disconnect React records?</h2>
          <p>Current updates will stop. Stored records remain available.</p>
        </WgConfirmationDialog>
      </main>
    </WgThemeProvider>
  );
}

const root = document.querySelector('#root');

if (!root) {
  throw new Error('React fixture root is missing.');
}

createRoot(root).render(<ReactFixture />);
