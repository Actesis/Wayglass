import {
  WgButton,
  WgConfirmationDialog,
  WgEventLog,
  WgEventRecord,
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
  WgTimeline,
  WgTimelineItem,
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
        <WgTimeline
          id="react-timeline"
          ref={(element) => {
            document.documentElement.dataset.timelineRefTag = element?.localName ?? '';
          }}
          label="React review history"
          chronology="ascending"
          chronologyLabel="Oldest to newest"
        >
          <h2 slot="heading">React review history</h2>
          <WgTimelineItem
            id="react-timeline-item"
            label="React review opened"
            kind="interval"
            condition="informational"
            knowledge="inferred"
            activity="pending"
          >
            <time slot="time" dateTime="2026-08-09T09:00:00-07:00">
              9:00 AM
            </time>
            <span slot="end-time">Ongoing</span>
            <p>The React-authored review remains in progress.</p>
            <details slot="details">
              <summary>Inspect React review context</summary>
              <p>Two authored checks remain.</p>
            </details>
          </WgTimelineItem>
        </WgTimeline>
        <WgEventLog
          id="react-event-log"
          ref={(element) => {
            document.documentElement.dataset.eventLogRefTag = element?.localName ?? '';
          }}
          label="React review events"
          chronology="descending"
          chronologyLabel="Newest to oldest"
        >
          <h2 slot="heading">React review events</h2>
          <p slot="status">2 newer React records are paused.</p>
          <WgEventRecord
            id="react-event-record"
            label="React response delayed"
            condition="caution"
            knowledge="stale"
            activity="pending"
          >
            <time slot="time" dateTime="2026-08-09T09:14:50-07:00">
              9:14:50 AM
            </time>
            <span slot="source">Source: React coordination</span>
            <span slot="category">Category: Delivery timing</span>
            <button slot="actions" type="button">
              Inspect React delayed response
            </button>
          </WgEventRecord>
        </WgEventLog>
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
