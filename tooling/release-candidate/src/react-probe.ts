import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { withConsumerProject } from './consumer-harness.ts';
import { consumerScenarios } from './consumer.ts';
import { fail } from './error.ts';
import {
  reactConsumerTemplate,
  reactDirectMain,
  reactMainPath,
  reactPackageSurfacePath,
  reactRemovalPackages,
} from './react-consumer.ts';
import type {
  CommandRunner,
  ConsumerProjectContext,
  ConsumerRuntimeProbe,
  ReactBuildProbeResult,
} from './types.ts';

export interface ReactProbeRequest {
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
  if (!existsSync(dist)) fail('WG_RC_REACT_OUTPUT', 'Production output directory is missing.');
  const queue = [dist];
  const javascript: string[] = [];
  const css: string[] = [];
  let htmlFound = false;
  while (queue.length > 0) {
    const directory = queue.pop()!;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) fail('WG_RC_REACT_OUTPUT', 'Build output contains a symlink.');
      if (entry.isDirectory()) queue.push(path);
      else if (!entry.isFile()) fail('WG_RC_REACT_OUTPUT', 'Build output is not a regular file.');
      else if (entry.name.endsWith('.js')) javascript.push(readFileSync(path, 'utf8'));
      else if (entry.name.endsWith('.css')) css.push(readFileSync(path, 'utf8'));
      else if (entry.name.endsWith('.html')) htmlFound = true;
    }
  }
  if (!htmlFound || javascript.length === 0 || css.length === 0) {
    fail('WG_RC_REACT_OUTPUT', 'Production output requires HTML, JavaScript, and CSS.');
  }
  return { javascript: javascript.join('\n'), css: css.join('\n') };
}

function verifyCss(output: BuildOutput): void {
  for (const marker of [
    '--wg-color-semantic-condition-positive',
    'data-wg-theme',
    'data-wg-density',
    '--wg-component-toggle-color',
  ]) {
    if (!output.css.includes(marker))
      fail('WG_RC_REACT_CSS', `Production CSS is missing ${marker}.`);
  }
}

function verifyReactBuild(output: BuildOutput): void {
  verifyCss(output);
  for (const marker of [
    'WG_REACT_CLIENT_FALLBACK_READY',
    'WG_REACT_RETAINED_WRAPPER_NOT_REGISTERED',
    'WG_REACT_UNUSED_ELEMENT_REGISTERED',
    'WG_REACT_DIRECT_PARITY_FAILED',
    'WG_REACT_EVENT_ADAPTATION_FAILED',
    'wg-toggle-request',
  ]) {
    if (!output.javascript.includes(marker)) {
      fail('WG_RC_REACT_RUNTIME_FIXTURE', `Production JavaScript is missing ${marker}.`);
    }
  }
  for (const marker of ['wg-media-viewer', 'wg-tabs']) {
    if (output.javascript.includes(marker)) {
      fail('WG_RC_REACT_TREE_SHAKING', `Unused wrapper marker ${marker} remains bundled.`);
    }
  }
}

function verifyDirectBuild(output: BuildOutput): void {
  verifyCss(output);
  if (!output.javascript.includes('WG_REACT_BINDING_REMOVED')) {
    fail('WG_RC_REACT_REMOVAL', 'Direct-element rebuild marker is missing.');
  }
  for (const marker of ['WG_REACT_CLIENT_FALLBACK_READY', 'wg-toggle-request', 'wg-toggle']) {
    if (output.javascript.includes(marker)) {
      fail('WG_RC_REACT_REMOVAL', `React-stage marker ${marker} remains after binding removal.`);
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
  return readBuildOutput(context.root);
}

function verifyRemoval(root: string): void {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  for (const name of reactRemovalPackages) {
    if (
      manifest.dependencies?.[name] !== undefined ||
      manifest.devDependencies?.[name] !== undefined
    ) {
      fail('WG_RC_REACT_REMOVAL', `${name} remains in the consumer manifest.`);
    }
    if (existsSync(resolve(root, 'node_modules', ...name.split('/')))) {
      fail('WG_RC_REACT_REMOVAL', `${name} remains installed.`);
    }
  }
}

export async function runReactBuildProbe(
  context: ConsumerProjectContext,
  runtime?: ConsumerRuntimeProbe,
): Promise<ReactBuildProbeResult> {
  if (context.scenario.kind !== 'react') {
    fail('WG_RC_REACT_SCENARIO', 'React probe requires a React consumer project.');
  }
  verifyReactBuild(await typecheckAndBuild(context));
  await runtime?.(context, 'primary');
  rmSync(resolve(context.root, reactPackageSurfacePath));
  writeFileSync(resolve(context.root, reactMainPath), reactDirectMain, { encoding: 'utf8' });
  await context.run({
    command: 'pnpm',
    arguments: ['remove', ...reactRemovalPackages, '--offline', '--ignore-scripts'],
    cwd: context.root,
    environment: context.environment,
  });
  verifyRemoval(context.root);
  verifyDirectBuild(await typecheckAndBuild(context));
  await runtime?.(context, 'removal');
  return Object.freeze({
    scenarioId: context.scenario.id,
    declarations: true,
    productionBuild: true,
    css: true,
    clientFallbackFixture: true,
    parityAndEventsFixture: true,
    guardedRegistrationFixture: true,
    unusedWrappersAbsent: true,
    bindingRemovalRebuild: true,
  });
}

export async function probeReactConsumers(
  request: ReactProbeRequest,
  runtime?: ConsumerRuntimeProbe,
): Promise<readonly ReactBuildProbeResult[]> {
  const results: ReactBuildProbeResult[] = [];
  for (const scenario of consumerScenarios().filter(({ kind }) => kind === 'react')) {
    results.push(
      await withConsumerProject(
        { ...request, template: reactConsumerTemplate(scenario) },
        (context) => runReactBuildProbe(context, runtime),
      ),
    );
  }
  return Object.freeze(results);
}
