import 'uplot/dist/uPlot.min.css';

import uPlot from 'uplot';

import { mountInspection, type InspectionHandle } from './inspection.js';
import type { RichVisualizationInput } from './model.js';
import type { InspectionState } from './selection.js';
import { createUPlotData, createUPlotSeries, type UPlotPalette } from './uplot-model.js';

export interface UPlotBaselineHandle {
  readonly root: HTMLElement;
  readonly chart: uPlot;
  getState(): InspectionState;
  destroy(): void;
}

interface UPlotSemanticPalette extends UPlotPalette {
  readonly annotation: string;
  readonly caution: string;
  readonly conflict: string;
  readonly inset: string;
  readonly selection: string;
  readonly text: string;
  readonly unavailable: string;
}

function element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const result = document.createElement(name);
  if (text !== undefined) result.textContent = text;
  return result;
}

function semanticColor(styles: CSSStyleDeclaration, name: string): string {
  return styles.getPropertyValue(name).trim();
}

function readPalette(root: HTMLElement): UPlotSemanticPalette {
  const styles = getComputedStyle(root);
  return {
    seriesOne: semanticColor(styles, '--wg-color-semantic-data-series-1'),
    seriesTwo: semanticColor(styles, '--wg-color-semantic-data-series-2'),
    annotation: semanticColor(styles, '--wg-color-semantic-data-change'),
    caution: semanticColor(styles, '--wg-color-semantic-condition-caution'),
    conflict: semanticColor(styles, '--wg-color-semantic-knowledge-conflicting'),
    inset: semanticColor(styles, '--wg-color-semantic-surface-inset'),
    selection: semanticColor(styles, '--wg-color-semantic-selection-indicator'),
    text: semanticColor(styles, '--wg-color-semantic-text-primary'),
    unavailable: semanticColor(styles, '--wg-color-semantic-knowledge-unavailable'),
  };
}

function drawLine(
  context: CanvasRenderingContext2D,
  stroke: string,
  width: number,
  dash: readonly number[],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  context.beginPath();
  context.strokeStyle = stroke;
  context.lineWidth = width;
  context.setLineDash([...dash]);
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
}

function createSemanticOverlay(
  input: RichVisualizationInput,
  palette: UPlotSemanticPalette,
): uPlot.Plugin {
  return {
    hooks: {
      draw: [
        (chart) => {
          const { ctx, bbox } = chart;
          const ratio = uPlot.pxRatio;
          ctx.save();

          const thresholdY = chart.valToPos(input.threshold.value, 'y', true);
          drawLine(
            ctx,
            palette.caution,
            3 * ratio,
            [12 * ratio, 6 * ratio],
            bbox.left,
            thresholdY,
            bbox.left + bbox.width,
            thresholdY,
          );

          const annotationX = chart.valToPos(input.annotation.observedAt, 'x', true);
          drawLine(
            ctx,
            palette.annotation,
            3 * ratio,
            [3 * ratio, 5 * ratio],
            annotationX,
            bbox.top,
            annotationX,
            bbox.top + bbox.height,
          );

          for (const [seriesIndex, series] of input.series.entries()) {
            if (chart.series[seriesIndex + 1]?.show === false) continue;
            for (const point of series.points) {
              if (point.knowledge === 'confirmed') continue;
              const x = chart.valToPos(point.observedAt, 'x', true);
              if (point.value === null) {
                drawLine(
                  ctx,
                  palette.unavailable,
                  3 * ratio,
                  [5 * ratio, 5 * ratio],
                  x,
                  bbox.top,
                  x,
                  bbox.top + bbox.height,
                );
                continue;
              }

              const y = chart.valToPos(point.value, 'y', true);
              ctx.beginPath();
              ctx.setLineDash(point.knowledge === 'unknown' ? [2 * ratio, 2 * ratio] : []);
              ctx.lineWidth = (point.knowledge === 'conflicting' ? 5 : 3) * ratio;
              ctx.strokeStyle = palette.text;
              ctx.fillStyle = point.knowledge === 'conflicting' ? palette.conflict : palette.inset;
              if (point.knowledge === 'stale') {
                ctx.rect(x - 4 * ratio, y - 4 * ratio, 8 * ratio, 8 * ratio);
              } else {
                ctx.arc(x, y, 5 * ratio, 0, Math.PI * 2);
              }
              ctx.fill();
              ctx.stroke();
            }
          }
          ctx.restore();
        },
      ],
    },
  };
}

function appendContext(root: HTMLElement, input: RichVisualizationInput) {
  const context = element('dl');
  context.className = 'p5c-context';
  context.append(
    element('dt', 'Scale'),
    element('dd', `${input.formattedScaleMinimum}–${input.formattedScaleMaximum}`),
    element('dt', input.threshold.label),
    element('dd', input.threshold.formattedValue),
    element('dt', input.annotation.label),
    element('dd', `${input.annotation.formattedObservedAt}. ${input.annotation.detail}`),
  );
  root.append(context);
}

