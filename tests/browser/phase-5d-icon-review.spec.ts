import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5d-icon-tooling/generated/review-index.html';

test.describe('Phase 5D icon review index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(proofPath);
  });

  test('accounts for every fixture, size, theme, and accessible-use case', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Icon review index' })).toBeVisible();
    await expect(page.locator('.theme')).toHaveCount(2);
    await expect(page.locator('.icon-card')).toHaveCount(10);
    await expect(page.locator('.icon-card .sample svg')).toHaveCount(60);
    await expect(page.locator('.icon-card .sample svg:not([aria-hidden="true"])')).toHaveCount(0);
    await expect(page.locator('.icon-card .sample svg:not([focusable="false"])')).toHaveCount(0);

    const sizes = await page
      .locator('.theme--light .icon-card[data-icon="close"]')
      .evaluate((card) =>
        Object.fromEntries(
          ['compact', 'standard', 'prominent'].map((size) => {
            const box = card
              .querySelector<SVGElement>(`.sample[data-size="${size}"] svg`)!
              .getBoundingClientRect();
            return [size, { width: box.width, height: box.height }];
          }),
        ),
      );
    expect(sizes).toEqual({
      compact: { width: 16, height: 16 },
      standard: { width: 24, height: 24 },
      prominent: { width: 40, height: 40 },
    });

    const geometry = await page.locator('.theme--light .icon-card').evaluateAll((cards) =>
      cards.map((card) => {
        const svg = card.querySelector<SVGGraphicsElement>('[data-size="prominent"] svg')!;
        const box = svg.getBBox();
        return {
          id: card.getAttribute('data-icon'),
          insideViewBox:
            box.width > 0 &&
            box.height > 0 &&
            box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= 24 &&
            box.y + box.height <= 24,
        };
      }),
    );
    expect(geometry).toEqual([
      { id: 'arrow-inline-start', insideViewBox: true },
      { id: 'close', insideViewBox: true },
      { id: 'menu', insideViewBox: true },
      { id: 'more', insideViewBox: true },
      { id: 'refresh', insideViewBox: true },
    ]);

    const namedReference = page.locator('.named-reference svg');
    await expect(namedReference).toHaveAttribute('role', 'img');
    await expect(namedReference).toHaveAttribute(
      'aria-labelledby',
      'named-title named-description',
    );
    await expect(page.getByRole('img', { name: 'Inline-start arrow reference' })).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Preview unavailable for requested icon' }),
    ).toBeVisible();

    for (const name of ['Refresh records', 'Open navigation', 'Close review']) {
      await expect(page.getByRole('button', { name })).toHaveCount(2);
    }
    await expect(page.locator('.controls button svg:not([aria-hidden="true"])')).toHaveCount(0);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('mirrors only the declared logical-direction fixture', async ({ page }) => {
    const transforms = await page.locator('.theme--light').evaluate((theme) => {
      const transform = (icon: string, direction: string) =>
        getComputedStyle(
          theme.querySelector(`.icon-card[data-icon="${icon}"] [dir="${direction}"] svg`)!,
        ).transform;
      return {
        arrowLtr: transform('arrow-inline-start', 'ltr'),
        arrowRtl: transform('arrow-inline-start', 'rtl'),
        closeLtr: transform('close', 'ltr'),
        closeRtl: transform('close', 'rtl'),
      };
    });

    expect(transforms.arrowLtr).toBe('none');
    expect(transforms.arrowRtl).not.toBe('none');
    expect(transforms.closeLtr).toBe('none');
    expect(transforms.closeRtl).toBe('none');
  });

  test('contains 200 percent text and retains non-color review in forced colors and grayscale', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addStyleTag({
      content: ':root { font-size: 200% !important; } main { filter: grayscale(1); }',
    });

    const result = await page.evaluate(() => ({
      contained: document.documentElement.scrollWidth <= innerWidth + 1,
      filter: getComputedStyle(document.querySelector('main')!).filter,
      forcedColors: matchMedia('(forced-colors: active)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      moving: Array.from(document.querySelectorAll<HTMLElement>('*')).filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.animationName !== 'none' ||
          style.transitionDuration.split(',').some((value) => Number.parseFloat(value) > 0)
        );
      }).length,
    }));

    expect(result).toEqual({
      contained: true,
      filter: 'grayscale(1)',
      forcedColors: true,
      reducedMotion: true,
      moving: 0,
    });
    await expect(page.getByText('mirrors-in-rtl').first()).toBeVisible();
    await expect(page.getByText('reinforcement-only').first()).toBeVisible();
    await expect(page.getByText('Unavailable preview')).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(results.violations).toEqual([]);
  });
});
