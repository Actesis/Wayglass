import { expect, test } from '@playwright/test';

async function openFunctionDeck(page: import('@playwright/test').Page) {
  await page.goto('/tests/browser/function-deck/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-tabs') !== undefined &&
      document.querySelector('wg-tabs')?.getAttribute('value') === 'access',
  );
}

test.beforeEach(async ({ page }) => {
  await openFunctionDeck(page);
});

test('composes one focused function surface directly from tabs', async ({ page }) => {
  await expect(page.getByRole('tablist', { name: 'Operational functions' })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Access Positive · Confirmed/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('region', { name: 'Access', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Communications', exact: true })).toBeHidden();
  await expect(page.getByRole('region', { name: 'Processing', exact: true })).toBeHidden();

  expect(await page.evaluate(() => customElements.get('wg-function-deck') !== undefined)).toBe(
    false,
  );
  await expect(page.locator('wg-function-deck')).toHaveCount(0);
});

test('uses wg-tabs as the only selection owner', async ({ page }) => {
  const tabs = page.locator('wg-tabs');
  const communications = page.getByRole('tab', {
    name: /Communications Caution · Data stale · Retry available/,
  });

  await communications.click();

  await expect(tabs).toHaveAttribute('value', 'communications');
  await expect(communications).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('region', { name: 'Communications', exact: true })).toBeVisible();
  await expect(page.getByText('Selected function: Communications', { exact: true })).toBeVisible();
});

test('does not repurpose elbow geometry as a nested selector', async ({ page }) => {
  await expect(page.locator('.wg-function-deck wg-elbow')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Access', level: 2 })).toBeVisible();
  await expect(page.locator('.wg-function-deck [aria-selected]')).toHaveCount(3);
  await expect(page.locator('.wg-function-deck [aria-selected]:not(wg-tab)')).toHaveCount(0);
});
