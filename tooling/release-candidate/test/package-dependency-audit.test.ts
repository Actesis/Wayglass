import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  auditProductionDependencies,
  serializeDependencyAudit,
  validateDependencyAudit,
  type ProductionDependencyInput,
} from '../src/dependency-audit.ts';
import { sha256 } from '../src/hash.ts';
import { projectCandidateInventory, serializeProjectedManifest } from '../src/manifest.ts';
import {
  auditPackedPackages,
  serializePackageAudit,
  validatePackageAudit,
  type PackageAuditEvidence,
  type PackedPackageAuditInput,
} from '../src/package-audit.ts';
import type { JsonValue, PackageFile } from '../src/types.ts';
import { bytes, repositoryRoot, sourceCandidates } from './fixtures.ts';

function exportTargets(value: JsonValue): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(exportTargets);
  if (value !== null && typeof value === 'object')
    return Object.values(value).flatMap(exportTargets);
  return [];
}

function packedInputs(): PackedPackageAuditInput[] {
  const license = readFileSync(resolve(repositoryRoot, 'LICENSE'));
  const notice = readFileSync(resolve(repositoryRoot, 'NOTICE'));
  return projectCandidateInventory(sourceCandidates()).map((manifest, index) => {
    const paths = new Set(exportTargets(manifest.exports).map((target) => target.slice(2)));
    paths.add('dist/audit.js.map');
    const files: PackageFile[] = [
      { path: 'README.md', bytes: bytes(`${manifest.name} readme\n`) },
      { path: 'LICENSE', bytes: license },
      { path: 'NOTICE', bytes: notice },
      { path: 'package.json', bytes: bytes(serializeProjectedManifest(manifest)) },
      ...[...paths].map((path) => ({
        path,
        bytes: path.endsWith('.map')
          ? bytes(
              JSON.stringify({ version: 3, sources: [`../src/${String(index)}.ts`], mappings: '' }),
            )
          : bytes(path.endsWith('.css') ? ':host {}\n' : 'export {};\n'),
      })),
    ];
    return { directory: sourceCandidates()[index]!.directory, manifest, files };
  });
}

function packageAudit(): PackageAuditEvidence {
  return auditPackedPackages(packedInputs());
}

interface DependencyFixture {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly peerDependencies?: Readonly<Record<string, string>>;
  readonly scripts?: Readonly<Record<string, string>>;
}

function dependencyInput(fixture: DependencyFixture): ProductionDependencyInput {
  const manifest = {
    name: fixture.name,
    version: fixture.version,
    license: 'BSD-3-Clause',
    ...(fixture.dependencies === undefined ? {} : { dependencies: fixture.dependencies }),
    ...(fixture.peerDependencies === undefined
      ? {}
      : { peerDependencies: fixture.peerDependencies }),
    ...(fixture.scripts === undefined ? {} : { scripts: fixture.scripts }),
  };
  return {
    files: [
      { path: 'package.json', bytes: bytes(`${JSON.stringify(manifest)}\n`) },
      { path: 'LICENSE', bytes: bytes(`License for ${fixture.name}\n`) },
    ],
    resolvedDependencies: fixture.dependencies ?? {},
  };
}

function dependencyInputs(): ProductionDependencyInput[] {
  return [
    dependencyInput({
      name: 'lit',
      version: '3.3.3',
      dependencies: {
        '@lit/reactive-element': '2.1.2',
        'lit-element': '4.2.2',
        'lit-html': '3.3.3',
      },
    }),
    dependencyInput({
      name: '@lit/react',
      version: '1.0.8',
      peerDependencies: { '@types/react': '17 || 18 || 19' },
    }),
    dependencyInput({
      name: '@lit/reactive-element',
      version: '2.1.2',
      dependencies: { '@lit-labs/ssr-dom-shim': '1.6.0' },
    }),
    dependencyInput({ name: '@lit-labs/ssr-dom-shim', version: '1.6.0' }),
    dependencyInput({
      name: 'lit-element',
      version: '4.2.2',
      dependencies: {
        '@lit-labs/ssr-dom-shim': '1.6.0',
        '@lit/reactive-element': '2.1.2',
        'lit-html': '3.3.3',
      },
    }),
    dependencyInput({
      name: 'lit-html',
      version: '3.3.3',
      dependencies: { '@types/trusted-types': '2.0.7' },
    }),
    dependencyInput({ name: '@types/trusted-types', version: '2.0.7' }),
  ];
}

