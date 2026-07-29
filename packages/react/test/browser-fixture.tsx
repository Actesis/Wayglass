import {
  WgButton,
  WgMetric,
  WgTab,
  WgTabList,
  WgTabPanel,
  WgTabs,
  WgThemeProvider,
  WgValueTile,
} from '../src/index.js';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function ReactFixture() {
  const [theme, setTheme] = useState<'wayglass-dark' | 'wayglass-light'>('wayglass-dark');
  const [activationCount, setActivationCount] = useState(0);
  const [selectedView, setSelectedView] = useState('overview');

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
      </main>
    </WgThemeProvider>
  );
}

const root = document.querySelector('#root');

if (!root) {
  throw new Error('React fixture root is missing.');
}

createRoot(root).render(<ReactFixture />);
