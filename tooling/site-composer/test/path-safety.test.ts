import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { validateNewSiteOutputPath } from '../src/path-safety.ts';
import { createSiteRepositoryFixture } from './system-fixtures.ts';

const temporary: string[] = [];

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe('site output path safety', () => {
  it('accepts only a new absolute path with an existing real parent under the OS temp root', () => {
    const fixture = createSiteRepositoryFixture();
    temporary.push(fixture.parent);
    expect(validateNewSiteOutputPath(fixture.output(), fixture.root)).toBe(fixture.output());
    mkdirSync(fixture.output());
    expect(() => validateNewSiteOutputPath(fixture.output(), fixture.root)).toThrow(
      'WG_SITE_OUTPUT_EXISTS',
    );
    expect(() => validateNewSiteOutputPath('relative', fixture.root)).toThrow(
      'WG_SITE_OUTPUT_ABSOLUTE',
    );
    expect(() =>
      validateNewSiteOutputPath(resolve(fixture.parent, 'absent/site'), fixture.root),
    ).toThrow('WG_SITE_OUTPUT_PARENT');
  });

  it('rejects non-directory and symbolic-link parents', () => {
    const fixture = createSiteRepositoryFixture();
    temporary.push(fixture.parent);
    const file = resolve(fixture.parent, 'file');
    writeFileSync(file, 'x');
    expect(() => validateNewSiteOutputPath(resolve(file, 'site'), fixture.root)).toThrow(
      'WG_SITE_OUTPUT_PARENT',
    );
    const target = mkdtempSync(resolve(tmpdir(), 'wayglass-site-parent-target-'));
    temporary.push(target);
    const link = resolve(fixture.parent, 'parent-link');
    symlinkSync(target, link, 'dir');
    expect(() => validateNewSiteOutputPath(resolve(link, 'site'), fixture.root)).toThrow(
      'WG_SITE_OUTPUT_PARENT',
    );
  });

  it('rejects paths outside the temporary root and repository descendants', () => {
    const fixture = createSiteRepositoryFixture();
    temporary.push(fixture.parent);
    expect(() => validateNewSiteOutputPath('/usr/wayglass-site-output', fixture.root)).toThrow(
      'WG_SITE_OUTPUT_TEMP',
    );
    expect(() => validateNewSiteOutputPath(resolve(fixture.root, 'output'), fixture.root)).toThrow(
      'WG_SITE_OUTPUT_REPOSITORY',
    );
  });
});
