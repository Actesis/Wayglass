import { expect, test } from '@playwright/test';

const benchmarkPath = '/experiments/phase-5c-rich-visualization/benchmark.html';

interface TimingSummary {
  readonly samples: readonly number[];
  readonly median: number;
  readonly p95: number;
  readonly maximum: number;
}

interface AdapterTimings {
  readonly construction: TimingSummary;
  readonly inspection: TimingSummary;
  readonly replacement: TimingSummary;
}

interface BenchmarkHandle {
  readonly root: HTMLElement;
  replaceInput(input: unknown): void;
  destroy(): void;
}

type BenchmarkMount = (container: HTMLElement, input: unknown) => BenchmarkHandle;

interface BrowserBenchmarkHarness {
  readonly fixture: unknown;
  readonly replacement: unknown;
  readonly mounts: Readonly<Record<'native', BenchmarkMount>>;
}

type BenchmarkWindow = typeof window & {
  readonly __p5cBenchmark: BrowserBenchmarkHarness;
};

test.describe('Phase 5C retained native performance', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'The named desktop baseline is Chromium.',
  );
  test.describe.configure({ mode: 'serial' });

  test('meets construction, inspection, and replacement timing budgets', async ({ page }) => {
    await page.goto(benchmarkPath);
    const measurements = await page.evaluate(() => {
      const benchmark = (window as BenchmarkWindow).__p5cBenchmark;
      const candidates = benchmark.mounts;
      const summarize = (rawSamples: number[]) => {
        const samples = rawSamples.map((value) => Number(value.toFixed(3)));
        const sorted = [...samples].sort((left, right) => left - right);
        return {
          samples,
          median: sorted[Math.floor(sorted.length / 2)]!,
          p95: sorted[Math.ceil(sorted.length * 0.95) - 1]!,
          maximum: sorted.at(-1)!,
        };
      };
      const results: Record<string, AdapterTimings> = {};

      for (const [name, mount] of Object.entries(candidates)) {
        const host = document.createElement('div');
        host.style.inlineSize = '1000px';
        document.querySelector('[data-p5c-benchmark]')!.append(host);
        for (let warmup = 0; warmup < 5; warmup += 1) {
          const handle = mount(host, benchmark.fixture);
          void handle.root.offsetHeight;
          handle.destroy();
        }

        const construction: number[] = [];
        for (let run = 0; run < 30; run += 1) {
          const started = performance.now();
          const handle = mount(host, benchmark.fixture);
          void handle.root.offsetHeight;
          construction.push(performance.now() - started);
          handle.destroy();
        }

        const handle = mount(host, benchmark.fixture);
        const previousSample = handle.root.querySelector<HTMLButtonElement>(
          '.p5c-inspector-controls button:nth-of-type(2)',
        )!;
        const nextSample = handle.root.querySelector<HTMLButtonElement>(
          '.p5c-inspector-controls button:nth-of-type(3)',
        )!;
        const value = handle.root.querySelector<HTMLElement>('[data-inspector-value]')!;
        const inspection: number[] = [];
        const replacement: number[] = [];
        for (let run = 0; run < 30; run += 1) {
          const inspectionStarted = performance.now();
          (run % 2 === 0 ? nextSample : previousSample).click();
          void value.textContent;
          inspection.push(performance.now() - inspectionStarted);

          const replacementStarted = performance.now();
          handle.replaceInput(run % 2 === 0 ? benchmark.replacement : benchmark.fixture);
          void value.textContent;
          replacement.push(performance.now() - replacementStarted);
        }
        handle.destroy();
        host.remove();
        results[name] = {
          construction: summarize(construction),
          inspection: summarize(inspection),
          replacement: summarize(replacement),
        };
      }
      return results;
    });

    console.info(`P5C_TIMING_MEASUREMENTS ${JSON.stringify(measurements)}`);
    for (const result of Object.values(measurements)) {
      expect(result.construction.median).toBeLessThan(50);
      expect(result.construction.maximum).toBeLessThan(100);
      expect(result.inspection.median).toBeLessThan(50);
      expect(result.inspection.maximum).toBeLessThan(100);
      expect(result.replacement.median).toBeLessThan(50);
      expect(result.replacement.maximum).toBeLessThan(100);
    }
  });

  test('releases adapter DOM, observers, animation frames, and retained heap', async ({ page }) => {
    await page.addInitScript(() => {
      const NativeResizeObserver = window.ResizeObserver;
      let activeObservers = 0;
      window.ResizeObserver = class extends NativeResizeObserver {
        private active = false;

        override observe(target: Element, options?: ResizeObserverOptions) {
          if (!this.active) {
            this.active = true;
            activeObservers += 1;
          }
          super.observe(target, options);
        }

        override disconnect() {
          if (this.active) {
            this.active = false;
            activeObservers -= 1;
          }
          super.disconnect();
        }
      };

      const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
      const nativeCancelAnimationFrame = window.cancelAnimationFrame.bind(window);
      const pendingFrames = new Set<number>();
      window.requestAnimationFrame = (callback) => {
        const id = nativeRequestAnimationFrame((time) => {
          pendingFrames.delete(id);
          callback(time);
        });
        pendingFrames.add(id);
        return id;
      };
      window.cancelAnimationFrame = (id) => {
        pendingFrames.delete(id);
        nativeCancelAnimationFrame(id);
      };
      Object.defineProperty(window, '__p5cResources', {
        value: {
          activeObservers: () => activeObservers,
          pendingFrames: () => pendingFrames.size,
        },
      });
    });
    await page.goto(benchmarkPath);
    const session = await page.context().newCDPSession(page);
    await session.send('HeapProfiler.enable');

    const loadAndWarm = () =>
      page.evaluate(() => {
        const benchmark = (window as BenchmarkWindow).__p5cBenchmark;
        const mounts = Object.values(benchmark.mounts);
        for (const mount of mounts) {
          const host = document.createElement('div');
          host.style.inlineSize = '1000px';
          document.querySelector('[data-p5c-benchmark]')!.append(host);
          const handle = mount(host, benchmark.fixture);
          void handle.root.offsetHeight;
          handle.destroy();
          host.remove();
        }
      });

    await loadAndWarm();
    await session.send('HeapProfiler.collectGarbage');
    const baseline = await session.send('Runtime.getHeapUsage');
    const resources = await page.evaluate(async () => {
      const benchmark = (window as BenchmarkWindow).__p5cBenchmark;
      const mounts = Object.values(benchmark.mounts);
      for (const mount of mounts) {
        const host = document.createElement('div');
        host.style.inlineSize = '1000px';
        document.querySelector('[data-p5c-benchmark]')!.append(host);
        const handle = mount(host, benchmark.fixture);
        for (let update = 0; update < 60; update += 1) {
          handle.replaceInput(update % 2 === 0 ? benchmark.replacement : benchmark.fixture);
        }
        handle.destroy();
        host.remove();
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const tracker = (
        window as typeof window & {
          __p5cResources: {
            activeObservers(): number;
            pendingFrames(): number;
          };
        }
      ).__p5cResources;
      return {
        adapterNodes: document.querySelectorAll('.p5c-adapter').length,
        activeObservers: tracker.activeObservers(),
        pendingFrames: tracker.pendingFrames(),
      };
    });
    await session.send('HeapProfiler.collectGarbage');
    const after = await session.send('Runtime.getHeapUsage');
    const heapRatio = after.usedSize / baseline.usedSize;
    console.info(
      `P5C_RESOURCE_MEASUREMENTS ${JSON.stringify({ baselineBytes: baseline.usedSize, afterBytes: after.usedSize, heapRatio: Number(heapRatio.toFixed(6)), ...resources })}`,
    );

    expect(resources).toEqual({ adapterNodes: 0, activeObservers: 0, pendingFrames: 0 });
    expect(heapRatio).toBeLessThanOrEqual(1.25);
  });
});
