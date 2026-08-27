import { describe, expect, it } from 'vitest';

import { queueInvestigationFixture, queueInvestigationReplacementFixture } from '../src/fixture.js';
import { assertCompatibleReplacement } from '../src/inspection.js';
import {
  createInspectionState,
  moveInspectionSample,
  moveInspectionSeries,
  selectInspectionPoint,
  setInspectionSeriesVisibility,
} from '../src/selection.js';

describe('Phase 5C shared inspection state', () => {
  it('uses stable bounded previous and next sample navigation', () => {
    const initial = createInspectionState(queueInvestigationFixture);
    expect(moveInspectionSample(queueInvestigationFixture, initial, -1)).toBe(initial);

    const second = moveInspectionSample(queueInvestigationFixture, initial, 1);
    expect(second.sampleIndex).toBe(1);
    const last = moveInspectionSample(queueInvestigationFixture, second, 10_000);
    expect(last.sampleIndex).toBe(2_879);
    expect(moveInspectionSample(queueInvestigationFixture, last, 1)).toBe(last);
  });

  it('moves only among visible series and keeps one series visible', () => {
    const initial = createInspectionState(queueInvestigationFixture);
    const withoutIntake = setInspectionSeriesVisibility(
      queueInvestigationFixture,
      initial,
      'intake',
      false,
    );
    expect(withoutIntake.visibleSeriesIds).toEqual(['review', 'classification', 'dispatch']);
    expect(moveInspectionSeries(queueInvestigationFixture, withoutIntake, 1).seriesIndex).toBe(2);
    expect(moveInspectionSeries(queueInvestigationFixture, withoutIntake, -1).seriesIndex).toBe(3);

    const reviewOnly = withoutIntake.visibleSeriesIds
      .filter((id) => id !== 'review')
      .reduce(
        (state, id) => setInspectionSeriesVisibility(queueInvestigationFixture, state, id, false),
        withoutIntake,
      );
    expect(reviewOnly.visibleSeriesIds).toEqual(['review']);
    expect(
      setInspectionSeriesVisibility(queueInvestigationFixture, reviewOnly, 'review', false),
    ).toBe(reviewOnly);
  });

  it('selects the nearest stable point without changing visibility', () => {
    const initial = createInspectionState(queueInvestigationFixture);
    const target = queueInvestigationFixture.series[2]!.points[1_200]!;
    const selected = selectInspectionPoint(
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

  it('accepts stable replacement identity and rejects a changed proof envelope', () => {
    expect(() =>
      assertCompatibleReplacement(queueInvestigationFixture, queueInvestigationReplacementFixture),
    ).not.toThrow();
    expect(() =>
      assertCompatibleReplacement(queueInvestigationFixture, {
        ...queueInvestigationReplacementFixture,
        windowEnd: queueInvestigationReplacementFixture.windowEnd + 30_000,
      }),
    ).toThrow(/P5C_REPLACEMENT_SHAPE/);

    const invalidSameShape = structuredClone(queueInvestigationReplacementFixture);
    const invalidPoint = invalidSameShape.series[0]!.points[0]! as {
      value: number | null;
      formattedValue: string;
    };
    invalidPoint.value = 121;
    invalidPoint.formattedValue = '121 items';
    expect(() => assertCompatibleReplacement(queueInvestigationFixture, invalidSameShape)).toThrow(
      /P5C_INPUT_POINT_SCALE/,
    );
  });
});
