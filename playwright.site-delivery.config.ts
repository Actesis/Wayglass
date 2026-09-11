import { defineConfig, devices } from '@playwright/test';

const origin = process.env.WAYGLASS_SITE_ORIGIN;
if (origin === undefined || !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
  throw new Error('WAYGLASS_SITE_ORIGIN must identify the local proof server.');
}

export default defineConfig({
  testDir: './tests/site-delivery',
  fullyParallel: false,
  forbidOnly: true,
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: origin,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium' }],
});
