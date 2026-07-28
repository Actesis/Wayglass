import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/fixture/');
  await page.waitForFunction(
    () =>
      customElements.get('wg-canvas') !== undefined &&
      customElements.get('wg-rail') !== undefined &&
      customElements.get('wg-elbow') !== undefined &&
      customElements.get('wg-panel') !== undefined &&
      customElements.get('wg-button') !== undefined,
  );
});

test('normalizes invalid structural and action attributes', async ({ page }) => {
  await page.locator('#canvas').evaluate((element) => element.setAttribute('width', 'wide'));
  await page.locator('#rail').evaluate((element) => {
    element.setAttribute('orientation', 'vertical');
    element.setAttribute('weight', 'heavy');
  });
  await page.locator('#elbow').evaluate((element) => {
    element.setAttribute('placement', 'left');
    element.setAttribute('weight', 'heavy');
  });
  await page.locator('#panel').evaluate((element) => {
    element.setAttribute('purpose', 'status');
    element.setAttribute('emphasis', 'prominent');
  });
  await page
    .locator('#primary-button')
    .evaluate((element) => element.setAttribute('appearance', 'loud'));

  await expect(page.locator('#canvas')).toHaveAttribute('width', 'contained');
  await expect(page.locator('#rail')).toHaveAttribute('orientation', 'block');
  await expect(page.locator('#rail')).toHaveAttribute('weight', 'standard');
  await expect(page.locator('#elbow')).toHaveAttribute('placement', 'start');
  await expect(page.locator('#elbow')).toHaveAttribute('weight', 'standard');
  await expect(page.locator('#panel')).toHaveAttribute('purpose', 'information');
  await expect(page.locator('#panel')).toHaveAttribute('emphasis', 'standard');
  await expect(page.locator('#primary-button')).toHaveAttribute('appearance', 'secondary');
});

test('constrains contained canvas content and preserves slot order', async ({ page }) => {
  const canvas = page.locator('#canvas');
  const containedWidth = await canvas.evaluate(
    (element) =>
      element.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!.getBoundingClientRect()
        .width,
  );

  const verticalOrder = await canvas.evaluate((element) =>
    Array.from(element.children).map((child) => ({
      slot: child.getAttribute('slot') ?? 'default',
      top: child.getBoundingClientRect().top,
    })),
  );

  expect(verticalOrder[0]?.slot).toBe('header');
  expect(verticalOrder.at(-1)?.slot).toBe('footer');
  expect(verticalOrder[0]!.top).toBeLessThan(verticalOrder.at(-1)!.top);

  await canvas.evaluate((element) => element.setAttribute('width', 'full'));
  const fullWidth = await canvas.evaluate(
    (element) =>
      element.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!.getBoundingClientRect()
        .width,
  );
  expect(fullWidth).toBeGreaterThan(containedWidth);
});

