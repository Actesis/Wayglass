import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { proofIconCatalog } from '../src/catalog.js';
import { IconModelError, validateIconCatalog } from '../src/model.js';

const repositoryRoot = fileURLToPath(new URL('../../..', import.meta.url));
const experimentRoot = join(repositoryRoot, 'experiments/phase-5d-icon-tooling');

interface RemovalPlan {
  readonly deletePaths: readonly string[];
  readonly removeRootScripts: readonly string[];
  readonly removeFromRootCheck: string;
  readonly retainHistoricalRecords: readonly string[];
}

function mutableCatalog(): unknown[] {
  return structuredClone(proofIconCatalog) as unknown as unknown[];
}

function expectCode(input: unknown, code: string): void {
  try {
    validateIconCatalog(input);
    throw new Error(`Expected ${code}.`);
  } catch (error) {
    expect(error).toBeInstanceOf(IconModelError);
    expect((error as IconModelError).code).toBe(code);
  }
}

function filesBelow(root: string): string[] {
  const ignored = new Set([
    '.git',
    '.pnpm-store',
    '.turbo',
    '.vitepress',
    'coverage',
    'dist',
    'node_modules',
    'playwright-report',
    'storybook-static',
    'test-results',
  ]);
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isFile()) return [path];
    return entry.isDirectory() && !ignored.has(entry.name) ? filesBelow(path) : [];
  });
}

function json<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

describe('Phase 5D active and external content rejection', () => {
  it('rejects active, external, hidden, styled, and text-bearing record fields', () => {
    for (const field of [
      'children',
      'display',
      'href',
      'markup',
      'onload',
      'opacity',
      'style',
      'text',
      'transform',
    ]) {
      const input = mutableCatalog();
      Object.assign(input[0] as object, { [field]: 'https://attacker.invalid/icon.svg' });
      expectCode(input, 'P5D_ICON_RECORD_KEYS');
    }
  });

  it('rejects executable, external-resource, hidden, and text primitive kinds', () => {
    for (const type of ['animate', 'foreign-object', 'image', 'script', 'style', 'text', 'use']) {
      const input = mutableCatalog();
      (input[0] as { primitives: unknown[] }).primitives[0] = {
        type,
        href: 'https://attacker.invalid/icon.svg',
      };
      expectCode(input, 'P5D_ICON_PRIMITIVE_KIND');
    }
  });

  it('rejects active, external, and presentation fields attached to permitted geometry', () => {
    for (const field of [
      'clipPath',
      'display',
      'href',
      'onload',
      'opacity',
      'style',
      'transform',
    ]) {
      const input = mutableCatalog();
      Object.assign((input[0] as { primitives: object[] }).primitives[0]!, {
        [field]: 'url(https://attacker.invalid/resource)',
      });
      expectCode(input, 'P5D_ICON_PRIMITIVE_KEYS');
    }
  });
});

