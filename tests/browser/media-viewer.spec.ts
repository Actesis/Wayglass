import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/media-viewer/');
  await page.waitForFunction(() => customElements.get('wg-media-viewer') !== undefined);
  await page.locator('#viewer-image').evaluate((image: HTMLImageElement) => {
    if (image.complete && image.naturalWidth) return;
    return new Promise<void>((resolve) =>
      image.addEventListener('load', () => resolve(), { once: true }),
    );
  });
});

test('keeps module import side-effect free and the fallback surface hidden', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  expect(
    await page.evaluate(async () => {
      await import('/packages/elements/dist/media-viewer.js');
      return customElements.get('wg-media-viewer') !== undefined;
    }),
  ).toBe(false);

  await page.goto('/tests/browser/media-viewer-fallback/');
  expect(await page.evaluate(() => customElements.get('wg-media-viewer'))).toBeUndefined();
  await expect(page.locator('#unupgraded')).toBeHidden();
  await expect(page.locator('#invoker')).toBeVisible();
});

test('opens one labeled native modal with consumer-authored image semantics', async ({ page }) => {
  const accepted = await page.locator('#viewer').evaluate((element) =>
    (
      element as HTMLElement & {
        show(options: { invoker: HTMLElement; fallbackFocus: HTMLElement }): boolean;
      }
    ).show({
      invoker: document.querySelector<HTMLElement>('#invoker')!,
      fallbackFocus: document.querySelector<HTMLElement>('#fallback')!,
    }),
  );
  expect(accepted).toBe(true);

  await expect(
    page.getByRole('dialog', { name: 'North utility closet air handler' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', {
      name: 'Gray HVAC air handler with a filter in its lower front access panel',
    }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('#viewer')
        .evaluate((element) => element.shadowRoot?.activeElement?.getAttribute('part')),
    )
    .toBe('heading');
  expect(
    await page.locator('#viewer').evaluate((element) => {
      const nativeDialog = element.shadowRoot!.querySelector('dialog')!;
      return { open: nativeDialog.open, modal: nativeDialog.matches(':modal') };
    }),
  ).toEqual({ open: true, modal: true });
  await expect(page.getByText('Loading the air handler image…')).toBeHidden();
  await expect(
    page.getByText(
      'Image unavailable. The filter is behind the lower front panel below the return duct.',
    ),
  ).toBeHidden();
});

test('fits initially and bounds zoom between fit and intrinsic actual size', async ({ page }) => {
  await page.locator('#viewer').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  await expect
    .poll(() =>
      page
        .locator('#viewer')
        .evaluate((element) => element.shadowRoot!.querySelector('output')!.textContent),
    )
    .not.toBe('100%');

  const result = await page.locator('#viewer').evaluate(async (element) => {
    const viewer = element as HTMLElement & {
      actualSize(): boolean;
      fit(): boolean;
      zoomIn(): boolean;
      zoomOut(): boolean;
      records?: unknown[];
    };
    viewer.records = [];
    element.addEventListener('wg-media-view-change', (event) => {
      viewer.records!.push((event as CustomEvent).detail);
    });
    const initialScale = Number(
      element.shadowRoot!.querySelector('output')!.textContent!.replace('%', ''),
    );
    const actual = viewer.actualSize();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const atActual = element.shadowRoot!.querySelector('output')!.textContent;
    const beyondActual = viewer.zoomIn();
    const towardFit = viewer.zoomOut();
    const fit = viewer.fit();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const atFit = Number(
      element.shadowRoot!.querySelector('output')!.textContent!.replace('%', ''),
    );
    const belowFit = viewer.zoomOut();
    return {
      initialScale,
      actual,
      atActual,
      beyondActual,
      towardFit,
      fit,
      atFit,
      belowFit,
      records: viewer.records,
    };
  });

  expect(result.initialScale).toBeLessThan(100);
  expect(result.actual).toBe(true);
  expect(result.atActual).toBe('100%');
  expect(result.beyondActual).toBe(false);
  expect(result.towardFit).toBe(true);
  expect(result.fit).toBe(true);
  expect(result.atFit).toBe(result.initialScale);
  expect(result.belowFit).toBe(false);
  expect(result.records).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ viewerId: 'air-handler-image', view: 'actual-size', scale: 1 }),
      expect.objectContaining({ viewerId: 'air-handler-image', view: 'fit' }),
    ]),
  );
});

test('uses a labeled native scroll region for actual-size pan without custom wheel zoom', async ({
  page,
}) => {
  await page.locator('#viewer').evaluate((element) => {
    (element as HTMLElement & { show(): boolean; actualSize(): boolean }).show();
  });
  await page.locator('#viewer').evaluate((element) => {
    (element as HTMLElement & { actualSize(): boolean }).actualSize();
  });
  const viewport = page.getByRole('region', { name: 'North utility closet air handler' });
  await expect(viewport).toHaveAttribute('tabindex', '0');
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await expect
    .poll(() =>
      viewport.evaluate((element) => ({ left: element.scrollLeft, top: element.scrollTop })),
    )
    .toEqual(expect.objectContaining({ left: expect.any(Number), top: expect.any(Number) }));
  const beforeWheel = await viewport.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scale: element.parentElement!.querySelector('output')!.textContent,
  }));
  await viewport.hover();
  await page.mouse.wheel(0, 120);
  const afterWheel = await viewport.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scale: element.parentElement!.querySelector('output')!.textContent,
  }));
  expect(afterWheel.scale).toBe(beforeWheel.scale);
  expect(afterWheel.scrollTop).toBeGreaterThanOrEqual(beforeWheel.scrollTop);
});

