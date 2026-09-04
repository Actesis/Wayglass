import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, '../../..');
const read = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const readJson = (path: string): Record<string, unknown> => JSON.parse(read(path));

const audit = read('docs/governance/phase-6b-completion-audit.md');
const candidatePackages = ['core', 'tokens', 'themes', 'elements', 'icons', 'react'] as const;
const manifests = Object.fromEntries(
  candidatePackages.map((name) => [name, readJson(`packages/${name}/package.json`)]),
) as Record<(typeof candidatePackages)[number], Record<string, unknown>>;

const componentAudits = [
  'phase-6b-phase-1-primitive-audit.md',
  'phase-6b-tabs-contract-audit.md',
  'phase-6b-foundation-layout-contract-audit.md',
  'phase-6b-core-controls-contract-audit.md',
  'phase-6b-menu-command-contract-audit.md',
  'phase-6b-form-foundation-contract-audit.md',
  'phase-6b-form-controls-contract-audit.md',
  'phase-6b-persistent-feedback-contract-audit.md',
  'phase-6b-transient-feedback-contract-audit.md',
  'phase-6b-modal-feedback-contract-audit.md',
  'phase-6b-media-contract-audit.md',
  'phase-6b-scalar-data-contract-audit.md',
  'phase-6b-telemetry-contract-audit.md',
  'phase-6b-status-collections-contract-audit.md',
  'phase-6b-temporal-collections-contract-audit.md',
  'phase-6b-filter-command-contract-audit.md',
  'phase-6b-data-table-contract-audit.md',
] as const;

describe('Phase 6B completion readiness', () => {
  it('retains the exact six-package candidate set and private candidate state', () => {
    expect(candidatePackages).toEqual(['core', 'tokens', 'themes', 'elements', 'icons', 'react']);
    for (const name of candidatePackages) {
      expect(manifests[name].name).toBe(`@wayglass/${name}`);
      expect(manifests[name].version).toBe('0.1.0');
      expect(manifests[name].private).toBe(true);
      expect(manifests[name].license).toBe('Apache-2.0');
    }
    expect(audit).toContain('packages remain private');
  });

  it('confirms all seventeen mapped component-family audits are accepted', () => {
    expect(componentAudits).toHaveLength(17);
    for (const file of componentAudits) {
      expect(read(`docs/governance/${file}`), file).toContain(
        '**Status:** Accepted by the project owner',
      );
    }
  });

  it('confirms entry-point, symbol, utility, and theme-name corrections are accepted', () => {
    for (const file of [
      'phase-6b-package-entrypoint-freeze.md',
      'phase-6b-foundation-root-symbols.md',
      'phase-6b-elements-react-root-symbols.md',
      'phase-6b-utility-entry-review.md',
    ]) {
      expect(read(`docs/governance/${file}`), file).toContain(
        '**Status:** Accepted by the project owner',
      );
    }
    const themeSource = [
      read('packages/themes/src/definitions.ts'),
      read('packages/themes/src/index.ts'),
      read('packages/themes/src/css.ts'),
    ].join('\n');
    expect(themeSource).not.toMatch(/Phase1ThemeName|phase1-(?:dark|light)/);
    expect(themeSource).toContain("export const themeNames = ['wayglass-dark', 'wayglass-light']");
  });

  it('keeps accepted stewardship metadata separate from release readiness', () => {
    for (const name of candidatePackages) {
      for (const field of [
        'description',
        'homepage',
        'repository',
        'keywords',
        'author',
        'publishConfig',
      ]) {
        expect(manifests[name], `${name} is missing ${field}`).toHaveProperty(field);
      }
      expect(manifests[name]).not.toHaveProperty('funding');
      expect(manifests[name].files).toEqual(['dist', 'README.md', 'LICENSE', 'NOTICE']);
    }
    expect(read('docs/governance/phase-6b-package-identity-stewardship.md')).toContain(
      '**Status:** Accepted by the project owner',
    );
    expect(audit).toMatch(/4\. Complete release metadata and package documentation\s*\| Complete/);
    expect(audit).toMatch(/5\. Include license\/notice and decide sources\/maps\s*\| Complete/);
    expect(audit).toMatch(/11\. Create maintenance and release-document baselines\s*\| Complete/);
  });

  it('keeps the accepted compatibility contract separate from publication readiness', () => {
    expect((manifests.react.devDependencies as Record<string, string>)['@wayglass/elements']).toBe(
      'workspace:*',
    );
    expect((manifests.react.peerDependencies as Record<string, string>).react).toBe('>=19.0.0 <20');
    expect(manifests.core.sideEffects).toBe(false);
    expect(manifests.tokens.sideEffects).toBe(false);
    for (const name of candidatePackages) {
      expect(manifests[name]).toHaveProperty('scripts');
    }
    expect(read('docs/governance/phase-6b-version-compatibility-contract.md')).toContain(
      '**Status:** Accepted by the project owner',
    );
    expect(audit).toMatch(/6\. Select versions and publish-time SemVer ranges\s*\| Complete/);
    expect(audit).toMatch(/7\. Make retained packed scripts independently usable\s*\| Complete/);
    expect(audit).toMatch(/8\. Complete side-effect declarations\s*\| Complete/);
    expect(audit).toMatch(/9\. Constrain React and choose TypeScript compatibility\s*\| Complete/);
  });

  it('records claim narrowing and the exact-freeze matrix as unresolved gates', () => {
    expect(audit).toMatch(
      /10\. Complete assistive-technology evidence or narrow claims\s*\| Open with accepted alternative/,
    );
    expect(audit).toContain('withholding broad desktop screen-reader and mobile');
    expect(audit).toMatch(/12\. Run the complete stabilization and freeze matrix\s*\| Open/);
    expect(audit).toContain('## Remaining Phase 6B sequence');
    expect(audit).not.toContain('Phase 6B is complete');
  });
});
