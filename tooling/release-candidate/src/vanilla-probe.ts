import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { withConsumerProject } from './consumer-harness.ts';
import { consumerScenarios } from './consumer.ts';
import { fail } from './error.ts';
import type {
  CommandRunner,
  ConsumerProjectContext,
  ConsumerRuntimeProbe,
  VanillaBuildProbeResult,
} from './types.ts';
import {
  vanillaCompileOnlyPackage,
  vanillaConsumerTemplate,
  vanillaPackageSurfacePath,
} from './vanilla.ts';

export interface VanillaProbeRequest {
  readonly evidencePath: string;
  readonly storePath: string;
  readonly runner: CommandRunner;
  readonly environment: NodeJS.ProcessEnv;
}

interface BuildOutput {
  readonly javascript: string;
  readonly css: string;
}

function readBuildOutput(root: string): BuildOutput {
  const dist = resolve(root, 'dist');
  if (!existsSync(dist)) fail('WG_RC_VANILLA_OUTPUT', 'Production output directory is missing.');
  const queue = [dist];
  const javascript: string[] = [];
  const css: string[] = [];
  let htmlFound = false;
  while (queue.length > 0) {
    const directory = queue.pop()!;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) fail('WG_RC_VANILLA_OUTPUT', 'Build output contains a symlink.');
      if (entry.isDirectory()) queue.push(path);
      else if (!entry.isFile()) fail('WG_RC_VANILLA_OUTPUT', 'Build output is not a regular file.');
      else if (entry.name.endsWith('.js')) javascript.push(readFileSync(path, 'utf8'));
      else if (entry.name.endsWith('.css')) css.push(readFileSync(path, 'utf8'));
      else if (entry.name.endsWith('.html')) htmlFound = true;
    }
  }
  if (!htmlFound || javascript.length === 0 || css.length === 0) {
    fail('WG_RC_VANILLA_OUTPUT', 'Production output requires HTML, JavaScript, and CSS.');
  }
  return { javascript: javascript.join('\n'), css: css.join('\n') };
}

function verifyBuildOutput(output: BuildOutput): void {
  for (const marker of [
    'WG_VANILLA_PROBE_READY',
    'WG_VANILLA_IMPORT_REGISTERED',
    'wg-toggle-request',
    'critical',
    'stale',
    'pending',
  ]) {
    if (!output.javascript.includes(marker)) {
      fail('WG_RC_VANILLA_RUNTIME_FIXTURE', `Production JavaScript is missing ${marker}.`);
    }
  }
  for (const marker of [
    '--wg-color-semantic-condition-positive',
    'data-wg-theme',
    'data-wg-density',
    '--wg-component-toggle-color',
  ]) {
    if (!output.css.includes(marker)) {
      fail('WG_RC_VANILLA_CSS', `Production CSS is missing ${marker}.`);
    }
  }
  for (const marker of ['wg-media-viewer', 'wg-icon']) {
    if (output.javascript.includes(marker)) {
      fail('WG_RC_VANILLA_TREE_SHAKING', `Unused runtime marker ${marker} remains bundled.`);
    }
  }
}

async function typecheckAndBuild(context: ConsumerProjectContext): Promise<BuildOutput> {
  await context.run({
    command: 'pnpm',
    arguments: ['exec', 'tsc', '--noEmit', '--project', 'tsconfig.json'],
    cwd: context.root,
    environment: context.environment,
  });
  await context.run({
    command: 'pnpm',
    arguments: ['exec', 'vite', 'build'],
    cwd: context.root,
    environment: context.environment,
  });
  const output = readBuildOutput(context.root);
  verifyBuildOutput(output);
  return output;
}

function verifyRemoval(root: string): void {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  if (manifest.dependencies?.[vanillaCompileOnlyPackage] !== undefined) {
    fail('WG_RC_VANILLA_REMOVAL', `${vanillaCompileOnlyPackage} remains in the consumer manifest.`);
  }
  const installed = resolve(root, 'node_modules', '@wayglass', 'icons');
  if (existsSync(installed)) {
    fail('WG_RC_VANILLA_REMOVAL', `${vanillaCompileOnlyPackage} remains installed.`);
  }
}

export async function runVanillaBuildProbe(
  context: ConsumerProjectContext,
  runtime?: ConsumerRuntimeProbe,
): Promise<VanillaBuildProbeResult> {
  if (context.scenario.kind !== 'vanilla') {
    fail('WG_RC_VANILLA_SCENARIO', 'Vanilla probe requires a Vanilla consumer project.');
  }
  await typecheckAndBuild(context);
  await runtime?.(context, 'primary');
  rmSync(resolve(context.root, vanillaPackageSurfacePath));
  await context.run({
    command: 'pnpm',
    arguments: ['remove', vanillaCompileOnlyPackage, '--offline', '--ignore-scripts'],
    cwd: context.root,
    environment: context.environment,
  });
  verifyRemoval(context.root);
  await typecheckAndBuild(context);
  await runtime?.(context, 'removal');
  return Object.freeze({
    scenarioId: context.scenario.id,
    declarations: true,
    productionBuild: true,
    css: true,
    runtimeFixture: true,
    unusedRuntimeCodeAbsent: true,
    removalRebuild: true,
  });
}

export async function probeVanillaConsumers(
  request: VanillaProbeRequest,
  runtime?: ConsumerRuntimeProbe,
): Promise<readonly VanillaBuildProbeResult[]> {
  const results: VanillaBuildProbeResult[] = [];
  for (const scenario of consumerScenarios().filter(({ kind }) => kind === 'vanilla')) {
    results.push(
      await withConsumerProject(
        {
          ...request,
          template: vanillaConsumerTemplate(scenario),
        },
        (context) => runVanillaBuildProbe(context, runtime),
      ),
    );
  }
  return Object.freeze(results);
}
