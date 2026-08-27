import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

test.describe('Phase 5C uPlot Canvas adapter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('isolates Canvas semantics behind the shared persistent inspector', async ({ page }) => {
    const adapter = page.locator('.p5c-uplot');
    const host = adapter.locator('.p5c-uplot-host');
    await expect(host).toHaveAttribute('aria-hidden', 'true');
    await expect(host.locator('canvas')).toHaveCount(1);
    await expect(adapter).toHaveAttribute('data-threshold-id', 'caution-threshold');
    await expect(adapter).toHaveAttribute('data-annotation-id', 'routing-intervention');
    await expect(adapter).toHaveAttribute('data-rendered-series-count', '4');

    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Review queue');
    await adapter.getByRole('button', { name: 'Next sample' }).click();
    await expect(adapter.locator('[data-inspector-value]')).toHaveText('39 items');
    await adapter.getByRole('button', { name: 'Next series' }).click();
    await expect(adapter.locator('[data-inspector-series]')).toHaveText('Intake queue');
  });

  test('shares series visibility and supports persistent pointer selection', async ({ page }) => {
    const adapter = page.locator('.p5c-uplot');
    await adapter.getByRole('checkbox', { name: 'Intake queue' }).uncheck();
    await expect(adapter).toHaveAttribute(
      'data-visible-series-ids',
      'review classification dispatch',
    );

    const overlay = adapter.locator('.u-over');
    const bounds = await overlay.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.click(bounds!.x + bounds!.width * 0.75, bounds!.y + bounds!.height * 0.25);
    await expect(adapter.locator('[data-inspector-time]')).not.toHaveText(
      '2026-08-18 00:00:00 UTC',
    );
  });

  test('resizes without overflow and has no detectable accessibility violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    const adapter = page.locator('.p5c-uplot');
    await expect(adapter.locator('.uplot')).toBeVisible();
    const contained = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(contained).toBe(true);
    const results = await new AxeBuilder({ page }).include('.p5c-uplot').analyze();
    expect(results.violations).toEqual([]);
  });
});
