import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/form-foundation/');
  await page.waitForFunction(() => customElements.get('wg-form-group') !== undefined);
});

test('keeps form-foundation imports side-effect free and fallback content visible', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const fallback = document.createElement('wg-field-message');
    fallback.textContent = 'Persistent fallback help';
    document.body.append(fallback);
    await Promise.all([
      import('/packages/elements/dist/field-label.js'),
      import('/packages/elements/dist/field-message.js'),
      import('/packages/elements/dist/form-group.js'),
    ]);
    return {
      labelRegistered: customElements.get('wg-field-label') !== undefined,
      messageRegistered: customElements.get('wg-field-message') !== undefined,
      groupRegistered: customElements.get('wg-form-group') !== undefined,
      fallbackText: fallback.textContent,
    };
  });

  expect(result).toEqual({
    labelRegistered: false,
    messageRegistered: false,
    groupRegistered: false,
    fallbackText: 'Persistent fallback help',
  });
});

test('preserves native label activation and adds no duplicate roles or focus stops', async ({
  page,
}) => {
  const email = page.getByLabel('Email address Required');
  await page.locator('label[for="email"]').click();
  await expect(email).toBeFocused();
  await expect(email).toHaveAccessibleDescription('Used for account notices.');
  await expect(page.locator('#email-group')).not.toHaveAttribute('role', /.+/);
  await expect(page.locator('#email-group')).not.toHaveAttribute('tabindex', /.+/);
  await expect(page.locator('#email-help')).not.toHaveAttribute('role', /.+/);
});

test('keeps pristine required fields free of authored error state', async ({ page }) => {
  const email = page.locator('#email');
  await expect(email).not.toHaveAttribute('aria-invalid', /.+/);
  await expect(page.locator('#email-error')).toBeHidden();
  expect(await email.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(
    true,
  );
});

test('uses native validation before exposing persistent application-authored errors', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Save account profile' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-submit-count', /.+/);
  await expect(page.locator('html')).toHaveAttribute('data-invalid-count', /[1-9]/);
  const email = page.locator('#email');
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#email-error')).toBeVisible();
  await expect(email).toHaveAccessibleDescription(
    'Used for account notices. Enter a complete email address, such as name@example.com.',
  );
});

test('preserves native submitter identity and successful-control form data', async ({ page }) => {
  await page.locator('#email').fill('person@example.com');
  await page.getByLabel('Email', { exact: true }).check();
  await page.getByRole('button', { name: 'Save account profile' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-submit-count', '1');
  await expect(page.locator('html')).toHaveAttribute('data-submitter', 'save');
  const formData = JSON.parse((await page.locator('html').getAttribute('data-form-data')) ?? '{}');
  expect(formData).toEqual({
    email: 'person@example.com',
    accountId: 'AC-2048',
    contact: 'email',
    intent: 'save',
  });
});

test('keeps native reset ownership and lets the application clear explicit errors', async ({
  page,
}) => {
  await page.locator('#email').fill('changed@example.com');
  await page.locator('#email').evaluate((element) => element.setAttribute('aria-invalid', 'true'));
  await page.getByRole('button', { name: 'Reset changes' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-reset-count', '1');
  await expect(page.locator('#email')).toHaveValue('');
  await expect(page.locator('#email')).not.toHaveAttribute('aria-invalid', /.+/);
  await expect(page.locator('#email-error')).toBeHidden();
});

test('retains native fieldset and legend grouping', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Preferred contact method Required' });
  await expect(group).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Email' })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Phone' })).toHaveCount(1);
});

test('normalizes message kind without adding automatic live-region semantics', async ({ page }) => {
  const message = page.locator('#email-help');
  await message.evaluate((element) => element.setAttribute('kind', 'warning'));
  await expect(message).toHaveAttribute('kind', 'help');
  await expect(message).not.toHaveAttribute('role', /.+/);
  await expect(message).not.toHaveAttribute('aria-live', /.+/);
});

test('keeps native form actions touch-sized and keyboard focused', async ({ page }) => {
  const submit = page.getByRole('button', { name: 'Save account profile' });
  const bounds = await submit.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  expect(bounds?.height).toBeGreaterThanOrEqual(44);
  await submit.focus();
  await expect(submit).toBeFocused();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('retains focus and error distinction in forced colors and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-form-group') !== undefined);
  await page.getByRole('button', { name: 'Save account profile' }).click();
  await expect(page.locator('#email')).toBeFocused();
  await expect(page.locator('#email-error')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('reflows at a 320 CSS-pixel viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-form-group') !== undefined);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
});
