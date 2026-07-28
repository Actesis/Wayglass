import { WgButton, WgMetric, WgThemeProvider, WgValueTile } from '../src/index.js';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function ReactFixture() {
  const [theme, setTheme] = useState<'wayglass-dark' | 'wayglass-light'>('wayglass-dark');
  const [activationCount, setActivationCount] = useState(0);

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
      </main>
    </WgThemeProvider>
  );
}

const root = document.querySelector('#root');

if (!root) {
  throw new Error('React fixture root is missing.');
}

createRoot(root).render(<ReactFixture />);
