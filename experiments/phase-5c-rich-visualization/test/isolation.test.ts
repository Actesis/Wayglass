import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5c-rich-visualization');
const candidatePackages = [
  '@types/d3-array',
  '@types/d3-scale',
  '@types/d3-shape',
  'd3-array',
  'd3-scale',
  'd3-shape',
  'uplot',
] as const;

function json(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function filesBelow(root: string): string[] {
  const ignoredDirectories = new Set([
    '.benchmark-dist',
    '.turbo',
    'coverage',
    'dist',
    'node_modules',
    'storybook-static',
  ]);
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isFile()) return [path];
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) return filesBelow(path);
    return [];
  });
}

describe('Phase 5C dependency and runtime isolation', () => {
  it('keeps exact candidates at the private root development boundary', () => {
    const rootManifest = json(join(repositoryRoot, 'package.json'));
    const developmentDependencies = rootManifest.devDependencies as Record<string, string>;
    const exactVersions = {
      '@types/d3-array': '3.2.2',
      '@types/d3-scale': '4.0.9',
      '@types/d3-shape': '3.2.0',
      'd3-array': '3.2.4',
      'd3-scale': '4.0.2',
      'd3-shape': '3.2.0',
      uplot: '1.6.32',
    };

    expect(rootManifest.private).toBe(true);
    expect(rootManifest).not.toHaveProperty('exports');
    expect(rootManifest).not.toHaveProperty('dependencies');
    expect(
      Object.fromEntries(candidatePackages.map((name) => [name, developmentDependencies[name]])),
    ).toEqual(exactVersions);

    const workspaceManifestPaths = [
      ...filesBelow(join(repositoryRoot, 'apps')),
      ...filesBelow(join(repositoryRoot, 'examples')),
      ...filesBelow(join(repositoryRoot, 'packages')),
    ].filter((path) => path.endsWith('package.json'));

    for (const manifestPath of workspaceManifestPaths) {
      const manifestText = readFileSync(manifestPath, 'utf8');
      for (const candidate of candidatePackages) {
        expect(
          manifestText,
          `${relative(repositoryRoot, manifestPath)} contains ${candidate}`,
        ).not.toContain(`"${candidate}"`);
      }
    }

    const workspaceDefinition = readFileSync(join(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8');
    expect(workspaceDefinition).not.toContain('phase-5c-rich-visualization');
    expect(filesBelow(experimentRoot).some((path) => path.endsWith('package.json'))).toBe(false);
  });

  it('keeps candidate imports and side effects inside their explicit proof adapters', () => {
    const productionRoots = ['apps', 'examples', 'packages'];
    const productionSource = productionRoots.flatMap((root) =>
      filesBelow(join(repositoryRoot, root)).filter((path) =>
        ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path)),
      ),
    );

    for (const sourcePath of productionSource) {
      const source = readFileSync(sourcePath, 'utf8');
      for (const runtimeCandidate of ['uplot', 'd3-array', 'd3-scale', 'd3-shape']) {
        expect(
          source,
          `${relative(repositoryRoot, sourcePath)} imports ${runtimeCandidate}`,
        ).not.toMatch(
          new RegExp(`(?:from\\s+|import\\s*\\()\\s*['"]${runtimeCandidate}(?:/[^'"]*)?['"]`),
        );
      }
    }

    const proofSource = filesBelow(join(experimentRoot, 'src')).filter((path) =>
      ['.js', '.ts'].includes(extname(path)),
    );
    const candidateImporters = proofSource
      .filter((path) =>
        /(?:from\s+|import\s*\()\s*['"](?:uplot|d3-(?:array|scale|shape))/.test(
          readFileSync(path, 'utf8'),
        ),
      )
      .map((path) => relative(experimentRoot, path))
      .sort();

    expect(candidateImporters).toEqual([
      'src/d3-geometry.ts',
      'src/uplot-adapter.ts',
      'src/uplot-model.ts',
    ]);
    for (const sourcePath of proofSource) {
      const source = readFileSync(sourcePath, 'utf8');
      expect(
        source,
        `${relative(experimentRoot, sourcePath)} registers a custom element`,
      ).not.toContain('customElements.define(');
      expect(
        source,
        `${relative(experimentRoot, sourcePath)} assigns a browser global`,
      ).not.toMatch(/(?:window|globalThis)\s*\.\s*[A-Za-z_$][\w$]*\s*=/);
    }
  });
});
