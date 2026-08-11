import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'states' | 'envelope';

async function openDataTableStory(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
    direction?: 'ltr' | 'rtl';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
    direction: options.direction ?? 'ltr',
  });
  await page.goto(`/tests/browser/data-table-stories/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-data-table') !== undefined &&
      customElements.get('wg-scroll-region') !== undefined &&
      document.querySelector('wg-data-table')?.shadowRoot !== null,
  );
}

test('renders one native semantic table with authored state axes and row actions', async ({
  page,
}) => {
  await openDataTableStory(page);
  await expect(page.getByRole('table', { name: 'Operational review records' })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(5);
  await expect(page.getByRole('rowheader', { name: /Regional evidence review/ })).toBeVisible();
  await expect(page.getByText('Caution', { exact: true })).toBeVisible();
  await expect(page.getByText('Confirmed', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Idle', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('grid')).toHaveCount(0);
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('keeps sorting authored, preserves header focus, and reorders existing rows', async ({
  page,
}) => {
  await openDataTableStory(page);
  const firstRow = page.locator('#operational-review-table tbody tr').first();
  await firstRow.evaluate((row) => {
    (window as Window & { retainedFirstTableRow?: Element }).retainedFirstTableRow = row;
  });
  const sort = page.getByRole('button', { name: 'Updated, newest first' });
  await sort.focus();
  await sort.press('Enter');
  await expect(page.getByRole('button', { name: 'Updated, oldest first' })).toBeFocused();
  await expect(page.locator('#operational-review-table th[aria-sort]')).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  await expect(page.locator('#operational-review-table tbody tr').first()).toHaveAttribute(
    'data-record-id',
    'WG-1854',
  );
  expect(
    await page
      .locator('#operational-review-table tbody tr')
      .last()
      .evaluate(
        (row) =>
          row === (window as Window & { retainedFirstTableRow?: Element }).retainedFirstTableRow,
      ),
  ).toBe(true);
  await expect(page.getByText('4 records shown; sorted by oldest update.')).toBeVisible();
});

test('uses the accepted confirmation pattern for a consequential table action', async ({
  page,
}) => {
  await openDataTableStory(page);
  const remove = page.getByRole('button', { name: 'Remove authorization review WG-1854' });
  await remove.click();
  await expect(
    page.getByRole('dialog', { name: 'Remove authorization review WG-1854?' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep record' })).toBeFocused();
  await page.getByRole('button', { name: 'Keep record' }).click();
  await expect(remove).toBeFocused();
});

test('keeps loading, empty, retained stale, and unavailable states outside data rows', async ({
  page,
}) => {
  await openDataTableStory(page, { fixture: 'states', theme: 'wayglass-light' });
  await expect(page.getByText('Loading assignment records', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Matching review records' })).toBeVisible();
  await expect(page.locator('#data-table-empty tbody tr')).toHaveCount(0);
  await expect(page.getByText('No matching records')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Retained delivery records' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(page.getByText('Stale · last confirmed 12 minutes ago')).toBeVisible();
  await expect(page.getByText('External capacity records unavailable')).toBeVisible();
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('replaces twenty rows while retaining unaffected nodes and action focus', async ({ page }) => {
  await openDataTableStory(page, { fixture: 'envelope' });
  const rows = page.locator('#data-table-envelope tbody tr');
  await expect(rows).toHaveCount(25);
  await rows.first().evaluate((row) => {
    (window as Window & { retainedEnvelopeRow?: Element }).retainedEnvelopeRow = row;
  });
  const action = page.getByRole('button', { name: 'Apply next 20-record batch' });
  await action.focus();
  await action.press('Enter');
  await expect(action).toBeFocused();
  await expect(rows).toHaveCount(25);
  await expect(rows.nth(4)).toHaveAttribute('data-record-id', 'WG-105');
  await expect(rows.nth(5)).toHaveAttribute('data-record-id', 'WG-206');
  expect(
    await rows
      .first()
      .evaluate(
        (row) => row === (window as Window & { retainedEnvelopeRow?: Element }).retainedEnvelopeRow,
      ),
  ).toBe(true);
  await expect(
    page.getByText(
      '20 application-owned rows replaced; five retained rows and focus remained stable.',
    ),
  ).toBeVisible();
});

test('contains the wide table at 320 pixels and preserves the authored sticky header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openDataTableStory(page, {
    fixture: 'envelope',
    width: 'phone',
    direction: 'rtl',
  });
  const region = page.locator('#data-table-envelope wg-scroll-region');
  await expect(region).toHaveAttribute('data-overflowing');
  await expect(region).toHaveAttribute('role', 'region');
  await expect(region).toHaveAttribute('aria-label', 'Wide operational reference table');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    await page
      .locator('#data-table-envelope thead th')
      .first()
      .evaluate((header) => getComputedStyle(header).position),
  ).toBe('sticky');
  await expect(page.getByRole('columnheader', { name: 'Record' })).toBeVisible();
});

for (const fixture of ['workspace', 'states', 'envelope'] as const) {
  for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
    test(`${fixture} passes accessibility checks in ${theme}`, async ({ page }) => {
      await openDataTableStory(page, { fixture, theme });
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
