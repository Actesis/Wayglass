import { expect, test } from '@playwright/test';

const isolationPath = '/experiments/phase-5c-rich-visualization/isolation.html';

test('Phase 5C candidates remain lazy, local, unregistered, and removable', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(isolationPath);

  await page.evaluate(() => {
    const originalDefine = customElements.define.bind(customElements);
    const definitions: string[] = [];
    Object.defineProperty(window, '__p5cDefinitions', { value: definitions, configurable: true });
    customElements.define = ((
      name: string,
      constructor: CustomElementConstructor,
      options?: ElementDefinitionOptions,
    ) => {
      definitions.push(name);
      originalDefine(name, constructor, options);
    }) as CustomElementRegistry['define'];
  });

  const nativeResult = await page.evaluate(async () => {
    const fixtureModule = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/fixture.ts'
    );
    const nativeModule = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/native-adapter.ts'
    );
    const host = document.querySelector<HTMLElement>('[data-p5c-isolation]')!;
    const handle = nativeModule.mountNativeBaseline(host, fixtureModule.queueInvestigationFixture);
    handle.destroy();
    return host.querySelectorAll('.p5c-adapter').length;
  });

  expect(nativeResult).toBe(0);
  expect(requests.some((url) => /(?:\/|%2F)uplot(?:\/|%2F|\?|$)/i.test(url))).toBe(false);
  expect(requests.some((url) => /d3-(?:array|scale|shape)/i.test(url))).toBe(false);

  const uplotResult = await page.evaluate(async () => {
    const fixtureModule = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/fixture.ts'
    );
    const uplotModule = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/uplot-adapter.ts'
    );
    const host = document.querySelector<HTMLElement>('[data-p5c-isolation]')!;
    const handle = uplotModule.mountUPlotBaseline(host, fixtureModule.queueInvestigationFixture);
    handle.destroy();
    return host.querySelectorAll('.p5c-adapter').length;
  });

  expect(uplotResult).toBe(0);
  expect(requests.some((url) => /(?:\/|%2F)uplot(?:\/|%2F|\?|$)/i.test(url))).toBe(true);
  expect(requests.some((url) => /d3-(?:array|scale|shape)/i.test(url))).toBe(false);

  const finalResult = await page.evaluate(async () => {
    const fixtureModule = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/fixture.ts'
    );
    const d3Module = await import(
      /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/d3-adapter.ts'
    );
    const host = document.querySelector<HTMLElement>('[data-p5c-isolation]')!;
    const handle = d3Module.mountD3Baseline(host, fixtureModule.queueInvestigationFixture);
    handle.destroy();
    return {
      adapterCount: host.querySelectorAll('.p5c-adapter').length,
      definitions: (window as typeof window & { __p5cDefinitions: string[] }).__p5cDefinitions,
      d3Global: Object.hasOwn(window, 'd3'),
      uplotGlobal: Object.hasOwn(window, 'uPlot'),
    };
  });

  expect(finalResult).toEqual({
    adapterCount: 0,
    definitions: [],
    d3Global: false,
    uplotGlobal: false,
  });
  expect(requests.some((url) => /d3-(?:array|scale|shape)/i.test(url))).toBe(true);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});
