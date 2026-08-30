import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/icons/');
  await page.waitForFunction(() => customElements.get('wg-icon') !== undefined);
});

test('keeps root and component imports side-effect free and backed by one implementation', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const before = customElements.get('wg-icon') ?? null;
    const [root, component] = await Promise.all([
      import('/packages/icons/dist/index.js'),
      import('/packages/icons/dist/icon.js'),
    ]);
    const afterImport = customElements.get('wg-icon') ?? null;
    component.defineWgIcon();
    component.defineWgIcon();
    return {
      afterImport: afterImport?.name ?? null,
      before: before?.name ?? null,
      implementationMatches: root.WgIcon === component.WgIcon,
      registered: customElements.get('wg-icon') === component.WgIcon,
    };
  });

  expect(result).toEqual({
    afterImport: null,
    before: null,
    implementationMatches: true,
    registered: true,
  });
});

test('renders every generated glyph at all semantic sizes with the public SVG part', async ({
  page,
}) => {
  await expect(page.locator('[data-icon]')).toHaveCount(4);
  await expect(page.locator('[data-icon] wg-icon')).toHaveCount(12);
  await expect(page.locator('[data-icon] wg-icon [part="svg"]')).toHaveCount(12);

  const result = await page.locator('[data-icon]').evaluateAll((figures) =>
    figures.map((figure) => ({
      name: figure.getAttribute('data-icon'),
      sizes: Array.from(figure.querySelectorAll('wg-icon')).map((icon) => {
        const bounds = icon.getBoundingClientRect();
        const svg = icon.shadowRoot?.querySelector('svg');
        return {
          height: bounds.height,
          part: svg?.getAttribute('part'),
          primitives: svg?.children.length,
          viewBox: svg?.getAttribute('viewBox'),
          width: bounds.width,
        };
      }),
    })),
  );

  expect(result).toEqual([
    {
      name: 'close',
      sizes: [16, 20, 32].map((size) => ({
        height: size,
        part: 'svg',
        primitives: 1,
        viewBox: '0 0 24 24',
        width: size,
      })),
    },
    {
      name: 'menu',
      sizes: [16, 20, 32].map((size) => ({
        height: size,
        part: 'svg',
        primitives: 1,
        viewBox: '0 0 24 24',
        width: size,
      })),
    },
    {
      name: 'more',
      sizes: [16, 20, 32].map((size) => ({
        height: size,
        part: 'svg',
        primitives: 3,
        viewBox: '0 0 24 24',
        width: size,
      })),
    },
    {
      name: 'refresh',
      sizes: [16, 20, 32].map((size) => ({
        height: size,
        part: 'svg',
        primitives: 1,
        viewBox: '0 0 24 24',
        width: size,
      })),
    },
  ]);
});

test('keeps decorative, labeled, missing, and unknown semantics explicit and mutable', async ({
  page,
}) => {
  const decorative = page.locator('#decorative');
  const labeled = page.locator('#labeled');
  const missing = page.locator('#missing');
  const unknown = page.locator('#unknown');

  await expect(decorative).toHaveAttribute('aria-hidden', 'true');
  await expect(decorative).not.toHaveAttribute('role', /.+/);
  await expect(labeled).toHaveAttribute('role', 'img');
  await expect(labeled).toHaveAttribute('aria-label', 'Refresh records');
  await expect(labeled).not.toHaveAttribute('aria-hidden', /.+/);
  await expect(labeled.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(labeled.locator('svg')).toHaveAttribute('focusable', 'false');
  await expect(page.getByRole('img', { name: 'Refresh records' })).toHaveCount(1);
  await expect(missing).toHaveAttribute('aria-hidden', 'true');
  await expect(unknown).toHaveAttribute('aria-hidden', 'true');
  await expect(missing.locator('svg')).toHaveCount(0);
  await expect(unknown.locator('svg')).toHaveCount(0);

  await labeled.evaluate((element) => element.setAttribute('label', '   '));
  await expect(labeled).toHaveAttribute('aria-hidden', 'true');
  await expect(labeled).not.toHaveAttribute('role', /.+/);
  await labeled.evaluate((element) => {
    element.setAttribute('label', 'Close reference');
    element.setAttribute('name', 'close');
  });
  await expect(page.getByRole('img', { name: 'Close reference' })).toHaveCount(1);

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('resolves automatic and explicit direction only for reviewed directional metadata', async ({
  page,
}) => {
  for (const id of ['auto-rtl', 'explicit-ltr', 'explicit-rtl']) {
    await page.locator(`#${id}`).evaluate((element) => {
      element.shadowRoot?.querySelector('svg')?.setAttribute('data-direction', 'mirrors-in-rtl');
    });
  }

  const transforms = await page.evaluate(() =>
    Object.fromEntries(
      ['auto-rtl', 'explicit-ltr', 'explicit-rtl'].map((id) => {
        const icon = document.querySelector(`#${id}`)!;
        const svg = icon.shadowRoot!.querySelector('svg')!;
        return [
          id,
          {
            hostDirection: getComputedStyle(icon).direction,
            transform: getComputedStyle(svg).transform,
          },
        ];
      }),
    ),
  );

  expect(transforms).toEqual({
    'auto-rtl': { hostDirection: 'rtl', transform: 'matrix(-1, 0, 0, 1, 0, 0)' },
    'explicit-ltr': { hostDirection: 'rtl', transform: 'none' },
    'explicit-rtl': { hostDirection: 'ltr', transform: 'matrix(-1, 0, 0, 1, 0, 0)' },
  });
});

test('honors styling hooks, normalizes invalid presentation values, and remains inert', async ({
  page,
}) => {
  const custom = page.locator('#custom');
  const invalid = page.locator('#invalid');
  const noSlot = page.locator('#no-slot');
  const inert = page.locator('#inert');

  expect(
    await custom.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        height: bounds.height,
        part: element.shadowRoot?.querySelector('svg')?.getAttribute('part'),
        width: bounds.width,
      };
    }),
  ).toEqual({ height: 40, part: 'svg', width: 40 });
  await expect(invalid).toHaveAttribute('size', 'standard');
  await expect(invalid).toHaveAttribute('direction', 'auto');
  expect(
    await noSlot.evaluate((element) => element.shadowRoot?.querySelectorAll('slot').length),
  ).toBe(0);
  await expect(inert).not.toHaveAttribute('tabindex', /.+/);
  expect(await inert.evaluate((element) => (element as HTMLElement).tabIndex)).toBe(-1);
  expect(
    await page
      .locator('.focus-order')
      .evaluate((container) =>
        Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
          (element) => element.id,
        ),
      ),
  ).toEqual(['before', 'after']);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('#theme').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('retains readable, contained evidence at 200 percent text and in forced colors', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: ':root { font-size: 200% !important; }' });

  const result = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    forcedColors: matchMedia('(forced-colors: active)').matches,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
    systemColor: getComputedStyle(
      document.querySelector('#custom')!.shadowRoot!.querySelector('svg')!,
    ).color,
  }));

  expect(result.scrollWidth - result.clientWidth).toBeLessThanOrEqual(1);
  expect(result.forcedColors).toBe(true);
  expect(result.reducedMotion).toBe(true);
  expect(result.systemColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(
    (await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()).violations,
  ).toEqual([]);
});
