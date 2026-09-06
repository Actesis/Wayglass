import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const record = read('docs/governance/phase-6c-vanilla-consumer-implementation.md');
const normalizedRecord = record.replace(/\s+/g, ' ');

describe('Phase 6C-D2 Vanilla consumer implementation record', () => {
  it('records both exact compiler scenarios and package inputs', () => {
    expect(normalizedRecord).toContain('TypeScript `5.9.3`');
    expect(normalizedRecord).toContain('TypeScript `6.0.3`');
    expect(normalizedRecord).toContain('core, tokens, themes, elements, and icons tarballs');
    expect(normalizedRecord).toContain('Vite remains exact at `8.1.5`');
  });

  it('keeps import registration and the four semantic axes explicit', () => {
    expect(normalizedRecord).toContain(
      'fails if importing the selected element subpaths registers',
    );
    expect(normalizedRecord).toContain('calls the two explicit registration functions');
    expect(normalizedRecord).toContain('`asserted` is checked separately');
    expect(normalizedRecord).toContain('`critical` condition, `stale` knowledge, and `pending`');
  });

  it('records build, CSS, tree-shaking, removal, and rebuild proof', () => {
    expect(normalizedRecord).toContain('requires emitted HTML, JavaScript, and CSS');
    expect(normalizedRecord).toContain('rejects bundled `wg-media-viewer` and `wg-icon`');
    expect(normalizedRecord).toContain('`@wayglass/icons`');
    expect(normalizedRecord).toContain('repeats declaration checking, production building');
  });

  it('keeps the command offline, isolated, and credential-free', () => {
    expect(normalizedRecord).toContain('release-candidate:probe:vanilla');
    expect(normalizedRecord).toContain('rejects recognized credentials');
    expect(normalizedRecord).toContain('fresh operating-system temporary projects');
    expect(normalizedRecord).toContain('cannot contact a registry to fill missing material');
  });

  it('states the evidence limitation and keeps D3 behind acceptance', () => {
    expect(normalizedRecord).toContain('**Status:** Proposed for project-owner acceptance');
    expect(normalizedRecord).toContain('release-candidate suite passes 56 assertions');
    expect(normalizedRecord).toContain('all 14 scheduled builds');
    expect(normalizedRecord).toContain('all 20 scheduled typecheck tasks');
    expect(normalizedRecord).toContain('all 20 scheduled package and application test tasks');
    expect(normalizedRecord).toContain('including 237 documentation assertions');
    expect(normalizedRecord).toContain('contains TypeScript `6.0.3` but not `5.9.3`');
    expect(normalizedRecord).toContain('authorizes Phase 6C-D3 React consumer implementation only');
    expect(normalizedRecord).toContain('does not accept a Vanilla or React result');
  });
});
