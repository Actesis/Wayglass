import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const harborBaseUrl = 'http://127.0.0.1:6105';

async function openHarbor(
  page: import('@playwright/test').Page,
  path = '/',
  parameters: Record<string, string> = {},
) {
  const query = new URLSearchParams({
    scenario: 'stale-evidence',
    theme: 'wayglass-dark',
    density: 'compact',
    ...parameters,
  });
  await page.goto(`${harborBaseUrl}${path}?${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-panel') !== undefined &&
      document.querySelector('main')?.getAttribute('data-route') !== null,
  );
}

test('presents four separated supervision functions and one honest decision answer', async ({
  page,
}) => {
  await openHarbor(page);
  await expect(page.getByRole('heading', { name: 'Supervision overview', level: 1 })).toBeVisible();
  const functions = page.locator('[data-function]');
  await expect(functions).toHaveCount(4);
  await expect(functions.nth(0)).toHaveAttribute('data-function', 'work-intake');
  await expect(functions.nth(1)).toHaveAttribute('data-function', 'execution');
  await expect(functions.nth(2)).toHaveAttribute('data-function', 'review-approval');
  await expect(functions.nth(3)).toHaveAttribute('data-function', 'outcome-recovery');
  await expect(page.getByText('1 task needs a human decision.')).toBeVisible();
  await expect(
    page.getByText(/test evidence is stale.*target branch is not merged/).first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-function="review-approval"] wg-status-indicator'),
  ).toHaveAttribute('knowledge', 'stale');
  await expect(page.locator('.harbor-announcement[aria-live="polite"]')).toHaveCount(1);
});

test('keeps the review consequence discoverable from a peer function', async ({ page }) => {
  await openHarbor(page, '/functions/execution');
  await expect(page.getByRole('heading', { name: 'Execution', level: 1 })).toBeVisible();
  const selectors = page.getByRole('navigation', { name: 'Supervision functions' });
  await expect(selectors.getByRole('link')).toHaveCount(4);
  await expect(selectors.getByRole('link', { name: /Execution/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('complementary', { name: 'Review decision consequence' }),
  ).toContainText('HL-317 has not been merged');
  await expect(page.locator('[data-function]')).toHaveCount(1);
  await page.getByRole('link', { name: 'Open Review and approval' }).click();
  await expect(page).toHaveURL(/\/functions\/review-approval/);
  await expect(page.getByRole('heading', { name: 'Review and approval', level: 1 })).toBeVisible();
});

test('keeps proposal, evidence, confidence, activity, and confirmed merge truth separate', async ({
  page,
}) => {
  await openHarbor(page, '/tasks/HL-317');
  await expect(page.locator('wg-key-value[label="Repository"]')).toHaveAttribute(
    'value',
    'harbor-lab/dependency-sentinel',
  );
  await expect(page.locator('wg-key-value[label="Evidence source"]')).toHaveAttribute(
    'knowledge',
    'stale',
  );
  await expect(page.locator('wg-key-value[label="Outcome confidence"]')).toHaveAttribute(
    'value',
    'high',
  );
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
  await expect(page.locator('wg-key-value[label="Task activity"]')).toHaveAttribute(
    'value',
    'waiting',
  );
  await expect(page.locator('wg-key-value[label="Task state"]')).toHaveAttribute(
    'value',
    'blocked',
  );
});

test('does not convert an unavailable worker into a task or merge result', async ({ page }) => {
  await openHarbor(page, '/functions/execution', { scenario: 'unavailable' });
  await expect(page.getByText('Execution worker unavailable')).toBeVisible();
  await expect(page.getByText('1 decision required')).toBeVisible();
  await page.getByRole('link', { name: 'Open Review and approval' }).click();
  await page
    .getByLabel('Review and approval')
    .getByRole('link', { name: 'Inspect HL-317' })
    .click();
  await expect(page.locator('wg-key-value[label="Confirmed merge state"]')).toHaveAttribute(
    'value',
    'Not merged',
  );
});

test('shows no fabricated decision or outcome during initial loading', async ({ page }) => {
  await openHarbor(page, '/', { scenario: 'initial-loading' });
  await expect(page.getByText('Waiting for confirmed task records.')).toBeVisible();
  await expect(page.getByText('No approval or merge result is shown yet.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Inspect HL-317' })).toHaveCount(0);
  await expect(page.locator('wg-metric[loading]')).toHaveCount(4);
});

test('contains the phone overview and passes automated accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openHarbor(page);
  await expect(page.locator('[data-function]')).toHaveCount(4);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(
    page
      .getByLabel('Human decisions', { exact: true })
      .getByRole('link', { name: 'Inspect HL-317' }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