function heightForWidth(width: number): number {
  // The bounded proof keeps a readable plot at phone width without making desktop charts excessively tall.
  return Math.max(240, Math.min(360, Math.round(width * 0.45)));
}

export function mountUPlotBaseline(
  container: HTMLElement,
  input: RichVisualizationInput,
): UPlotBaselineHandle {
  const root = element('section');
  root.className = 'p5c-adapter p5c-uplot';
  root.setAttribute('aria-labelledby', `${input.id}-uplot-heading`);
  root.dataset.thresholdId = input.threshold.id;
  root.dataset.annotationId = input.annotation.id;
  root.dataset.renderedSeriesCount = String(input.series.length);
  const heading = element('h2', 'uPlot Canvas baseline');
  heading.id = `${input.id}-uplot-heading`;
  root.append(heading);
  appendContext(root, input);

  const visual = element('div');
  visual.className = 'p5c-visual';
  const chartHost = element('div');
  chartHost.className = 'p5c-uplot-host';
  chartHost.setAttribute('aria-hidden', 'true');
  visual.append(chartHost);
  const windowLabels = element('div');
  windowLabels.className = 'p5c-window';
  windowLabels.append(
    element('span', input.formattedWindowStart),
    element('span', input.formattedWindowEnd),
  );
  visual.append(windowLabels);
  root.append(visual);
  container.append(root);

  const palette = readPalette(root);
  const initialWidth = Math.max(1, Math.round(chartHost.clientWidth));
  const chart = new uPlot(
    {
      width: initialWidth,
      height: heightForWidth(initialWidth),
      series: createUPlotSeries(input, palette),
      scales: {
        x: { time: false, auto: false, range: [input.windowStart, input.windowEnd] },
        y: { time: false, auto: false, range: [input.scaleMinimum, input.scaleMaximum] },
      },
      axes: [{ show: false }, { show: false }],
      legend: { show: false },
      cursor: {
        x: true,
        y: false,
        lock: true,
        points: { show: true, size: 8, width: 3 },
        drag: { x: false, y: false, setScale: false },
      },
      padding: [24, 24, 24, 24],
      plugins: [createSemanticOverlay(input, palette)],
    },
    createUPlotData(input),
    chartHost,
  );
  chart.root.setAttribute('aria-hidden', 'true');

  function renderState(state: InspectionState) {
    root.dataset.visibleSeriesIds = state.visibleSeriesIds.join(' ');
    for (const [seriesIndex, series] of input.series.entries()) {
      chart.setSeries(seriesIndex + 1, { show: state.visibleSeriesIds.includes(series.id) }, false);
    }

    const point = input.series[state.seriesIndex]!.points[state.sampleIndex]!;
    const left =
      ((point.observedAt - input.windowStart) / (input.windowEnd - input.windowStart)) *
      (chart.bbox.width / uPlot.pxRatio);
    const top =
      point.value === null
        ? 0
        : (1 - (point.value - input.scaleMinimum) / (input.scaleMaximum - input.scaleMinimum)) *
          (chart.bbox.height / uPlot.pxRatio);
    chart.setCursor({ left, top }, false);
    chart.setLegend({ idx: state.sampleIndex }, false);
  }

  const inspection: InspectionHandle = mountInspection(root, input, renderState);

  const handleClick = (event: MouseEvent) => {
    const bounds = chart.over.getBoundingClientRect();
    const left = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
    const top = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height);
    const sampleIndex = chart.posToIdx(left);
    let closestSeriesIndex = inspection.getState().seriesIndex;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const [seriesIndex, series] of input.series.entries()) {
      if (!inspection.getState().visibleSeriesIds.includes(series.id)) continue;
      const value = series.points[sampleIndex]?.value;
      if (value === null || value === undefined) continue;
      const y =
        (1 - (value - input.scaleMinimum) / (input.scaleMaximum - input.scaleMinimum)) *
        bounds.height;
      const distance = Math.abs(y - top);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSeriesIndex = seriesIndex;
      }
    }
    const point = input.series[closestSeriesIndex]!.points[sampleIndex]!;
    inspection.selectPoint(input.series[closestSeriesIndex]!.id, point.observedAt);
  };
  chart.over.addEventListener('click', handleClick);

  let resizeFrame = 0;
  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const width = Math.max(1, Math.round(chartHost.clientWidth));
      if (width !== chart.width) chart.setSize({ width, height: heightForWidth(width) });
    });
  });
  resizeObserver.observe(chartHost);

  return {
    root,
    chart,
    getState: () => inspection.getState(),
    destroy: () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      chart.over.removeEventListener('click', handleClick);
      inspection.destroy();
      chart.destroy();
      root.remove();
    },
  };
}
