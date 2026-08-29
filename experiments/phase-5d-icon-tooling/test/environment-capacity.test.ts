import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { proofIconCatalog } from '../src/catalog.js';
import { createSyntheticIconCatalog, measureIconToolingCapacity } from '../src/capacity.js';
import { generateIconArtifacts } from '../src/generator.js';
import { validateIconCatalog } from '../src/model.js';

describe('Phase 5D-A environment and capacity evidence', () => {
  it('is independent of current working directory, locale, time zone, and input order', () => {
    const baseline = generateIconArtifacts(proofIconCatalog);
    const original = {
      cwd: process.cwd(),
      lang: process.env.LANG,
      timezone: process.env.TZ,
    };
    const cases = [
      {
        cwd: fileURLToPath(new URL('..', import.meta.url)),
        lang: 'C',
        timezone: 'UTC',
        source: proofIconCatalog,
      },
      {
        cwd: fileURLToPath(new URL('../../..', import.meta.url)),
        lang: 'tr_TR.UTF-8',
        timezone: 'Pacific/Kiritimati',
        source: [...proofIconCatalog].reverse(),
      },
    ];

    try {
      for (const environment of cases) {
        process.chdir(environment.cwd);
        process.env.LANG = environment.lang;
        process.env.TZ = environment.timezone;
        expect(generateIconArtifacts(environment.source)).toEqual(baseline);
      }
    } finally {
      process.chdir(original.cwd);
      if (original.lang === undefined) delete process.env.LANG;
      else process.env.LANG = original.lang;
      if (original.timezone === undefined) delete process.env.TZ;
      else process.env.TZ = original.timezone;
    }
  });

  it('constructs an unambiguous 500-glyph synthetic capacity fixture', () => {
    const catalog = createSyntheticIconCatalog();
    const validated = validateIconCatalog(catalog);

    expect(validated).toHaveLength(500);
    expect(new Set(validated.map(({ id }) => id))).toHaveLength(500);
    expect(validated.filter(({ direction }) => direction === 'mirrors-in-rtl')).toHaveLength(50);
  });

  it('rejects invalid capacity inputs', () => {
    expect(() => createSyntheticIconCatalog(0)).toThrow(/1 through 500/);
    expect(() => createSyntheticIconCatalog(501)).toThrow(/1 through 500/);
    expect(() => measureIconToolingCapacity(500, 0)).toThrow(/positive safe integer/);
  });

  it('keeps every one of 50 capacity runs below the accepted time and memory bounds', () => {
    const measurement = measureIconToolingCapacity();

    expect(measurement).toMatchObject({ glyphs: 500, repetitions: 50 });
    expect(measurement.statistics.maximumMilliseconds).toBeLessThan(2_000);
    expect(measurement.memory.observedMaxRssDeltaKibibytes).toBeLessThan(256 * 1_024);

    if (process.env.WG_P5D_REPORT_CAPACITY === '1') {
      console.info(`P5D_CAPACITY ${JSON.stringify(measurement)}`);
    }
  });
});
