import { isKnowledge, type Knowledge } from '../../../packages/core/src/state.js';

export const richVisualizationMaximumSeries = 4;
export const richVisualizationMaximumSamplesPerSeries = 2_880;

export interface RichVisualizationPoint {
  readonly id: string;
  readonly observedAt: number;
  readonly formattedObservedAt: string;
  readonly value: number | null;
  readonly formattedValue: string;
  readonly knowledge: Knowledge;
}

export interface RichVisualizationSeries {
  readonly id: string;
  readonly label: string;
  readonly points: readonly RichVisualizationPoint[];
}

export interface RichVisualizationThreshold {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly formattedValue: string;
}

export interface RichVisualizationAnnotation {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly observedAt: number;
  readonly formattedObservedAt: string;
}

export interface RichVisualizationInput {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly unit: string;
  readonly windowStart: number;
  readonly windowEnd: number;
  readonly formattedWindowStart: string;
  readonly formattedWindowEnd: string;
  readonly scaleMinimum: number;
  readonly scaleMaximum: number;
  readonly formattedScaleMinimum: string;
  readonly formattedScaleMaximum: string;
  readonly series: readonly RichVisualizationSeries[];
  readonly threshold: RichVisualizationThreshold;
  readonly annotation: RichVisualizationAnnotation;
}

function fail(code: string, message: string): never {
  throw new Error(`P5C_INPUT_${code}: ${message}`);
}

function record(value: unknown, path: string): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fail('RECORD', `${path} must be an object.`);
  }

  return value as Readonly<Record<string, unknown>>;
}

function array(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    return fail('ARRAY', `${path} must be an array.`);
  }

  return value;
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fail('TEXT', `${path} must be nonempty text.`);
  }

  return value;
}

function finiteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fail('NUMBER', `${path} must be a finite number.`);
  }

  return value;
}

function validatePoint(
  value: unknown,
  path: string,
  windowStart: number,
  windowEnd: number,
  scaleMinimum: number,
  scaleMaximum: number,
): RichVisualizationPoint {
  const candidate = record(value, path);
  const id = text(candidate.id, `${path}.id`);
  const observedAt = finiteNumber(candidate.observedAt, `${path}.observedAt`);
  const formattedObservedAt = text(candidate.formattedObservedAt, `${path}.formattedObservedAt`);
  const formattedValue = text(candidate.formattedValue, `${path}.formattedValue`);
  const knowledge = candidate.knowledge;

  if (observedAt < windowStart || observedAt > windowEnd) {
    fail('POINT_WINDOW', `${path}.observedAt must be inside the authored window.`);
  }

  if (!isKnowledge(knowledge)) {
    fail('KNOWLEDGE', `${path}.knowledge must use the Wayglass knowledge vocabulary.`);
  }

  const pointValue = candidate.value;
  if (pointValue === null) {
    if (knowledge !== 'unavailable') {
      fail('GAP_KNOWLEDGE', `${path} gaps must be authored as unavailable.`);
    }
  } else {
    const numericValue = finiteNumber(pointValue, `${path}.value`);
    if (numericValue < scaleMinimum || numericValue > scaleMaximum) {
      fail('POINT_SCALE', `${path}.value must be inside the authored scale.`);
    }

    if (knowledge === 'unavailable') {
      fail('VALUE_KNOWLEDGE', `${path} finite values cannot be authored as unavailable.`);
    }
  }

  return {
    id,
    observedAt,
    formattedObservedAt,
    value: pointValue as number | null,
    formattedValue,
    knowledge,
  };
}

