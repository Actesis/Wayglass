import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { consumerScenarios, projectConsumerMaterialManifest } from './consumer.ts';
import { fail } from './error.ts';
import type { CommandRunner, JsonValue } from './types.ts';

function serialize(value: JsonValue): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function preflightConsumerMaterial(
  store: string,
  runner: CommandRunner,
  environment: Readonly<Record<string, string>>,
): Promise<void> {
  const root = mkdtempSync(resolve(tmpdir(), 'wayglass-rc-material-'));
  try {
    const userConfig = resolve(root, 'empty-npmrc');
    writeFileSync(userConfig, '', { encoding: 'utf8', flag: 'wx' });
    const preflightEnvironment = Object.freeze({
      ...environment,
      npm_config_cache: resolve(root, '.npm-cache'),
      npm_config_userconfig: userConfig,
    });
    for (const scenario of consumerScenarios()) {
      const project = resolve(root, scenario.id);
      mkdirSync(project);
      writeFileSync(
        resolve(project, 'package.json'),
        serialize(projectConsumerMaterialManifest(scenario)),
        { encoding: 'utf8', flag: 'wx' },
      );
      const shared = ['--offline', '--ignore-scripts', '--store-dir', store] as const;
      try {
        await runner({
          command: 'pnpm',
          arguments: ['install', '--lockfile-only', '--no-frozen-lockfile', ...shared],
          cwd: project,
          environment: preflightEnvironment,
        });
        await runner({
          command: 'pnpm',
          arguments: ['install', '--frozen-lockfile', ...shared],
          cwd: project,
          environment: preflightEnvironment,
        });
      } catch (error) {
        fail(
          'WG_RC_CONSUMER_OFFLINE_MATERIAL',
          `Offline material preflight failed for ${scenario.id}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
