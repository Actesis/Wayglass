import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5c-rich-visualization');
const rejectedPackages = [
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

describe('Phase 5C rejected-candidate cleanup and isolation', () => {
  it('removes rejected packages and keeps the retained proof private', () => {
    const rootManifest = json(join(repositoryRoot, 'package.json'));
    const manifestText = readFileSync(join(repositoryRoot, 'package.json'), 'utf8');
    const lockText = readFileSync(join(repositoryRoot, 'pnpm-lock.yaml'), 'utf8');

    expect(rootManifest.private).toBe(true);
    expect(rootManifest).not.toHaveProperty('exports');
    expect(rootManifest).not.toHaveProperty('dependencies');
    for (const candidate of rejectedPackages) {
      expect(manifestText, `root manifest contains ${candidate}`).not.toContain(`"${candidate}"`);
      expect(lockText, `lockfile contains ${candidate}`).not.toMatch(
        new RegExp(`(?:^|/)${candidate.replace('/', '\\/')}@`, 'm'),
      );
    }

    const workspaceDefinition = readFileSync(join(repositoryRoot, 'pnpm-workspace.yaml'), 'utf8');
    expect(workspaceDefinition).not.toContain('phase-5c-rich-visualization');
    expect(filesBelow(experimentRoot).some((path) => path.endsWith('package.json'))).toBe(false);
  });

  it('retains no executable import or side effect from rejected candidates', () => {
    const executableSource = ['apps', 'examples', 'packages', 'experiments', 'tests'].flatMap(
      (root) =>
        filesBelow(join(repositoryRoot, root)).filter((path) =>
          ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path)),
        ),
    );

    for (const sourcePath of executableSource) {
      const source = readFileSync(sourcePath, 'utf8');
      expect(
        source,
        `${relative(repositoryRoot, sourcePath)} imports a rejected visualization dependency`,
      ).not.toMatch(/(?:from\s+|import\s*\()\s*['"](?:uplot|d3-(?:array|scale|shape))/);
    }

    for (const sourcePath of filesBelow(join(experimentRoot, 'src')).filter((path) =>
      ['.js', '.ts'].includes(extname(path)),
    )) {
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
