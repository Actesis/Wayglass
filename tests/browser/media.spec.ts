import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/media/');
  await page.waitForFunction(() => customElements.get('wg-media') !== undefined);
});

test('keeps the media module side-effect free and native content visible before upgrade', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');

  const result = await page.evaluate(async () => {
    const media = document.createElement('wg-media');
    media.innerHTML =
      '<img alt="Pre-upgrade asset" width="120" height="90" src="/apps/storybook/stories/assets/hvac-air-handler.jpg">';
    document.body.append(media);
    const before = media.getBoundingClientRect();

    await import('/packages/elements/dist/media.js');

    return {
      registered: customElements.get('wg-media')?.name ?? null,
      before: { width: before.width, height: before.height },
      imageAlt: media.querySelector('img')?.alt,
    };
  });

  expect(result.registered).toBeNull();
  expect(result.before.width).toBeGreaterThan(0);
  expect(result.before.height).toBeGreaterThan(0);
  expect(result.imageAlt).toBe('Pre-upgrade asset');
});

test('uses fallback CSS to prevent false pre-upgrade state claims', async ({ page }) => {
  await page.goto('/tests/browser/media-fallback/');

  expect(await page.evaluate(() => customElements.get('wg-media'))).toBeUndefined();
  await expect(page.locator('#fallback-ready img')).toBeVisible();
  await expect(page.locator('#fallback-ready [slot="loading"]')).toBeHidden();
  await expect(page.locator('#fallback-ready [slot="unavailable"]')).toBeHidden();
  await expect(page.locator('#fallback-unavailable [slot="loading"]')).toBeHidden();
  await expect(page.locator('#fallback-unavailable [slot="unavailable"]')).toBeVisible();
});

test('normalizes the closed presentation vocabulary without adding semantics', async ({ page }) => {
  const media = page.locator('#ready-media');
  await media.evaluate((element) => {
    element.setAttribute('aspect', 'cinematic');
    element.setAttribute('fit', 'stretch');
    element.setAttribute('state', 'critical');
    element.setAttribute('boundary', 'condition');
  });

  await expect(media).toHaveAttribute('aspect', 'auto');
  await expect(media).toHaveAttribute('fit', 'contain');
  await expect(media).toHaveAttribute('state', 'ready');
  await expect(media).toHaveAttribute('boundary', 'subtle');
  await expect(media).not.toHaveAttribute('role');
  await expect(media).not.toHaveAttribute('tabindex');
  await expect(media).not.toHaveAttribute('aria-label');
});

test('preserves native image, picture, figure, and caption semantics', async ({ page }) => {
  await expect(
    page.getByRole('img', {
      name: 'Gray HVAC air handler with a filter in its lower front access panel',
    }),
  ).toBeVisible();
  await expect(page.getByText('Air handler in the north utility closet.')).toBeVisible();
  await expect(page.locator('#ready-picture')).toBeVisible();

  const imageRoles = await page.getByRole('img').count();
  expect(imageRoles).toBe(3);
});

test('reserves every named aspect without stretching its container', async ({ page }) => {
  const ratios = await page.evaluate(async () => {
    const samples = [
      ['square', 1],
      ['landscape', 4 / 3],
      ['portrait', 3 / 4],
      ['wide', 16 / 9],
    ] as const;

    return Promise.all(
      samples.map(async ([aspect, expected]) => {
        const media = document.createElement('wg-media');
        media.setAttribute('aspect', aspect);
        media.style.inlineSize = '320px';
        media.innerHTML =
          '<img alt="" width="1200" height="900" src="/apps/storybook/stories/assets/hvac-air-handler.jpg">';
        document.body.append(media);
        await (media as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
        const viewport = media.shadowRoot!.querySelector<HTMLElement>('[part="viewport"]')!;
        const box = viewport.getBoundingClientRect();
        media.remove();
        return { aspect, actual: box.width / box.height, expected };
      }),
    );
  });

  for (const ratio of ratios) {
    expect(ratio.actual).toBeCloseTo(ratio.expected, 1);
  }
});

test('applies safe contain and deliberate cover fit to direct and picture images', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const readyImage = document.querySelector<HTMLElement>('#ready-image')!;
    const coverImage = document.querySelector<HTMLElement>('#cover-image')!;
    return {
      pictureFit: getComputedStyle(readyImage).objectFit,
      directFit: getComputedStyle(coverImage).objectFit,
      pictureSize: {
        width: readyImage.getBoundingClientRect().width,
        height: readyImage.getBoundingClientRect().height,
      },
      viewportSize: (() => {
        const viewport = document
          .querySelector('#ready-media')!
          .shadowRoot!.querySelector<HTMLElement>('[part="viewport"]')!;
        return {
          width: viewport.getBoundingClientRect().width,
          height: viewport.getBoundingClientRect().height,
        };
      })(),
    };
  });

  expect(result.pictureFit).toBe('contain');
  expect(result.directFit).toBe('cover');
  expect(Math.abs(result.pictureSize.width - result.viewportSize.width)).toBeLessThanOrEqual(4);
  expect(Math.abs(result.pictureSize.height - result.viewportSize.height)).toBeLessThanOrEqual(4);
});

