import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

function relativeLuminance(color: string): number {
  const channels = color
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number)
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/confirmation-dialog/');
  await page.waitForFunction(() => customElements.get('wg-confirmation-dialog') !== undefined);
});

test('keeps the module import side-effect free', async ({ page }) => {
  await page.goto('/tests/browser/module-import/');
  expect(
    await page.evaluate(async () => {
      await import('/packages/elements/dist/confirmation-dialog.js');
      return customElements.get('wg-confirmation-dialog') !== undefined;
    }),
  ).toBe(false);
});

test('opens one native modal with explicit labeling and cancel-first focus', async ({ page }) => {
  const accepted = await page.locator('#confirmation').evaluate((element) =>
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

  const dialog = page.getByRole('dialog', { name: 'Disconnect Northwind records?' });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#confirmation')).toHaveAttribute('open', '');
  await expect(page.getByRole('button', { name: 'Keep connected' })).toBeFocused();
  expect(
    await page.locator('#confirmation').evaluate((element) => {
      const nativeDialog = element.shadowRoot!.querySelector('dialog')!;
      return { open: nativeDialog.open, modal: nativeDialog.matches(':modal') };
    }),
  ).toEqual({ open: true, modal: true });
});

test('supports deliberate action and static-heading initial focus', async ({ page }) => {
  for (const [initialFocus, expectedPart] of [
    ['action', 'action-button'],
    ['heading', 'heading'],
  ] as const) {
    await page.locator('#confirmation').evaluate((element, value) => {
      element.setAttribute('initial-focus', value);
      (element as HTMLElement & { show(): boolean }).show();
    }, initialFocus);
    await expect
      .poll(() =>
        page
          .locator('#confirmation')
          .evaluate((element) => element.shadowRoot?.activeElement?.getAttribute('part')),
      )
      .toBe(expectedPart);
    await page.locator('#confirmation').evaluate(async (element) => {
      const closed = new Promise<void>((resolve) => {
        element.addEventListener('wg-confirmation-close', () => resolve(), { once: true });
      });
      (element as HTMLElement & { cancel(): boolean }).cancel();
      await closed;
    });
  }
});

test('keeps forward and reverse keyboard focus inside the native modal', async ({ page }) => {
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#invoker')).not.toBeFocused();
  await expect(page.locator('#fallback')).not.toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#invoker')).not.toBeFocused();
  await expect(page.locator('#fallback')).not.toBeFocused();
  expect(
    await page
      .locator('#confirmation')
      .evaluate((element) => element.shadowRoot!.querySelector('dialog')!.matches(':modal')),
  ).toBe(true);
});

test('closes on Escape, reports the reason, and returns focus to the invoker', async ({ page }) => {
  await page.locator('#invoker').focus();
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
    (element as HTMLElement & { events?: unknown[] }).events = [];
    element.addEventListener('wg-confirmation-close', (event) => {
      (element as HTMLElement & { events: unknown[] }).events.push((event as CustomEvent).detail);
    });
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#invoker')).toBeFocused();
  await expect
    .poll(() =>
      page
        .locator('#confirmation')
        .evaluate((element) => (element as HTMLElement & { events: unknown[] }).events),
    )
    .toEqual([{ dialogId: 'disconnect-source', reason: 'escape' }]);
});

test('closes before emitting one confirmed action intent', async ({ page }) => {
  await page.locator('#invoker').focus();
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { events?: string[] }).events = [];
    element.addEventListener('wg-confirmation-close', (event) => {
      const customEvent = event as CustomEvent<{ reason: string }>;
      (element as HTMLElement & { events: string[] }).events.push(
        `close:${customEvent.detail.reason}`,
      );
    });
    element.addEventListener('wg-confirmation-action', () => {
      (element as HTMLElement & { events: string[] }).events.push('action');
    });
    (element as HTMLElement & { show(): boolean }).show();
  });
  await page.getByRole('button', { name: 'Disconnect Northwind records' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#invoker')).toBeFocused();
  await expect
    .poll(() =>
      page
        .locator('#confirmation')
        .evaluate((element) => (element as HTMLElement & { events: string[] }).events),
    )
    .toEqual(['close:action', 'action']);
});