describe('packed candidate package audit', () => {
  it('derives all six exact audits from inspected packed bytes', () => {
    const audit = packageAudit();
    expect(audit.packages).toHaveLength(6);
    expect(audit.packages.map(({ name }) => name)).toEqual([
      '@wayglass/core',
      '@wayglass/tokens',
      '@wayglass/themes',
      '@wayglass/elements',
      '@wayglass/icons',
      '@wayglass/react',
    ]);
    expect(audit.packages.every(({ lifecycleScriptsAbsent }) => lifecycleScriptsAbsent)).toBe(true);
    expect(audit.packages.every(({ privateFilesAbsent }) => privateFilesAbsent)).toBe(true);
    expect(audit.packages.every(({ sourceMaps }) => sourceMaps.length === 1)).toBe(true);
    expect(validatePackageAudit(JSON.parse(serializePackageAudit(audit)))).toEqual(audit);
  });

  it('rejects changed legal bytes, unsafe maps, unknown manifest fields, and audit drift', () => {
    const legalDrift = packedInputs();
    legalDrift[0] = {
      ...legalDrift[0]!,
      files: legalDrift[0]!.files.map((file) =>
        file.path === 'LICENSE' ? { ...file, bytes: bytes('changed\n') } : file,
      ),
    };
    expect(() => auditPackedPackages(legalDrift)).toThrowError(/WG_RC_PACKAGE_AUDIT/);

    const unsafeMap = packedInputs();
    unsafeMap[0] = {
      ...unsafeMap[0]!,
      files: unsafeMap[0]!.files.map((file) =>
        file.path.endsWith('.map')
          ? { ...file, bytes: bytes(JSON.stringify({ sources: ['/private/source.ts'] })) }
          : file,
      ),
    };
    expect(() => auditPackedPackages(unsafeMap)).toThrowError(/WG_RC_SOURCE_MAP_ABSOLUTE/);

    const manifestDrift = packedInputs();
    manifestDrift[0] = {
      ...manifestDrift[0]!,
      manifest: { ...manifestDrift[0]!.manifest, scripts: {} } as never,
    };
    expect(() => auditPackedPackages(manifestDrift)).toThrowError(/WG_RC_PACKAGE_AUDIT/);
    expect(() => validatePackageAudit({ ...packageAudit(), invented: true })).toThrowError(
      /WG_RC_PACKAGE_AUDIT/,
    );
  });

  it('canonicalizes object keys and rejects reordered or unsafe retained findings', () => {
    const audit = packageAudit();
    const reordered = Object.fromEntries(Object.entries(audit).reverse());
    expect(serializePackageAudit(reordered)).toBe(serializePackageAudit(audit));

    const duplicateMap = {
      ...audit,
      packages: audit.packages.map((package_, index) =>
        index === 0
          ? { ...package_, sourceMaps: [...package_.sourceMaps, package_.sourceMaps[0]!] }
          : package_,
      ),
    };
    expect(() => validatePackageAudit(duplicateMap)).toThrowError(/WG_RC_PACKAGE_AUDIT/);

    const absoluteSource = {
      ...audit,
      packages: audit.packages.map((package_, index) =>
        index === 0
          ? {
              ...package_,
              sourceMaps: package_.sourceMaps.map((map, mapIndex) =>
                mapIndex === 0 ? { ...map, sources: ['https://example.test/source.ts'] } : map,
              ),
            }
          : package_,
      ),
    };
    expect(() => validatePackageAudit(absoluteSource)).toThrowError(/WG_RC_PACKAGE_AUDIT/);
  });
});

