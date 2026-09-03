import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/foundations/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-surface') !== undefined &&
      customElements.get('wg-divider') !== undefined,
  );
});

test('keeps element modules side-effect free until explicit registration', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');

  const fallback = await page.evaluate(async () => {
    const surface = document.createElement('wg-surface');
    surface.textContent = 'Fallback content remains visible';
    document.body.append(surface);
    const beforeImport = surface.getBoundingClientRect();

    await Promise.all([
      import('/packages/elements/dist/surface.js'),
      import('/packages/elements/dist/divider.js'),
    ]);
    const afterImport = surface.getBoundingClientRect();

    return {
      registrations: ['wg-surface', 'wg-divider'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      beforeImport: { width: beforeImport.width, height: beforeImport.height },
      afterImport: { width: afterImport.width, height: afterImport.height },
      text: surface.textContent,
    };
  });

  expect(fallback.registrations).toEqual([false, false]);
  expect(fallback.beforeImport.width).toBeGreaterThan(0);
  expect(fallback.beforeImport.height).toBeGreaterThan(0);
  expect(fallback.afterImport.width).toBeGreaterThan(0);
  expect(fallback.afterImport.height).toBeGreaterThan(0);
  expect(fallback.text).toBe('Fallback content remains visible');
});

test('applies typography without replacing native semantics or margins', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Foundation fixture' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Native heading' })).toBeVisible();

  const styles = await page.locator('#title').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      fontSize: computed.fontSize,
      marginBlockStart: computed.marginBlockStart,
    };
  });
  const bodySize = await page
    .locator('#body-copy')
    .evaluate((element) => getComputedStyle(element).fontSize);
  const valueVariant = await page
    .locator('#value')
    .evaluate((element) => getComputedStyle(element).fontVariantNumeric);

  expect(Number.parseFloat(styles.fontSize)).toBeGreaterThan(Number.parseFloat(bodySize));
  expect(styles.marginBlockStart).toBe('0px');
  expect(valueVariant).toContain('tabular-nums');
});

test('retains visually hidden content and reveals the focusable variant', async ({ page }) => {
  const hiddenStyles = await page.locator('#hidden-copy').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      position: computed.position,
      width: computed.width,
      height: computed.height,
    };
  });

  expect(hiddenStyles).toEqual({
    position: 'absolute',
    width: '1px',
    height: '1px',
  });

  await page.locator('#skip-link').focus();
  await expect(page.locator('#skip-link')).toBeFocused();
  await expect(page.locator('#skip-link')).toBeVisible();
  const skipBox = await page.locator('#skip-link').boundingBox();
  expect(skipBox?.width).toBeGreaterThan(1);
  expect(skipBox?.height).toBeGreaterThan(1);
});

test('applies a visible focus ring only for keyboard focus', async ({ page }) => {
  const button = page.locator('#native-focus');
  await button.focus();
  await expect(button).toBeFocused();

  const outline = await button.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      style: computed.outlineStyle,
      width: computed.outlineWidth,
    };
  });

  expect(outline.style).not.toBe('none');
  expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(3);
});

test('normalizes surface variants and preserves neutral containment', async ({ page }) => {
  const panel = page.locator('#surface-panel');
  const raised = page.locator('#surface-raised');

  const colors = await Promise.all([
    panel.locator('[part="base"]').evaluate((element) => getComputedStyle(element).backgroundColor),
    raised
      .locator('[part="base"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(colors[0]).not.toBe(colors[1]);

  await panel.evaluate((element) => {
    element.setAttribute('tone', 'critical');
    element.setAttribute('boundary', 'heavy');
    element.setAttribute('padding', 'wide');
  });
  await expect(panel).toHaveAttribute('tone', 'panel');
  await expect(panel).toHaveAttribute('boundary', 'subtle');
  await expect(panel).toHaveAttribute('padding', 'comfortable');
  await expect(panel).not.toHaveAttribute('role');
  await expect(panel).not.toHaveAttribute('tabindex');
  await expect(panel).toContainText('Panel content');
});

test('uses density aliases without changing authored padding roles', async ({ page }) => {
  const surface = page.locator('#surface-panel');
  const compactPadding = await surface
    .locator('[part="base"]')
    .evaluate((element) => getComputedStyle(element).paddingInlineStart);

  await page.locator('body').evaluate((element) => {
    element.dataset.wgDensity = 'comfortable';
  });
  const comfortablePadding = await surface
    .locator('[part="base"]')
    .evaluate((element) => getComputedStyle(element).paddingInlineStart);

  expect(Number.parseFloat(comfortablePadding)).toBeGreaterThan(Number.parseFloat(compactPadding));
  await expect(surface).toHaveAttribute('padding', 'comfortable');
});

test('exposes separator semantics unless the divider is decorative', async ({ page }) => {
  const semantic = page.locator('#semantic-divider');
  const decorative = page.locator('#decorative-divider');
  const vertical = page.locator('#vertical-divider');

  await expect(semantic).toHaveAttribute('role', 'separator');
  await expect(semantic).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(decorative).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative).not.toHaveAttribute('role');
  await expect(vertical).toHaveAttribute('role', 'separator');
  await expect(vertical).toHaveAttribute('aria-orientation', 'vertical');

  const verticalBox = await vertical.boundingBox();
  expect(verticalBox).not.toBeNull();
  expect(verticalBox!.height).toBeGreaterThan(verticalBox!.width);

  await semantic.evaluate((element) => {
    element.setAttribute('orientation', 'diagonal');
    element.setAttribute('weight', 'heavy');
  });
  await expect(semantic).toHaveAttribute('orientation', 'horizontal');
  await expect(semantic).toHaveAttribute('weight', 'standard');
});

test('reflows without horizontal page overflow at a 400% zoom-equivalent width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.reload();
  await page.waitForFunction(
    () =>
      customElements.get('wg-surface') !== undefined &&
      customElements.get('wg-divider') !== undefined,
  );

  const layout = await page.locator('html').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));

  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Foundation fixture' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Native focus target' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in the ${theme} theme`, async ({ page }) => {
    await page.locator('body').evaluate((element, nextTheme) => {
      element.dataset.wgTheme = nextTheme;
    }, theme);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('retains boundaries and focus treatment in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.reload();
  await page.waitForFunction(
    () =>
      customElements.get('wg-surface') !== undefined &&
      customElements.get('wg-divider') !== undefined,
  );

  const button = page.locator('#native-focus');
  await button.focus();
  const presentation = await page.locator('#surface-panel').evaluate((surface) => {
    const base = surface.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    const divider = document
      .querySelector('#semantic-divider')!
      .shadowRoot!.querySelector<HTMLElement>('[part="line"]')!;
    const focus = getComputedStyle(document.querySelector('#native-focus')!);

    return {
      active: matchMedia('(forced-colors: active)').matches,
      borderStyle: getComputedStyle(base).borderBlockStartStyle,
      dividerColor: getComputedStyle(divider).backgroundColor,
      outlineStyle: focus.outlineStyle,
      outlineWidth: focus.outlineWidth,
    };
  });

  expect(presentation.active).toBe(true);
  expect(presentation.borderStyle).toBe('solid');
  expect(presentation.dividerColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(presentation.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(presentation.outlineWidth)).toBeGreaterThan(0);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