test('keeps retained pixels and explicit loading text in one stable viewport', async ({ page }) => {
  const media = page.locator('#loading-media');
  const before = await media.boundingBox();
  await expect(page.locator('#loading-image')).toBeVisible();
  await expect(page.locator('#loading-copy')).toBeVisible();

  await media.evaluate((element) => element.setAttribute('state', 'ready'));
  await expect(page.locator('#loading-copy')).toBeHidden();
  const after = await media.boundingBox();

  expect(after?.width).toBeCloseTo(before?.width ?? 0, 0);
  expect(after?.height).toBeCloseTo(before?.height ?? 0, 0);
});

test('replaces broken media without hiding identity, state, or action', async ({ page }) => {
  await expect(page.locator('#missing-image')).toBeHidden();
  await expect(page.locator('#unavailable-copy')).toBeVisible();
  const fallbackGeometry = await page.locator('#unavailable-media').evaluate((element) => {
    const viewport = element.shadowRoot!.querySelector<HTMLElement>('[part="viewport"]')!;
    const fallback = element.querySelector<HTMLElement>('#unavailable-copy')!;
    const viewportBounds = viewport.getBoundingClientRect();
    const fallbackBounds = fallback.getBoundingClientRect();
    return {
      stateDisplay: getComputedStyle(
        element.shadowRoot!.querySelector<HTMLElement>('[part~="state-unavailable"]')!,
      ).display,
      contained:
        fallbackBounds.top >= viewportBounds.top &&
        fallbackBounds.bottom <= viewportBounds.bottom &&
        fallbackBounds.left >= viewportBounds.left &&
        fallbackBounds.right <= viewportBounds.right,
    };
  });
  expect(fallbackGeometry).toEqual({ stateDisplay: 'grid', contained: true });
  await expect(page.locator('#persistent-state')).toHaveText('Email verification: confirmed.');
  await expect(page.locator('#persistent-action')).toBeVisible();
  await expect(page.locator('#persistent-action')).toBeEnabled();
});

test('keeps inspection as a native, labeled keyboard action', async ({ page }) => {
  const inspection = page.getByRole('link', { name: 'View full-size HVAC image' });
  await inspection.focus();
  await expect(inspection).toBeFocused();
  await expect(inspection).toHaveAttribute(
    'href',
    '/apps/storybook/stories/assets/hvac-air-handler.jpg',
  );
});

test('does not translate native image lifecycle events', async ({ page }) => {
  const result = await page.evaluate(() => {
    const media = document.querySelector('#ready-media')!;
    const image = document.querySelector('#ready-image')!;
    let hostLoads = 0;
    let nativeLoads = 0;
    media.addEventListener('load', () => hostLoads++);
    image.addEventListener('load', () => nativeLoads++);
    image.dispatchEvent(new Event('load'));
    return { hostLoads, nativeLoads };
  });

  expect(result).toEqual({ hostLoads: 0, nativeLoads: 1 });
});

test('keeps decorative media out of the accessible image set', async ({ page }) => {
  await expect(page.locator('#decorative-media img')).toHaveAttribute('alt', '');
  await expect(
    page.getByText('No state or instructions depend on the decorative media.'),
  ).toBeVisible();
  expect(await page.getByRole('img').count()).toBe(3);
});

test('reserves a useful loading state when intrinsic dimensions are unknown', async ({ page }) => {
  const height = await page
    .locator('#auto-loading-media')
    .evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(160);
  await expect(page.getByText('Loading image with unknown intrinsic dimensions…')).toBeVisible();
});

test('reflows media content at a 400% zoom-equivalent width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });

  const dimensions = await page.locator('html').evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(dimensions.scroll - dimensions.client).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Media fixture' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue account review' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in the ${theme} theme`, async ({ page }) => {
    await page.locator('body').evaluate((body, nextTheme) => {
      body.dataset.wgTheme = nextTheme;
    }, theme);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('retains neutral boundaries and useful fallback text in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-media') !== undefined);

  const result = await page.locator('#unavailable-media').evaluate((element) => {
    const viewport = element.shadowRoot!.querySelector<HTMLElement>('[part="viewport"]')!;
    const state = element.shadowRoot!.querySelector<HTMLElement>('[part~="state-unavailable"]')!;
    return {
      active: matchMedia('(forced-colors: active)').matches,
      border: getComputedStyle(viewport).borderBlockStartStyle,
      stateDisplay: getComputedStyle(state).display,
    };
  });
  expect(result.active).toBe(true);
  expect(result.border).toBe('solid');
  expect(result.stateDisplay).toBe('grid');
  await expect(page.locator('#unavailable-copy')).toBeVisible();

  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});
