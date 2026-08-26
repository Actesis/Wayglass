import type { RichVisualizationInput } from './model.js';

export interface NativeSelectionState {
  readonly seriesIndex: number;
  readonly sampleIndex: number;
  readonly visibleSeriesIds: readonly string[];
}

export function createNativeSelection(input: RichVisualizationInput): NativeSelectionState {
  return {
    seriesIndex: 0,
    sampleIndex: 0,
    visibleSeriesIds: input.series.map(({ id }) => id),
  };
}

export function moveNativeSample(
  input: RichVisualizationInput,
  state: NativeSelectionState,
  delta: number,
): NativeSelectionState {
  const sampleCount = input.series[state.seriesIndex]?.points.length ?? 0;
  const sampleIndex = Math.min(Math.max(state.sampleIndex + delta, 0), sampleCount - 1);
  return sampleIndex === state.sampleIndex ? state : { ...state, sampleIndex };
}

export function moveNativeSeries(
  input: RichVisualizationInput,
  state: NativeSelectionState,
  delta: number,
): NativeSelectionState {
  const visibleIndexes = input.series
    .map(({ id }, index) => (state.visibleSeriesIds.includes(id) ? index : -1))
    .filter((index) => index >= 0);
  const currentVisibleIndex = visibleIndexes.indexOf(state.seriesIndex);
  const currentPosition = currentVisibleIndex < 0 ? 0 : currentVisibleIndex;
  const nextPosition =
    (currentPosition + Math.sign(delta) + visibleIndexes.length) % visibleIndexes.length;
  const seriesIndex = visibleIndexes[nextPosition] ?? state.seriesIndex;
  return seriesIndex === state.seriesIndex ? state : { ...state, seriesIndex };
}

export function setNativeSeriesVisibility(
  input: RichVisualizationInput,
  state: NativeSelectionState,
  seriesId: string,
  visible: boolean,
): NativeSelectionState {
  const candidateIndex = input.series.findIndex(({ id }) => id === seriesId);
  if (candidateIndex < 0) return state;

  const visibleSeriesIds = visible
    ? input.series
        .filter(({ id }) => state.visibleSeriesIds.includes(id) || id === seriesId)
        .map(({ id }) => id)
    : state.visibleSeriesIds.filter((id) => id !== seriesId);

  if (visibleSeriesIds.length === 0) return state;

  const selectedSeriesId = input.series[state.seriesIndex]?.id;
  const seriesIndex =
    selectedSeriesId && visibleSeriesIds.includes(selectedSeriesId)
      ? state.seriesIndex
      : input.series.findIndex(({ id }) => visibleSeriesIds.includes(id));

  return { ...state, seriesIndex, visibleSeriesIds };
}

export function selectNativePoint(
  input: RichVisualizationInput,
  state: NativeSelectionState,
  seriesId: string,
  observedAt: number,
): NativeSelectionState {
  const seriesIndex = input.series.findIndex(({ id }) => id === seriesId);
  if (seriesIndex < 0 || !state.visibleSeriesIds.includes(seriesId)) return state;

  const points = input.series[seriesIndex]!.points;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle]!.observedAt < observedAt) low = middle + 1;
    else high = middle;
  }

  const right = points[low]!;
  const left = points[Math.max(0, low - 1)]!;
  const sampleIndex =
    Math.abs(left.observedAt - observedAt) <= Math.abs(right.observedAt - observedAt)
      ? Math.max(0, low - 1)
      : low;

  return { ...state, seriesIndex, sampleIndex };
}
