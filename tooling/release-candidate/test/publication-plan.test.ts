import { describe, expect, it } from 'vitest';

import { candidateDirectories } from '../src/constants.ts';
import { projectPackageManifest } from '../src/manifest.ts';
import { projectPublicationManifest, preparePublicationPlan } from '../src/publication-plan.ts';
import { sourceManifest } from './fixtures.ts';

describe('publication metadata review', () => {
  it('changes only isolated manifest privacy for exactly the six reviewed packages', () => {
    for (const directory of candidateDirectories) {
      const source = sourceManifest(directory);
      const candidate = projectPackageManifest(directory, source);
      const publication = projectPublicationManifest(directory, source);
      expect(publication).toEqual({ ...candidate, private: false });
      expect(candidate.private).toBe(true);
      expect(source.private).toBe(true);
      expect(publication).not.toHaveProperty('scripts');
      expect(publication).not.toHaveProperty('devDependencies');
    }
  });
  it('rejects drift rather than turning arbitrary manifests into public packages', () => {
    const source = sourceManifest('core');
    expect(() => projectPublicationManifest('core', { ...source, name: '@other/core' })).toThrow();
    expect(() => projectPublicationManifest('core', { ...source, private: false })).toThrow();
  });
  it('rejects credentials before any filesystem or process action', async () => {
    let ran = false;
    await expect(
      preparePublicationPlan(
        '/absent',
        'bad',
        '/absent',
        async () => {
          ran = true;
          return { stdout: '', stderr: '' };
        },
        { NPM_TOKEN: 'not-a-real-token' },
      ),
    ).rejects.toThrow('WG_RC_CREDENTIAL_EXPOSURE');
    expect(ran).toBe(false);
  });
});
