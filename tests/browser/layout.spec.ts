import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const layoutTags = [
  'wg-frame',
  'wg-stack',
  'wg-cluster',
  'wg-grid',
  'wg-split',
  'wg-scroll-region',
] as const;

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/layout/');
  await page.waitForFunction(
    (tags) => tags.every((tag) => customElements.get(tag) !== undefined),
    layoutTags,
  );
});

test('keeps layout modules side-effect free and pre-upgrade content visible', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');

  const result = await page.evaluate(async (tags) => {
    const stack = document.createElement('wg-stack');
    stack.innerHTML = '<span>First</span><span>Second</span>';
    document.body.append(stack);
    const before = stack.getBoundingClientRect();

    await Promise.all([
      import('/packages/elements/dist/frame.js'),
      import('/packages/elements/dist/stack.js'),
      import('/packages/elements/dist/cluster.js'),
      import('/packages/elements/dist/grid.js'),
      import('/packages/elements/dist/split.js'),
      import('/packages/elements/dist/scroll-region.js'),
    ]);

    return {
      registered: tags.some((tag) => customElements.get(tag) !== undefined),
      before: { width: before.width, height: before.height },
      text: stack.textContent,
    };
  }, layoutTags);

  expect(result.registered).toBe(false);
  expect(result.before.width).toBeGreaterThan(0);
  expect(result.before.height).toBeGreaterThan(0);
  expect(result.text).toContain('FirstSecond');
});

test('normalizes closed attributes without adding semantics or focus stops', async ({ page }) => {
  await page.locator('#frame-fixture').evaluate((element) => {
    element.setAttribute('boundary', 'critical');
    element.setAttribute('padding', 'wide');
  });
  await page.locator('#root-stack').evaluate((element) => {
    element.setAttribute('space', 'large');
    element.setAttribute('align', 'top');
  });
  await page.locator('#cluster-fixture').evaluate((element) => {
    element.setAttribute('align', 'top');
    element.setAttribute('justify', 'around');
  });
  await page.locator('#grid-fixture').evaluate((element) => {
    element.setAttribute('minimum', 'phone');
  });
  await page.locator('#split-fixture').evaluate((element) => {
    element.setAttribute('ratio', 'golden');
  });

  await expect(page.locator('#frame-fixture')).toHaveAttribute('boundary', 'standard');
  await expect(page.locator('#frame-fixture')).toHaveAttribute('padding', 'comfortable');
  await expect(page.locator('#root-stack')).toHaveAttribute('space', 'section');
  await expect(page.locator('#root-stack')).toHaveAttribute('align', 'stretch');
  await expect(page.locator('#cluster-fixture')).toHaveAttribute('align', 'center');
  await expect(page.locator('#cluster-fixture')).toHaveAttribute('justify', 'start');
  await expect(page.locator('#grid-fixture')).toHaveAttribute('minimum', 'standard');
  await expect(page.locator('#split-fixture')).toHaveAttribute('ratio', 'equal');

  for (const selector of [
    '#frame-fixture',
    '#root-stack',
    '#cluster-fixture',
    '#grid-fixture',
    '#split-fixture',
  ]) {
    await expect(page.locator(selector)).not.toHaveAttribute('role');
    await expect(page.locator(selector)).not.toHaveAttribute('tabindex');
  }
});

test('uses density-aware semantic spacing while preserving authored roles', async ({ page }) => {
  const compact = await page.locator('#root-stack').evaluate((element) => {
    const base = element.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    return getComputedStyle(base).rowGap;
  });

  await page.locator('body').evaluate((body) => {
    body.dataset.wgDensity = 'comfortable';
  });

  const comfortable = await page.locator('#root-stack').evaluate((element) => {
    const base = element.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    return getComputedStyle(base).rowGap;
  });

  expect(Number.parseFloat(comfortable)).toBeGreaterThan(Number.parseFloat(compact));
  await expect(page.locator('#root-stack')).toHaveAttribute('space', 'function');
});

test('wraps cluster and adapts grid without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 900 });

  const clusterRows = await page.locator('#cluster-fixture > *').evaluateAll((children) => {
    return new Set(children.map((child) => Math.round(child.getBoundingClientRect().top))).size;
  });
  const gridRows = await page.locator('#grid-fixture > *').evaluateAll((children) => {
    return new Set(children.map((child) => Math.round(child.getBoundingClientRect().top))).size;
  });
  const pageSize = await page.locator('html').evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));

  expect(clusterRows).toBeGreaterThan(1);
  expect(gridRows).toBe(3);
  expect(pageSize.scroll - pageSize.client).toBeLessThanOrEqual(1);
});

test('adapts grid item capacity to its own available width', async ({ page }) => {
  const grid = page.locator('#grid-fixture');
  await grid.evaluate((element) => {
    (element as HTMLElement).style.inlineSize = '50rem';
  });
  const wideRows = await grid.locator(':scope > *').evaluateAll((children) => {
    return new Set(children.map((child) => Math.round(child.getBoundingClientRect().top))).size;
  });

  await grid.evaluate((element) => {
    (element as HTMLElement).style.inlineSize = '13rem';
  });
  const narrowRows = await grid.locator(':scope > *').evaluateAll((children) => {
    return new Set(children.map((child) => Math.round(child.getBoundingClientRect().top))).size;
  });

  expect(wideRows).toBe(1);
  expect(narrowRows).toBe(3);
});

