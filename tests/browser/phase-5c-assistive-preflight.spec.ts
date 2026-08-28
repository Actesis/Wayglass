import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const nativeProofPath = '/experiments/phase-5c-rich-visualization/?candidate=native';

test('Phase 5C native candidate exposes one quiet non-visual task path', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(nativeProofPath);

  await expect(page.getByRole('heading', { level: 1, name: 'Queue investigation' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Native SVG and HTML baseline' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /uPlot|D3-assisted/ })).toHaveCount(0);
  expect(requests.some((url) => /(?:\/|%2F)uplot(?:\/|%2F|\?|$)/i.test(url))).toBe(false);
  expect(requests.some((url) => /d3-(?:array|scale|shape)/i.test(url))).toBe(false);
  await expect(page.locator('.p5c-native svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.p5c-native svg')).toHaveAttribute('focusable', 'false');

  const checkboxes = page.getByRole('checkbox');
  await expect(checkboxes).toHaveCount(4);
  for (const name of ['Review queue', 'Intake queue', 'Classification queue', 'Dispatch queue']) {
    await expect(page.getByRole('checkbox', { name })).toBeChecked();
  }

  const navigation = page.getByRole('group', { name: 'Exact inspection navigation' });
  await expect(navigation.getByRole('button')).toHaveCount(4);
  await expect(navigation.getByRole('button', { name: 'Previous sample' })).toBeDisabled();
  await navigation.getByRole('button', { name: 'Next sample' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-inspector-time]')).toHaveText('2026-08-18 00:00:30 UTC');
  await expect(navigation.getByRole('button', { name: 'Next sample' })).toBeFocused();
  await expect(page.locator('[aria-live], [role="alert"], [role="status"]')).toHaveCount(0);
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  const tableDisclosure = page.getByText('Inspect all exact queue observations', { exact: true });
  await expect(page.getByRole('table')).toHaveCount(0);
  await tableDisclosure.click();
  const tableRegion = page.getByRole('region', { name: 'Exact queue observations' });
  await expect(tableRegion).toBeVisible();
  const table = page.getByRole('table', { name: /Queue depth around the August 18 intervention/ });
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader')).toHaveText([
    'Observed at',
    'Review queue',
    'Intake queue',
    'Classification queue',
    'Dispatch queue',
  ]);
  await expect(table.getByRole('rowheader', { name: '2026-08-18 08:00:00 UTC' })).toHaveCount(1);
  await expect(table.getByRole('rowheader', { name: '2026-08-18 14:00:00 UTC' })).toHaveCount(1);

  await expect(page.locator('[aria-live], [role="alert"], [role="status"]')).toHaveCount(0);
});

test('Phase 5C rejects an unknown private candidate mode', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/experiments/phase-5c-rich-visualization/?candidate=unknown');
  await expect
    .poll(() => errors)
    .toContain('P5C_CANDIDATE: unsupported private proof candidate "unknown".');
  await expect(page.locator('.p5c-adapter')).toHaveCount(0);
});
