import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const northlineBaseUrl = 'http://127.0.0.1:6104';

async function openNorthline(
  page: import('@playwright/test').Page,
  path = '/',
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({
    scenario: 'stale-trailer',
    theme: 'wayglass-dark',
    density: 'compact',
    ...parameters,
  });
  await page.goto(`${northlineBaseUrl}${path}?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-panel') !== undefined &&
      document.querySelector('main')?.getAttribute('data-route') !== null,
  );
}

test('presents four separated functions and an honest outbound answer', async ({ page }) => {
  await openNorthline(page);

  await expect(page.getByRole('heading', { name: 'Outbound readiness', level: 1 })).toBeVisible();
  const functions = page.locator('[data-function]');
  await expect(functions).toHaveCount(4);
  await expect(functions.nth(0)).toHaveAttribute('data-function', 'receiving');
  await expect(functions.nth(1)).toHaveAttribute('data-function', 'cold-storage');
  await expect(functions.nth(2)).toHaveAttribute('data-function', 'order-preparation');
  await expect(functions.nth(3)).toHaveAttribute('data-function', 'dispatch');

  await expect(page.getByText('1 outbound load needs review.')).toBeVisible();
  await expect(page.getByText(/cannot confirm readiness from that observation/)).toBeVisible();
  await expect(page.locator('[data-function="dispatch"] wg-status-indicator')).toHaveAttribute(
    'knowledge',
    'stale',
  );
  await expect(page.locator('.northline-announcement[aria-live="polite"]')).toHaveCount(1);
});

test('keeps the dispatch consequence discoverable from a peer function', async ({ page }) => {
  await openNorthline(page, '/functions/receiving');

  await expect(page.getByRole('heading', { name: 'Receiving', level: 1 })).toBeVisible();
  const selectors = page.getByRole('navigation', { name: 'Operational functions' });
  await expect(selectors.getByRole('link')).toHaveCount(4);
  await expect(selectors.getByRole('link', { name: /Receiving/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('complementary', { name: 'Dispatch consequence' })).toContainText(
    'NL-2048',
  );
  await expect(page.locator('[data-function]')).toHaveCount(1);

  await page.getByRole('link', { name: 'Open Dispatch' }).click();
  await expect(page).toHaveURL(/\/functions\/dispatch/);
  await expect(page.getByRole('heading', { name: 'Dispatch', level: 1 })).toBeVisible();
});

test('renders one contained native table from the same load truth as detail', async ({ page }) => {
  await openNorthline(page, '/functions/dispatch');

  const table = page.getByRole('table', { name: 'Outbound load records' });
  await expect(table).toBeVisible();
  await expect(table.getByRole('row')).toHaveCount(4);
  const representative = table.locator('tr[data-load-id="NL-2048"]');
  await expect(representative).toContainText('Stale');
  await expect(representative).toContainText('Scheduled');

  await representative.getByRole('link', { name: 'Inspect NL-2048' }).click();
  await expect(page).toHaveURL(/\/loads\/NL-2048\?.*scenario=stale-trailer/);
  await expect(page.getByRole('heading', { name: 'Load NL-2048', level: 1 })).toBeVisible();
  await expect(page.locator('wg-key-value[label="Confirmed release state"]')).toHaveAttribute(
    'value',
    'Scheduled',
  );
  await expect(page.getByText(/does not infer that NL-2048 is safe or unsafe/)).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('table', { name: 'Outbound load records' })).toBeVisible();
});

test('does not convert unavailable evidence into a release result', async ({ page }) => {
  await openNorthline(page, '/loads/NL-2048', { scenario: 'unavailable' });

  await expect(page.locator('wg-status-indicator')).toHaveAttribute('knowledge', 'unavailable');
  await expect(page.locator('wg-key-value[label="Confirmed release state"]')).toHaveAttribute(
    'value',
    'Scheduled',
  );
  await expect(page.getByText(/does not infer that NL-2048 is safe or unsafe/)).toBeVisible();
});

test('contains the phone overview and keeps all functions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openNorthline(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link', { name: 'Open Dispatch' })).toBeVisible();
  const linksMeetTouchTarget = await page
    .locator('.northline-header nav a')
    .evaluateAll((links) => links.every((link) => link.getBoundingClientRect().height >= 44));
  expect(linksMeetTouchTarget).toBe(true);
});

test('has no automatically detectable accessibility violations in the overview', async ({
  page,
}) => {
  await openNorthline(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
