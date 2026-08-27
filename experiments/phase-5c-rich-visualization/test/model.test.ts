import { describe, expect, it } from 'vitest';

import { queueInvestigationFixture } from '../src/fixture.js';
import {
  assertRichVisualizationInput,
  richVisualizationMaximumSamplesPerSeries,
  richVisualizationMaximumSeries,
} from '../src/model.js';

function mutableFixture(): Record<string, unknown> {
  return structuredClone(queueInvestigationFixture) as unknown as Record<string, unknown>;
}

function series(input: Record<string, unknown>): Array<Record<string, unknown>> {
  return input.series as Array<Record<string, unknown>>;
}

function points(input: Record<string, unknown>, seriesIndex = 0): Array<Record<string, unknown>> {
  return series(input)[seriesIndex]?.points as Array<Record<string, unknown>>;
}

describe('Phase 5C shared input boundary', () => {
  it('accepts the maximum deterministic fixture without mutation', () => {
    const input = mutableFixture();
    const before = structuredClone(input);

    expect(() => assertRichVisualizationInput(input)).not.toThrow();
    expect(input).toEqual(before);
  });

  it('rejects series and sample counts outside the accepted envelope', () => {
    const tooManySeries = mutableFixture();
    tooManySeries.series = Array.from(
      { length: richVisualizationMaximumSeries + 1 },
      (_, index) => ({ ...series(tooManySeries)[0], id: `series-${index}` }),
    );
    expect(() => assertRichVisualizationInput(tooManySeries)).toThrow('P5C_INPUT_SERIES_COUNT');

    const tooManyPoints = mutableFixture();
    points(tooManyPoints).push({
      ...points(tooManyPoints).at(-1),
      id: 'overflow',
      observedAt: queueInvestigationFixture.windowEnd,
    });
    expect(points(tooManyPoints)).toHaveLength(richVisualizationMaximumSamplesPerSeries + 1);
    expect(() => assertRichVisualizationInput(tooManyPoints)).toThrow('P5C_INPUT_SAMPLE_COUNT');
  });

  it('rejects duplicate identities, unordered samples, and misaligned timestamps', () => {
    const duplicateSeries = mutableFixture();
    series(duplicateSeries)[1]!.id = series(duplicateSeries)[0]!.id;
    expect(() => assertRichVisualizationInput(duplicateSeries)).toThrow('P5C_INPUT_SERIES_ID');

    const duplicatePoint = mutableFixture();
    points(duplicatePoint)[1]!.id = points(duplicatePoint)[0]!.id;
    expect(() => assertRichVisualizationInput(duplicatePoint)).toThrow('P5C_INPUT_POINT_ID');

    const crossSeriesDuplicatePoint = mutableFixture();
    points(crossSeriesDuplicatePoint, 1)[0]!.id = points(crossSeriesDuplicatePoint)[0]!.id;
    expect(() => assertRichVisualizationInput(crossSeriesDuplicatePoint)).toThrow(
      'P5C_INPUT_POINT_ID',
    );

    const unordered = mutableFixture();
    points(unordered)[1]!.observedAt = points(unordered)[0]!.observedAt;
    expect(() => assertRichVisualizationInput(unordered)).toThrow('P5C_INPUT_POINT_ORDER');

    const misaligned = mutableFixture();
    points(misaligned, 1)[10]!.observedAt = (points(misaligned, 1)[10]!.observedAt as number) + 1;
    expect(() => assertRichVisualizationInput(misaligned)).toThrow('P5C_INPUT_ALIGNMENT');

    const ambiguousFormattedTime = mutableFixture();
    points(ambiguousFormattedTime)[1]!.formattedObservedAt =
      points(ambiguousFormattedTime)[0]!.formattedObservedAt;
    expect(() => assertRichVisualizationInput(ambiguousFormattedTime)).toThrow(
      'P5C_INPUT_FORMATTED_TIME_DUPLICATE',
    );

    const misalignedFormattedTime = mutableFixture();
    points(misalignedFormattedTime, 1)[10]!.formattedObservedAt = 'Different authored time';
    expect(() => assertRichVisualizationInput(misalignedFormattedTime)).toThrow(
      'P5C_INPUT_FORMATTED_TIME_ALIGNMENT',
    );
  });

  it('rejects values outside the scale and semantically ambiguous gaps', () => {
    const outsideScale = mutableFixture();
    points(outsideScale)[0]!.value = 121;
    expect(() => assertRichVisualizationInput(outsideScale)).toThrow('P5C_INPUT_POINT_SCALE');

    const ambiguousGap = mutableFixture();
    points(ambiguousGap)[0]!.value = null;
    points(ambiguousGap)[0]!.formattedValue = 'Unavailable';
    expect(() => assertRichVisualizationInput(ambiguousGap)).toThrow('P5C_INPUT_GAP_KNOWLEDGE');

    const unavailableValue = mutableFixture();
    points(unavailableValue)[0]!.knowledge = 'unavailable';
    expect(() => assertRichVisualizationInput(unavailableValue)).toThrow(
      'P5C_INPUT_VALUE_KNOWLEDGE',
    );
  });

  it('rejects derived-boundary ambiguity in authored scale, threshold, annotation, and text', () => {
    const invalidWindow = mutableFixture();
    invalidWindow.windowEnd = invalidWindow.windowStart;
    expect(() => assertRichVisualizationInput(invalidWindow)).toThrow('P5C_INPUT_WINDOW');

    const invalidScale = mutableFixture();
    invalidScale.scaleMaximum = invalidScale.scaleMinimum;
    expect(() => assertRichVisualizationInput(invalidScale)).toThrow('P5C_INPUT_SCALE');

    const invalidThreshold = mutableFixture();
    (invalidThreshold.threshold as Record<string, unknown>).value = 121;
    expect(() => assertRichVisualizationInput(invalidThreshold)).toThrow(
      'P5C_INPUT_THRESHOLD_SCALE',
    );

    const invalidAnnotation = mutableFixture();
    (invalidAnnotation.annotation as Record<string, unknown>).observedAt =
      queueInvestigationFixture.windowEnd + 1;
    expect(() => assertRichVisualizationInput(invalidAnnotation)).toThrow(
      'P5C_INPUT_ANNOTATION_WINDOW',
    );

    const missingSummary = mutableFixture();
    missingSummary.summary = ' ';
    expect(() => assertRichVisualizationInput(missingSummary)).toThrow('P5C_INPUT_TEXT');
  });
});
