import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

test.describe('Phase 5C native baseline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('keeps the graphic non-semantic and exact inspection persistent', async ({ page }) => {
    const adapter = page.locator('.p5c-native');
    const graphic = adapter.locator('.p5c-visual svg');
    await expect(graphic).toHaveAttribute('aria-hidden', 'true');
    await expect(graphic).toHaveAttribute('focusable', 'false');
    await expect(adapter.locator('.p5c-threshold')).toHaveCount(1);
    await expect(adapter.locator('.p5c-annotation')).toHaveCount(1);
    await expect(adapter.locator('[data-series-id]')).toHaveCount(4);

    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Review queue');
    await adapter.getByRole('button', { name: 'Next sample' }).click();
    await expect(adapter.locator('[data-inspector-time]')).toHaveText('2026-08-18 00:00:30 UTC');
    await expect(adapter.locator('[data-inspector-value]')).toHaveText('39 items');
    await adapter.getByRole('button', { name: 'Next series' }).click();
    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Intake queue');

    await adapter.getByRole('button', { name: 'Previous series' }).click();
    await graphic.scrollIntoViewIfNeeded();
    const clientPoint = await graphic.evaluate((svg) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) throw new Error('P5C_TEST_SVG_MATRIX: SVG has no screen transform.');
      const point = new DOMPoint(752, 188).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
    await page.mouse.click(clientPoint.x, clientPoint.y);
    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Review queue');
    await expect(adapter.locator('[data-inspector-time]')).not.toHaveText(
      '2026-08-18 00:00:30 UTC',
    );
  });

  test('preserves native visibility controls and the complete exact table', async ({ page }) => {
    const adapter = page.locator('.p5c-native');
    const intake = adapter.getByRole('checkbox', { name: 'Intake queue' });
    await intake.uncheck();
    await expect(adapter.locator('[data-series-id="intake"]')).toHaveAttribute('hidden', '');
    await expect(adapter.locator('[data-series-id="intake"]')).toBeHidden();
    await expect(adapter.getByRole('button', { name: 'Next series' })).toBeEnabled();

    await page.getByText('Inspect all exact queue observations').click();
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.locator('tbody tr')).toHaveCount(2_880);
    await expect(table.locator('thead th')).toHaveCount(5);
  });

  test('contains at narrow width and has no detectable accessibility violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const contained = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(contained).toBe(true);
    const results = await new AxeBuilder({ page }).include('.p5c-native').analyze();
    expect(results.violations).toEqual([]);
  });
});