test('keeps structural elements inert and direction neutral', async ({ page }) => {
  await expect(page.locator('#rail')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#rail')).not.toHaveAttribute('tabindex', /.+/);
  await expect(page.locator('#elbow')).not.toHaveAttribute('tabindex', /.+/);

  const blockRail = await page.locator('#rail').boundingBox();
  expect(blockRail).not.toBeNull();
  expect(blockRail!.height).toBeGreaterThan(blockRail!.width);

  await page.locator('#rail').evaluate((element) => element.setAttribute('orientation', 'inline'));
  const inlineRail = await page.locator('#rail').boundingBox();
  expect(inlineRail).not.toBeNull();
  expect(inlineRail!.width).toBeGreaterThan(inlineRail!.height);

  await page.locator('html').evaluate((element) => element.setAttribute('dir', 'rtl'));
  await expect(page.locator('#elbow')).toBeVisible();
});

test('exposes panel regions only when they have accessible names', async ({ page }) => {
  await expect(page.getByRole('region', { name: 'Primary link monitor' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Recovery control' })).toBeVisible();

  const unlabelledRole = await page.locator('#unlabelled-panel').evaluate((element) => {
    const section = element.shadowRoot?.querySelector('section');
    return section?.getAttribute('role');
  });
  expect(unlabelledRole).toBeNull();

  const busySemantics = await page.locator('#panel').evaluate((element) => {
    const section = element.shadowRoot?.querySelector('section');
    return {
      busy: section?.getAttribute('aria-busy'),
    };
  });
  expect(busySemantics.busy).toBe('true');
  await expect(page.locator('#panel')).toContainText(
    'Confirmed content remains visible while busy.',
  );
  await expect(page.locator('#panel')).toContainText('Refreshing link state');
});

test('uses native button activation and forwards host focus and click', async ({ page }) => {
  const button = page.locator('#primary-button');
  const nativeButton = button.locator('button');

  await button.evaluate((element) => {
    document.documentElement.dataset.activationCount = '0';
    element.addEventListener('click', () => {
      const current = Number(document.documentElement.dataset.activationCount);
      document.documentElement.dataset.activationCount = String(current + 1);
    });
    (element as HTMLElement).focus();
  });

  await expect(nativeButton).toBeFocused();
  await nativeButton.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-activation-count', '1');

  await button.evaluate((element) => (element as HTMLElement).click());
  await expect(page.locator('html')).toHaveAttribute('data-activation-count', '2');
});

test('suppresses pending and disabled activation while retaining pending focus', async ({
  page,
}) => {
  const pending = page.locator('#pending-button');
  const pendingNative = pending.locator('button');
  const disabledNative = page.locator('#disabled-button').locator('button');

  await pending.evaluate((element) => {
    document.documentElement.dataset.pendingActivations = '0';
    element.addEventListener('click', () => {
      const current = Number(document.documentElement.dataset.pendingActivations);
      document.documentElement.dataset.pendingActivations = String(current + 1);
    });
    (element as HTMLElement).focus();
    (element as HTMLElement).click();
  });

  await expect(pendingNative).toBeFocused();
  await expect(pendingNative).toHaveAttribute('aria-disabled', 'true');
  await expect(pendingNative).toHaveAttribute('aria-busy', 'true');
  await pendingNative.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-pending-activations', '0');
  await expect(disabledNative).toBeDisabled();
});

test('retains pending button width and does not disable slotted panel controls', async ({
  page,
}) => {
  const pending = page.locator('#pending-button');
  const pendingNative = pending.locator('button');
  const pendingWidth = (await pendingNative.boundingBox())!.width;

  await pending.evaluate((element) => element.removeAttribute('pending'));
  const settledWidth = (await pendingNative.boundingBox())!.width;
  expect(settledWidth).toBe(pendingWidth);

  const panel = page.locator('#fallback-panel');
  await panel.evaluate((element) => element.setAttribute('disabled', ''));
  await expect(panel.locator('section')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#primary-button').locator('button')).toBeEnabled();
});

test('preserves the minimum button target and recomposes narrow panel actions', async ({
  page,
}) => {
  const buttonBox = await page.locator('#primary-button').locator('button').boundingBox();
  expect(buttonBox).not.toBeNull();
  expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  expect(buttonBox!.width).toBeGreaterThanOrEqual(44);

  const positions = await page.locator('#narrow-panel').evaluate((element) => {
    const description = element.shadowRoot?.querySelector<HTMLElement>('[part="content"]');
    const actions = element.shadowRoot?.querySelector<HTMLElement>('[part="actions"]');
    return {
      descriptionTop: description?.getBoundingClientRect().top,
      actionsTop: actions?.getBoundingClientRect().top,
    };
  });

  expect(positions.descriptionTop).toBeDefined();
  expect(positions.actionsTop).toBeDefined();
  expect(positions.actionsTop!).toBeGreaterThan(positions.descriptionTop!);
});

test('has no automated accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