export function assertRichVisualizationInput(
  value: unknown,
): asserts value is RichVisualizationInput {
  const candidate = record(value, 'input');
  text(candidate.id, 'input.id');
  text(candidate.title, 'input.title');
  text(candidate.summary, 'input.summary');
  text(candidate.unit, 'input.unit');
  text(candidate.formattedWindowStart, 'input.formattedWindowStart');
  text(candidate.formattedWindowEnd, 'input.formattedWindowEnd');
  text(candidate.formattedScaleMinimum, 'input.formattedScaleMinimum');
  text(candidate.formattedScaleMaximum, 'input.formattedScaleMaximum');

  const windowStart = finiteNumber(candidate.windowStart, 'input.windowStart');
  const windowEnd = finiteNumber(candidate.windowEnd, 'input.windowEnd');
  const scaleMinimum = finiteNumber(candidate.scaleMinimum, 'input.scaleMinimum');
  const scaleMaximum = finiteNumber(candidate.scaleMaximum, 'input.scaleMaximum');

  if (windowEnd <= windowStart) {
    fail('WINDOW', 'input.windowEnd must be greater than input.windowStart.');
  }

  if (scaleMaximum <= scaleMinimum) {
    fail('SCALE', 'input.scaleMaximum must be greater than input.scaleMinimum.');
  }

  const series = array(candidate.series, 'input.series');
  if (series.length === 0 || series.length > richVisualizationMaximumSeries) {
    fail(
      'SERIES_COUNT',
      `input.series must contain between 1 and ${richVisualizationMaximumSeries} series.`,
    );
  }

  const seriesIds = new Set<string>();
  const pointIds = new Set<string>();
  let referenceTimestamps: readonly number[] | undefined;

  for (const [seriesIndex, rawSeries] of series.entries()) {
    const seriesPath = `input.series[${seriesIndex}]`;
    const seriesCandidate = record(rawSeries, seriesPath);
    const seriesId = text(seriesCandidate.id, `${seriesPath}.id`);
    text(seriesCandidate.label, `${seriesPath}.label`);

    if (seriesIds.has(seriesId)) {
      fail('SERIES_ID', `${seriesPath}.id duplicates series identity "${seriesId}".`);
    }
    seriesIds.add(seriesId);

    const points = array(seriesCandidate.points, `${seriesPath}.points`);
    if (points.length === 0 || points.length > richVisualizationMaximumSamplesPerSeries) {
      fail(
        'SAMPLE_COUNT',
        `${seriesPath}.points must contain between 1 and ${richVisualizationMaximumSamplesPerSeries} samples.`,
      );
    }

    const timestamps: number[] = [];
    let priorTimestamp = Number.NEGATIVE_INFINITY;

    for (const [pointIndex, rawPoint] of points.entries()) {
      const pointPath = `${seriesPath}.points[${pointIndex}]`;
      const point = validatePoint(
        rawPoint,
        pointPath,
        windowStart,
        windowEnd,
        scaleMinimum,
        scaleMaximum,
      );

      if (pointIds.has(point.id)) {
        fail('POINT_ID', `${pointPath}.id duplicates point identity "${point.id}".`);
      }
      pointIds.add(point.id);

      if (point.observedAt <= priorTimestamp) {
        fail('POINT_ORDER', `${pointPath}.observedAt must be strictly increasing.`);
      }
      priorTimestamp = point.observedAt;
      timestamps.push(point.observedAt);
    }

    if (referenceTimestamps === undefined) {
      referenceTimestamps = timestamps;
      continue;
    }

    if (
      timestamps.length !== referenceTimestamps.length ||
      timestamps.some((timestamp, index) => timestamp !== referenceTimestamps?.[index])
    ) {
      fail('ALIGNMENT', `${seriesPath}.points must share the first series timestamp sequence.`);
    }
  }

  const threshold = record(candidate.threshold, 'input.threshold');
  text(threshold.id, 'input.threshold.id');
  text(threshold.label, 'input.threshold.label');
  text(threshold.formattedValue, 'input.threshold.formattedValue');
  const thresholdValue = finiteNumber(threshold.value, 'input.threshold.value');
  if (thresholdValue < scaleMinimum || thresholdValue > scaleMaximum) {
    fail('THRESHOLD_SCALE', 'input.threshold.value must be inside the authored scale.');
  }

  const annotation = record(candidate.annotation, 'input.annotation');
  text(annotation.id, 'input.annotation.id');
  text(annotation.label, 'input.annotation.label');
  text(annotation.detail, 'input.annotation.detail');
  text(annotation.formattedObservedAt, 'input.annotation.formattedObservedAt');
  const annotationObservedAt = finiteNumber(annotation.observedAt, 'input.annotation.observedAt');
  if (annotationObservedAt < windowStart || annotationObservedAt > windowEnd) {
    fail('ANNOTATION_WINDOW', 'input.annotation.observedAt must be inside the authored window.');
  }
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }

  for (const child of Object.values(value as Readonly<Record<string, unknown>>)) {
    deepFreeze(child);
  }

  return Object.freeze(value);
}