test('splits at its container threshold and collapses in source order', async ({ page }) => {
  const split = page.locator('#split-fixture');
  const positions = async () =>
    split.locator(':scope > *').evaluateAll((children) =>
      children.map((child) => {
        const box = child.getBoundingClientRect();
        return { left: box.left, top: box.top };
      }),
    );

  const wide = await positions();
  expect(Math.abs(wide[0]!.top - wide[1]!.top)).toBeLessThanOrEqual(1);
  expect(wide[0]!.left).toBeLessThan(wide[1]!.left);

  await split.evaluate((element) => {
    (element as HTMLElement).style.inlineSize = '30rem';
  });
  const narrow = await positions();
  expect(narrow[0]!.top).toBeLessThan(narrow[1]!.top);

  const tabOrder = await page.evaluate(async () => {
    const primary = document.querySelector<HTMLElement>('#primary-action')!;
    const secondary = document.querySelector<HTMLElement>('#secondary-link')!;
    primary.focus();
    const first = document.activeElement?.id;
    secondary.focus();
    return [first, document.activeElement?.id];
  });
  expect(tabOrder).toEqual(['primary-action', 'secondary-link']);
});

test('uses logical split placement in right-to-left contexts', async ({ page }) => {
  await page.locator('#split-fixture').evaluate((element) => {
    element.setAttribute('dir', 'rtl');
  });
  const positions = await page
    .locator('#split-fixture > *')
    .evaluateAll((children) => children.map((child) => child.getBoundingClientRect().left));

  expect(positions[0]).toBeGreaterThan(positions[1]!);
  await expect(page.locator('#primary-action')).toBeVisible();
  await expect(page.locator('#secondary-link')).toBeVisible();
});

test('makes only overflowing scroll regions labeled keyboard targets', async ({ page }) => {
  const overflowing = page.locator('#scroll-overflow');
  const fitting = page.locator('#scroll-fit');
  const unlabeled = page.locator('#scroll-unlabeled');

  await expect(overflowing).toHaveAttribute('data-overflowing');
  await expect(overflowing).toHaveAttribute('tabindex', '0');
  await expect(overflowing).toHaveAttribute('role', 'region');
  await expect(overflowing).toHaveAttribute('aria-label', 'Recent events');

  await expect(fitting).not.toHaveAttribute('data-overflowing');
  await expect(fitting).not.toHaveAttribute('tabindex');
  await expect(fitting).not.toHaveAttribute('role');

  await expect(unlabeled).toHaveAttribute('data-overflowing');
  await expect(unlabeled).toHaveAttribute('tabindex', '0');
  await expect(unlabeled).not.toHaveAttribute('role');
  await expect(unlabeled).not.toHaveAttribute('aria-label');
});

test('updates scroll-region focusability when content changes', async ({ page }) => {
  const fitting = page.locator('#scroll-fit');
  await fitting.evaluate((element) => {
    element.innerHTML = Array.from(
      { length: 30 },
      (_, index) => `<p>Dynamically appended event ${index + 1}.</p>`,
    ).join('');
  });

  await expect(fitting).toHaveAttribute('data-overflowing');
  await expect(fitting).toHaveAttribute('tabindex', '0');
  await expect(fitting).toHaveAttribute('role', 'region');

  await fitting.focus();
  await expect(fitting).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const scrollTop = await fitting.evaluate((element) => element.scrollTop);
  expect(scrollTop).toBeGreaterThanOrEqual(0);

  await fitting.evaluate((element) => {
    element.innerHTML = '<p>Short again.</p>';
  });
  await expect(fitting).not.toHaveAttribute('data-overflowing');
  await expect(fitting).not.toHaveAttribute('tabindex');
});

test('reflows at a 400% zoom-equivalent width without lost content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });

  const pageSize = await page.locator('html').evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
  }));
  expect(pageSize.scroll - pageSize.client).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Function boundary' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Primary action' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Supporting context' })).toBeVisible();
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

test('retains frame boundaries and scroll focus treatment in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.reload();
  await page.waitForFunction(
    (tags) => tags.every((tag) => customElements.get(tag) !== undefined),
    layoutTags,
  );

  const scroll = page.locator('#scroll-overflow');
  await scroll.focus();
  const presentation = await page.evaluate(() => {
    const frame = document
      .querySelector('#frame-fixture')!
      .shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    const scroll = document.querySelector<HTMLElement>('#scroll-overflow')!;
    return {
      active: matchMedia('(forced-colors: active)').matches,
      frameBorder: getComputedStyle(frame).borderBlockStartStyle,
      scrollBorder: getComputedStyle(scroll).borderBlockStartStyle,
      outline: getComputedStyle(scroll).outlineStyle,
    };
  });

  expect(presentation.active).toBe(true);
  expect(presentation.frameBorder).toBe('solid');
  expect(presentation.scrollBorder).toBe('solid');
  expect(presentation.outline).not.toBe('none');

  // Forced-colors emulation exposes system palette values as synthetic RGB;
  // structural accessibility remains testable, but their contrast is OS-owned.
  const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});
