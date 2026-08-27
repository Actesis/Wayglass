import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
}

test.describe('Phase 5C visual adaptation', () => {
  test('contains every official theme and density at phone and wall widths', async ({ page }) => {
    const densityGap: Record<string, number> = {};
    const themeBackgrounds: Record<string, string> = {};

    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ['wayglass-dark', 'wayglass-light']) {
        for (const density of ['compact', 'comfortable']) {
          await page.goto(`${proofPath}?theme=${theme}&density=${density}`);
          await settle(page);
          await expect(page.locator('body')).toHaveAttribute('data-wg-theme', theme);
          await expect(page.locator('body')).toHaveAttribute('data-wg-density', density);
          expect(await overflow(page)).toBeLessThanOrEqual(1);
          await expect(page.locator('.p5c-adapter')).toHaveCount(3);
          await expect(page.locator('.p5c-inspector')).toHaveCount(3);

          if (width === 1440) {
            const presentation = await page.locator('.p5c-proof').evaluate((element) => {
              const proofStyle = getComputedStyle(element);
              const panelStyle = getComputedStyle(element.querySelector('.p5c-adapter')!);
              return {
                background: proofStyle.backgroundColor,
                panelGap: Number.parseFloat(panelStyle.rowGap),
              };
            });
            densityGap[density] = presentation.panelGap;
            themeBackgrounds[theme] = presentation.background;
          }
        }
      }
    }

    expect(densityGap.comfortable).toBeGreaterThan(densityGap.compact!);
    expect(themeBackgrounds['wayglass-dark']).not.toBe(themeBackgrounds['wayglass-light']);
  });

  test('contains long localized text at 320 pixels, 200 percent text, and RTL', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    for (const theme of ['wayglass-dark', 'wayglass-light']) {
      await page.goto(`${proofPath}?theme=${theme}&density=comfortable&dir=rtl&longLabels=true`);
      await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });
      await settle(page);

      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await expect(
        page.getByText('Warteschlange für ausführliche manuelle Überprüfung').first(),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Next sample' }).first()).toBeVisible();
      await expect(page.getByText(/ausdrücklich gekennzeichnete Wissenslücken/)).toBeVisible();
      expect(await overflow(page)).toBeLessThanOrEqual(1);

      const directions = await page.evaluate(() => ({
        document: getComputedStyle(document.documentElement).direction,
        context: getComputedStyle(document.querySelector('.p5c-context')!).direction,
        timeAxis: getComputedStyle(document.querySelector('.p5c-visual')!).direction,
        formattedValueBidi: getComputedStyle(document.querySelector('.p5c-context dd')!)
          .unicodeBidi,
      }));
      expect(directions).toEqual({
        document: 'rtl',
        context: 'rtl',
        timeAxis: 'ltr',
        formattedValueBidi: 'plaintext',
      });
    }
  });

  test('retains non-color distinctions in forced colors, grayscale, and reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.goto(
      `${proofPath}?theme=wayglass-light&density=comfortable&grayscale=true&longLabels=true`,
    );
    await settle(page);

    const adaptation = await page.evaluate(() => {
      const native = document.querySelector('.p5c-native')!;
      const seriesPatterns = [0, 1, 2, 3].map(
        (index) =>
          getComputedStyle(native.querySelector(`[data-series-index="${index}"] .p5c-series-line`)!)
            .strokeDasharray,
      );
      const legendPatterns = [0, 1, 2, 3].map(
        (index) =>
          getComputedStyle(
            native.querySelector(`.p5c-series-controls [data-series-index="${index}"]`)!,
            '::before',
          ).borderBlockStartStyle,
      );
      const moving = Array.from(document.querySelectorAll<HTMLElement>('.p5c-proof *')).filter(
        (element) => {
          const style = getComputedStyle(element);
          return (
            style.animationName !== 'none' ||
            style.transitionDuration.split(',').some((duration) => Number.parseFloat(duration) > 0)
          );
        },
      ).length;
      return {
        forcedColors: matchMedia('(forced-colors: active)').matches,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        filter: getComputedStyle(document.querySelector('.p5c-proof')!).filter,
        seriesPatterns,
        legendPatterns,
        thresholdPattern: getComputedStyle(native.querySelector('.p5c-threshold')!).strokeDasharray,
        annotationPattern: getComputedStyle(native.querySelector('.p5c-annotation')!)
          .strokeDasharray,
        moving,
      };
    });

    expect(adaptation.forcedColors).toBe(true);
    expect(adaptation.reducedMotion).toBe(true);
    expect(adaptation.filter).not.toBe('none');
    expect(new Set(adaptation.seriesPatterns).size).toBe(4);
    expect(adaptation.legendPatterns).toEqual(['solid', 'dashed', 'dotted', 'double']);
    expect(adaptation.thresholdPattern).not.toBe(adaptation.annotationPattern);
    expect(adaptation.moving).toBe(0);
    await expect(page.locator('.p5c-uplot canvas')).toBeVisible();
    await expect(page.locator('.p5c-uplot [data-inspector-value]')).toBeVisible();
    expect(await overflow(page)).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(results.violations).toEqual([]);
  });
});
