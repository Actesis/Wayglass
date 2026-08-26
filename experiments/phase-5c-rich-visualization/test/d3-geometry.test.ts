import { describe, expect, it } from 'vitest';

import { createD3Geometry } from '../src/d3-geometry.js';
import { queueInvestigationFixture } from '../src/fixture.js';
import { createNativeGeometry, nativeX, nativeY } from '../src/native-geometry.js';
import { svgPlot } from '../src/svg-geometry.js';

describe('Phase 5C D3-assisted SVG geometry', () => {
  it('maps only the authored window, scale, threshold, and annotation', () => {
    const geometry = createD3Geometry(queueInvestigationFixture);
    expect(geometry.xScale(queueInvestigationFixture.windowStart)).toBe(svgPlot.inlineStart);
    expect(geometry.xScale(queueInvestigationFixture.windowEnd)).toBe(svgPlot.inlineEnd);
    expect(geometry.yScale(queueInvestigationFixture.scaleMaximum)).toBe(svgPlot.blockStart);
    expect(geometry.yScale(queueInvestigationFixture.scaleMinimum)).toBe(svgPlot.blockEnd);
    expect(geometry.thresholdY).toBe(nativeY(queueInvestigationFixture, 80));
    expect(geometry.annotationX).toBe(
      nativeX(queueInvestigationFixture, queueInvestigationFixture.annotation.observedAt),
    );
  });

  it('retains the native baseline identities, marks, and full series paths', () => {
    const native = createNativeGeometry(queueInvestigationFixture);
    const d3 = createD3Geometry(queueInvestigationFixture);
    expect(d3.series.map(({ seriesId }) => seriesId)).toEqual(
      native.series.map(({ seriesId }) => seriesId),
    );
    expect(d3.series.map(({ marks }) => marks)).toEqual(native.series.map(({ marks }) => marks));
    expect(d3.series.every(({ hitPath }) => hitPath.length > 0)).toBe(true);
    expect(d3.series.map(({ paths }) => paths.map(({ knowledge }) => knowledge))).toEqual(
      native.series.map(({ paths }) => paths.map(({ knowledge }) => knowledge)),
    );
  });

  it('breaks D3 paths at explicit unavailable observations', () => {
    const geometry = createD3Geometry(queueInvestigationFixture);
    const classification = geometry.series.find(({ seriesId }) => seriesId === 'classification')!;
    const point = queueInvestigationFixture.series[2]!.points[361]!;
    const unavailableCoordinate = `${Number(geometry.xScale(point.observedAt).toFixed(3))},`;
    expect(point.value).toBeNull();
    expect(classification.hitPath).not.toContain(unavailableCoordinate);
  });
});