describe('Phase 5D dependency, network, and removal boundary', () => {
  it('limits executable proof imports to Node built-ins and existing repository test tools', () => {
    const executableFiles = filesBelow(experimentRoot).filter((path) =>
      ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path)),
    );
    const allowedBareImport = /^(?:vite|vitest(?:\/config)?)$/;
    const importPattern = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;

    for (const path of executableFiles) {
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(importPattern)) {
        const specifier = match[1]!;
        expect(
          specifier.startsWith('.') ||
            specifier.startsWith('node:') ||
            allowedBareImport.test(specifier),
          `${relative(repositoryRoot, path)} imports unapproved ${specifier}`,
        ).toBe(true);
      }
    }

    const rootManifest = json<{
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    }>(join(repositoryRoot, 'package.json'));
    expect(rootManifest.devDependencies.vite).toBe('8.1.5');
    expect(rootManifest.devDependencies.vitest).toBe('4.1.10');
    expect(filesBelow(experimentRoot).some((path) => path.endsWith('package.json'))).toBe(false);
  });

  it('contains no executable network, credential, persistence, telemetry, or registration API', () => {
    const executableFiles = [
      ...filesBelow(join(experimentRoot, 'src')),
      ...filesBelow(join(experimentRoot, 'generated')),
    ].filter((path) => ['.html', '.js', '.ts'].includes(extname(path)));
    const forbidden =
      /\b(?:EventSource|WebSocket|XMLHttpRequest|fetch|sendBeacon)\b|navigator\.clipboard|(?:local|session)Storage|document\.cookie|process\.env|customElements\.define|<script\b|<foreignObject\b|https?:\/\//i;

    for (const path of executableFiles) {
      expect(readFileSync(path, 'utf8'), relative(repositoryRoot, path)).not.toMatch(forbidden);
    }
  });

  it('keeps an exact, executable complete-removal plan with only historical records retained', () => {
    const plan = json<RemovalPlan>(join(experimentRoot, 'removal-plan.json'));
    expect(plan.deletePaths).toEqual([
      'experiments/phase-5d-icon-tooling/generated/',
      'experiments/phase-5d-icon-tooling/src/',
      'experiments/phase-5d-icon-tooling/test/',
      'experiments/phase-5d-icon-tooling/README.md',
      'experiments/phase-5d-icon-tooling/removal-plan.json',
      'experiments/phase-5d-icon-tooling/tsconfig.json',
      'experiments/phase-5d-icon-tooling/vitest.config.ts',
      'tests/browser/phase-5d-icon-review.spec.ts',
      'tests/browser/phase-5d-runtime-isolation.spec.ts',
    ]);
    expect(plan.retainHistoricalRecords).toEqual([
      'apps/docs/architecture/adr/0034-private-icon-pipeline-architecture.md',
      'apps/docs/governance/icon-runtime-contract-reconciliation.md',
      'apps/docs/governance/icon-tooling-implementation-contract.md',
      'apps/docs/governance/explorations/phase-5d-icon-tooling.md',
      'docs/architecture/adr/0034-private-icon-pipeline-architecture.md',
      'docs/governance/icon-runtime-contract-reconciliation.md',
      'docs/governance/icon-tooling-implementation-contract.md',
      'docs/governance/explorations/phase-5d-icon-tooling.md',
      'docs/phase-5.md',
      'experiments/phase-5d-icon-tooling/evidence/',
    ]);

    const repositoryFiles = filesBelow(repositoryRoot).map((file) =>
      relative(repositoryRoot, file),
    );
    for (const path of [...plan.deletePaths, ...plan.retainHistoricalRecords]) {
      const exists = path.endsWith('/')
        ? repositoryFiles.some((file) => file.startsWith(path))
        : repositoryFiles.includes(path);
      expect(exists, `${path} is not present`).toBe(true);
    }

    const manifest = json<{ scripts: Record<string, string> }>(
      join(repositoryRoot, 'package.json'),
    );
    for (const script of plan.removeRootScripts) expect(manifest.scripts).toHaveProperty(script);
    const simulatedScripts = { ...manifest.scripts };
    for (const script of plan.removeRootScripts) delete simulatedScripts[script];
    simulatedScripts.check = simulatedScripts.check!.replace(plan.removeFromRootCheck, '');
    expect(JSON.stringify(simulatedScripts)).not.toMatch(/phase5d|phase-5d-icon-tooling/);

    const externalReferences = repositoryFiles
      .filter((path) => !path.startsWith('experiments/phase-5d-icon-tooling/'))
      .filter((path) => ['.json', '.md', '.ts'].includes(extname(path)))
      .filter((path) => {
        const source = readFileSync(join(repositoryRoot, path), 'utf8');
        return /phase5d|phase-5d-icon-tooling|P5D-ICON-TOOLING/.test(source);
      })
      .sort();
    expect(externalReferences).toEqual(
      [
        'apps/docs/governance/explorations/phase-5d-icon-tooling.md',
        'docs/architecture/adr/0034-private-icon-pipeline-architecture.md',
        'docs/governance/explorations/phase-5d-icon-tooling.md',
        'docs/governance/icon-tooling-implementation-contract.md',
        'docs/phase-5.md',
        'package.json',
        'tests/browser/phase-5d-icon-review.spec.ts',
        'tests/browser/phase-5d-runtime-isolation.spec.ts',
      ].sort(),
    );
  });
});
