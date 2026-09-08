import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { auditProductionDependencies } from '../src/dependency-audit.ts';
import { readInstalledProductionDependencies } from '../src/installed-dependencies.ts';
import type { PackageAuditEvidence } from '../src/package-audit.ts';
import {
  acceptedDocumentHashes,
  candidateDirectories,
  expectedDependencies,
  expectedPeerDependencies,
  expectedSideEffects,
} from '../src/constants.ts';
import { sha256 } from '../src/hash.ts';

const temporary: string[] = [];

function temp(prefix: string): string {
  const path = mkdtempSync(resolve(tmpdir(), prefix));
  temporary.push(path);
  return path;
}

afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function packageAudit(): PackageAuditEvidence {
  return {
    schemaVersion: 1,
    packages: candidateDirectories.map((directory) => ({
      directory,
      name: `@wayglass/${directory}`,
      version: '0.1.0',
      private: true,
      manifestSha256: sha256(`manifest:${directory}`),
      licenseSha256: acceptedDocumentHashes.license,
      noticeSha256: acceptedDocumentHashes.notice,
      fileCount: 5,
      unpackedBytes: 50,
      inventorySha256: sha256(`inventory:${directory}`),
      exports: [],
      dependencies: expectedDependencies[directory] ?? {},
      peerDependencies: expectedPeerDependencies[directory] ?? {},
      sideEffects: expectedSideEffects[directory],
      lifecycleScriptsAbsent: true,
      privateFilesAbsent: true,
      sourceMaps: [],
    })),
  };
}

interface InstalledFixture {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly licenseFile?: boolean;
}

function install(root: string, fixture: InstalledFixture): string {
  const path = resolve(root, fixture.name.replace('/', '__'));
  mkdirSync(path, { recursive: true });
  writeFileSync(
    resolve(path, 'package.json'),
    `${JSON.stringify({
      name: fixture.name,
      version: fixture.version,
      license: 'BSD-3-Clause',
      ...(fixture.dependencies === undefined ? {} : { dependencies: fixture.dependencies }),
    })}\n`,
  );
  if (fixture.licenseFile !== false) {
    writeFileSync(resolve(path, 'LICENSE'), `License for ${fixture.name}\n`);
  }
  return path;
}

function linkDependency(owner: string, name: string, target: string): void {
  const destination = resolve(owner, 'node_modules', ...name.split('/'));
  mkdirSync(dirname(destination), { recursive: true });
  symlinkSync(target, destination);
}

function installedGraph(worktree: string): Readonly<Record<string, string>> {
  const store = resolve(worktree, '.installed');
  mkdirSync(store);
  const paths = {
    shim: install(store, {
      name: '@lit-labs/ssr-dom-shim',
      version: '1.6.0',
      licenseFile: false,
    }),
    react: install(store, { name: '@lit/react', version: '1.0.8' }),
    reactive: install(store, {
      name: '@lit/reactive-element',
      version: '2.1.2',
      dependencies: { '@lit-labs/ssr-dom-shim': '^1.5.0' },
    }),
    trusted: install(store, { name: '@types/trusted-types', version: '2.0.7' }),
    lit: install(store, {
      name: 'lit',
      version: '3.3.3',
      dependencies: {
        '@lit/reactive-element': '^2.1.0',
        'lit-element': '^4.2.0',
        'lit-html': '^3.3.0',
      },
    }),
    element: install(store, {
      name: 'lit-element',
      version: '4.2.2',
      dependencies: {
        '@lit-labs/ssr-dom-shim': '^1.5.0',
        '@lit/reactive-element': '^2.1.0',
        'lit-html': '^3.3.0',
      },
    }),
    html: install(store, {
      name: 'lit-html',
      version: '3.3.3',
      dependencies: { '@types/trusted-types': '^2.0.0' },
    }),
  };
  linkDependency(paths.reactive, '@lit-labs/ssr-dom-shim', paths.shim);
  linkDependency(paths.lit, '@lit/reactive-element', paths.reactive);
  linkDependency(paths.lit, 'lit-element', paths.element);
  linkDependency(paths.lit, 'lit-html', paths.html);
  linkDependency(paths.element, '@lit-labs/ssr-dom-shim', paths.shim);
  linkDependency(paths.element, '@lit/reactive-element', paths.reactive);
  linkDependency(paths.element, 'lit-html', paths.html);
  linkDependency(paths.html, '@types/trusted-types', paths.trusted);
  for (const directory of candidateDirectories)
    mkdirSync(resolve(worktree, 'packages', directory), { recursive: true });
  linkDependency(resolve(worktree, 'packages/elements'), 'lit', paths.lit);
  linkDependency(resolve(worktree, 'packages/react'), '@lit/react', paths.react);
  return paths;
}

describe('installed production dependency reader', () => {
  it('follows the actual installed graph and supplies exact manifest and legal bytes', () => {
    const worktree = temp('wayglass-installed-dependencies-');
    installedGraph(worktree);
    const inputs = readInstalledProductionDependencies(worktree, packageAudit());
    expect(inputs).toHaveLength(7);
    const evidence = auditProductionDependencies(packageAudit(), inputs);
    expect(evidence.productionGraph.map(({ name, version }) => `${name}@${version}`)).toEqual([
      '@lit-labs/ssr-dom-shim@1.6.0',
      '@lit/react@1.0.8',
      '@lit/reactive-element@2.1.2',
      '@types/trusted-types@2.0.7',
      'lit-element@4.2.2',
      'lit-html@3.3.3',
      'lit@3.3.3',
    ]);
    expect(
      evidence.productionGraph.find(({ name }) => name === '@lit-labs/ssr-dom-shim'),
    ).toMatchObject({ declaredLicense: 'BSD-3-Clause', licenseFiles: [] });
    expect(
      evidence.productionGraph
        .filter(({ name }) => name !== '@lit-labs/ssr-dom-shim')
        .every(({ licenseFiles }) => licenseFiles.length > 0),
    ).toBe(true);
  });

  it('rejects an installed production root resolving outside the frozen worktree', () => {
    const worktree = temp('wayglass-installed-dependencies-boundary-');
    const paths = installedGraph(worktree);
    const external = temp('wayglass-installed-dependencies-external-');
    const outside = install(external, { name: 'lit', version: '3.3.3' });
    rmSync(resolve(worktree, 'packages/elements/node_modules/lit'));
    symlinkSync(outside, resolve(worktree, 'packages/elements/node_modules/lit'));
    expect(() => readInstalledProductionDependencies(worktree, packageAudit())).toThrow(
      /WG_RC_DEPENDENCY_GRAPH/,
    );
    expect(paths.lit).toBeDefined();
  });
});
