import type { Knowledge } from '../../../packages/core/src/state.js';

import type { RichVisualizationInput } from './model.js';
import {
  createInspectionState,
  moveInspectionSample,
  moveInspectionSeries,
  selectInspectionPoint,
  setInspectionSeriesVisibility,
  type InspectionState,
} from './selection.js';

export interface InspectionHandle {
  getState(): InspectionState;
  selectPoint(seriesId: string, observedAt: number): void;
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

function knowledgeLabel(knowledge: Knowledge): string {
  return `${knowledge.slice(0, 1).toUpperCase()}${knowledge.slice(1)}`;
}

function appendDescriptionItem(list: HTMLDListElement, label: string, hook: string) {
  list.append(element('dt', label));
  const description = element('dd');
  description.dataset[hook] = '';
  list.append(description);
}

export function mountInspection(
  container: HTMLElement,
  input: RichVisualizationInput,
  onStateChange: (state: InspectionState) => void,
): InspectionHandle {
  let state = createInspectionState(input);
  const region = element('div');
  region.className = 'p5c-interaction';

  const visibility = element('fieldset');
  visibility.className = 'p5c-series-controls';
  visibility.append(element('legend', 'Visible series'));
  const visibilityInputs = new Map<string, HTMLInputElement>();
  for (const [seriesIndex, series] of input.series.entries()) {
    const label = element('label');
    label.dataset.seriesIndex = String(seriesIndex);
    const checkbox = element('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      state = setInspectionSeriesVisibility(input, state, series.id, checkbox.checked);
      renderState();
    });
    visibilityInputs.set(series.id, checkbox);
    label.append(checkbox, element('span', series.label));
    visibility.append(label);
  }
  region.append(visibility);

  const inspector = element('section');
  inspector.className = 'p5c-inspector';
  inspector.append(element('h3', 'Persistent exact inspection'));

  const navigation = element('div');
  navigation.className = 'p5c-inspector-controls';
  navigation.setAttribute('aria-label', 'Exact inspection navigation');
  const previousSeries = element('button', 'Previous series');
  const previousSample = element('button', 'Previous sample');
  const nextSample = element('button', 'Next sample');
  const nextSeries = element('button', 'Next series');
  for (const button of [previousSeries, previousSample, nextSample, nextSeries]) {
    button.type = 'button';
  }
  previousSeries.addEventListener('click', () => {
    state = moveInspectionSeries(input, state, -1);
    renderState();
  });
  nextSeries.addEventListener('click', () => {
    state = moveInspectionSeries(input, state, 1);
    renderState();
  });
  previousSample.addEventListener('click', () => {
    state = moveInspectionSample(input, state, -1);
    renderState();
  });
  nextSample.addEventListener('click', () => {
    state = moveInspectionSample(input, state, 1);
    renderState();
  });
  navigation.append(previousSeries, previousSample, nextSample, nextSeries);
  inspector.append(navigation);

  const exact = element('dl');
  exact.className = 'p5c-exact-value';
  appendDescriptionItem(exact, 'Series', 'inspectorSeries');
  appendDescriptionItem(exact, 'Observed at', 'inspectorTime');
  appendDescriptionItem(exact, 'Value', 'inspectorValue');
  appendDescriptionItem(exact, 'Knowledge', 'inspectorKnowledge');
  inspector.append(exact);
  region.append(inspector);
  container.append(region);

  function renderState() {
    const selectedSeries = input.series[state.seriesIndex]!;
    const selectedPoint = selectedSeries.points[state.sampleIndex]!;
    for (const series of input.series) {
      const checkbox = visibilityInputs.get(series.id);
      if (checkbox) checkbox.checked = state.visibleSeriesIds.includes(series.id);
    }

    const values = {
      inspectorSeries: selectedSeries.label,
      inspectorTime: selectedPoint.formattedObservedAt,
      inspectorValue: selectedPoint.formattedValue,
      inspectorKnowledge: knowledgeLabel(selectedPoint.knowledge),
    };
    for (const [hook, value] of Object.entries(values)) {
      const output = exact.querySelector<HTMLElement>(
        `[data-${hook.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}]`,
      );
      if (output) output.textContent = value;
    }
    previousSample.disabled = state.sampleIndex === 0;
    nextSample.disabled = state.sampleIndex === selectedSeries.points.length - 1;
    onStateChange(state);
  }

  renderState();

  return {
    getState: () => state,
    selectPoint: (seriesId, observedAt) => {
      state = selectInspectionPoint(input, state, seriesId, observedAt);
      renderState();
    },
    destroy: () => region.remove(),
  };
}
