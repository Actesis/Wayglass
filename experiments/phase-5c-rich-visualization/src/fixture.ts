import {
  assertRichVisualizationInput,
  deepFreeze,
  type RichVisualizationInput,
  type RichVisualizationPoint,
  type RichVisualizationSeries,
} from './model.js';

export const queueFixtureSampleInterval = 30_000;
export const queueFixtureSampleCount = 2_880;
export const queueFixtureWindowStart = Date.UTC(2026, 7, 18, 0, 0, 0);
export const queueFixtureWindowEnd =
  queueFixtureWindowStart + (queueFixtureSampleCount - 1) * queueFixtureSampleInterval;
export const queueFixtureThresholdValue = 80;
export const queueFixtureInterventionIndex = 1_680;

const seriesDefinitions = [
  { id: 'review', label: 'Review queue', breachIndex: 960, recoveryIndex: 1_690 },
  { id: 'intake', label: 'Intake queue', breachIndex: 990, recoveryIndex: 1_694 },
  { id: 'classification', label: 'Classification queue', breachIndex: 1_020, recoveryIndex: 1_698 },
  { id: 'dispatch', label: 'Dispatch queue', breachIndex: 1_050, recoveryIndex: 1_704 },
] as const;

export const queueFixtureExpectedTaskAnswers = deepFreeze({
  firstBreachSeriesId: 'review',
  firstBreachObservedAt: queueFixtureWindowStart + 960 * queueFixtureSampleInterval,
  interventionObservedAt:
    queueFixtureWindowStart + queueFixtureInterventionIndex * queueFixtureSampleInterval,
  recoveryDeadlineObservedAt:
    queueFixtureWindowStart + (queueFixtureInterventionIndex + 30) * queueFixtureSampleInterval,
  latestRecoverySeriesId: 'dispatch',
  latestRecoveryObservedAt: queueFixtureWindowStart + 1_704 * queueFixtureSampleInterval,
  allRecoveredWithinFifteenMinutes: true,
});

function formatTimestamp(timestamp: number): string {
  return `${new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

function knowledgeAt(
  seriesIndex: number,
  sampleIndex: number,
): RichVisualizationPoint['knowledge'] {
  if (seriesIndex === 2 && sampleIndex >= 360 && sampleIndex <= 362) {
    return 'unavailable';
  }

  if (seriesIndex === 0 && sampleIndex === 720) return 'stale';
  if (seriesIndex === 1 && sampleIndex === 721) return 'inferred';
  if (seriesIndex === 2 && sampleIndex === 722) return 'conflicting';
  if (seriesIndex === 3 && sampleIndex === 723) return 'unknown';
  return 'confirmed';
}

function numericValueAt(
  seriesIndex: number,
  sampleIndex: number,
  breachIndex: number,
  recoveryIndex: number,
): number {
  if (sampleIndex < breachIndex) {
    return 36 + seriesIndex * 4 + ((sampleIndex * (seriesIndex + 3)) % 9);
  }

  if (sampleIndex < queueFixtureInterventionIndex) {
    return 86 + seriesIndex * 3 + (sampleIndex % 5);
  }

  if (sampleIndex < recoveryIndex) {
    return 80 + Math.ceil((recoveryIndex - sampleIndex) / 2) + seriesIndex;
  }

  return 70 + seriesIndex + (sampleIndex % 7);
}

function createSeries(
  definition: (typeof seriesDefinitions)[number],
  seriesIndex: number,
): RichVisualizationSeries {
  const points = Array.from({ length: queueFixtureSampleCount }, (_, sampleIndex) => {
    const observedAt = queueFixtureWindowStart + sampleIndex * queueFixtureSampleInterval;
    const knowledge = knowledgeAt(seriesIndex, sampleIndex);
    const value =
      knowledge === 'unavailable'
        ? null
        : numericValueAt(
            seriesIndex,
            sampleIndex,
            definition.breachIndex,
            definition.recoveryIndex,
          );

    return {
      id: `${definition.id}-${sampleIndex}`,
      observedAt,
      formattedObservedAt: formatTimestamp(observedAt),
      value,
      formattedValue: value === null ? 'Unavailable' : `${value} items`,
      knowledge,
    } satisfies RichVisualizationPoint;
  });

  return {
    id: definition.id,
    label: definition.label,
    points,
  };
}

export function createQueueInvestigationFixture(): RichVisualizationInput {
  const interventionObservedAt = queueFixtureExpectedTaskAnswers.interventionObservedAt;
  const input = {
    id: 'queue-investigation-24h',
    title: 'Queue depth around the August 18 intervention',
    summary:
      'The review queue crossed caution first at 08:00 UTC. After the 14:00 UTC intervention, all four queues returned below caution by 14:12 UTC.',
    unit: 'items',
    windowStart: queueFixtureWindowStart,
    windowEnd: queueFixtureWindowEnd,
    formattedWindowStart: formatTimestamp(queueFixtureWindowStart),
    formattedWindowEnd: formatTimestamp(queueFixtureWindowEnd),
    scaleMinimum: 0,
    scaleMaximum: 120,
    formattedScaleMinimum: '0 items',
    formattedScaleMaximum: '120 items',
    series: seriesDefinitions.map(createSeries),
    threshold: {
      id: 'caution-threshold',
      label: 'Caution threshold',
      value: queueFixtureThresholdValue,
      formattedValue: '80 items',
    },
    annotation: {
      id: 'routing-intervention',
      label: 'Routing intervention',
      detail: 'The application redistributed incoming work at 14:00 UTC.',
      observedAt: interventionObservedAt,
      formattedObservedAt: formatTimestamp(interventionObservedAt),
    },
  } satisfies RichVisualizationInput;

  assertRichVisualizationInput(input);
  return deepFreeze(input);
}

export const queueInvestigationFixture = createQueueInvestigationFixture();
