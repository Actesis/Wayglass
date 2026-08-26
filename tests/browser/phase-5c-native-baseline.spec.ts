import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

test.describe('Phase 5C native baseline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('keeps the graphic non-semantic and exact inspection persistent', async ({ page }) => {
    const graphic = page.locator('.p5c-visual svg');
    await expect(graphic).toHaveAttribute('aria-hidden', 'true');
    await expect(graphic).toHaveAttribute('focusable', 'false');
    await expect(page.locator('.p5c-threshold')).toHaveCount(1);
    await expect(page.locator('.p5c-annotation')).toHaveCount(1);
    await expect(page.locator('[data-series-id]')).toHaveCount(4);

    await expect(page.locator('[data-inspector-series]')).toHaveText('Review queue');
    await page.getByRole('button', { name: 'Next sample' }).click();
    await expect(page.locator('[data-inspector-time]')).toHaveText('2026-08-18 00:00 UTC');
    await expect(page.locator('[data-inspector-value]')).toHaveText('39 items');
    await page.getByRole('button', { name: 'Next series' }).click();
    await expect(page.locator('[data-inspector-series]')).toHaveText('Intake queue');

    const bounds = await graphic.boundingBox();
    expect(bounds).not.toBeNull();
    await page
      .locator('[data-series-id="review"] .p5c-hit-target')
      .dispatchEvent('click', { clientX: bounds!.x + bounds!.width * 0.75 });
    await expect(page.locator('[data-inspector-series]')).toHaveText('Review queue');
    await expect(page.locator('[data-inspector-time]')).not.toHaveText('2026-08-18 00:00 UTC');
  });

  test('preserves native visibility controls and the complete exact table', async ({ page }) => {
    const intake = page.getByRole('checkbox', { name: 'Intake queue' });
    await intake.uncheck();
    await expect(page.locator('[data-series-id="intake"]')).toHaveAttribute('hidden', '');
    await expect(page.locator('[data-series-id="intake"]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Next series' })).toBeEnabled();

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
    const results = await new AxeBuilder({ page }).include('.p5c-proof').analyze();
    expect(results.violations).toEqual([]);
  });
});
