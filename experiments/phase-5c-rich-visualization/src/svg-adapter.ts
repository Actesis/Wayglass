import {
  assertCompatibleReplacement,
  mountInspection,
  type InspectionHandle,
} from './inspection.js';
import type { RichVisualizationInput } from './model.js';
import type { InspectionState } from './selection.js';
import { svgPlot, svgViewBox, type SvgGeometry, type SvgKnowledgeMark } from './svg-geometry.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

export interface SvgBaselineHandle {
  readonly root: HTMLElement;
  getState(): InspectionState;
  replaceInput(input: RichVisualizationInput): void;
  destroy(): void;
}

export interface SvgBaselineOptions {
  readonly className: string;
  readonly heading: string;
  readonly headingSuffix: string;
  geometry(input: RichVisualizationInput): SvgGeometry;
  x(input: RichVisualizationInput, observedAt: number): number;
  y(input: RichVisualizationInput, value: number): number;
}

function element<K extends keyof HTMLElementTagNameMap>(
  name: K,
  text?: string,
): HTMLElementTagNameMap[K] {
  const result = document.createElement(name);
  if (text !== undefined) result.textContent = text;
  return result;
}

function svgElement<K extends keyof SVGElementTagNameMap>(name: K): SVGElementTagNameMap[K] {
  return document.createElementNS(svgNamespace, name);
}

function setSvgAttributes(node: SVGElement, attributes: Readonly<Record<string, string | number>>) {
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
}

function appendKnowledgeMark(group: SVGGElement, mark: SvgKnowledgeMark) {
  if (mark.y === null) {
    const gap = svgElement('line');
    setSvgAttributes(gap, {
      x1: mark.x,
      x2: mark.x,
      y1: svgPlot.blockStart,
      y2: svgPlot.blockEnd,
    });
    gap.classList.add('p5c-gap-mark');
    gap.dataset.knowledge = mark.knowledge;
    group.append(gap);
    return;
  }

  const marker = svgElement(mark.knowledge === 'stale' ? 'rect' : 'circle');
  if (marker instanceof SVGRectElement) {
    setSvgAttributes(marker, { x: mark.x - 4, y: mark.y - 4, width: 8, height: 8 });
  } else {
    setSvgAttributes(marker, { cx: mark.x, cy: mark.y, r: 5 });
  }
  marker.classList.add('p5c-knowledge-mark');
  marker.dataset.knowledge = mark.knowledge;
  group.append(marker);
}

