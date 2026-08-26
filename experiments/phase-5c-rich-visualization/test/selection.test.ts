import { describe, expect, it } from 'vitest';

import { queueInvestigationFixture } from '../src/fixture.js';
import {
  createNativeSelection,
  moveNativeSample,
  moveNativeSeries,
  selectNativePoint,
  setNativeSeriesVisibility,
} from '../src/selection.js';

describe('Phase 5C native inspection state', () => {
  it('uses stable bounded previous and next sample navigation', () => {
    const initial = createNativeSelection(queueInvestigationFixture);
    expect(moveNativeSample(queueInvestigationFixture, initial, -1)).toBe(initial);

    const second = moveNativeSample(queueInvestigationFixture, initial, 1);
    expect(second.sampleIndex).toBe(1);
    const last = moveNativeSample(queueInvestigationFixture, second, 10_000);
    expect(last.sampleIndex).toBe(2_879);
    expect(moveNativeSample(queueInvestigationFixture, last, 1)).toBe(last);
  });

  it('moves only among visible series and keeps one series visible', () => {
    const initial = createNativeSelection(queueInvestigationFixture);
    const withoutIntake = setNativeSeriesVisibility(
      queueInvestigationFixture,
      initial,
      'intake',
      false,
    );
    expect(withoutIntake.visibleSeriesIds).toEqual(['review', 'classification', 'dispatch']);
    expect(moveNativeSeries(queueInvestigationFixture, withoutIntake, 1).seriesIndex).toBe(2);
    expect(moveNativeSeries(queueInvestigationFixture, withoutIntake, -1).seriesIndex).toBe(3);

    const reviewOnly = withoutIntake.visibleSeriesIds
      .filter((id) => id !== 'review')
      .reduce(
        (state, id) => setNativeSeriesVisibility(queueInvestigationFixture, state, id, false),
        withoutIntake,
      );
    expect(reviewOnly.visibleSeriesIds).toEqual(['review']);
    expect(setNativeSeriesVisibility(queueInvestigationFixture, reviewOnly, 'review', false)).toBe(
      reviewOnly,
    );
  });

  it('selects the nearest stable point without changing visibility', () => {
    const initial = createNativeSelection(queueInvestigationFixture);
    const target = queueInvestigationFixture.series[2]!.points[1_200]!;
    const selected = selectNativePoint(
      queueInvestigationFixture,
      initial,
      'classification',
      target.observedAt + 1,
    );
    expect(selected).toEqual({
      seriesIndex: 2,
      sampleIndex: 1_200,
      visibleSeriesIds: initial.visibleSeriesIds,
    });
  });
});
