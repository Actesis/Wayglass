import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/form-controls/');
  await page.waitForFunction(() => customElements.get('wg-slider') !== undefined);
});

test('keeps form-control imports side-effect free with native fallback content', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const shell = document.createElement('wg-text-field');
    const input = document.createElement('input');
    input.name = 'fallback';
    shell.append(input);
    document.body.append(shell);
    await Promise.all([
      import('/packages/elements/dist/text-field.js'),
      import('/packages/elements/dist/number-field.js'),
      import('/packages/elements/dist/select.js'),
      import('/packages/elements/dist/checkbox.js'),
      import('/packages/elements/dist/radio.js'),
      import('/packages/elements/dist/slider.js'),
    ]);
    return {
      registered: [
        'wg-text-field',
        'wg-number-field',
        'wg-select',
        'wg-checkbox',
        'wg-radio',
        'wg-slider',
      ].some((name) => customElements.get(name) !== undefined),
      inputVisible: input.getBoundingClientRect().width > 0,
      inputName: input.name,
    };
  });
  expect(result).toEqual({ registered: false, inputVisible: true, inputName: 'fallback' });
});

test('keeps the native controls as the only form-control roles and focus targets', async ({
  page,
}) => {
  await expect(page.getByRole('textbox', { name: 'Profile name' })).toHaveCount(1);
  await expect(page.getByRole('spinbutton', { name: 'Team size' })).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Region' })).toHaveCount(1);
  await expect(page.getByRole('checkbox', { name: 'Send account updates' })).toHaveCount(1);
  await expect(page.getByRole('slider', { name: 'Alert threshold' })).toHaveCount(1);
  for (const tag of [
    'wg-text-field',
    'wg-number-field',
    'wg-select',
    'wg-checkbox',
    'wg-radio',
    'wg-slider',
  ]) {
    await expect(page.locator(tag).first()).not.toHaveAttribute('role', /.+/);
    await expect(page.locator(tag).first()).not.toHaveAttribute('tabindex', /.+/);
  }
});

test('reports invalid direct anatomy without hiding or replacing the native control', async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...values: unknown[]) => warnings.push(values.join(' '));
    const shell = document.createElement('wg-number-field');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'still native';
    shell.append(input);
    document.body.append(shell);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    console.warn = originalWarn;
    return {
      warning: warnings.find((value) => value.includes('[wg-number-field]')) ?? '',
      inputValue: input.value,
      inputVisible: input.getBoundingClientRect().width > 0,
      inputRole: input.getAttribute('role'),
    };
  });

  expect(result.warning).toContain('Expected exactly one direct input[type="number"]');
  expect(result).toMatchObject({ inputValue: 'still native', inputVisible: true, inputRole: null });
});

test('preserves ordinary text, textarea, and number editing behavior', async ({ page }) => {
  const name = page.getByLabel('Profile name');
  await name.fill('Morgan');
  await expect(name).toHaveValue('Morgan');
  const note = page.getByLabel('Profile note');
  await note.fill('Updated note');
  await expect(note).toHaveValue('Updated note');
  const number = page.getByLabel('Team size');
  await number.fill('8');
  await number.press('ArrowUp');
  await expect(number).toHaveValue('9');
});

test('preserves native select options, optgroups, and change behavior', async ({ page }) => {
  const select = page.getByLabel('Region');
  await expect(select.locator('optgroup')).toHaveCount(2);
  await select.selectOption('eu');
  await expect(select).toHaveValue('eu');
});

test('uses native label activation and preserves checkbox mixed state', async ({ page }) => {
  const updates = page.getByRole('checkbox', { name: 'Send account updates' });
  await page.getByText('Send account updates').click();
  await expect(updates).not.toBeChecked();
  const mixed = page.getByRole('checkbox', { name: 'Apply to selected teams' });
  expect(await mixed.evaluate((input: HTMLInputElement) => input.indeterminate)).toBe(true);
});

test('retains native radio grouping and keyboard movement', async ({ page }) => {
  const daily = page.getByRole('radio', { name: 'Daily' });
  const weekly = page.getByRole('radio', { name: 'Weekly' });
  await daily.focus();
  await daily.press('ArrowDown');
  await expect(weekly).toBeChecked();
  await expect(daily).not.toBeChecked();
});

test('retains native range keyboard adjustment and application-owned output', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'Alert threshold' });
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('70');
  await expect(page.locator('#threshold-value')).toHaveText('70 percent');
});

test('preserves native submission values and reset defaults', async ({ page }) => {
  await page.getByLabel('Profile name').fill('Morgan');
  await page.getByRole('radio', { name: 'Weekly' }).check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  const data = JSON.parse((await page.locator('html').getAttribute('data-form-data')) ?? '{}');
  expect(data).toEqual({
    profileName: 'Morgan',
    note: 'Initial note',
    teamSize: '4',
    region: 'na',
    updates: 'yes',
    schedule: 'weekly',
    threshold: '60',
    recovery: 'name@example',
    intent: 'save',
  });
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('Profile name')).toHaveValue('Matt');
  await expect(page.getByRole('radio', { name: 'Daily' })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-reset', 'true');
});

test('keeps control and labeled-choice targets at least 44 CSS pixels', async ({ page }) => {
  for (const selector of ['#profile-name', '#team-size', '#region', '#threshold']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(bounds?.height, selector).toBeGreaterThanOrEqual(44);
  }
  for (const selector of ['label[for="updates"]', 'label[for="daily"]']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(bounds?.height, selector).toBeGreaterThanOrEqual(44);
  }
});

test('distinguishes explicit invalid styling from native pristine validity', async ({ page }) => {
  const recovery = page.locator('#recovery');
  const profile = page.locator('#profile-name');
  await expect(recovery).toHaveAttribute('aria-invalid', 'true');
  expect(
    await recovery.evaluate((element) => getComputedStyle(element).borderInlineStartColor),
  ).not.toBe(await profile.evaluate((element) => getComputedStyle(element).borderInlineStartColor));
  await expect(recovery).toHaveAccessibleDescription('Enter a complete email address.');
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`has no automated accessibility violations in ${theme}`, async ({ page }) => {
    await page.locator('wg-theme-provider').evaluate((element, value) => {
      element.setAttribute('theme', value);
    }, theme);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test('retains native controls and focus distinction in forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-slider') !== undefined);
  await page.getByLabel('Profile name').focus();
  await expect(page.getByLabel('Profile name')).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('reflows at a 320 CSS-pixel viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.reload();
  await page.waitForFunction(() => customElements.get('wg-slider') !== undefined);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
});
