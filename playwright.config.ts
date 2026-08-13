import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command:
        'pnpm --filter @wayglass/tokens build && pnpm --filter @wayglass/themes build && pnpm --filter @wayglass/icons build && pnpm --filter @wayglass/elements build && pnpm --filter @wayglass/react build && pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173/tests/browser/fixture/',
      reuseExistingServer: true,
    },
    {
      command:
        'pnpm --filter @wayglass/example-smart-home build && pnpm --filter @wayglass/example-smart-home exec vite preview --host 127.0.0.1 --port 6103 --strictPort',
      url: 'http://127.0.0.1:6103/',
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
