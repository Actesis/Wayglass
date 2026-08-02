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
  expect(
    await page
      .locator('#confirmation')
      .evaluate((element) => (element as HTMLElement & { events: unknown[] }).events),
  ).toEqual([{ dialogId: 'disconnect-source', reason: 'escape' }]);
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
  expect(
    await page
      .locator('#confirmation')
      .evaluate((element) => (element as HTMLElement & { events: string[] }).events),
  ).toEqual(['close:action', 'action']);
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
