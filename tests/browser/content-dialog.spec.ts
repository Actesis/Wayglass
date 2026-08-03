import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/content-dialog/');
  await page.waitForFunction(() => customElements.get('wg-dialog') !== undefined);
});

test('keeps the module import side-effect free', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  expect(
    await page.evaluate(async () => {
      await import('/packages/elements/dist/dialog.js');
      return customElements.get('wg-dialog') !== undefined;
    }),
  ).toBe(false);
});

test('opens one labeled native modal and focuses the visible heading by default', async ({
  page,
}) => {
  const accepted = await page.locator('#content-dialog').evaluate((element) =>
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

  await expect(page.getByRole('dialog', { name: 'Air handler maintenance details' })).toBeVisible();
  await expect(page.locator('#content-dialog')).toHaveAttribute('open', '');
  await expect
    .poll(() =>
      page
        .locator('#content-dialog')
        .evaluate((element) => element.shadowRoot?.activeElement?.getAttribute('part')),
    )
    .toBe('heading');
  expect(
    await page.locator('#content-dialog').evaluate((element) => {
      const nativeDialog = element.shadowRoot!.querySelector('dialog')!;
      return { open: nativeDialog.open, modal: nativeDialog.matches(':modal') };
    }),
  ).toEqual({ open: true, modal: true });
});

test('supports close, first-interactive, and explicit descendant initial focus', async ({
  page,
}) => {
  const cases = [
    { mode: 'close', expected: 'shadow-close' },
    { mode: 'first-interactive', expected: 'note' },
  ] as const;

  for (const { mode, expected } of cases) {
    const result = await page.locator('#content-dialog').evaluate(
      async (element, value) => {
        const dialog = element as HTMLElement & {
          show(): boolean;
          close(): boolean;
          updateComplete: Promise<boolean>;
        };
        element.setAttribute('initial-focus', value.mode);
        dialog.show();
        await new Promise<void>((resolve) => queueMicrotask(resolve));
        const focused =
          element.shadowRoot?.activeElement?.getAttribute('part') === 'close-button'
            ? 'shadow-close'
            : document.activeElement?.id;
        const closed = new Promise<void>((resolve) =>
          element.addEventListener('wg-dialog-close', () => resolve(), { once: true }),
        );
        dialog.close();
        await closed;
        await dialog.updateComplete;
        return focused;
      },
      { mode, expected },
    );
    expect(result).toBe(expected);
  }

  const explicit = await page.locator('#content-dialog').evaluate(async (element) => {
    const save = element.querySelector<HTMLElement>('#save')!;
    (element as HTMLElement & { show(options: { initialFocus: HTMLElement }): boolean }).show({
      initialFocus: save,
    });
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return document.activeElement?.id;
  });
  expect(explicit).toBe('save');
});

test('closes on Escape, reports presentation lifetime, and returns focus', async ({ page }) => {
  await page.locator('#invoker').focus();
  await page.locator('#content-dialog').evaluate((element) => {
    (element as HTMLElement & { records?: unknown[] }).records = [];
    element.addEventListener('wg-dialog-close', (event) => {
      (element as HTMLElement & { records: unknown[] }).records.push((event as CustomEvent).detail);
    });
    (element as HTMLElement & { show(): boolean }).show();
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#invoker')).toBeFocused();
  expect(
    await page
      .locator('#content-dialog')
      .evaluate((element) => (element as HTMLElement & { records: unknown[] }).records),
  ).toEqual([{ dialogId: 'maintenance-details', reason: 'escape' }]);
});

test('reports open, close-control, and programmatic presentation reasons', async ({ page }) => {
  const records = await page.locator('#content-dialog').evaluate(async (element) => {
    const dialog = element as HTMLElement & {
      show(): boolean;
      close(): boolean;
      updateComplete: Promise<boolean>;
      records?: string[];
    };
    dialog.records = [];
    element.addEventListener('wg-dialog-open', () => dialog.records!.push('open'));
    element.addEventListener('wg-dialog-close', (event) => {
      dialog.records!.push(`close:${(event as CustomEvent).detail.reason}`);
    });

    dialog.show();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const firstClosed = new Promise<void>((resolve) =>
      element.addEventListener('wg-dialog-close', () => resolve(), { once: true }),
    );
    element.shadowRoot!.querySelector<HTMLButtonElement>('[part="close-button"]')!.click();
    await firstClosed;
    await dialog.updateComplete;

    dialog.show();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    const secondClosed = new Promise<void>((resolve) =>
      element.addEventListener('wg-dialog-close', () => resolve(), { once: true }),
    );
    dialog.close();
    await secondClosed;
    return dialog.records;
  });
  expect(records).toEqual(['open', 'close:close-control', 'open', 'close:programmatic']);
});

test('keeps consumer controls in light DOM and returns focus through a fallback', async ({
  page,
}) => {
  await page.locator('#content-dialog').evaluate((element) => {
    const invoker = document.querySelector<HTMLElement>('#invoker')!;
    (
      element as HTMLElement & {
        show(options: { invoker: HTMLElement; fallbackFocus: HTMLElement }): boolean;
      }
    ).show({
      invoker,
      fallbackFocus: document.querySelector<HTMLElement>('#fallback')!,
    });
    invoker.remove();
  });
  await page.locator('#note').fill('Filter replaced');
  await page.getByRole('button', { name: 'Close details' }).click();
  await expect(page.locator('#fallback')).toBeFocused();
  await expect(page.locator('#note')).toHaveValue('Filter replaced');
});

test('shares one-at-a-time coordination with dialogs and confirmations', async ({ page }) => {
  const result = await page.evaluate(() => {
    const first = document.querySelector<HTMLElement>('#content-dialog') as HTMLElement & {
      show(): boolean;
    };
    const second = document.querySelector<HTMLElement>('#second-dialog') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    const confirmation = document.querySelector<HTMLElement>('#confirmation') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    return {
      first: first.show(),
      second: second.show(),
      secondOpen: second.open,
      confirmation: confirmation.show(),
      confirmationOpen: confirmation.open,
    };
  });
  expect(result).toEqual({
    first: true,
    second: false,
    secondOpen: false,
    confirmation: false,
    confirmationOpen: false,
  });
  await expect(page.getByRole('dialog')).toHaveCount(1);
});

test('rejects foreign modals, invalid focus, and missing required content', async ({ page }) => {
  const result = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>('#content-dialog') as HTMLElement & {
      show(options?: { initialFocus?: HTMLElement }): boolean;
      open: boolean;
    };
    const foreign = document.createElement('dialog');
    document.body.append(foreign);
    foreign.showModal();
    const foreignResult = dialog.show();
    foreign.close();

    const invalidFocus = dialog.show({ initialFocus: document.querySelector('#invoker')! });
    dialog.removeAttribute('close-label');
    const missingLabel = dialog.show();
    return { foreignResult, invalidFocus, missingLabel, open: dialog.open };
  });
  expect(result).toEqual({
    foreignResult: false,
    invalidFocus: false,
    missingLabel: false,
    open: false,
  });
});

test('ignores backdrop interaction and normalizes public vocabularies', async ({ page }) => {
  const dialog = page.locator('#content-dialog');
  await dialog.evaluate((element) => {
    element.setAttribute('initial-focus', 'automatic');
    element.setAttribute('size', 'large');
    (element as HTMLElement & { show(): boolean }).show();
  });
  await expect(dialog).toHaveAttribute('initial-focus', 'heading');
  await expect(dialog).toHaveAttribute('size', 'standard');
  await page.mouse.click(4, 4);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close details' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations while open in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    await page.locator('#content-dialog').evaluate((element) => {
      (element as HTMLElement & { show(): boolean }).show();
    });
    expect(
      await page
        .locator('#content-dialog')
        .evaluate((element) =>
          getComputedStyle(element.shadowRoot!.querySelector('[part="surface"]')!).getPropertyValue(
            'opacity',
          ),
        ),
    ).toBe('1');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('preserves boundaries in forced colors and removes entry motion when requested', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.locator('#content-dialog').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  const presentation = await page.locator('#content-dialog').evaluate((element) => {
    const root = element.shadowRoot!;
    const surface = getComputedStyle(root.querySelector('[part="surface"]')!);
    const close = getComputedStyle(root.querySelector('[part="close-button"]')!);
    return {
      forcedColors: matchMedia('(forced-colors: active)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationName: surface.animationName,
      surfaceBorder: surface.borderStyle,
      closeBorder: close.borderStyle,
    };
  });
  expect(presentation).toEqual({
    forcedColors: true,
    reducedMotion: true,
    animationName: 'none',
    surfaceBorder: 'solid',
    closeBorder: 'solid',
  });
});

test('reflows and scrolls internally at a 320 CSS-pixel zoom-equivalent viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 260 });
  await page.locator('#content-dialog').evaluate((element) => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector('h1')!.remove();
    element.querySelector('p')!.textContent = Array.from(
      { length: 16 },
      () => 'Maintenance context remains readable while the modal body scrolls independently.',
    ).join(' ');
    (element as HTMLElement & { show(): boolean }).show();
  });
  const layout = await page.locator('#content-dialog').evaluate((element) => {
    const root = element.shadowRoot!;
    const surface = root.querySelector<HTMLElement>('[part="surface"]')!;
    const body = root.querySelector<HTMLElement>('[part="body"]')!;
    const bounds = surface.getBoundingClientRect();
    return {
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      left: bounds.left,
      right: bounds.right,
      bodyClientHeight: body.clientHeight,
      bodyScrollHeight: body.scrollHeight,
    };
  });
  expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.bodyScrollHeight).toBeGreaterThan(layout.bodyClientHeight);
});
