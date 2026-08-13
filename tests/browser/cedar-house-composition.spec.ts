import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const cedarBaseUrl = 'http://127.0.0.1:6103';

async function openCedarHouse(
  page: import('@playwright/test').Page,
  path = '/',
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({
    scenario: 'steady',
    theme: 'wayglass-dark',
    density: 'comfortable',
    ...parameters,
  });
  await page.goto(`${cedarBaseUrl}${path}?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-panel') !== undefined &&
      document.querySelectorAll('[data-function]').length > 0,
  );
}

test('presents five separated household functions from one application state', async ({ page }) => {
  await openCedarHouse(page);

  await expect(page.getByRole('heading', { name: 'Whole-home overview', level: 1 })).toBeVisible();
  const functions = page.locator('[data-function]');
  await expect(functions).toHaveCount(5);
  await expect(functions.nth(0)).toHaveAttribute('data-function', 'comfort');
  await expect(functions.nth(1)).toHaveAttribute('data-function', 'access');
  await expect(functions.nth(2)).toHaveAttribute('data-function', 'lighting');
  await expect(functions.nth(3)).toHaveAttribute('data-function', 'energy');
  await expect(functions.nth(4)).toHaveAttribute('data-function', 'maintenance');

  await expect(page.getByText('One item needs attention.')).toBeVisible();
  await expect(page.getByText(/HVAC return filter is due/)).toBeVisible();
  await expect(
    page.locator('wg-status-indicator[label="Air handler available"]').first(),
  ).toHaveAttribute('condition', 'positive');
  await expect(page.locator('.cedar-announcement[aria-live="polite"]')).toHaveCount(1);
});

test('keeps domain values independent from condition', async ({ page }) => {
  await openCedarHouse(page, '/', { scenario: 'secure-partial' });

  const garage = page.locator('wg-boolean-value[label="Garage door"]');
  await expect(garage).toHaveAttribute('not-asserted-label', 'Open');
  await expect(garage).not.toHaveAttribute('asserted');
  await expect(page.locator('.cedar-readiness-copy')).toContainText('Garage door is open');

  const porch = page.locator('wg-boolean-value[label="Porch light"]');
  await expect(porch).toHaveAttribute('not-asserted-label', 'Off');
  await expect(porch).not.toHaveAttribute('asserted');
  await expect(page.locator('[data-function="lighting"] wg-status-indicator')).toHaveAttribute(
    'condition',
    'neutral',
  );
});

test('routes to one focused function while retaining peer summaries', async ({ page }) => {
  await openCedarHouse(page, '/functions/access');

  await expect(page.getByRole('heading', { name: 'Access and safety', level: 1 })).toBeVisible();
  const selectorNavigation = page.getByRole('navigation', { name: 'Household functions' });
  await expect(selectorNavigation.getByRole('link')).toHaveCount(5);
  await expect(selectorNavigation.getByRole('link', { name: /Access and safety/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(selectorNavigation.getByText('Filter due · Equipment available')).toBeVisible();
  await expect(page.locator('[data-function]')).toHaveCount(1);
  await expect(page.locator('[data-function]')).toHaveAttribute('data-function', 'access');

  await selectorNavigation.getByRole('link', { name: /Maintenance/ }).click();
  await expect(page).toHaveURL(/\/functions\/maintenance/);
  await expect(page.getByRole('heading', { name: 'Maintenance', level: 1 })).toBeVisible();
  await expect(page).toHaveTitle('Maintenance — Cedar House');
});

test('retains scenario options through native route links and browser history', async ({
  page,
}) => {
  await openCedarHouse(page, '/', { scenario: 'stale', theme: 'wayglass-light', dir: 'rtl' });

  await page.getByRole('link', { name: 'Open Comfort and air' }).click();
  await expect(page).toHaveURL(/\/functions\/comfort\?.*scenario=stale/);
  await expect(page.locator('wg-theme-provider')).toHaveAttribute('theme', 'wayglass-light');
  await expect(page.locator('wg-theme-provider')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('wg-key-value[label="Air quality reading"]')).toHaveAttribute(
    'knowledge',
    'stale',
  );

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Whole-home overview', level: 1 })).toBeVisible();
});

test('contains the phone overview and keeps all functions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCedarHouse(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link', { name: 'Open Maintenance' })).toBeVisible();

  const linksMeetTouchTarget = await page
    .locator('.cedar-header nav a')
    .evaluateAll((links) => links.every((link) => link.getBoundingClientRect().height >= 44));
  expect(linksMeetTouchTarget).toBe(true);
});

test('has no automatically detectable accessibility violations in the steady overview', async ({
  page,
}) => {
  await openCedarHouse(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
