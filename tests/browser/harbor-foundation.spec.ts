import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const harborUrl = 'http://127.0.0.1:6105';

test('orients the lead without conflating activity, evidence, confidence, or merge truth', async ({
  page,
}) => {
  await page.goto(`${harborUrl}/?scenario=stale-evidence`);
  await expect(page).toHaveTitle('Supervision overview — Harbor Lab');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Supervision overview');
  await expect(page.getByRole('region', { name: 'Supervision functions' })).toContainText(
    'Review and approval',
  );
  const decision = page.getByText('Agent activity: waiting. Evidence: stale, confidence high.');
  await expect(decision).toContainText('Confirmed merge state: not-merged');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('navigates native task and function routes with browser history', async ({ page }) => {
  await page.goto(`${harborUrl}/`);
  await page.getByRole('link', { name: 'HL-317' }).click();
  await expect(page).toHaveURL(/\/tasks\/HL-317/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Task HL-317');
  await page.getByRole('link', { name: 'Review and approval' }).click();
  await expect(page).toHaveURL(/\/functions\/review-approval/);
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Task HL-317');
});

test('recomposes the foundation at phone width without hiding decision context', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(`${harborUrl}/?scenario=stale-evidence&fixture=maximum`);
  await expect(
    page.getByRole('region', { name: 'Supervision functions' }).locator('article'),
  ).toHaveCount(4);
  await expect(page.getByText('Confirmed merge state: not-merged')).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  for (const link of await page.getByRole('navigation').getByRole('link').all()) {
    expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});
