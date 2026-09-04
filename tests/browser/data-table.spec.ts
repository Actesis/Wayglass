import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openDataTable(
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
  await page.goto(`/tests/browser/data-table/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-data-table') !== undefined &&
      customElements.get('wg-scroll-region') !== undefined &&
      document.querySelector('wg-data-table')?.shadowRoot !== null,
  );
}

test('keeps the element import side-effect free and leaves useful native fallback', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    const dataTable = document.createElement('wg-data-table');
    dataTable.innerHTML = `
      <p slot="context">Fallback table context</p>
      <wg-scroll-region axis="inline" label="Fallback records table">
        <table><caption>Fallback records</caption><tbody><tr><td>Record one</td></tr></tbody></table>
      </wg-scroll-region>
    `;
    document.body.append(dataTable);
    await import('/packages/elements/dist/data-table.js');
    return {
      dataTableRegistered: customElements.get('wg-data-table') !== undefined,
      scrollRegionRegistered: customElements.get('wg-scroll-region') !== undefined,
      text: dataTable.textContent?.replace(/\s+/g, ' ').trim(),
      visible: dataTable.getBoundingClientRect().height > 0,
    };
  });
  expect(result).toEqual({
    dataTableRegistered: false,
    scrollRegionRegistered: false,
    text: 'Fallback table context Fallback recordsRecord one',
    visible: true,
  });
});

test('keeps React registration explicit for the separately composed scroll region', async ({
  page,
}) => {
  await page.goto('/tests/browser/module-import/');
  const result = await page.evaluate(async () => {
    await import('/packages/react/dist/data-table.js');
    return {
      dataTableRegistered: customElements.get('wg-data-table') !== undefined,
      scrollRegionRegistered: customElements.get('wg-scroll-region') !== undefined,
    };
  });
  expect(result).toEqual({
    dataTableRegistered: true,
    scrollRegionRegistered: false,
  });
});

test('preserves native table semantics without adding grid, live-region, or wrapper focus', async ({
  page,
}) => {
  await openDataTable(page);
  await expect(page.getByRole('table', { name: 'Operational review records' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Record' })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Review WG-1842' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Operational review records table' }),
  ).toBeVisible();
  await expect(page.locator('wg-data-table')).not.toHaveAttribute('tabindex');
  await expect(
    page.locator('wg-data-table [role="grid"], [aria-live], [role="status"]'),
  ).toHaveCount(0);
});

test('keeps sorting intent, row identity, and data operations application-owned', async ({
  page,
}) => {
  await openDataTable(page);
  const result = await page.locator('#operational-records').evaluate(async (dataTable) => {
    const table = dataTable.querySelector<HTMLTableElement>('#records-table')!;
    const row = dataTable.querySelector<HTMLTableRowElement>('#record-1842')!;
    const sort = dataTable.querySelector<HTMLButtonElement>('#sort-updated')!;
    const events: string[] = [];
    dataTable.addEventListener('click', () => events.push('click'));
    dataTable.addEventListener('wg-data-table-sort', () => events.push('aggregate'));
    sort.click();
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    return {
      events,
      sameTable: table === dataTable.querySelector('#records-table'),
      sameRow: row === dataTable.querySelector('#record-1842'),
      ariaSort: sort.closest('th')?.getAttribute('aria-sort'),
      rowOrder: Array.from(table.tBodies[0]?.rows ?? []).map((current) => current.id),
    };
  });
  expect(result).toEqual({
    events: ['click'],
    sameTable: true,
    sameRow: true,
    ariaSort: 'descending',
    rowOrder: ['record-1842', 'record-1841', 'record-1840'],
  });
});

test('scopes the opt-in native stylesheet and maps inherited density', async ({ page }) => {
  const cellPadding: number[] = [];
  for (const density of ['compact', 'comfortable'] as const) {
    await openDataTable(page, { density });
    cellPadding.push(
      await page
        .locator('#records-table td')
        .first()
        .evaluate((cell) => Number.parseFloat(getComputedStyle(cell).paddingBlockStart)),
    );
  }
  expect(cellPadding[1]).toBeGreaterThan(cellPadding[0]!);

  const scoped = await page.evaluate(() => ({
    inside: getComputedStyle(document.querySelector('#records-table td')!).paddingInlineStart,
    outside: getComputedStyle(document.querySelector('#outside-cell')!).paddingInlineStart,
  }));
  expect(scoped.inside).not.toBe(scoped.outside);
});

test('contains the same table at 320 CSS pixels, 200 percent text, and RTL', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openDataTable(page, { direction: 'rtl' });
  await page.locator('#records-table').evaluate((table) => {
    (table as HTMLElement).dataset.identity = 'retained-table';
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const result = await page.evaluate(() => {
    const table = document.querySelector<HTMLElement>('#records-table')!;
    const scroll = document.querySelector<HTMLElement>('wg-scroll-region')!;
    return {
      direction: document.documentElement.dir,
      identity: table.dataset.identity,
      tableOverflow: table.scrollWidth > scroll.clientWidth,
      regionFocusable: scroll.tabIndex === 0,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(result).toEqual({
    direction: 'rtl',
    identity: 'retained-table',
    tableOverflow: true,
    regionFocusable: true,
    pageOverflow: 0,
  });

  const flattenedOrder = await page.evaluate(() => {
    const dataTable = document.querySelector<HTMLElement>('#operational-records')!;
    const context = dataTable.shadowRoot!.querySelector<HTMLElement>('[part="context"]')!;
    const scroll = dataTable.querySelector<HTMLElement>('wg-scroll-region')!;
    const feedback = dataTable.shadowRoot!.querySelector<HTMLElement>('[part="feedback"]')!;
    return {
      contextBottom: context.getBoundingClientRect().bottom,
      scrollTop: scroll.getBoundingClientRect().top,
      scrollBottom: scroll.getBoundingClientRect().bottom,
      feedbackTop: feedback.getBoundingClientRect().top,
    };
  });
  expect(flattenedOrder.scrollTop).toBeGreaterThanOrEqual(flattenedOrder.contextBottom);
  expect(flattenedOrder.feedbackTop).toBeGreaterThanOrEqual(flattenedOrder.scrollBottom);
});

test('preserves unsupported anatomy and emits one stable diagnostic', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await openDataTable(page);
  await page.evaluate(async () => {
    const dataTable = document.querySelector<
      HTMLElement & {
        requestUpdate(): void;
        updateComplete: Promise<boolean>;
      }
    >('#operational-records')!;
    const extra = document.createElement('article');
    extra.textContent = 'Preserved unsupported default content';
    dataTable.append(extra);
    const legacy = document.createElement('p');
    legacy.slot = 'legacy';
    legacy.textContent = 'Preserved unsupported named content';
    dataTable.append(legacy);
    await dataTable.updateComplete;
    dataTable.requestUpdate();
    await dataTable.updateComplete;
  });
  await expect(page.getByText('Preserved unsupported default content')).toBeVisible();
  await expect(page.getByText('Preserved unsupported named content')).toBeVisible();
  expect(warnings.filter((warning) => warning.includes('[wg-data-table]'))).toHaveLength(1);
});

for (const theme of ['wayglass-dark', 'wayglass-light'] as const) {
  test(`passes data-table accessibility checks in ${theme}`, async ({ page }) => {
    await openDataTable(page, { theme });
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
