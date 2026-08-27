import { expect, test } from '@playwright/test';

const proofPath = '/experiments/phase-5c-rich-visualization/';

for (const candidate of ['native', 'uplot', 'd3'] as const) {
  test(`Phase 5C ${candidate} adapter rejects adverse input transactionally`, async ({ page }) => {
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

      const invalidMount = structuredClone(fixtureModule.queueInvestigationFixture);
      invalidMount.series = [];
      let mountError = '';
      try {
        mount(host, invalidMount);
      } catch (error) {
        mountError = String(error);
      }
      const adapterCountAfterInvalidMount = host.querySelectorAll('.p5c-adapter').length;

      const handle = mount(host, fixtureModule.queueInvestigationFixture);
      const nextSample = handle.root.querySelector<HTMLButtonElement>(
        '.p5c-inspector-controls button:nth-of-type(3)',
      )!;
      nextSample.click();
      nextSample.focus();
      const inspectorValue = handle.root.querySelector<HTMLElement>('[data-inspector-value]')!;
      const before = {
        state: JSON.stringify(handle.getState()),
        value: inspectorValue.textContent,
        geometry:
          selectedCandidate === 'uplot'
            ? String(handle.chart.data[1]?.[1])
            : handle.root.querySelector<SVGPathElement>('.p5c-series-line')?.getAttribute('d'),
      };

      const invalidReplacement = structuredClone(fixtureModule.queueInvestigationFixture);
      invalidReplacement.series[0].points[1].value = 121;
      invalidReplacement.series[0].points[1].formattedValue = '121 items';
      let replacementError = '';
      try {
        handle.replaceInput(invalidReplacement);
      } catch (error) {
        replacementError = String(error);
      }
      const afterInvalidReplacement = {
        state: JSON.stringify(handle.getState()),
        value: inspectorValue.textContent,
        geometry:
          selectedCandidate === 'uplot'
            ? String(handle.chart.data[1]?.[1])
            : handle.root.querySelector<SVGPathElement>('.p5c-series-line')?.getAttribute('d'),
        focusPreserved: document.activeElement === nextSample,
      };

      const incompatibleReplacement = {
        ...fixtureModule.queueInvestigationReplacementFixture,
        windowEnd: fixtureModule.queueInvestigationReplacementFixture.windowEnd + 30_000,
      };
      let shapeError = '';
      try {
        handle.replaceInput(incompatibleReplacement);
      } catch (error) {
        shapeError = String(error);
      }

      handle.replaceInput(fixtureModule.queueInvestigationReplacementFixture);
      const validReplacementValue = inspectorValue.textContent;
      const validReplacementFocusPreserved = document.activeElement === nextSample;
      handle.destroy();
      const adapterCountAfterDestroy = host.querySelectorAll('.p5c-adapter').length;
      host.remove();

      return {
        mountError,
        adapterCountAfterInvalidMount,
        before,
        replacementError,
        afterInvalidReplacement,
        shapeError,
        validReplacementValue,
        validReplacementFocusPreserved,
        adapterCountAfterDestroy,
      };
    }, candidate);

    expect(result.mountError).toContain('P5C_INPUT_SERIES_COUNT');
    expect(result.adapterCountAfterInvalidMount).toBe(0);
    expect(result.replacementError).toContain('P5C_INPUT_POINT_SCALE');
    expect(result.afterInvalidReplacement).toEqual({
      ...result.before,
      focusPreserved: true,
    });
    expect(result.shapeError).toContain('P5C_REPLACEMENT_SHAPE');
    expect(result.validReplacementValue).toBe('40 items');
    expect(result.validReplacementFocusPreserved).toBe(true);
    expect(result.adapterCountAfterDestroy).toBe(0);
  });
}
