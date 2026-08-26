import type uPlot from 'uplot';

import type { RichVisualizationInput } from './model.js';

export interface UPlotPalette {
  readonly seriesOne: string;
  readonly seriesTwo: string;
}

const seriesDashPatterns = [[], [14, 5], [3, 5], [14, 5, 3, 5]] as const;

export function createUPlotData(input: RichVisualizationInput): uPlot.AlignedData {
  return [
    input.series[0]!.points.map(({ observedAt }) => observedAt),
    ...input.series.map(({ points }) => points.map(({ value }) => value)),
  ];
}

export function createUPlotSeries(
  input: RichVisualizationInput,
  palette: UPlotPalette,
): uPlot.Series[] {
  return [
    { label: 'Observed at' },
    ...input.series.map(({ label }, seriesIndex) => ({
      label,
      scale: 'y',
      auto: false,
      sorted: 1 as const,
      spanGaps: false,
      width: 3,
      stroke: seriesIndex % 2 === 0 ? palette.seriesOne : palette.seriesTwo,
      dash: [...seriesDashPatterns[seriesIndex]!],
      points: { show: false },
    })),
  ];
}
