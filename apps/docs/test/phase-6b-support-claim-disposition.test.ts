import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');

const disposition = read('docs/governance/phase-6b-support-claim-disposition.md');
const support = read('SUPPORT.md');
const audit = read('docs/governance/phase-6b-completion-audit.md');

describe('Phase 6B support-claim disposition', () => {
  it('separates support, validation, observation, and absent claims', () => {
    for (const label of ['**Supported**', '**Validated**', '**Task-observed**', '**Unclaimed**']) {
      expect(disposition).toContain(label);
    }
    expect(disposition).toContain('not human observation, certification');
    expect(disposition).toContain('does not assert that the environment is broken');
  });

  it('retains the accepted runtime, compiler, browser-engine, and React boundaries', () => {
    expect(disposition).toContain('Node `>=22.13.0 <27`');
    expect(disposition).toContain('TypeScript `>=5.9.0 <6.1.0`');
    expect(disposition).toContain('Current stable Chromium, Firefox, and WebKit');
    expect(disposition).toContain('React `>=19.0.0 <20`');
    expect(disposition).toContain('client-only fallback');
    expect(disposition).toContain('Exact engine versions belong in release evidence');
  });

  it('does not generalize automated or focused VoiceOver evidence', () => {
    expect(disposition).toContain('no broad desktop or mobile screen-reader support claim');
    expect(disposition).toContain('accepted tabs task');
    expect(disposition).toContain('accepted core-controls task');
    expect(disposition).toContain('Phase 5C visualization tasks');
    expect(disposition).toContain('create no v1 visualization or package claim');
    expect(disposition).toContain('NVDA/Firefox');
    expect(disposition).toContain('VoiceOver/iOS Safari');
    expect(disposition).toContain('Automated accessibility trees and Axe');
  });

  it('keeps physical, embedded, form-profile, provider, and SSR claims out of v1', () => {
    for (const boundary of [
      'physical mobile devices',
      'installed PWAs',
      'Electron',
      'Tauri',
      'Home Assistant',
      'embedded webviews',
      'low-power',
      'password-manager',
      'React Server Components',
      'provider',
    ]) {
      expect(disposition).toContain(boundary);
    }
  });

  it('records acceptance without activating private-candidate support', () => {
    expect(disposition).toContain('**Status:** Accepted by the project owner');
    expect(support).toContain('## Initial `0.1.0` candidate matrix');
    expect(support).toContain('This matrix is not active support while packages remain private');
    expect(audit).toContain('Support-claim disposition — complete');
    expect(audit).toMatch(
      /10\. Complete assistive-technology evidence or narrow claims\s*\| Complete/,
    );
    expect(audit).toMatch(/12\. Run the complete stabilization and freeze matrix\s*\| Complete/);
    expect(disposition).toContain('Phase 6B then advances to the integrated freeze');
  });
});
