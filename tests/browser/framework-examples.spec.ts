import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const examples = [
  {
    kind: 'vanilla',
    path: '/examples/vanilla/',
  },
  {
    kind: 'react',
    path: '/examples/react/',
  },
] as const;

for (const example of examples) {
  test.describe(`${example.kind} example`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(example.path);
      await page.waitForFunction(
        () =>
          customElements.get('wg-value-tile') !== undefined &&
          document.querySelectorAll('[data-function]').length === 3,
      );
    });

    test('uses production components for three named function regions', async ({ page }) => {
      await expect(page.locator(`[data-example="${example.kind}"]`)).toBeVisible();

      for (const name of ['Access', 'Communications', 'Processing']) {
        await expect(page.getByRole('region', { name, exact: true })).toBeVisible();
      }

      await expect(page.locator('wg-theme-provider')).toHaveAttribute('theme', 'system');
      await expect(page.locator('wg-value-tile')).toHaveCount(3);
    });

    test('keeps confirmed state separate when a retry is requested', async ({ page }) => {
      const communications = page.locator('[data-function="communications"]');
      const retry = communications.getByRole('button', {
        name: 'Retry Communications primary link',
      });

      await retry.click();

      await expect(communications.locator('wg-button')).toHaveAttribute('pending', '');
      await expect(
        communications.getByText('Retry requested; confirmed state remains Connected.', {
          exact: true,
        }),
      ).toBeVisible();
      await expect(communications.getByText('Connected', { exact: true })).toBeVisible();
    });

    test('renders without Custom Element construction errors', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.reload();
      await page.waitForFunction(() => document.querySelectorAll('[data-function]').length === 3);

      expect(errors).toEqual([]);
    });

    test('recomposes without horizontal overflow at phone width', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });

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
        .locator(`[data-example="${example.kind}"]`)
        .evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test('passes automated accessibility checks', async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
