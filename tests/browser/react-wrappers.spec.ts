import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/react-fixture/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-theme-provider') !== undefined &&
      customElements.get('wg-metric') !== undefined &&
      customElements.get('wg-button') !== undefined &&
      customElements.get('wg-value-tile') !== undefined,
  );
});

test('registers wrappers and assigns typed element properties', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('data-ref-tag', 'wg-button');
  await expect(page.locator('#react-metric')).toHaveJSProperty('condition', 'caution');
  await expect(page.locator('#react-metric')).toHaveJSProperty('knowledge', 'stale');
  await expect(page.locator('#react-metric').getByText('184')).toBeVisible();
});

test('forwards native events through React props', async ({ page }) => {
  await expect(page.locator('#activation-count')).toHaveText('0');
  await page.locator('#react-button').locator('button').click();
  await expect(page.locator('#activation-count')).toHaveText('1');
});

test('translates typed Custom Events to React callback props', async ({ page }) => {
  await page.locator('#switch-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-resolved-theme', 'wayglass-light');
});

test('preserves the production accessibility semantics', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
