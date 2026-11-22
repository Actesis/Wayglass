import { expect, test, type Page } from '@playwright/test';

async function openContentWrapping(
  page: Page,
  options: { direction?: 'ltr' | 'rtl'; textScale?: '100' | '200' } = {},
): Promise<void> {
  const parameters = new URLSearchParams({ direction: options.direction ?? 'ltr' });
  await page.goto(`/tests/browser/content-wrapping/?${parameters}`);
  await page.waitForFunction(
    () =>
      customElements.get('wg-data-table') !== undefined &&
      customElements.get('wg-scroll-region') !== undefined &&
      customElements.get('wg-button') !== undefined,
  );
  if (options.textScale === '200') {
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/**
 * Returns every word fragment (text between spaces and hyphens, which are ordinary break
 * opportunities) that the browser rendered across more than one line, including text rendered in
 * component shadow roots.
 */
async function brokenWords(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((rootSelector) => {
    const root = document.querySelector(rootSelector);
    if (root === null) throw new Error(`Missing ${rootSelector}`);
    const broken: string[] = [];
    const visit = (scope: Node): void => {
      const walker = document.createTreeWalker(
        scope,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      );
      for (let node: Node | null = walker.currentNode; node !== null; node = walker.nextNode()) {
        if (node instanceof Element && node.shadowRoot !== null) visit(node.shadowRoot);
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const text = node.textContent ?? '';
        for (const match of text.matchAll(/[^\s-]+/g)) {
          const range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          const lines = new Set(
            [...range.getClientRects()]
              .filter((rect) => rect.width > 0)
              .map((rect) => Math.round(rect.top)),
          );
          if (lines.size > 1) broken.push(match[0]);
        }
      }
    };
    visit(root);
    return broken;
  }, selector);
}

async function tableOverflow(page: Page) {
  return page.evaluate(() => {
    const scroll = document.querySelector<HTMLElement>('#route-table wg-scroll-region')!;
    const table = scroll.querySelector('table')!;
    return {
      tableOverflow: table.scrollWidth > scroll.clientWidth,
      regionFocusable: scroll.tabIndex === 0,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

test('keeps whole words in a table that has no forced width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openContentWrapping(page);

  expect(await brokenWords(page, '#route-table')).toEqual([]);
  expect((await tableOverflow(page)).pageOverflow).toBe(0);
});

test('keeps whole words in state and scalar components inside table cells', async ({ page }) => {
  for (const [width, textScale] of [
    [1280, '100'],
    [320, '200'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await openContentWrapping(page, { textScale });

    expect(await brokenWords(page, '#state-table')).toEqual([]);
    expect((await tableOverflow(page)).pageOverflow).toBe(0);
  }
});

for (const direction of ['ltr', 'rtl'] as const) {
  test(`scrolls instead of breaking words at 320 CSS pixels and 200 percent text (${direction})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openContentWrapping(page, { direction, textScale: '200' });

    expect(await brokenWords(page, '#route-table')).toEqual([]);
    expect(await tableOverflow(page)).toEqual({
      tableOverflow: true,
      regionFocusable: true,
      pageOverflow: 0,
    });
  });
}

test('wraps a squeezed button label between words', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openContentWrapping(page);

  expect(await brokenWords(page, '#narrow-button')).toEqual([]);
  const geometry = await page.evaluate(() => {
    const column = document.querySelector<HTMLElement>('.narrow-column')!.getBoundingClientRect();
    const host = document.querySelector<HTMLElement>('#narrow-button')!;
    const button = host.shadowRoot!.querySelector<HTMLElement>('[part="button"]')!;
    const label = host.shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
    const box = button.getBoundingClientRect();
    return {
      inside: box.left >= column.left - 0.5 && box.right <= column.right + 0.5,
      wraps: label.getBoundingClientRect().height > lineHeight * 1.5,
      height: box.height,
    };
  });
  expect(geometry.inside).toBe(true);
  expect(geometry.wraps).toBe(true);
  expect(geometry.height).toBeGreaterThanOrEqual(44);
});

test('keeps a single word longer than its column inside each component', async ({ page }) => {
  for (const textScale of ['100', '200'] as const) {
    await page.setViewportSize({ width: 320, height: 900 });
    await openContentWrapping(page, { textScale });

    const result = await page.evaluate(() => {
      const column = document.querySelector<HTMLElement>('.narrow-column')!.getBoundingClientRect();
      const outside: string[] = [];
      const check = (scope: Element | ShadowRoot, owner: string): void => {
        for (const element of scope.querySelectorAll('*')) {
          const box = element.getBoundingClientRect();
          if (box.width > 0 && (box.left < column.left - 0.5 || box.right > column.right + 0.5)) {
            outside.push(
              `${owner} ${element.localName}${element.getAttribute('part') ? `[part=${element.getAttribute('part')}]` : ''}`,
            );
          }
          if (element.shadowRoot !== null) check(element.shadowRoot, element.localName);
        }
      };
      check(document.querySelector('#unbreakable')!, 'light');
      return {
        outside,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(result).toEqual({ outside: [], pageOverflow: 0 });
  }
});

test('lets a consumer keep a table button label on one line through the label part', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openContentWrapping(page, { textScale: '200' });

  const geometry = await page.evaluate(() => {
    const host = document.querySelector<HTMLElement>('#single-line-button')!;
    const button = host.shadowRoot!.querySelector<HTMLElement>('[part="button"]')!;
    const label = host.shadowRoot!.querySelector<HTMLElement>('[part="label"]')!;
    const lineHeight = Number.parseFloat(getComputedStyle(label).lineHeight);
    const box = button.getBoundingClientRect();
    const text = label.getBoundingClientRect();
    return {
      oneLine: text.height < lineHeight * 1.5,
      labelInsideButton: text.left >= box.left - 0.5 && text.right <= box.right + 0.5,
    };
  });
  expect(geometry).toEqual({ oneLine: true, labelInsideButton: true });
  expect((await tableOverflow(page)).pageOverflow).toBe(0);
});
