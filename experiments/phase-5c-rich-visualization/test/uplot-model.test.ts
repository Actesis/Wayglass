import { describe, expect, it } from 'vitest';

import { queueInvestigationFixture } from '../src/fixture.js';
import { createUPlotData, createUPlotSeries } from '../src/uplot-model.js';

describe('Phase 5C uPlot translation', () => {
  it('retains every aligned timestamp, value, and explicit gap', () => {
    const data = createUPlotData(queueInvestigationFixture);
    expect(data).toHaveLength(5);
    expect(data.every((column) => column.length === 2_880)).toBe(true);
    expect(data[0]).toEqual(
      queueInvestigationFixture.series[0]!.points.map(({ observedAt }) => observedAt),
    );
    expect(
      data
        .slice(1)
        .flat()
        .filter((value) => value === null),
    ).toHaveLength(3);
  });

  it('preserves authored order and four non-color series patterns', () => {
    const series = createUPlotSeries(queueInvestigationFixture, {
      seriesOne: 'series-one',
      seriesTwo: 'series-two',
    });
    expect(series.map(({ label }) => label)).toEqual([
      'Observed at',
      'Review queue',
      'Intake queue',
      'Classification queue',
      'Dispatch queue',
    ]);
    expect(series.slice(1).map(({ dash }) => dash)).toEqual([[], [14, 5], [3, 5], [14, 5, 3, 5]]);
    expect(series.slice(1).map(({ stroke }) => stroke)).toEqual([
      'series-one',
      'series-two',
      'series-one',
      'series-two',
    ]);
    expect(series.slice(1).every(({ spanGaps }) => spanGaps === false)).toBe(true);
  });
});
