import { defineConfig, devices } from '@playwright/test';

const benchmarkUrl = 'http://127.0.0.1:6106/experiments/phase-5c-rich-visualization/benchmark.html';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'phase-5c-performance.spec.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:6106',
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'pnpm exec vite build --config experiments/phase-5c-rich-visualization/vite.benchmark.config.ts && pnpm exec vite preview --config experiments/phase-5c-rich-visualization/vite.benchmark.config.ts --host 127.0.0.1 --port 6106 --strictPort',
    url: benchmarkUrl,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
