import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

test.describe('Phase 5C D3-assisted SVG adapter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('keeps authored SVG non-semantic behind the shared persistent inspector', async ({
    page,
  }) => {
    const adapter = page.locator('.p5c-d3');
    const graphic = adapter.locator('.p5c-visual svg');
    await expect(graphic).toHaveAttribute('aria-hidden', 'true');
    await expect(graphic).toHaveAttribute('focusable', 'false');
    await expect(adapter.locator('.p5c-threshold')).toHaveCount(1);
    await expect(adapter.locator('.p5c-annotation')).toHaveCount(1);
    await expect(adapter.locator('[data-series-id]')).toHaveCount(4);

    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Review queue');
    await adapter.getByRole('button', { name: 'Next sample' }).click();
    await expect(adapter.locator('[data-inspector-value]')).toHaveText('39 items');
    await adapter.getByRole('button', { name: 'Next series' }).click();
    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Intake queue');
  });

  test('shares visibility controls and supports persistent SVG pointer selection', async ({
    page,
  }) => {
    const adapter = page.locator('.p5c-d3');
    await adapter.getByRole('checkbox', { name: 'Intake queue' }).uncheck();
    await expect(adapter.locator('[data-series-id="intake"]')).toBeHidden();

    const graphic = adapter.locator('.p5c-visual svg');
    const clientPoint = await graphic.evaluate((svg) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) throw new Error('P5C_TEST_SVG_MATRIX: SVG has no screen transform.');
      const point = new DOMPoint(752, 188).matrixTransform(matrix);
      return { x: point.x, y: point.y };
    });
    await page.mouse.click(clientPoint.x, clientPoint.y);
    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Review queue');
    await expect(adapter.locator('[data-inspector-time]')).not.toHaveText(
      '2026-08-18 00:00:00 UTC',
    );
  });

  test('contains at narrow width and has no detectable accessibility violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const adapter = page.locator('.p5c-d3');
    await expect(adapter.locator('.p5c-visual svg')).toBeVisible();
    const contained = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(contained).toBe(true);
    const results = await new AxeBuilder({ page }).include('.p5c-d3').analyze();
    expect(results.violations).toEqual([]);
  });
});