export function mountSvgBaseline(
  container: HTMLElement,
  input: RichVisualizationInput,
  options: SvgBaselineOptions,
): SvgBaselineHandle {
  let currentInput = input;
  let seriesGroups = new Map<string, SVGGElement>();
  let selectionLine = svgElement('line');
  let selectionMark = svgElement('circle');

  const root = element('section');
  root.className = `p5c-adapter ${options.className}`;
  root.setAttribute('aria-labelledby', `${input.id}-${options.headingSuffix}-heading`);

  const heading = element('h2', options.heading);
  heading.id = `${input.id}-${options.headingSuffix}-heading`;
  root.append(heading);

  const context = element('dl');
  context.className = 'p5c-context';
  const scaleValue = element('dd');
  const thresholdLabel = element('dt');
  const thresholdValue = element('dd');
  const annotationLabel = element('dt');
  const annotationValue = element('dd');
  context.append(
    element('dt', 'Scale'),
    scaleValue,
    thresholdLabel,
    thresholdValue,
    annotationLabel,
    annotationValue,
  );
  root.append(context);

  const visual = element('div');
  visual.className = 'p5c-visual';
  const svg = svgElement('svg');
  setSvgAttributes(svg, {
    viewBox: `0 0 ${svgViewBox.width} ${svgViewBox.height}`,
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  visual.append(svg);

  const windowLabels = element('div');
  windowLabels.className = 'p5c-window';
  const windowStart = element('span');
  const windowEnd = element('span');
  windowLabels.append(windowStart, windowEnd);
  visual.append(windowLabels);
  root.append(visual);

  function renderGeometry() {
    const geometry = options.geometry(currentInput);
    const fragment = document.createDocumentFragment();
    seriesGroups = new Map();

    const plotHitArea = svgElement('rect');
    setSvgAttributes(plotHitArea, {
      x: svgPlot.inlineStart,
      y: svgPlot.blockStart,
      width: svgPlot.inlineEnd - svgPlot.inlineStart,
      height: svgPlot.blockEnd - svgPlot.blockStart,
    });
    plotHitArea.classList.add('p5c-plot-hit-area');
    fragment.append(plotHitArea);

    const threshold = svgElement('line');
    setSvgAttributes(threshold, {
      x1: svgPlot.inlineStart,
      x2: svgPlot.inlineEnd,
      y1: geometry.thresholdY,
      y2: geometry.thresholdY,
    });
    threshold.classList.add('p5c-threshold');
    fragment.append(threshold);

    const annotation = svgElement('line');
    setSvgAttributes(annotation, {
      x1: geometry.annotationX,
      x2: geometry.annotationX,
      y1: svgPlot.blockStart,
      y2: svgPlot.blockEnd,
    });
    annotation.classList.add('p5c-annotation');
    fragment.append(annotation);

    for (const seriesGeometry of geometry.series) {
      const group = svgElement('g');
      group.dataset.seriesId = seriesGeometry.seriesId;
      group.dataset.seriesIndex = String(seriesGeometry.seriesIndex);
      for (const candidatePath of seriesGeometry.paths) {
        const path = svgElement('path');
        setSvgAttributes(path, { d: candidatePath.data });
        path.classList.add('p5c-series-line');
        path.dataset.knowledge = candidatePath.knowledge;
        group.append(path);
      }
      for (const mark of seriesGeometry.marks) appendKnowledgeMark(group, mark);
      seriesGroups.set(seriesGeometry.seriesId, group);
      fragment.append(group);
    }

    selectionLine = svgElement('line');
    selectionLine.classList.add('p5c-selection-line');
    setSvgAttributes(selectionLine, { y1: svgPlot.blockStart, y2: svgPlot.blockEnd });
    selectionMark = svgElement('circle');
    selectionMark.classList.add('p5c-selection-mark');
    selectionMark.setAttribute('r', '7');
    fragment.append(selectionLine, selectionMark);
    svg.replaceChildren(fragment);
  }

  function renderContext() {
    scaleValue.textContent = `${currentInput.formattedScaleMinimum}–${currentInput.formattedScaleMaximum}`;
    thresholdLabel.textContent = currentInput.threshold.label;
    thresholdValue.textContent = currentInput.threshold.formattedValue;
    annotationLabel.textContent = currentInput.annotation.label;
    annotationValue.textContent = `${currentInput.annotation.formattedObservedAt}. ${currentInput.annotation.detail}`;
    windowStart.textContent = currentInput.formattedWindowStart;
    windowEnd.textContent = currentInput.formattedWindowEnd;
  }

  function renderState(state: InspectionState) {
    const selectedSeries = currentInput.series[state.seriesIndex]!;
    const selectedPoint = selectedSeries.points[state.sampleIndex]!;
    for (const series of currentInput.series) {
      seriesGroups
        .get(series.id)
        ?.toggleAttribute('hidden', !state.visibleSeriesIds.includes(series.id));
    }

    const x = options.x(currentInput, selectedPoint.observedAt);
    selectionLine.setAttribute('x1', String(x));
    selectionLine.setAttribute('x2', String(x));
    if (selectedPoint.value === null) {
      selectionMark.setAttribute('hidden', '');
    } else {
      selectionMark.removeAttribute('hidden');
      selectionMark.setAttribute('cx', String(x));
      selectionMark.setAttribute('cy', String(options.y(currentInput, selectedPoint.value)));
    }
    selectionMark.dataset.seriesIndex = String(state.seriesIndex);
  }

  renderContext();
  renderGeometry();
  const inspection: InspectionHandle = mountInspection(root, input, renderState);
  const selectFromPointer = (event: MouseEvent) => {
    const screenMatrix = svg.getScreenCTM();
    if (!screenMatrix) return;
    const pointer = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      screenMatrix.inverse(),
    );
    const ratio = Math.min(
      Math.max((pointer.x - svgPlot.inlineStart) / (svgPlot.inlineEnd - svgPlot.inlineStart), 0),
      1,
    );
    const selectedSeries = currentInput.series[inspection.getState().seriesIndex];
    if (!selectedSeries) return;
    inspection.selectPoint(
      selectedSeries.id,
      currentInput.windowStart + ratio * (currentInput.windowEnd - currentInput.windowStart),
    );
  };
  svg.addEventListener('click', selectFromPointer);
  container.append(root);

  return {
    root,
    getState: () => inspection.getState(),
    replaceInput: (nextInput) => {
      assertCompatibleReplacement(currentInput, nextInput);
      currentInput = nextInput;
      renderContext();
      renderGeometry();
      inspection.replaceInput(nextInput);
    },
    destroy: () => {
      svg.removeEventListener('click', selectFromPointer);
      inspection.destroy();
      root.remove();
    },
  };
}