describe('production dependency audit', () => {
  it('records the exact reachable production graph with manifest and license evidence', () => {
    const audit = auditProductionDependencies(packageAudit(), dependencyInputs());
    expect(audit.productionRoots).toEqual([
      { name: '@lit/react', version: '1.0.8' },
      { name: 'lit', version: '3.3.3' },
    ]);
    expect(audit.productionGraph).toHaveLength(7);
    expect(audit.productionGraph.every(({ licenseFiles }) => licenseFiles.length === 1)).toBe(true);
    expect(
      audit.productionGraph.every(({ packageJsonSha256 }) => packageJsonSha256.length === 64),
    ).toBe(true);
    expect(validateDependencyAudit(JSON.parse(serializeDependencyAudit(audit)))).toEqual(audit);
  });

  it('records lifecycle hooks instead of executing or hiding them', () => {
    const inputs = dependencyInputs();
    inputs[0] = dependencyInput({
      name: 'lit',
      version: '3.3.3',
      dependencies: {
        '@lit/reactive-element': '2.1.2',
        'lit-element': '4.2.2',
        'lit-html': '3.3.3',
      },
      scripts: { postinstall: 'never executed', test: 'not lifecycle' },
    });
    const audit = auditProductionDependencies(packageAudit(), inputs);
    expect(audit.productionGraph.find(({ name }) => name === 'lit')?.lifecycleScripts).toEqual([
      'postinstall',
    ]);
  });

  it('rejects missing, unreachable, duplicate, and unresolved production nodes', () => {
    expect(() =>
      auditProductionDependencies(packageAudit(), dependencyInputs().slice(1)),
    ).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);
    expect(() =>
      auditProductionDependencies(packageAudit(), [
        ...dependencyInputs(),
        dependencyInput({ name: 'development-only', version: '1.0.0' }),
      ]),
    ).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);
    expect(() =>
      auditProductionDependencies(packageAudit(), [dependencyInputs()[0]!, ...dependencyInputs()]),
    ).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);
    const unresolved = dependencyInputs();
    unresolved[0] = { ...unresolved[0]!, resolvedDependencies: {} };
    expect(() => auditProductionDependencies(packageAudit(), unresolved)).toThrowError(
      /WG_RC_DEPENDENCY_AUDIT/,
    );
  });

  it('retains manifest-only license evidence and rejects absent declarations', () => {
    const inputs = dependencyInputs();
    inputs[0] = {
      ...inputs[0]!,
      files: inputs[0]!.files.filter(({ path }) => path === 'package.json'),
    };
    const manifestOnly = auditProductionDependencies(packageAudit(), inputs);
    expect(manifestOnly.productionGraph.find(({ name }) => name === 'lit')).toMatchObject({
      declaredLicense: 'BSD-3-Clause',
      licenseFiles: [],
    });

    const missingDeclaration = dependencyInputs();
    missingDeclaration[0] = {
      ...missingDeclaration[0]!,
      files: missingDeclaration[0]!.files.map((file) =>
        file.path === 'package.json'
          ? {
              ...file,
              bytes: bytes(JSON.stringify({ name: 'lit', version: '3.3.3', dependencies: {} })),
            }
          : file,
      ),
    };
    expect(() => auditProductionDependencies(packageAudit(), missingDeclaration)).toThrowError(
      /WG_RC_DEPENDENCY_AUDIT/,
    );

    const audit = auditProductionDependencies(packageAudit(), dependencyInputs());
    expect(() => validateDependencyAudit({ ...audit, invented: sha256('invented') })).toThrowError(
      /WG_RC_DEPENDENCY_AUDIT/,
    );
  });

  it('recomputes exact roots, edges, and reachability from retained evidence', () => {
    const audit = auditProductionDependencies(packageAudit(), dependencyInputs());

    const missingRoot = { ...audit, productionRoots: audit.productionRoots.slice(1) };
    expect(() => validateDependencyAudit(missingRoot)).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);

    const missingNode = { ...audit, productionGraph: audit.productionGraph.slice(0, -1) };
    expect(() => validateDependencyAudit(missingNode)).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);

    const unreachable = {
      ...audit,
      productionGraph: audit.productionGraph.map((node) =>
        node.name === 'lit-html' ? { ...node, dependencies: [] } : node,
      ),
    };
    expect(() => validateDependencyAudit(unreachable)).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);

    const duplicateEdge = {
      ...audit,
      productionGraph: audit.productionGraph.map((node) =>
        node.name === 'lit'
          ? { ...node, dependencies: [...node.dependencies, node.dependencies[0]!] }
          : node,
      ),
    };
    expect(() => validateDependencyAudit(duplicateEdge)).toThrowError(/WG_RC_DEPENDENCY_AUDIT/);
  });

  it('canonicalizes dependency-audit object key order', () => {
    const audit = auditProductionDependencies(packageAudit(), dependencyInputs());
    const reordered = Object.fromEntries(Object.entries(audit).reverse());
    expect(serializeDependencyAudit(reordered)).toBe(serializeDependencyAudit(audit));
  });
});
