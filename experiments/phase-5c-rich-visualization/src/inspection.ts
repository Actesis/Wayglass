import type { Knowledge } from '../../../packages/core/src/state.js';

import { assertRichVisualizationInput, type RichVisualizationInput } from './model.js';
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
  replaceInput(input: RichVisualizationInput): void;
  destroy(): void;
}

export function assertCompatibleReplacement(
  previous: RichVisualizationInput,
  next: RichVisualizationInput,
): void {
  assertRichVisualizationInput(next);
  const incompatible =
    previous.id !== next.id ||
    previous.windowStart !== next.windowStart ||
    previous.windowEnd !== next.windowEnd ||
    previous.scaleMinimum !== next.scaleMinimum ||
    previous.scaleMaximum !== next.scaleMaximum ||
    previous.series.length !== next.series.length ||
    previous.series.some((series, seriesIndex) => {
      const replacement = next.series[seriesIndex];
      return (
        replacement?.id !== series.id ||
        replacement.points.length !== series.points.length ||
        series.points.some((point, pointIndex) => replacement.points[pointIndex]?.id !== point.id)
      );
    });

  if (incompatible) {
    throw new Error(
      'P5C_REPLACEMENT_SHAPE: replacement input must retain the proof identity, window, scale, series order, and point identities.',
    );
  }
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
  let currentInput = input;
  let state = createInspectionState(input);
  const region = element('div');
  region.className = 'p5c-interaction';

  const visibility = element('fieldset');
  visibility.className = 'p5c-series-controls';
  visibility.append(element('legend', 'Visible series'));
  const visibilityInputs = new Map<string, HTMLInputElement>();
  const visibilityLabels = new Map<string, HTMLElement>();
  for (const [seriesIndex, series] of input.series.entries()) {
    const label = element('label');
    label.dataset.seriesIndex = String(seriesIndex);
    const checkbox = element('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.addEventListener('change', () => {
      state = setInspectionSeriesVisibility(currentInput, state, series.id, checkbox.checked);
      renderState();
    });
    visibilityInputs.set(series.id, checkbox);
    const text = element('span', series.label);
    visibilityLabels.set(series.id, text);
    label.append(checkbox, text);
    visibility.append(label);
  }
  region.append(visibility);

  const inspector = element('section');
  inspector.className = 'p5c-inspector';
  inspector.append(element('h3', 'Persistent exact inspection'));

  const navigation = element('div');
  navigation.className = 'p5c-inspector-controls';
  navigation.setAttribute('role', 'group');
  navigation.setAttribute('aria-label', 'Exact inspection navigation');
  const previousSeries = element('button', 'Previous series');
  const previousSample = element('button', 'Previous sample');
  const nextSample = element('button', 'Next sample');
  const nextSeries = element('button', 'Next series');
  for (const button of [previousSeries, previousSample, nextSample, nextSeries]) {
    button.type = 'button';
  }
  previousSeries.addEventListener('click', () => {
    state = moveInspectionSeries(currentInput, state, -1);
    renderState();
  });
  nextSeries.addEventListener('click', () => {
    state = moveInspectionSeries(currentInput, state, 1);
    renderState();
  });
  previousSample.addEventListener('click', () => {
    state = moveInspectionSample(currentInput, state, -1);
    renderState();
  });
  nextSample.addEventListener('click', () => {
    state = moveInspectionSample(currentInput, state, 1);
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
    const selectedSeries = currentInput.series[state.seriesIndex]!;
    const selectedPoint = selectedSeries.points[state.sampleIndex]!;
    for (const series of currentInput.series) {
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
      state = selectInspectionPoint(currentInput, state, seriesId, observedAt);
      renderState();
    },
    replaceInput: (nextInput) => {
      // The owning adapter validates compatibility before mutating rendered or inspection state.
      currentInput = nextInput;
      for (const series of currentInput.series) {
        const label = visibilityLabels.get(series.id);
        if (label) label.textContent = series.label;
      }
      renderState();
    },
    destroy: () => region.remove(),
  };
}
