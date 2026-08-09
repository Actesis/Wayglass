import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type Fixture = 'workspace' | 'feedback' | 'no-matches';

async function openCompositionStory(
  page: import('@playwright/test').Page,
  options: {
    fixture?: Fixture;
    width?: 'phone' | 'desktop' | 'wall';
    theme?: 'wayglass-dark' | 'wayglass-light';
    density?: 'compact' | 'comfortable';
    direction?: 'ltr' | 'rtl';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    fixture: options.fixture ?? 'workspace',
    width: options.width ?? 'desktop',
    theme: options.theme ?? 'wayglass-dark',
    density: options.density ?? 'compact',
    direction: options.direction ?? 'ltr',
  });
  await page.goto(`/tests/browser/composition-stories/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-filter-bar') !== undefined &&
      customElements.get('wg-command-bar') !== undefined &&
      document.querySelector('wg-event-log, wg-alert, wg-empty-state')?.shadowRoot !== null,
  );
}

test('renders production-backed collection tools with one result announcement owner', async ({
  page,
}) => {
  await openCompositionStory(page);
  await expect(page.getByRole('region', { name: 'Event filters' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Selected Event record commands' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Filtered operational events' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await expect(page.locator('[aria-live]')).toHaveCount(1);
  await expect(page.locator('wg-command-bar [role="toolbar"]')).toHaveCount(0);
});

test('applies filters without replacing records or moving focus and resets only the draft', async ({
  page,
}) => {
  await openCompositionStory(page);
  await page.locator('#composition-event-03').evaluate((record) => {
    (window as Window & { retainedCompositionRecord?: Element }).retainedCompositionRecord = record;
  });
  await page.getByRole('checkbox', { name: 'Caution' }).check();
  await page.getByRole('combobox', { name: 'Source' }).selectOption('south');
  const submitter = page.getByRole('button', { name: 'Apply Event filters' });
  await submitter.focus();
  await submitter.press('Enter');
  await expect(submitter).toBeFocused();
  await expect(page.getByText('2 filters applied: Caution, South coordination.')).toBeVisible();
  await expect(page.getByText('1 event, filtered from 5.')).toBeVisible();
  await expect(page.locator('wg-event-record:not([hidden])')).toHaveCount(1);
  expect(
    await page
      .locator('#composition-event-03')
      .evaluate(
        (record) =>
          record ===
          (window as Window & { retainedCompositionRecord?: Element }).retainedCompositionRecord,
      ),
  ).toBe(true);

  await page.getByRole('button', { name: 'Reset filter draft' }).click();
  await expect(page.getByText('2 filters applied: Caution, South coordination.')).toBeVisible();
  await expect(page.getByText('1 event, filtered from 5.')).toBeVisible();
  await expect(
    page.getByText('Draft controls reset. Applied filters and results are unchanged.'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByText('No filters applied.')).toBeVisible();
  await expect(page.getByText('5 events, filtered from 5.')).toBeVisible();
  await expect(page.locator('wg-event-record:not([hidden])')).toHaveCount(5);
});

test('keeps command priority visible and moves durable progress outside the command control', async ({
  page,
}) => {
  await openCompositionStory(page);
  const primary = page.getByRole('button', { name: 'Acknowledge 2 selected Event records' });
  const secondary = page.getByRole('button', { name: 'Assign 2 selected Event records' });
  const overflow = page.getByRole('button', { name: 'More selected Event record commands' });
  await expect(primary).toBeVisible();
  await expect(secondary).toBeVisible();
  await expect(overflow).toBeVisible();
  await primary.click();
  await expect(primary).toHaveAttribute('aria-busy', 'true');
  await expect(
    page.getByText('Acknowledging 2 selected Event records. Confirmed record state is unchanged.'),
  ).toBeVisible();
});

test('keeps native constraint validation and submit focus application-owned', async ({ page }) => {
  await openCompositionStory(page);
  const result = await page.locator('.wg-composition-filter-form').evaluate((formElement) => {
    const form = formElement as HTMLFormElement;
    const source = form.querySelector<HTMLSelectElement>('#composition-source')!;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a source';
    source.prepend(placeholder);
    source.required = true;
    source.value = '';
    let submits = 0;
    form.addEventListener('submit', () => submits++);
    form.requestSubmit(form.querySelector<HTMLButtonElement>('[value="apply"]')!);
    return {
      submits,
      valid: source.validity.valid,
      activeId: document.activeElement?.id,
      describedBy: source.getAttribute('aria-describedby'),
    };
  });
  expect(result).toEqual({
    submits: 0,
    valid: false,
    activeId: 'composition-source',
    describedBy: null,
  });
  await expect(page.getByText('No filters applied.')).toBeVisible();
  await expect(page.getByText('5 events, unfiltered.')).toBeVisible();
});

test('uses ordinary Tab order and the existing flat-menu keyboard model', async ({
  page,
  browserName,
}) => {
  await openCompositionStory(page);
  const primary = page.getByRole('button', { name: 'Acknowledge 2 selected Event records' });
  const secondary = page.getByRole('button', { name: 'Assign 2 selected Event records' });
  const overflow = page.getByRole('button', { name: 'More selected Event record commands' });
  await primary.focus();
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);
  await expect(secondary).toBeFocused();
  await page.keyboard.press(tabKey);
  await expect(overflow).toBeFocused();

  await overflow.press('Enter');
  const exportCommand = page.getByRole('menuitem', { name: 'Export selected Event records' });
  await expect(exportCommand).toBeFocused();
  await exportCommand.press('Enter');
  await expect(overflow).toBeFocused();
  await expect(
    page.getByText(
      'Requested export selected Event records; completion remains application-owned.',
    ),
  ).toBeVisible();
});

test('does not duplicate, reorder, or aggregate commands across responsive compositions', async ({
  page,
}) => {
  await openCompositionStory(page, { width: 'phone', direction: 'rtl' });
  const result = await page.locator('wg-command-bar').evaluate(async (bar) => {
    const commands = Array.from(bar.children).filter((element) =>
      ['WG-BUTTON', 'WG-MENU'].includes(element.tagName),
    );
    const references = [...commands];
    let aggregateEvents = 0;
    bar.addEventListener('wg-command-bar-command', () => aggregateEvents++);
    (commands[0] as HTMLElement).click();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return {
      count: commands.length,
      slots: commands.map((element) => element.getAttribute('slot') ?? 'primary'),
      sameNodes: references.every((element) => bar.contains(element)),
      aggregateEvents,
      direction: document.documentElement.dir,
    };
  });
  expect(result).toEqual({
    count: 3,
    slots: ['primary', 'secondary', 'overflow'],
    sameNodes: true,
    aggregateEvents: 0,
    direction: 'rtl',
  });
});

test('preserves primary actions and avoids page overflow in the phone composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompositionStory(page, { width: 'phone' });
  await expect(
    page.getByRole('button', { name: 'Acknowledge 2 selected Event records' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test('preserves touch targets and density mapping without changing semantics', async ({ page }) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openCompositionStory(page, { density });
    gaps.push(
      await page
        .locator('wg-command-bar [part="base"]')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
    await expect(
      page.getByRole('region', { name: 'Selected Event record commands' }),
    ).toBeVisible();
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);

  const targets = await page
    .locator(
      '.wg-composition-filter-actions button, #composition-source, wg-command-bar wg-button button, wg-command-bar wg-menu button',
    )
    .evaluateAll((elements) =>
      elements.map((element) => ({
        name: element.textContent?.trim() ?? element.getAttribute('aria-label') ?? element.tagName,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      })),
    );
  expect(targets.length).toBeGreaterThanOrEqual(7);
  for (const target of targets) {
    expect(target.width, `${target.name} width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.name} height`).toBeGreaterThanOrEqual(44);
  }
});

test('contains long localized content at 320 pixels, 200 percent text, RTL, and adaptive media', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompositionStory(page, {
    width: 'phone',
    theme: 'wayglass-light',
    density: 'comfortable',
    direction: 'rtl',
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    document.querySelector<HTMLElement>('.wg-composition-viewport')!.style.filter = 'grayscale(1)';
    document.querySelector<HTMLElement>('wg-filter-bar [slot="summary"]')!.textContent =
      '3 filters applied: Überprüfung erforderlich, Coordinación del corredor meridional, and the preceding twenty-four-hour operational interval.';
    document.querySelector<HTMLElement>('wg-command-bar [slot="description"]')!.textContent =
      'Commands affect two selected records from the extraordinarily long localized operational-review collection.';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByText(/Überprüfung erforderlich/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Acknowledge 2 selected Event records' }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('shows persistent pending, rejection, retry, and unavailable reasons', async ({ page }) => {
  await openCompositionStory(page, { fixture: 'feedback', theme: 'wayglass-light' });
  await expect(
    page.getByRole('progressbar', { name: 'Applying South coordination filter' }),
  ).toBeVisible();
  await expect(
    page.getByText('5 retained events remain valid while the request is pending.'),
  ).toBeVisible();
  await expect(page.getByText('The 2 Event records remain unacknowledged.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Retry acknowledging 2 selected Event records' }),
  ).toBeVisible();
  await expect(page.getByText(/Archive is unavailable while operational review/)).toBeVisible();
});

test('keeps no-match context outside the filter bar with a clear recovery path', async ({
  page,
}) => {
  await openCompositionStory(page, { fixture: 'no-matches' });
  await expect(page.getByText('2 filters applied: Critical, Archive coordination.')).toBeVisible();
  await expect(page.getByText('0 events, filtered from 500.')).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'No events match Critical and Archive coordination' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Clear Event filters' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes production composition accessibility checks in ${theme}`, async ({ page }) => {
    await openCompositionStory(page, { theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
