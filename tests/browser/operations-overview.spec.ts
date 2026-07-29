import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openOverview(
  page: import('@playwright/test').Page,
  parameters = 'width=desktop&theme=wayglass-dark',
) {
  await page.goto(`/tests/browser/operations-overview/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-value-tile') !== undefined &&
      document.querySelectorAll('[data-function]').length === 3,
  );
}

test('keeps three named function regions simultaneously visible', async ({ page }) => {
  await openOverview(page);

  for (const name of ['Access', 'Communications', 'Processing']) {
    await expect(page.getByRole('region', { name, exact: true })).toBeVisible();
  }

  const order = await page
    .locator('[data-function]')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('data-function')));
  expect(order).toEqual(['access', 'communications', 'processing']);
});

test('keeps controls inside the function they affect', async ({ page }) => {
  await openOverview(page);

  const communications = page.locator('[data-function="communications"]');
  const processing = page.locator('[data-function="processing"]');

  await expect(
    communications.getByRole('button', { name: 'Retry Communications primary link' }),
  ).toBeVisible();
  await expect(processing.getByRole('button', { name: 'Pause Processing intake' })).toBeVisible();
  await expect(processing.getByText('Confirmed state remains Open')).toBeVisible();
});

test('renders independent value, condition, knowledge, and activity combinations', async ({
  page,
}) => {
  await openOverview(page);

  const communications = page.locator('[data-function="communications"]');
  await expect(
    communications.locator('wg-boolean-value[label="Connection"]').getByText('Connected'),
  ).toBeVisible();
  await expect(communications.getByText('Caution', { exact: true }).first()).toBeVisible();
  await expect(communications.getByText('Data stale', { exact: true }).first()).toBeVisible();
  await expect(communications.getByText('Unavailable', { exact: true }).first()).toBeVisible();
  await expect(communications.getByText('Current knowledge: Unavailable')).toBeVisible();

  const processing = page.locator('[data-function="processing"]');
  await expect(processing.getByText('Open', { exact: true })).toBeVisible();
  await expect(processing.getByText('Critical', { exact: true }).first()).toBeVisible();
  await expect(processing.getByText('Pending', { exact: true }).first()).toBeVisible();
});

test('recomposes functions without horizontal overflow at phone width', async ({ page }) => {
  await openOverview(page, 'width=phone&theme=wayglass-dark');

  const positions = await page.locator('[data-function]').evaluateAll((elements) =>
    elements.map((element) => ({
      left: element.getBoundingClientRect().left,
      top: element.getBoundingClientRect().top,
    })),
  );
  expect(positions[1]!.top).toBeGreaterThan(positions[0]!.top);
  expect(positions[2]!.top).toBeGreaterThan(positions[1]!.top);
  expect(positions[0]!.left).toBe(positions[1]!.left);

  const overflow = await page
    .locator('[data-overview-width="phone"]')
    .evaluate((element) => element.scrollWidth - element.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('uses prominent signals at wall-panel width', async ({ page }) => {
  await openOverview(page, 'width=wall&theme=wayglass-dark');

  const status = page.locator('[data-function="access"]').locator('wg-status-indicator').first();
  const booleanValue = page.locator('[data-function="access"]').locator('wg-boolean-value');
  await expect(status).toHaveAttribute('size', 'prominent');
  await expect(booleanValue).toHaveAttribute('presentation', 'field');
});

test('covers retained, loading, positive false, and rejected request states', async ({ page }) => {
  await page.goto('/tests/browser/operations-overview/?fixture=states&theme=wayglass-light');
  await page.waitForFunction(() => customElements.get('wg-value-tile') !== undefined);

  await expect(
    page
      .locator('wg-value-tile[label="Positive not asserted"] wg-boolean-value')
      .getByText('Standby'),
  ).toBeVisible();
  await expect(
    page
      .locator('wg-value-tile[label="Unavailable retained value"] wg-boolean-value')
      .getByText('Approved'),
  ).toBeVisible();
  await expect(
    page
      .locator('wg-value-tile[label="Loading before known value"] wg-metric')
      .getByText('Loading'),
  ).toBeVisible();
  await expect(page.locator('wg-value-tile[label="Rejected request"]')).toContainText(
    'Confirmed value remains Connected',
  );
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes accessibility checks in ${theme}`, async ({ page }) => {
    await openOverview(page, `width=desktop&theme=${theme}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
