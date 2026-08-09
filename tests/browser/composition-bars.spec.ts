import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openCompositionBars(
  page: import('@playwright/test').Page,
  options: {
    density?: 'compact' | 'comfortable';
    direction?: 'ltr' | 'rtl';
    theme?: 'wayglass-dark' | 'wayglass-light';
  } = {},
): Promise<void> {
  const parameters = new URLSearchParams({
    density: options.density ?? 'compact',
    direction: options.direction ?? 'ltr',
    theme: options.theme ?? 'wayglass-dark',
  });
  await page.goto(`/tests/browser/composition-bars/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-filter-bar') !== undefined &&
      customElements.get('wg-command-bar') !== undefined &&
      document.querySelector('wg-command-bar')?.shadowRoot !== null,
  );
}

test('keeps both element imports side-effect free with useful fallback content', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const filterBar = document.createElement('wg-filter-bar');
    filterBar.innerHTML = '<form><button>Fallback filters</button></form>';
    const commandBar = document.createElement('wg-command-bar');
    commandBar.innerHTML = '<button>Fallback command</button>';
    document.body.append(filterBar, commandBar);
    await Promise.all([
      import('/packages/elements/dist/filter-bar.js'),
      import('/packages/elements/dist/command-bar.js'),
    ]);
    return {
      registrations: ['wg-filter-bar', 'wg-command-bar'].map(
        (name) => customElements.get(name) !== undefined,
      ),
      text: [filterBar, commandBar].map((element) => element.textContent?.trim()),
      visible: [filterBar, commandBar].every(
        (element) => element.getBoundingClientRect().height > 0,
      ),
    };
  });
  expect(result).toEqual({
    registrations: [false, false],
    text: ['Fallback filters', 'Fallback command'],
    visible: true,
  });
});

test('preserves native form ownership, submitter identity, form data, and reset behavior', async ({
  page,
}) => {
  await openCompositionBars(page);
  await page.getByRole('checkbox', { name: 'Caution' }).check();
  await page.getByRole('combobox', { name: 'Source' }).selectOption('north');

  const result = await page.locator('#event-filter-form').evaluate(async (form) => {
    const events: string[] = [];
    let submitted: { submitter: string | null; data: [string, FormDataEntryValue][] } | undefined;
    form.addEventListener('input', () => events.push('input'));
    form.addEventListener('change', () => events.push('change'));
    form.addEventListener('reset', () => events.push('reset'));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submitEvent = event as SubmitEvent;
      submitted = {
        submitter: (submitEvent.submitter as HTMLButtonElement | null)?.value ?? null,
        data: Array.from(new FormData(form as HTMLFormElement, submitEvent.submitter).entries()),
      };
    });
    (form.querySelector('#apply-filters') as HTMLButtonElement).click();
    (form.querySelector('#reset-filter-draft') as HTMLButtonElement).click();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return {
      submitted,
      events,
      conditionChecked: (form.querySelector('[value="caution"]') as HTMLInputElement).checked,
      source: (form.querySelector('select') as HTMLSelectElement).value,
    };
  });

  expect(result.submitted).toEqual({
    submitter: 'apply',
    data: [
      ['condition', 'caution'],
      ['source', 'north'],
      ['intent', 'apply'],
    ],
  });
  expect(result.events).toEqual(['reset']);
  expect(result.conditionChecked).toBe(false);
  expect(result.source).toBe('');
});

test('creates named regions without toolbar, live-region, or extra focus semantics', async ({
  page,
}) => {
  await openCompositionBars(page);
  await expect(page.getByRole('region', { name: 'Event filters' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Event commands' })).toBeVisible();
  await expect(page.locator('wg-command-bar [role="toolbar"]')).toHaveCount(0);
  expect(
    await page
      .locator('wg-filter-bar, wg-command-bar')
      .evaluateAll((elements) => elements.every((element) => !element.hasAttribute('tabindex'))),
  ).toBe(true);
  await expect(page.locator('[aria-live], [role="status"], [role="alert"]')).toHaveCount(0);
});

test('keeps authored command priority, node identity, events, and ordinary Tab order', async ({
  page,
  browserName,
}) => {
  await openCompositionBars(page);
  const result = await page.locator('#event-commands').evaluate(async (bar) => {
    const primary = bar.querySelector<HTMLElement>('#acknowledge-events')!;
    const secondary = bar.querySelector<HTMLElement>('#assign-events')!;
    const overflow = bar.querySelector<HTMLElement>('#event-command-menu')!;
    const references = [primary, secondary, overflow];
    const events: string[] = [];
    bar.addEventListener('click', () => events.push('click'));
    bar.addEventListener('wg-command', () => events.push('wg-command'));
    bar.addEventListener('wg-command-bar-command', () => events.push('aggregate'));
    primary.click();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return {
      order: references.map((element) => element.getAttribute('slot') ?? 'primary'),
      sameNodes: references.every((element) => bar.contains(element)),
      events,
    };
  });
  expect(result).toEqual({
    order: ['primary', 'secondary', 'overflow'],
    sameNodes: true,
    events: ['click'],
  });

  await page.getByRole('button', { name: 'Acknowledge selected Event records' }).focus();
  // macOS WebKit uses Option+Tab when the system's full keyboard access setting is disabled.
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(tabKey);
  await expect(page.getByRole('button', { name: 'Assign selected Event records' })).toBeFocused();
  await page.keyboard.press(tabKey);
  await expect(page.getByRole('button', { name: 'More Event commands' })).toBeFocused();
});

test('preserves content and emits one stable diagnostic for unsupported anatomy', async ({
  page,
}) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await openCompositionBars(page);
  await page.evaluate(async () => {
    const filterBar = document.querySelector<HTMLElement>('#event-filters')!;
    const extra = document.createElement('article');
    extra.textContent = 'Preserved unsupported filter content';
    filterBar.append(extra);
    const legacySummary = document.createElement('p');
    legacySummary.slot = 'legacy-summary';
    legacySummary.textContent = 'Preserved unsupported named filter content';
    filterBar.append(legacySummary);
    const commandBar = document.querySelector<HTMLElement>('#event-commands')!;
    const overflow = document.createElement('article');
    overflow.slot = 'overflow';
    overflow.textContent = 'Preserved unsupported overflow content';
    commandBar.append(overflow);
    const legacyCommand = document.createElement('p');
    legacyCommand.slot = 'legacy-command';
    legacyCommand.textContent = 'Preserved unsupported named command content';
    commandBar.append(legacyCommand);
    for (const element of [filterBar, commandBar] as Array<
      HTMLElement & { requestUpdate(): void; updateComplete: Promise<boolean> }
    >) {
      await element.updateComplete;
      element.requestUpdate();
      await element.updateComplete;
    }
  });
  await expect(page.getByText('Preserved unsupported filter content')).toBeVisible();
  await expect(page.getByText('Preserved unsupported named filter content')).toBeVisible();
  await expect(page.getByText('Preserved unsupported overflow content')).toBeVisible();
  await expect(page.getByText('Preserved unsupported named command content')).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-filter-bar]'))).toHaveLength(1);
  expect(warnings.filter((warning) => warning.includes('[wg-command-bar]'))).toHaveLength(1);
});

test('stacks at 320 CSS pixels and 200 percent text without reordering or page overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompositionBars(page, { direction: 'rtl' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const result = await page.evaluate(() => {
    const commands = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#event-commands > #acknowledge-events, #event-commands > #assign-events, #event-commands > #event-command-menu',
      ),
    );
    return {
      direction: document.documentElement.dir,
      ids: commands.map((command) => command.id),
      tops: commands.map((command) => command.getBoundingClientRect().top),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(result.direction).toBe('rtl');
  expect(result.ids).toEqual(['acknowledge-events', 'assign-events', 'event-command-menu']);
  expect(result.tops[1]).toBeGreaterThan(result.tops[0]!);
  expect(result.tops[2]).toBeGreaterThan(result.tops[1]!);
  expect(result.overflow).toBeLessThanOrEqual(1);
});

test('maps density spacing without changing semantics', async ({ page }) => {
  const gaps: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openCompositionBars(page, { density });
    gaps.push(
      await page
        .locator('wg-filter-bar [part="base"]')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).gap)),
    );
  }
  expect(gaps[1]).toBeGreaterThan(gaps[0]!);
  await expect(page.getByRole('region', { name: 'Event filters' })).toBeVisible();
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes composition-bar accessibility checks in ${theme}`, async ({ page }) => {
    await openCompositionBars(page, { theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
