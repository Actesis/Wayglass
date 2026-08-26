import { describe, expect, it } from 'vitest';

import { queueInvestigationFixture } from '../src/fixture.js';
import { createNativeGeometry, nativePlot, nativeX, nativeY } from '../src/native-geometry.js';

describe('Phase 5C native SVG geometry', () => {
  it('maps authored bounds, threshold, and annotation without inference', () => {
    const geometry = createNativeGeometry(queueInvestigationFixture);
    expect(nativeX(queueInvestigationFixture, queueInvestigationFixture.windowStart)).toBe(
      nativePlot.inlineStart,
    );
    expect(nativeX(queueInvestigationFixture, queueInvestigationFixture.windowEnd)).toBe(
      nativePlot.inlineEnd,
    );
    expect(nativeY(queueInvestigationFixture, queueInvestigationFixture.scaleMaximum)).toBe(
      nativePlot.blockStart,
    );
    expect(nativeY(queueInvestigationFixture, queueInvestigationFixture.scaleMinimum)).toBe(
      nativePlot.blockEnd,
    );
    expect(geometry.thresholdY).toBe(nativeY(queueInvestigationFixture, 80));
    expect(geometry.annotationX).toBe(
      nativeX(queueInvestigationFixture, queueInvestigationFixture.annotation.observedAt),
    );
  });

  it('retains every series, explicit gap, and authored knowledge mark', () => {
    const geometry = createNativeGeometry(queueInvestigationFixture);
    expect(geometry.series.map(({ seriesId }) => seriesId)).toEqual([
      'review',
      'intake',
      'classification',
      'dispatch',
    ]);
    expect(
      geometry.series.flatMap(({ marks }) => marks).filter(({ y }) => y === null),
    ).toHaveLength(3);
    expect(
      new Set(geometry.series.flatMap(({ marks }) => marks.map(({ knowledge }) => knowledge))),
    ).toEqual(new Set(['inferred', 'stale', 'unknown', 'conflicting', 'unavailable']));
    expect(geometry.series.every(({ hitPath }) => hitPath.length > 0)).toBe(true);
  });

  it('breaks paths at gaps instead of interpolating unavailable observations', () => {
    const geometry = createNativeGeometry(queueInvestigationFixture);
    const classification = geometry.series.find(({ seriesId }) => seriesId === 'classification')!;
    const unavailableX = nativeX(
      queueInvestigationFixture,
      queueInvestigationFixture.series[2]!.points[361]!.observedAt,
    );
    expect(classification.hitPath).not.toContain(` ${unavailableX} `);
  });
});
