import { mountInspection, type InspectionHandle } from './inspection.js';
import type { RichVisualizationInput } from './model.js';
import {
  createNativeGeometry,
  nativePlot,
  nativeViewBox,
  nativeX,
  nativeY,
  type NativeKnowledgeMark,
} from './native-geometry.js';
import type { InspectionState } from './selection.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

export interface NativeBaselineHandle {
  readonly root: HTMLElement;
  getState(): InspectionState;
  destroy(): void;
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

function appendKnowledgeMark(group: SVGGElement, mark: NativeKnowledgeMark) {
  if (mark.y === null) {
    const gap = svgElement('line');
    setSvgAttributes(gap, {
      x1: mark.x,
      x2: mark.x,
      y1: nativePlot.blockStart,
      y2: nativePlot.blockEnd,
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

export function mountNativeBaseline(
  container: HTMLElement,
  input: RichVisualizationInput,
): NativeBaselineHandle {
  const geometry = createNativeGeometry(input);

  const root = element('section');
  root.className = 'p5c-adapter p5c-native';
  root.setAttribute('aria-labelledby', `${input.id}-native-heading`);

  const heading = element('h2', 'Native SVG and HTML baseline');
  heading.id = `${input.id}-native-heading`;
  root.append(heading);

  const context = element('dl');
  context.className = 'p5c-context';
  context.append(
    element('dt', 'Scale'),
    element('dd', `${input.formattedScaleMinimum}–${input.formattedScaleMaximum}`),
  );
  context.append(
    element('dt', input.threshold.label),
    element('dd', input.threshold.formattedValue),
  );
  context.append(
    element('dt', input.annotation.label),
    element('dd', `${input.annotation.formattedObservedAt}. ${input.annotation.detail}`),
  );
  root.append(context);

  const visual = element('div');
  visual.className = 'p5c-visual';
  const svg = svgElement('svg');
  setSvgAttributes(svg, {
    viewBox: `0 0 ${nativeViewBox.width} ${nativeViewBox.height}`,
    preserveAspectRatio: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  const threshold = svgElement('line');
  setSvgAttributes(threshold, {
    x1: nativePlot.inlineStart,
    x2: nativePlot.inlineEnd,
    y1: geometry.thresholdY,
    y2: geometry.thresholdY,
  });
  threshold.classList.add('p5c-threshold');
  svg.append(threshold);

  const annotation = svgElement('line');
  setSvgAttributes(annotation, {
    x1: geometry.annotationX,
    x2: geometry.annotationX,
    y1: nativePlot.blockStart,
    y2: nativePlot.blockEnd,
  });
  annotation.classList.add('p5c-annotation');
  svg.append(annotation);

  const seriesGroups = new Map<string, SVGGElement>();
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

    const hitPath = svgElement('path');
    setSvgAttributes(hitPath, { d: seriesGeometry.hitPath });
    hitPath.classList.add('p5c-hit-target');
    hitPath.addEventListener('click', (event) => {
      const bounds = svg.getBoundingClientRect();
      const normalizedX =
        nativePlot.inlineStart +
        ((event.clientX - bounds.left) / bounds.width) * nativeViewBox.width;
      const ratio = Math.min(
        Math.max(
          (normalizedX - nativePlot.inlineStart) / (nativePlot.inlineEnd - nativePlot.inlineStart),
          0,
        ),
        1,
      );
      const observedAt = input.windowStart + ratio * (input.windowEnd - input.windowStart);
      inspection.selectPoint(seriesGeometry.seriesId, observedAt);
    });
    group.append(hitPath);
    seriesGroups.set(seriesGeometry.seriesId, group);
    svg.append(group);
  }

  const selectionLine = svgElement('line');
  selectionLine.classList.add('p5c-selection-line');
  setSvgAttributes(selectionLine, {
    y1: nativePlot.blockStart,
    y2: nativePlot.blockEnd,
  });
  const selectionMark = svgElement('circle');
  selectionMark.classList.add('p5c-selection-mark');
  selectionMark.setAttribute('r', '7');
  svg.append(selectionLine, selectionMark);
  visual.append(svg);

  const windowLabels = element('div');
  windowLabels.className = 'p5c-window';
  windowLabels.append(
    element('span', input.formattedWindowStart),
    element('span', input.formattedWindowEnd),
  );
  visual.append(windowLabels);
  root.append(visual);

  function renderState(state: InspectionState) {
    const selectedSeries = input.series[state.seriesIndex]!;
    const selectedPoint = selectedSeries.points[state.sampleIndex]!;
    for (const series of input.series) {
      const visible = state.visibleSeriesIds.includes(series.id);
      seriesGroups.get(series.id)?.toggleAttribute('hidden', !visible);
    }

    const x = nativeX(input, selectedPoint.observedAt);
    selectionLine.setAttribute('x1', String(x));
    selectionLine.setAttribute('x2', String(x));
    if (selectedPoint.value === null) {
      selectionMark.setAttribute('hidden', '');
    } else {
      selectionMark.removeAttribute('hidden');
      selectionMark.setAttribute('cx', String(x));
      selectionMark.setAttribute('cy', String(nativeY(input, selectedPoint.value)));
    }
    selectionMark.dataset.seriesIndex = String(state.seriesIndex);
  }

  const inspection: InspectionHandle = mountInspection(root, input, renderState);
  container.append(root);

  return {
    root,
    getState: () => inspection.getState(),
    destroy: () => {
      inspection.destroy();
      root.remove();
    },
  };
}