test('uses an explicit fallback when the action removes its invoker', async ({ page }) => {
  await page.locator('#confirmation').evaluate((element) => {
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
  await page.getByRole('button', { name: 'Keep connected' }).click();
  await expect(page.locator('#fallback')).toBeFocused();
});

test('returns focus through a shadow root to the remembered invoker', async ({ page }) => {
  const focused = await page.evaluate(async () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    button.textContent = 'Shadow invoker';
    root.append(button);
    document.body.append(host);
    button.focus();
    const confirmation = document.querySelector<HTMLElement>('#confirmation') as HTMLElement & {
      show(): boolean;
      cancel(): boolean;
    };
    confirmation.show();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    confirmation.cancel();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return document.activeElement === host && root.activeElement === button;
  });
  expect(focused).toBe(true);
});

test('rejects a second modal instead of stacking or queueing it', async ({ page }) => {
  const result = await page.evaluate(() => {
    const first = document.querySelector<HTMLElement>('#confirmation') as HTMLElement & {
      show(): boolean;
    };
    const second = document.querySelector<HTMLElement>('#second-confirmation') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    return { first: first.show(), second: second.show(), secondOpen: second.open };
  });
  expect(result).toEqual({ first: true, second: false, secondOpen: false });
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.getByRole('button', { name: 'Keep connected' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('rejects invocation while a foreign native modal is active', async ({ page }) => {
  const result = await page.evaluate(() => {
    const foreign = document.createElement('dialog');
    foreign.textContent = 'Application-owned workflow';
    document.body.append(foreign);
    foreign.showModal();
    const confirmation = document.querySelector<HTMLElement>('#confirmation') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    const accepted = confirmation.show();
    const state = { accepted, open: confirmation.open, foreignOpen: foreign.open };
    foreign.close();
    return state;
  });
  expect(result).toEqual({ accepted: false, open: false, foreignOpen: true });
});

test('ignores backdrop interaction and keeps the visible cancel path', async ({ page }) => {
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  await page.mouse.click(4, 4);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep connected' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep connected' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('reports programmatic closure and suppresses repeated confirmed activation', async ({
  page,
}) => {
  const result = await page.locator('#confirmation').evaluate(async (element) => {
    const confirmation = element as HTMLElement & {
      show(): boolean;
      close(): boolean;
      records?: string[];
    };
    confirmation.records = [];
    confirmation.addEventListener('wg-confirmation-close', (event) => {
      confirmation.records!.push(`close:${(event as CustomEvent).detail.reason}`);
    });
    confirmation.addEventListener('wg-confirmation-action', () => {
      confirmation.records!.push('action');
    });
    confirmation.show();
    const programmaticClose = new Promise<void>((resolve) => {
      confirmation.addEventListener('wg-confirmation-close', () => resolve(), { once: true });
    });
    confirmation.close();
    await programmaticClose;
    await (confirmation as typeof confirmation & { updateComplete: Promise<boolean> })
      .updateComplete;
    confirmation.show();
    await (confirmation as typeof confirmation & { updateComplete: Promise<boolean> })
      .updateComplete;
    const action =
      confirmation.shadowRoot!.querySelector<HTMLButtonElement>('[part="action-button"]')!;
    const actionClose = new Promise<void>((resolve) => {
      confirmation.addEventListener('wg-confirmation-close', () => resolve(), { once: true });
    });
    action.click();
    action.click();
    await actionClose;
    return confirmation.records;
  });
  expect(result).toEqual(['close:programmatic', 'close:action', 'action']);
});

test('rejects a reentrant invocation during the current close lifecycle', async ({ page }) => {
  const result = await page.locator('#confirmation').evaluate(async (element) => {
    const confirmation = element as HTMLElement & {
      show(): boolean;
      cancel(): boolean;
      open: boolean;
    };
    let reentrantAccepted: boolean | undefined;
    const closed = new Promise<void>((resolve) => {
      confirmation.addEventListener(
        'wg-confirmation-close',
        () => {
          reentrantAccepted = confirmation.show();
          resolve();
        },
        { once: true },
      );
    });
    confirmation.show();
    confirmation.cancel();
    await closed;
    return { reentrantAccepted, open: confirmation.open };
  });
  expect(result).toEqual({ reentrantAccepted: false, open: false });
});

test('allows the application to close stale terms before requiring a fresh decision', async ({
  page,
}) => {
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
    element.querySelector('p')!.textContent = 'The consequence changed while this was open.';
    (element as HTMLElement & { close(): boolean }).close();
  });
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#confirmation')).not.toHaveAttribute('open', '');
});

test('supports explicit interruptive semantics without changing the action appearance', async ({
  page,
}) => {
  await page.locator('#confirmation').evaluate((element) => {
    element.setAttribute('attention', 'interruptive');
    element.setAttribute('action-appearance', 'primary');
    (element as HTMLElement & { show(): boolean }).show();
  });
  await expect(
    page.getByRole('alertdialog', { name: 'Disconnect Northwind records?' }),
  ).toBeVisible();
  await expect(page.locator('#confirmation')).toHaveAttribute('action-appearance', 'primary');
});

test('rejects missing labels and complex interactive descriptions', async ({ page }) => {
  const results = await page.evaluate(() => {
    const element = document.querySelector<HTMLElement>('#confirmation') as HTMLElement & {
      show(): boolean;
      open: boolean;
    };
    element.removeAttribute('action-label');
    const missingLabel = element.show();
    element.setAttribute('action-label', 'Disconnect Northwind records');
    const control = document.createElement('button');
    control.textContent = 'Unexpected third choice';
    element.append(control);
    const complexContent = element.show();
    return { missingLabel, complexContent, open: element.open };
  });
  expect(results).toEqual({ missingLabel: false, complexContent: false, open: false });
});

test('normalizes the public vocabularies', async ({ page }) => {
  const element = page.locator('#confirmation');
  await element.evaluate((dialog) => {
    dialog.setAttribute('attention', 'urgent');
    dialog.setAttribute('action-appearance', 'danger');
    dialog.setAttribute('initial-focus', 'first');
  });
  await expect(element).toHaveAttribute('attention', 'ordinary');
  await expect(element).toHaveAttribute('action-appearance', 'primary');
  await expect(element).toHaveAttribute('initial-focus', 'cancel');
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations while open in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    await page.locator('#confirmation').evaluate((element) => {
      (element as HTMLElement & { show(): boolean }).show();
    });
    // axe-core currently composites a shadow-owned native ::backdrop over the dialog itself.
    // Check every modal foreground/background pair directly while retaining all other rules.
    expect(
      (await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze()).violations,
    ).toEqual([]);
    const colors = await page.locator('#confirmation').evaluate((element) => {
      const root = element.shadowRoot!;
      const style = (target: Element) => getComputedStyle(target);
      const surface = style(root.querySelector('[part="surface"]')!).backgroundColor;
      const cancel = style(root.querySelector('[part="cancel-button"]')!);
      const action = style(root.querySelector('[part="action-button"]')!);
      return {
        surface,
        heading: style(element.querySelector('[slot="heading"]')!).color,
        description: style(element.querySelector('p')!).color,
        cancel: { foreground: cancel.color, background: cancel.backgroundColor },
        action: { foreground: action.color, background: action.backgroundColor },
      };
    });
    expect(contrastRatio(colors.heading, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colors.description, colors.surface)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colors.cancel.foreground, colors.cancel.background),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colors.action.foreground, colors.action.background),
    ).toBeGreaterThanOrEqual(4.5);
  });
}

test('preserves boundaries in forced colors and removes entry motion when requested', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.locator('#confirmation').evaluate((element) => {
    (element as HTMLElement & { show(): boolean }).show();
  });
  const presentation = await page.locator('#confirmation').evaluate((element) => {
    const root = element.shadowRoot!;
    const surface = getComputedStyle(root.querySelector('[part="surface"]')!);
    const marker = getComputedStyle(root.querySelector('[part="marker"]')!);
    return {
      forcedColors: matchMedia('(forced-colors: active)').matches,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationName: surface.animationName,
      borderStyle: surface.borderStyle,
      markerBackground: marker.backgroundColor,
    };
  });
  expect(presentation.forcedColors).toBe(true);
  expect(presentation.reducedMotion).toBe(true);
  expect(presentation.animationName).toBe('none');
  expect(presentation.borderStyle).toBe('solid');
  expect(presentation.markerBackground).not.toBe('rgba(0, 0, 0, 0)');
});

test('reflows and scrolls internally at a 320 CSS-pixel zoom-equivalent viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 260 });
  await page.locator('#confirmation').evaluate((element) => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector('h1')!.remove();
    element.querySelector('p')!.textContent = Array.from(
      { length: 12 },
      () => 'Current updates will stop for every operator while stored records remain available.',
    ).join(' ');
    (element as HTMLElement & { show(): boolean }).show();
  });
  const layout = await page.locator('#confirmation').evaluate((element) => {
    const surface = element.shadowRoot!.querySelector<HTMLElement>('[part="surface"]')!;
    const bounds = surface.getBoundingClientRect();
    return {
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      left: bounds.left,
      right: bounds.right,
      clientHeight: surface.clientHeight,
      scrollHeight: surface.scrollHeight,
    };
  });
  expect(layout.documentScrollWidth).toBeLessThanOrEqual(layout.documentClientWidth);
  expect(layout.left).toBeGreaterThanOrEqual(0);
  expect(layout.right).toBeLessThanOrEqual(320);
  expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight);
});