test('disables scaling while loading or unavailable and retains useful fallback content', async ({
  page,
}) => {
  const viewer = page.locator('#viewer');
  await viewer.evaluate((element) => {
    element.setAttribute('state', 'loading');
    (element as HTMLElement & { show(): boolean }).show();
  });
  await expect(page.getByText('Loading the air handler image…')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Actual size' })).toBeDisabled();

  await viewer.evaluate((element) => element.setAttribute('state', 'unavailable'));
  await expect(
    page.getByText(
      'Image unavailable. The filter is behind the lower front panel below the return duct.',
    ),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close image' })).toBeEnabled();
  await expect(
    page.getByText('Use the lower front panel to identify the filter access point.'),
  ).toBeVisible();
});

test('shares modal coordination and returns focus with explicit close reasons', async ({
  page,
}) => {
  await page.locator('#invoker').focus();
  const result = await page.evaluate(() => {
    const viewer = document.querySelector<HTMLElement>('#viewer') as HTMLElement & {
      show(): boolean;
      records?: unknown[];
    };
    const second = document.querySelector<HTMLElement>('#second-viewer') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    const dialog = document.querySelector<HTMLElement>('#content-dialog') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    viewer.records = [];
    viewer.addEventListener('wg-media-viewer-close', (event) => {
      viewer.records!.push((event as CustomEvent).detail);
    });
    return {
      viewer: viewer.show(),
      second: second.show(),
      secondOpen: second.open,
      dialog: dialog.show(),
      dialogOpen: dialog.open,
    };
  });
  expect(result).toEqual({
    viewer: true,
    second: false,
    secondOpen: false,
    dialog: false,
    dialogOpen: false,
  });

  await page.keyboard.press('Escape');
  await expect(page.locator('#invoker')).toBeFocused();
  expect(
    await page
      .locator('#viewer')
      .evaluate((element) => (element as HTMLElement & { records: unknown[] }).records),
  ).toEqual([{ viewerId: 'air-handler-image', reason: 'escape' }]);
});

test('normalizes state vocabulary and rejects invalid anatomy and labels', async ({ page }) => {
  const result = await page.locator('#viewer').evaluate((element) => {
    const viewer = element as HTMLElement & { show(): boolean; open: boolean };
    element.setAttribute('state', 'critical');
    element.setAttribute('initial-view', 'fill');
    element.removeAttribute('zoom-in-label');
    const missingLabel = viewer.show();
    element.setAttribute('zoom-in-label', 'Zoom in');
    element.querySelector('picture')!.remove();
    const missingImage = viewer.show();
    return {
      state: element.getAttribute('state'),
      initialView: element.getAttribute('initial-view'),
      missingLabel,
      missingImage,
      open: viewer.open,
    };
  });
  expect(result).toEqual({
    state: 'ready',
    initialView: 'fit',
    missingLabel: false,
    missingImage: false,
    open: false,
  });
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations while open in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    await page.locator('#viewer').evaluate((element) => {
      (element as HTMLElement & { show(): boolean }).show();
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('preserves boundaries and removes motion in forced-colors reduced-motion mode', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.locator('#viewer').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  const result = await page.locator('#viewer').evaluate((element) => {
    const root = element.shadowRoot!;
    const surface = getComputedStyle(root.querySelector('[part="surface"]')!);
    const image = getComputedStyle(element.querySelector('picture')!);
    return {
      forcedColors: matchMedia('(forced-colors: active)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationName: surface.animationName,
      transitionDuration: image.transitionDuration,
      borderStyle: surface.borderStyle,
    };
  });
  expect(result).toEqual({
    forcedColors: true,
    reducedMotion: true,
    animationName: 'none',
    transitionDuration: '0s',
    borderStyle: 'solid',
  });
});

test('keeps controls and useful text reachable at a 320 CSS-pixel zoom-equivalent viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.locator('#viewer').evaluate((element) => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector('h1')!.remove();
    (element as HTMLElement & { show(): boolean }).show();
  });
  const layout = await page.locator('#viewer').evaluate((element) => {
    const root = element.shadowRoot!;
    const surface = root.querySelector<HTMLElement>('[part="surface"]')!;
    const controls = root.querySelector<HTMLElement>('[part="controls"]')!;
    const firstControl = root.querySelector<HTMLElement>('[part="zoom-out-button"]')!;
    const lastControl = root.querySelector<HTMLElement>('[part="actual-size-button"]')!;
    const bounds = surface.getBoundingClientRect();
    const beforeScroll = controls.getBoundingClientRect();
    const isVisible = (control: HTMLElement) => {
      const controlBounds = control.getBoundingClientRect();
      const surfaceBounds = surface.getBoundingClientRect();
      return controlBounds.bottom > surfaceBounds.top && controlBounds.top < surfaceBounds.bottom;
    };
    firstControl.scrollIntoView({ block: 'center' });
    const firstControlReachable = isVisible(firstControl);
    lastControl.scrollIntoView({ block: 'center' });
    const lastControlReachable = isVisible(lastControl);
    return {
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      left: bounds.left,
      right: bounds.right,
      surfaceScrollable: surface.scrollHeight > surface.clientHeight,
      controlsInitiallyBelowSurface: beforeScroll.bottom > bounds.bottom,
      firstControlReachable,
      lastControlReachable,
    };
  });
  expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.surfaceScrollable || !layout.controlsInitiallyBelowSurface).toBe(true);
  expect(layout.firstControlReachable).toBe(true);
  expect(layout.lastControlReachable).toBe(true);
});
