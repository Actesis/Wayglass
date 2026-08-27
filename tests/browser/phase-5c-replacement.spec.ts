import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

for (const candidate of ['native', 'uplot', 'd3'] as const) {
  test(`Phase 5C ${candidate} adapter preserves inspection and focus across replacement`, async ({
    page,
  }) => {
    await page.goto(proofPath);
    const result = await page.evaluate(async (selectedCandidate) => {
      const fixtureModule = await import(
        /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/fixture.ts'
      );
      const nativeModule = await import(
        /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/native-adapter.ts'
      );
      const uplotModule = await import(
        /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/uplot-adapter.ts'
      );
      const d3Module = await import(
        /* @vite-ignore */ '/experiments/phase-5c-rich-visualization/src/d3-adapter.ts'
      );
      const mount = {
        native: nativeModule.mountNativeBaseline,
        uplot: uplotModule.mountUPlotBaseline,
        d3: d3Module.mountD3Baseline,
      }[selectedCandidate];
      const host = document.createElement('div');
      host.style.inlineSize = '1000px';
      document.body.append(host);
      const handle = mount(host, fixtureModule.queueInvestigationFixture);
      const nextSample = handle.root.querySelector<HTMLButtonElement>(
        '.p5c-inspector-controls button:nth-of-type(3)',
      )!;
      nextSample.click();
      nextSample.focus();
      const value = handle.root.querySelector<HTMLElement>('[data-inspector-value]')!;
      const beforeValue = value.textContent;
      const beforePath = handle.root
        .querySelector<SVGPathElement>('.p5c-series-line')
        ?.getAttribute('d');
      handle.replaceInput(fixtureModule.queueInvestigationReplacementFixture);
      const replacementValue = value.textContent;
      const afterPath = handle.root
        .querySelector<SVGPathElement>('.p5c-series-line')
        ?.getAttribute('d');
      const focusPreserved = document.activeElement === nextSample;
      handle.replaceInput(fixtureModule.queueInvestigationFixture);
      const restoredValue = value.textContent;
      handle.destroy();
      const adapterCount = host.querySelectorAll('.p5c-adapter').length;
      host.remove();
      return {
        adapterCount,
        beforeValue,
        replacementValue,
        restoredValue,
        focusPreserved,
        geometryChanged:
          selectedCandidate === 'uplot'
            ? replacementValue !== beforeValue
            : beforePath !== afterPath,
      };
    }, candidate);

    expect(result).toEqual({
      adapterCount: 0,
      beforeValue: '39 items',
      replacementValue: '40 items',
      restoredValue: '39 items',
      focusPreserved: true,
      geometryChanged: true,
    });
  });
}
