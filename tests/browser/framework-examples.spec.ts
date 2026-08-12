import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const examples = [
  { kind: 'vanilla', path: '/examples/vanilla/' },
  { kind: 'react', path: '/examples/react/' },
] as const;

async function openExample(page: Page, path: string, query = ''): Promise<void> {
  await page.goto(`${path}${query}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-data-table') !== undefined &&
      customElements.get('wg-tabs') !== undefined &&
      document.querySelector('[data-example]') !== null,
  );
}

for (const example of examples) {
  test.describe(`${example.kind} Operational Activity example`, () => {
    test('renders the same three-function overview from production components', async ({
      page,
    }) => {
      await openExample(page, example.path);
      await expect(page.locator(`[data-example="${example.kind}"]`)).toBeVisible();
      const functions = page.locator('.wg-operational-overview > [data-function]');
      await expect(functions).toHaveCount(3);
      await expect(functions.nth(0)).toHaveAttribute('data-function', 'intake');
      await expect(functions.nth(1)).toHaveAttribute('data-function', 'processing');
      await expect(functions.nth(2)).toHaveAttribute('data-function', 'delivery');
      for (const name of ['Intake', 'Processing', 'Delivery']) {
        await expect(page.getByRole('region', { name, exact: true })).toBeVisible();
      }
      await expect(page.locator('wg-event-record')).toHaveCount(4);
      await expect(page.locator('tbody tr[data-record-key]')).toHaveCount(4);
      await expect(page.locator('[data-announcement-owner][aria-live="polite"]')).toHaveCount(1);
      await expect(page.locator('[aria-live]')).toHaveCount(1);
    });

    test('runs shared filter, sort, and request transitions without replacing retained nodes', async ({
      page,
    }) => {
      await openExample(page, example.path);
      await page.locator('#operational-intake-query').fill('Central');
      await page.getByRole('button', { name: 'Apply Intake event filters' }).click();
      await expect(page.locator('wg-event-record')).toHaveCount(2);
      await expect(page.locator('[data-announcement-owner]')).toHaveText(
        'Intake filters applied. 2 records shown.',
      );

      const firstRow = page.locator('tbody tr[data-record-key]').first();
      await firstRow.evaluate((row) => {
        (window as Window & { retainedExampleRow?: Element }).retainedExampleRow = row;
      });
      const sort = page.getByRole('button', { name: 'Updated, newest first' });
      await sort.focus();
      await sort.press('Enter');
      await expect(page.getByRole('button', { name: 'Updated, oldest first' })).toBeFocused();
      expect(
        await page
          .locator('tbody tr[data-record-key]')
          .last()
          .evaluate(
            (row) =>
              row === (window as Window & { retainedExampleRow?: Element }).retainedExampleRow,
          ),
      ).toBe(true);

      await page.getByRole('button', { name: 'Request Processing intake pause' }).click();
      await expect(page.locator('[data-processing-request-status]')).toHaveText(
        'Pause requested. Confirmed Processing intake remains open.',
      );
    });

    test('renders one focused Function Deck with consequential state retained', async ({
      page,
    }) => {
      await openExample(page, example.path, '?composition=focused&selected=processing');
      await expect(
        page.getByRole('tablist', { name: 'Operational Activity functions' }),
      ).toHaveCount(1);
      await expect(page.getByRole('tab')).toHaveCount(3);
      await expect(page.locator('wg-tab[value="processing"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.getByRole('button', { name: 'Open Delivery response' })).toBeVisible();
      await page.getByRole('button', { name: 'Open Delivery response' }).click();
      await expect(page.locator('wg-tab[value="delivery"]')).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.locator('wg-tab[value="delivery"]')).toBeFocused();
      await expect(page.locator('[data-operational-composition="focused"]')).toHaveCount(1);
      await expect(page.locator('.wg-operational-overview')).toHaveCount(0);
    });

    test('honors deterministic loading and live-update routes', async ({ page }) => {
      await openExample(page, example.path, '?scenario=initial-loading');
      await expect(page.locator('wg-progress')).toHaveCount(3);
      await expect(page.locator('wg-event-record, tbody tr[data-record-key]')).toHaveCount(0);

      await openExample(page, example.path, '?scenario=live-update');
      await expect(page.locator('wg-event-record')).toHaveCount(5);
      await expect(page.locator('tbody tr[data-record-key]')).toHaveCount(5);
      await expect(page.locator('[data-announcement-owner]')).toBeEmpty();
    });

    test('contains the phone composition and passes automated accessibility checks', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await openExample(
        page,
        example.path,
        '?composition=focused&width=phone&theme=wayglass-light&density=comfortable&selected=intake',
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test('renders without Custom Element construction errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await openExample(page, example.path);
      expect(errors).toEqual([]);
    });
  });
}

test('Vanilla and React expose equivalent Operational Activity semantics', async ({ page }) => {
  const snapshots: Array<{
    functions: string[];
    tabs: string[];
    events: string[];
    rows: string[];
  }> = [];
  for (const example of examples) {
    await openExample(page, example.path, '?composition=focused&selected=delivery');
    snapshots.push(
      await page.evaluate(() => ({
        functions: [...document.querySelectorAll('[data-function]')].map(
          (element) => (element as HTMLElement).dataset.function ?? '',
        ),
        tabs: [...document.querySelectorAll('wg-tab')].map(
          (element) => element.getAttribute('value') ?? '',
        ),
        events: [...document.querySelectorAll('wg-event-record')].map(
          (element) => element.getAttribute('data-record-key') ?? '',
        ),
        rows: [...document.querySelectorAll('tbody tr[data-record-key]')].map(
          (element) => element.getAttribute('data-record-key') ?? '',
        ),
      })),
    );
  }
  expect(snapshots[1]).toEqual(snapshots[0]);
});
