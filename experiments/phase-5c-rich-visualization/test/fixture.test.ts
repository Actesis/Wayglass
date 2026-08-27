import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  createQueueInvestigationFixture,
  queueInvestigationAdaptationFixture,
  queueInvestigationReplacementFixture,
  queueFixtureExpectedTaskAnswers,
  queueFixtureInterventionIndex,
  queueFixtureSampleCount,
  queueFixtureSampleInterval,
  queueFixtureThresholdValue,
  queueInvestigationFixture,
} from '../src/fixture.js';

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

describe('Phase 5C deterministic queue fixture', () => {
  it('contains the exact accepted maximum envelope and aligned application input', () => {
    expect(queueInvestigationFixture.series).toHaveLength(4);
    expect(queueInvestigationFixture.series.every(({ points }) => points.length === 2_880)).toBe(
      true,
    );
    expect(queueInvestigationFixture.series.flatMap(({ points }) => points)).toHaveLength(11_520);
    expect(queueFixtureSampleCount).toBe(2_880);
    expect(queueFixtureSampleInterval).toBe(30_000);

    const timestamps = queueInvestigationFixture.series[0]!.points.map(
      ({ observedAt }) => observedAt,
    );
    for (const candidateSeries of queueInvestigationFixture.series.slice(1)) {
      expect(candidateSeries.points.map(({ observedAt }) => observedAt)).toEqual(timestamps);
    }
  });

  it('is deeply frozen and deterministic across constructions', () => {
    const first = createQueueInvestigationFixture();
    const second = createQueueInvestigationFixture();

    expect(first).toEqual(second);
    expect(sha256(first)).toBe('9975d323221772846d7b973adff1ee66bd9c52d07c75da891159d450c4c4db7a');
    expect(sha256(second)).toBe('9975d323221772846d7b973adff1ee66bd9c52d07c75da891159d450c4c4db7a');
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.series)).toBe(true);
    expect(Object.isFrozen(first.series[0]?.points)).toBe(true);
    expect(Object.isFrozen(first.series[0]?.points[0])).toBe(true);
  });

  it('retains explicit gaps and each non-default observation knowledge case', () => {
    const allPoints = queueInvestigationFixture.series.flatMap(({ points }) => points);
    const gaps = allPoints.filter(({ value }) => value === null);

    expect(gaps).toHaveLength(3);
    expect(
      gaps.every(
        ({ knowledge, formattedValue }) =>
          knowledge === 'unavailable' && formattedValue === 'Unavailable',
      ),
    ).toBe(true);
    expect(new Set(allPoints.map(({ knowledge }) => knowledge))).toEqual(
      new Set(['confirmed', 'inferred', 'stale', 'unknown', 'conflicting', 'unavailable']),
    );
  });

  it('provides a compatible full-series replacement with updated exact values', () => {
    expect(queueInvestigationReplacementFixture).not.toBe(queueInvestigationFixture);
    expect(queueInvestigationReplacementFixture.series.map(({ id }) => id)).toEqual(
      queueInvestigationFixture.series.map(({ id }) => id),
    );
    expect(queueInvestigationReplacementFixture.series[0]!.points[0]).toMatchObject({
      id: queueInvestigationFixture.series[0]!.points[0]!.id,
      value: 37,
      formattedValue: '37 items',
    });
    expect(Object.isFrozen(queueInvestigationReplacementFixture)).toBe(true);
  });

  it('provides validated long application-authored labels without changing the envelope', () => {
    expect(Object.isFrozen(queueInvestigationAdaptationFixture)).toBe(true);
    expect(queueInvestigationAdaptationFixture.id).toBe(queueInvestigationFixture.id);
    expect(queueInvestigationAdaptationFixture.series.map(({ id }) => id)).toEqual(
      queueInvestigationFixture.series.map(({ id }) => id),
    );
    expect(queueInvestigationAdaptationFixture.series[0]!.label.length).toBeGreaterThan(40);
    expect(queueInvestigationAdaptationFixture.annotation.detail.length).toBeGreaterThan(80);
  });

  it('encodes the authored first-breach answer independently of series order', () => {
    const breaches = queueInvestigationFixture.series
      .flatMap((candidateSeries) =>
        candidateSeries.points
          .filter(({ value }) => value !== null && value >= queueFixtureThresholdValue)
          .map(({ observedAt }) => ({ seriesId: candidateSeries.id, observedAt })),
      )
      .sort((left, right) => left.observedAt - right.observedAt);

    expect(breaches[0]).toEqual({
      seriesId: queueFixtureExpectedTaskAnswers.firstBreachSeriesId,
      observedAt: queueFixtureExpectedTaskAnswers.firstBreachObservedAt,
    });
  });

  it('encodes exact intervention values and recovery within the authored deadline', () => {
    const interventionValues = Object.fromEntries(
      queueInvestigationFixture.series.map((candidateSeries) => [
        candidateSeries.id,
        candidateSeries.points[queueFixtureInterventionIndex]?.value,
      ]),
    );
    expect(interventionValues).toEqual({
      review: 85,
      intake: 88,
      classification: 91,
      dispatch: 95,
    });

    const recoveries = queueInvestigationFixture.series.map((candidateSeries) => {
      const recovery = candidateSeries.points.find(
        ({ observedAt, value }) =>
          observedAt >= queueFixtureExpectedTaskAnswers.interventionObservedAt &&
          value !== null &&
          value < queueFixtureThresholdValue,
      );
      return { seriesId: candidateSeries.id, observedAt: recovery?.observedAt };
    });
    const latestRecovery = recoveries.reduce((latest, recovery) =>
      (recovery.observedAt ?? Number.POSITIVE_INFINITY) >
      (latest.observedAt ?? Number.NEGATIVE_INFINITY)
        ? recovery
        : latest,
    );

    expect(latestRecovery).toEqual({
      seriesId: queueFixtureExpectedTaskAnswers.latestRecoverySeriesId,
      observedAt: queueFixtureExpectedTaskAnswers.latestRecoveryObservedAt,
    });
    expect(latestRecovery.observedAt).toBeLessThanOrEqual(
      queueFixtureExpectedTaskAnswers.recoveryDeadlineObservedAt,
    );
    expect(queueFixtureExpectedTaskAnswers.allRecoveredWithinFifteenMinutes).toBe(true);
  });
});
